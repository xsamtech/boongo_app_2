/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import RTCManager from './RTCManager';

export default class RTCGroupManager {
    constructor({ echo, roomName, localUserId, members, onMessage, onFile, onPeerState }) {
        this.echo = echo;
        this.roomName = roomName;
        this.localUserId = localUserId;
        this.members = members.filter((id) => id !== localUserId);
        this.onMessage = onMessage;
        this.onFile = onFile;
        this.onPeerState = onPeerState;
        this.peers = {};
    }

    init() {
        this.members.forEach((peerId) => {
            const rtc = new RTCManager({
                echo: this.echo,
                roomName: `${this.roomName}.${peerId}`,
                localUserId: this.localUserId,
                onMessage: this.onMessage,
                onFile: this.onFile,
                onPeerState: (s) => this.onPeerState && this.onPeerState(peerId, s),
            });
            rtc.attachSignaling();
            rtc.connectAsCaller().catch(console.warn);
            this.peers[peerId] = rtc;
        });
    }

    sendTextMessage(msgObj) {
        Object.values(this.peers).forEach((rtc) => rtc.sendTextMessage(msgObj));
    }

    sendFile(file) {
        Object.values(this.peers).forEach((rtc) => rtc.sendFile(file));
    }

    closeAll() {
        Object.values(this.peers).forEach((rtc) => rtc.close());
        this.peers = {};
    }
}
