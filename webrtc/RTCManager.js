/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 *
 * RTCManager.js
 * 1-to-1 WebRTC manager using personal signaling channels chat.{userId}
 * Comments in English.
 *
 * - constructor accepts: { echo, roomName, peerId, localUserId, onMessage, onFile, onPeerState, onRemoteStream }
 * - signaling uses echo.private(`chat.${localUserId}`) to LISTEN and sends whispers to echo.private(`chat.${peerId}`)
 * - safe sends: checks datachannel readyState
 */
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add TURN servers if you have them
  ],
};

export default class RTCManager {
  constructor({ echo, roomName, peerId, localUserId, onMessage, onFile, onPeerState, onRemoteStream }) {
    this.echo = echo;
    this.roomName = roomName; // kept for compatibility / analytics
    this.peerId = peerId; // target peer id (required to send signaling whispers)
    this.localUserId = localUserId;
    this.onMessage = onMessage;
    this.onFile = onFile;
    this.onPeerState = onPeerState;
    this.onRemoteStream = onRemoteStream;

    this.pc = null;      // RTCPeerConnection
    this.dc = null;      // RTCDataChannel
    this.fileRecv = null;
    this.channel = null; // personal signaling subscription (chat.{localUserId})
    this.isReady = false;
  }

  // Attach to personal signaling channel chat.{localUserId}
  attachSignaling() {
    if (!this.echo) {
      console.warn('RTCManager: missing echo instance');
      return;
    }

    const myChannelName = `chat.${this.localUserId}`;
    try {
      this.channel = this.echo.private(myChannelName);
      console.log(`RTCManager: subscribed to signaling channel ${myChannelName}`);
    } catch (err) {
      console.warn('RTCManager attachSignaling subscribe error:', err);
    }

    // Listen for whisper 'signal' with payload { type, from, data }
    this.channel.listenForWhisper('signal', async (payload) => {
      try {
        const { type, from, data } = payload || {};
        if (!from) return;
        if (from === this.localUserId) return; // ignore self

        console.log(`RTCManager: received SIGNAL ${type} from ${from}`);

        // Ensure PC exists
        await this.ensurePC();

        switch (type) {
          case 'offer':
            // Received an offer: set remote, create answer and reply
            await this.pc.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);
            this.whisper('answer', answer, from);
            console.log('RTCManager: answered offer -> whisper(answer)');
            break;

          case 'answer':
            // Received an answer: set remote description if not already set
            if (this.pc && (!this.pc.remoteDescription || !this.pc.remoteDescription.type)) {
              await this.pc.setRemoteDescription(new RTCSessionDescription(data));
              console.log('RTCManager: set remote description (answer)');
            }
            break;

          case 'ice':
            if (this.pc) {
              try {
                await this.pc.addIceCandidate(new RTCIceCandidate(data));
              } catch (err) {
                console.warn('RTCManager: addIceCandidate error', err);
              }
            }
            break;

          default:
            console.warn('RTCManager: unknown signal type', type);
        }
      } catch (err) {
        console.warn('RTCManager signaling handler error:', err);
      }
    });
  }

  // Whisper a signal to target channel chat.{targetId} (default to this.peerId)
  whisper(type, data, targetId = this.peerId) {
    if (!this.echo) {
      console.warn('RTCManager.whisper: echo missing');
      return;
    }
    if (!targetId) {
      console.warn('RTCManager.whisper: targetId undefined');
      return;
    }
    try {
      const targetChannel = this.echo.private(`chat.${targetId}`);
      targetChannel.whisper('signal', { type, from: this.localUserId, data });
      console.log(`RTCManager: whisper ${type} -> chat.${targetId}`);
    } catch (err) {
      console.warn('RTCManager.whisper error:', err);
    }
  }

  // Create RTCPeerConnection and wire events
  async ensurePC() {
    if (this.pc) return this.pc;

    this.pc = new RTCPeerConnection(ICE_CONFIG);

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        // send ICE to peer
        this.whisper('ice', e.candidate);
      }
    };

    this.pc.onconnectionstatechange = () => {
      try {
        if (!this.pc) return;
        const state = this.pc.connectionState || 'unknown';
        this.onPeerState && this.onPeerState(state);
        console.log('RTCManager: connectionState ->', state);
      } catch (err) {
        console.warn('RTCManager onconnectionstatechange error:', err);
      }
    };

    this.pc.ondatachannel = (e) => {
      console.log('RTCManager: ondatachannel received', e?.channel?.label);
      this.dc = e.channel;
      this.bindDataChannel();
    };

    this.pc.ontrack = (event) => {
      const [stream] = event.streams || [];
      if (stream) this.onRemoteStream && this.onRemoteStream(stream);
    };

    return this.pc;
  }

  // Bind DataChannel events and message protocol
  bindDataChannel() {
    if (!this.dc) return;

    this.dc.onopen = () => {
      this.isReady = true;
      this.onPeerState && this.onPeerState('datachannel-open');
      console.log('RTCManager: datachannel open');
    };

    this.dc.onclose = () => {
      this.isReady = false;
      this.onPeerState && this.onPeerState('datachannel-close');
      console.log('RTCManager: datachannel close');
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
        console.warn('RTCManager: invalid datachannel message', err);
      }
    };
  }

  // Caller: create data channel + offer + whisper offer to peer
  async connectAsCaller() {
    await this.ensurePC();
    if (!this.pc) return;

    try {
      this.dc = this.pc.createDataChannel('chat');
      this.bindDataChannel();

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // send offer to peer via his personal channel
      this.whisper('offer', offer);
      console.log('RTCManager: offer sent to peer');
    } catch (err) {
      console.warn('RTCManager.connectAsCaller error:', err);
    }
  }

  // Enable getUserMedia and add tracks to PeerConnection
  async enableAV({ audio = true, video = true } = {}) {
    await this.ensurePC();
    const stream = await mediaDevices.getUserMedia({ audio, video });
    stream.getTracks().forEach((t) => this.pc && this.pc.addTrack(t, stream));
    return stream;
  }

  // Close gracefully
  close() {
    try {
      if (this.dc) this.dc.close();
    } catch (e) {
      console.warn('RTCManager: error closing dc', e);
    }
    try {
      if (this.pc) this.pc.close();
    } catch (e) {
      console.warn('RTCManager: error closing pc', e);
    }
    this.dc = null;
    this.pc = null;
    this.isReady = false;
  }

  // Safe send text
  async sendTextMessage(messageObj) {
    if (!this.dc || this.dc.readyState !== 'open') {
      console.warn('RTCManager: DataChannel not ready, cannot send text.');
      return;
    }
    try {
      this.dc.send(JSON.stringify({ kind: 'text', payload: messageObj }));
      console.log('RTCManager: text message sent via dc');
    } catch (err) {
      console.warn('RTCManager.sendTextMessage error:', err);
    }
  }

  // Safe send file (read and chunk)
  async sendFile({ path, name, mime }, chunkSize = 64 * 1024) {
    if (!this.dc || this.dc.readyState !== 'open') {
      console.warn('RTCManager: DataChannel not ready, cannot send file.');
      return;
    }
    try {
      const transferId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const base64 = await RNFS.readFile(path, 'base64');

      // meta
      this.dc.send(JSON.stringify({ kind: 'file-meta', payload: { name, mime, size: base64.length, transferId } }));

      // chunks
      for (let i = 0; i < base64.length; i += chunkSize) {
        const chunk = base64.substring(i, i + chunkSize);
        this.dc.send(JSON.stringify({ kind: 'file-chunk', payload: { transferId, base64: chunk } }));
      }

      // end
      this.dc.send(JSON.stringify({ kind: 'file-end', payload: { transferId } }));
      console.log('RTCManager: file transfer completed (sent meta/chunks/end)');
    } catch (err) {
      console.warn('RTCManager.sendFile error:', err);
    }
  }

  // Local storage helpers
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
