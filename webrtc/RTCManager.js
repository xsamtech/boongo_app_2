/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const ICE_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // You can add your TURN servers here for better reliability (4G/CGNAT)
    ],
};

export default class RTCManager {
    constructor({ echo, roomName, localUserId, onMessage, onFile, onPeerState, onRemoteStream }) {
        this.echo = echo;
        this.roomName = roomName;
        this.localUserId = localUserId;
        this.onMessage = onMessage;
        this.onFile = onFile;
        this.onPeerState = onPeerState;
        this.onRemoteStream = onRemoteStream;

        this.pc = null;
        this.dc = null;
        this.fileRecv = null;
        this.channel = null;
        this.isReady = false;
    }

    // === Signaling setup ===
    attachSignaling() {
        this.channel = this.echo.private(this.roomName);

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
                        } catch (err) {
                            console.warn('ICE candidate error:', err);
                        }
                    }
                    break;
            }
        });
    }

    whisper(type, data) {
        if (!this.channel) return;
        this.channel.whisper('signal', { type, from: this.localUserId, data });
    }

    async ensurePC() {
        if (this.pc) return this.pc;

        this.pc = new RTCPeerConnection(ICE_CONFIG);

        this.pc.onicecandidate = (e) => {
            if (e.candidate) this.whisper('ice', e.candidate);
        };

        this.pc.onconnectionstatechange = () => {
            if (!this.pc) return;
            const state = this.pc.connectionState || 'unknown';
            this.onPeerState && this.onPeerState(state);
        };

        this.pc.ondatachannel = (e) => {
            this.dc = e.channel;
            this.bindDataChannel();
        };

        this.pc.ontrack = (event) => {
            const [stream] = event.streams || [];
            if (stream) this.onRemoteStream && this.onRemoteStream(stream);
        };

        return this.pc;
    }

    bindDataChannel() {
        if (!this.dc) return;

        this.dc.onopen = () => {
            this.isReady = true;
            this.onPeerState && this.onPeerState('datachannel-open');
        };

        this.dc.onclose = () => {
            this.isReady = false;
            this.onPeerState && this.onPeerState('datachannel-close');
        };

        this.dc.onmessage = async (e) => {
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
            } catch (err) {
                console.warn('Invalid DataChannel message', err);
            }
        };
    }

    async connectAsCaller() {
        await this.ensurePC();
        if (!this.pc) return;
        this.dc = this.pc.createDataChannel('chat');
        this.bindDataChannel();

        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        this.whisper('offer', offer);
    }

    async enableAV({ audio = true, video = true } = {}) {
        await this.ensurePC();
        const stream = await mediaDevices.getUserMedia({ audio, video });
        stream.getTracks().forEach((t) => this.pc && this.pc.addTrack(t, stream));
        return stream;
    }

    close() {
        try {
            if (this.dc) this.dc.close();
        } catch (e) {
            console.warn('Error closing DC:', e);
        }

        try {
            if (this.pc) this.pc.close();
        } catch (e) {
            console.warn('Error closing PC:', e);
        }

        this.dc = null;
        this.pc = null;
        this.isReady = false;
    }

    // === Safe send message ===
    async sendTextMessage(messageObj) {
        if (!this.dc || this.dc.readyState !== 'open') {
            console.warn('⚠️ DataChannel not ready, message not sent.');
            return;
        }
        try {
            this.dc.send(JSON.stringify({ kind: 'text', payload: messageObj }));
        } catch (err) {
            console.warn('Error sending text message:', err);
        }
    }

    async sendFile({ path, name, mime }, chunkSize = 64 * 1024) {
        if (!this.dc || this.dc.readyState !== 'open') {
            console.warn('⚠️ DataChannel not ready, file not sent.');
            return;
        }

        const transferId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const base64 = await RNFS.readFile(path, 'base64');
        this.dc.send(JSON.stringify({ kind: 'file-meta', payload: { name, mime, size: base64.length, transferId } }));

        for (let i = 0; i < base64.length; i += chunkSize) {
            const chunk = base64.substring(i, i + chunkSize);
            this.dc.send(JSON.stringify({ kind: 'file-chunk', payload: { transferId, base64: chunk } }));
        }

        this.dc.send(JSON.stringify({ kind: 'file-end', payload: { transferId } }));
    }

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
