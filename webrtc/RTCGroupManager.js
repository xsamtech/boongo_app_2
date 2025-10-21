/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 *
 * RTCGroupManager.js
 * Simple group (mesh) manager built on top of RTCManager (1-to-1 per peer).
 * Exposes broadcastTextMessage and broadcastFile for convenience.
 * Comments in English.
 */
import RTCManager from './RTCManager';

export default class RTCGroupManager {
  constructor({ echo, roomName, localUserId, members = [], onMessage, onFile, onPeerState }) {
    this.echo = echo;
    this.roomName = roomName;
    this.localUserId = localUserId;
    // members should be array of user ids (numbers)
    this.members = (members || []).filter((id) => id !== localUserId);
    this.onMessage = onMessage;
    this.onFile = onFile;
    this.onPeerState = onPeerState;
    this.peers = {}; // peerId -> RTCManager
  }

  // Initialize RTCManager for each member and attach signaling
  init() {
    this.members.forEach((peerId) => {
      const rtc = new RTCManager({
        echo: this.echo,
        roomName: `${this.roomName}.${peerId}`,
        peerId,
        localUserId: this.localUserId,
        onMessage: this.onMessage,
        onFile: this.onFile,
        onPeerState: (state) => this.onPeerState && this.onPeerState(peerId, state),
        onRemoteStream: () => {}, // group video not implemented here
      });

      rtc.attachSignaling();
      // try to connect as caller (both sides do this; handshake handled by signaling)
      rtc.connectAsCaller().catch(console.warn);

      this.peers[peerId] = rtc;
    });
  }

  // Broadcast text to ready peers
  broadcastTextMessage(msgObj) {
    Object.entries(this.peers).forEach(([peerId, rtc]) => {
      if (!rtc) {
        console.warn(`RTCGroup: peer ${peerId} missing`);
        return;
      }
      if (rtc.dc && rtc.dc.readyState === 'open') {
        rtc.sendTextMessage(msgObj);
      } else {
        console.warn(`RTCGroup: peer ${peerId} datachannel not open, skipping send`);
      }
    });
  }

  // Broadcast file to ready peers
  broadcastFile({ path, name, mime }) {
    Object.entries(this.peers).forEach(([peerId, rtc]) => {
      if (!rtc) {
        console.warn(`RTCGroup: peer ${peerId} missing`);
        return;
      }
      if (rtc.dc && rtc.dc.readyState === 'open') {
        rtc.sendFile({ path, name, mime }).catch(console.warn);
      } else {
        console.warn(`RTCGroup: peer ${peerId} datachannel not open, skipping file send`);
      }
    });
  }

  // Return number of ready peers
  countReadyPeers() {
    return Object.values(this.peers).filter((p) => p && p.dc && p.dc.readyState === 'open').length;
  }

  // Close all peer connections
  closeAll() {
    Object.values(this.peers).forEach((rtc) => {
      try {
        rtc.close();
      } catch (err) {
        console.warn('RTCGroup: error closing peer', err);
      }
    });
    this.peers = {};
  }
}
