/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices, } from 'react-native-webrtc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const ICE_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Tu peux ajouter ton/tes TURN ici pour fiabiliser en 4G/CGNAT
    ],
};

/**
 * Signalisation: on utilise Echo private channel + whisper :
 * - channel.listenForWhisper('signal', handler)
 * - channel.whisper('signal', payload)
 *
 * roomName: un identifiant déterministe partagé par les 2 parties
 *   ex: webrtc.user.<minId>-<maxId>
 */
export default class RTCManager {
    constructor({ echo, roomName, localUserId, onMessage, onFile, onPeerState, onRemoteStream }) {
        this.echo = echo;
        this.roomName = roomName;
        this.localUserId = localUserId;
        this.onMessage = onMessage;      // (msgObject) -> void
        this.onFile = onFile;            // ({name, mime, path}) -> void
        this.onPeerState = onPeerState;  // (state) -> void
        this.onRemoteStream = onRemoteStream; // (MediaStream) -> void

        this.pc = null;
        this.dc = null;
        this.fileRecv = null; // {meta, chunks: []}
        this.channel = null;
    }

    // Abonnement au canal de signalisation
    attachSignaling() {
        this.channel = this.echo.private(this.roomName);

        // Réception des signaux
        this.channel.listenForWhisper('signal', async (payload) => {
            const { type, from, data } = payload || {};
            if (from === this.localUserId) return;

            switch (type) {
                case 'offer':
                    await this.ensurePC();
                    await this.pc.setRemoteDescription(new RTCSessionDescription(data));
                    const answer = await this.pc.createAnswer();
                    await this.pc.setLocalDescription(answer);
                    this.whisper('answer', answer);
                    break;
                case 'answer':
                    if (this.pc && !this.pc.remoteDescription) {
                        await this.pc.setRemoteDescription(new RTCSessionDescription(data));
                    }
                    break;
                case 'ice':
                    if (this.pc) {
                        try {
                            await this.pc.addIceCandidate(new RTCIceCandidate(data));
                        } catch { }
                    }
                    break;
            }
        });
    }

    whisper(type, data) {
        this.channel && this.channel.whisper('signal', { type, from: this.localUserId, data });
    }

    async ensurePC() {
        if (this.pc) return this.pc;

        this.pc = new RTCPeerConnection(ICE_CONFIG);

        this.pc.onicecandidate = (e) => {
            if (e.candidate) this.whisper('ice', e.candidate);
        };

        this.pc.onconnectionstatechange = () => {
            this.onPeerState && this.onPeerState(this.pc.connectionState);
        };

        // DataChannel côté callee (réception)
        this.pc.ondatachannel = (e) => {
            this.dc = e.channel;
            this.bindDataChannel();
        };

        // Remote stream (audio/vidéo)
        this.pc.ontrack = (event) => {
            const [stream] = event.streams || [];
            stream && this.onRemoteStream && this.onRemoteStream(stream);
        };

        return this.pc;
    }

    bindDataChannel() {
        if (!this.dc) return;
        this.dc.onopen = () => this.onPeerState && this.onPeerState('datachannel-open');
        this.dc.onclose = () => this.onPeerState && this.onPeerState('datachannel-close');
        this.dc.onmessage = async (e) => {
            // Protocole simple:
            // - {kind:'text', payload:{...}}
            // - {kind:'file-meta', payload:{name,mime,size,transferId}}
            // - {kind:'file-chunk', payload:{transferId, base64}}
            // - {kind:'file-end', payload:{transferId}}
            try {
                const msg = JSON.parse(e.data);

                if (msg.kind === 'text') {
                    this.onMessage && this.onMessage(msg.payload);
                    return;
                }

                if (msg.kind === 'file-meta') {
                    this.fileRecv = { meta: msg.payload, chunks: [] };
                    return;
                }

                if (msg.kind === 'file-chunk' && this.fileRecv) {
                    this.fileRecv.chunks.push(msg.payload.base64);
                    return;
                }

                if (msg.kind === 'file-end' && this.fileRecv) {
                    const { name, mime, transferId } = this.fileRecv.meta;
                    const base64 = this.fileRecv.chunks.join('');
                    const path = `${RNFS.CachesDirectoryPath}/${Date.now()}_${name}`;
                    await RNFS.writeFile(path, base64, 'base64');
                    this.onFile && this.onFile({ name, mime, path, transferId });
                    this.fileRecv = null;
                    return;
                }
            } catch {
                // message non JSON -> ignorer
            }
        };
    }

    // Appelé par l'initiateur
    async connectAsCaller() {
        await this.ensurePC();
        this.dc = this.pc.createDataChannel('chat');
        this.bindDataChannel();

        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        this.whisper('offer', offer);
    }

    // Ajout audio/vidéo local et envoi au pair
    async enableAV({ audio = true, video = true } = {}) {
        await this.ensurePC();
        const stream = await mediaDevices.getUserMedia({ audio, video });
        stream.getTracks().forEach((t) => this.pc.addTrack(t, stream));
        return stream; // pour afficher le local preview
    }

    close() {
        try { this.dc && this.dc.close(); } catch { }
        try { this.pc && this.pc.close(); } catch { }
        this.dc = null;
        this.pc = null;
    }

    // ----------- Envoi de message texte -----------
    async sendTextMessage(messageObj) {
        // messageObj : {id, message_content, user:{id,...}, created_at, ...}
        if (this.dc && this.dc.readyState === 'open') {
            this.dc.send(JSON.stringify({ kind: 'text', payload: messageObj }));
        }
    }

    // ----------- Envoi de fichier (chunké) -----------
    /**
     * file: { path, name, mime } (depuis un picker)
     * chunkSize: ~64KB par défaut
     */
    async sendFile({ path, name, mime }, chunkSize = 64 * 1024) {
        if (!this.dc || this.dc.readyState !== 'open') return;

        const transferId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const base64 = await RNFS.readFile(path, 'base64');
        this.dc.send(JSON.stringify({ kind: 'file-meta', payload: { name, mime, size: base64.length, transferId } }));

        for (let i = 0; i < base64.length; i += chunkSize) {
            const chunk = base64.substring(i, i + chunkSize);
            this.dc.send(JSON.stringify({ kind: 'file-chunk', payload: { transferId, base64: chunk } }));
        }
        this.dc.send(JSON.stringify({ kind: 'file-end', payload: { transferId } }));
    }

    // ----------- Stockage local (append) -----------
    static async appendLocalMessage(chatKey, msg) {
        const raw = await AsyncStorage.getItem(chatKey);
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift(msg);
        await AsyncStorage.setItem(chatKey, JSON.stringify(arr));
        return arr;
    }

    static async loadLocalMessages(chatKey) {
        const raw = await AsyncStorage.getItem(chatKey);
        return raw ? JSON.parse(raw) : [];
    }
}
