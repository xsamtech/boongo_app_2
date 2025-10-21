/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 *
 * NewChatScreen.js
 * Updated to use RTCManager with peerId and robust signaling.
 * Comments in English.
 */
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  UIManager,
  LayoutAnimation,
  ToastAndroid,
} from 'react-native';
import { pick, types as docTypes, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { API, IMAGE_SIZE, PADDING, TEXT_SIZE } from '../../tools/constants';
import CallScreen from '../../components/call_screen';
import RTCManager from '../../webrtc/RTCManager';
import RTCGroupManager from '../../webrtc/RTCGroupManager';
import MessageItem from '../../components/message_item';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';

const NewChatScreen = ({ route }) => {
  // =============== Params =
  const { chat_entity, chat_entity_id, chat_entity_name, chat_entity_profile, doc_title, doc_page, doc_note } = route.params || {};

  // =============== Colors / hooks =
  const COLORS = useColors();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

  // =============== States =
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [isPicking, setIsPicking] = useState(false);
  const MAX_FILES = 20;

  const [rtc, setRtc] = useState(null);
  const [rtcGroup, setRtcGroup] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [showCall, setShowCall] = useState(false);

  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojis, setEmojis] = useState([]);
  const [answeredFor, setAnsweredFor] = useState(null);
  const [inputHeight, setInputHeight] = useState(44);
  const [isLoading, setIsLoading] = useState(false);

  // =============== Local storage keys =
  const chatKey = `chat:${chat_entity}:${chat_entity_id}:with:${userInfo.id}`;
  const metaKey = `chatmeta:${chat_entity}:${chat_entity_id}:with:${userInfo.id}`;

  // =============== Save chat metadata locally =
  useEffect(() => {
    const meta = {
      chat_entity,
      chat_entity_id,
      chat_entity_name,
      chat_entity_profile,
    };
    AsyncStorage.setItem(metaKey, JSON.stringify(meta)).catch(console.warn);
  }, [chat_entity, chat_entity_id, chat_entity_name, chat_entity_profile]);

  // =============== Enable LayoutAnimation (Android) =
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // =============== Keyboard handling =
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardOffset(30));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardOffset(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // =============== Echo + WebRTC init =
  useEffect(() => {
    if (!userInfo?.api_token || !userInfo?.id) return;

    window.Pusher = Pusher;

    const echo = new Echo({
      broadcaster: 'pusher',
      key: '39cd87aabfcac5d515e8',
      cluster: 'mt1',
      wsHost: 'ws-mt1.pusher.com',
      wsPort: 443,
      forceTLS: true,
      encrypted: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${API.boongo_url}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${userInfo.api_token}`,
          'X-user-id': userInfo.id,
          'X-localization': 'fr',
        },
      },
    });

    echo.connector.pusher.connection.bind('connected', () => {
      console.log('Echo connected, socketId=', echo.socketId());
    });

    // choose channel to listen for normal MessageSent events
    let channelName = '';
    let channel = null;

    switch (chat_entity) {
      case 'user':
        channelName = `chat.${userInfo.id}`;
        channel = echo.private(channelName);
        break;
      case 'circle':
        channelName = `circle.${chat_entity_id}`;
        channel = echo.private(channelName);
        break;
      case 'organization':
        channelName = `organization.${chat_entity_id}`;
        channel = echo.private(channelName);
        break;
      case 'event':
        channelName = `event.${chat_entity_id}`;
        channel = echo.private(channelName);
        break;
      default:
        return;
    }

    // Listen incoming normal messages sent by backend (if any)
    channel.listen('MessageSent', async (e) => {
      console.log('📡 New message received:', e.message);
      setMessages((prev) => [e.message, ...prev]);

      // Save chat meta if missing (for recipient)
      try {
        const metaExists = await AsyncStorage.getItem(metaKey);
        if (!metaExists) {
          const meta = {
            chat_entity,
            chat_entity_id: e.message.user?.id || chat_entity_id,
            chat_entity_name:
              e.message.user?.firstname && e.message.user?.lastname
                ? `${e.message.user.firstname} ${e.message.user.lastname}`
                : chat_entity_name || 'Utilisateur',
            chat_entity_profile: e.message.user?.avatar_url || chat_entity_profile || null,
          };
          await AsyncStorage.setItem(metaKey, JSON.stringify(meta));
        }
      } catch (err) {
        console.warn('Failed to save chat meta on recv', err);
      }
    });

    // =============================
    // WebRTC 1-to-1
    // =============================
    if (chat_entity === 'user') {
      const a = Math.min(userInfo.id, chat_entity_id);
      const b = Math.max(userInfo.id, chat_entity_id);
      const roomName = `webrtc.user.${a}-${b}`;
      const isCaller = userInfo.id < chat_entity_id;

      console.log('NewChat: room=', roomName, 'isCaller=', isCaller, 'peerId=', chat_entity_id);

      const rtcMgr = new RTCManager({
        echo,
        roomName,
        peerId: chat_entity_id, // IMPORTANT: target peer id for signaling whispers
        localUserId: userInfo.id,
        onMessage: async (msgObj) => {
          const next = await RTCManager.appendLocalMessage(chatKey, msgObj);
          setMessages(next);
        },
        onFile: async ({ name, mime, path }) => {
          const msg = {
            id: Date.now(),
            message_content: `📎 ${name}`,
            user: { id: chat_entity_id },
            created_at: new Date().toISOString(),
            documents: [{ file_url: 'file://' + path, file_name: name, mime }],
          };
          const next = await RTCManager.appendLocalMessage(chatKey, msg);
          setMessages(next);
        },
        onPeerState: (state) => console.log('RTC state:', state),
        onRemoteStream: (stream) => setRemoteStream(stream),
      });

      // Attach signaling (listens on chat.{localUserId})
      rtcMgr.attachSignaling();

      // Initiate offer only if this client is the "caller"
      if (isCaller) {
        rtcMgr.connectAsCaller().catch(console.warn);
      }

      setRtc(rtcMgr);

      return () => {
        try {
          echo.leave(channelName);
        } catch (e) {}
        rtcMgr.close();
      };
    }

    // =============================
    // Group chat (circle) mesh
    // =============================
    if (chat_entity === 'circle') {
      const roomName = `webrtc.circle.${chat_entity_id}`;

      // TODO: fetch actual members list via API
      const members = []; // e.g. [userId1, userId2...]

      const rtcGrp = new RTCGroupManager({
        echo,
        roomName,
        localUserId: userInfo.id,
        members,
        onMessage: async (msgObj) => {
          const next = await RTCManager.appendLocalMessage(chatKey, msgObj);
          setMessages(next);
        },
        onFile: async ({ name, mime, path }) => {
          const msg = {
            id: Date.now(),
            message_content: `📎 ${name}`,
            user: { id: 0 },
            created_at: new Date().toISOString(),
            documents: [{ file_url: 'file://' + path, file_name: name, mime }],
          };
          const next = await RTCManager.appendLocalMessage(chatKey, msg);
          setMessages(next);
        },
        onPeerState: (peerId, state) => console.log(`Peer ${peerId} → ${state}`),
      });

      rtcGrp.init();
      setRtcGroup(rtcGrp);

      return () => {
        try {
          echo.leave(channelName);
        } catch (e) {}
        rtcGrp.closeAll();
      };
    }
  }, [userInfo, chat_entity, chat_entity_id]);

  // =============== Load local messages on open =
  useEffect(() => {
    (async () => {
      const local = await RTCManager.loadLocalMessages(chatKey);
      setMessages(local);
    })();
  }, [chatKey]);

  // =============== Handle send (text + files) =
  const handleSend = async () => {
    // nothing to send
    if (!text.trim() && files.length === 0) return;

    setIsLoading(true);

    try {
      // 1) send text message if any
      if (text.trim()) {
        const messageObj = {
          id: Date.now(),
          message_content: text,
          user: { id: userInfo.id, avatar_url: userInfo.avatar_url || null },
          created_at: new Date().toISOString(),
          answered_for: answeredFor,
          type_id: 27,
        };

        // persist local + display
        const next = await RTCManager.appendLocalMessage(chatKey, messageObj);
        setMessages(next);

        // send via dc or group manager
        if (rtc && rtc.dc && rtc.dc.readyState === 'open') {
          rtc.sendTextMessage(messageObj);
        } else if (rtcGroup) {
          rtcGroup.broadcastTextMessage(messageObj);
        } else {
          console.warn('No active RTC channel to send text');
        }
      }

      // 2) send files (if any) — one message per file
      for (let f of files) {
        const fileMsg = {
          id: Date.now() + Math.random(),
          message_content: `📎 ${f.name}`,
          user: { id: userInfo.id, avatar_url: userInfo.avatar_url || null },
          created_at: new Date().toISOString(),
          documents: [{ file_url: f.uri, file_name: f.name, mime: f.type || f.mime }],
          type_id: 28,
        };

        const next2 = await RTCManager.appendLocalMessage(chatKey, fileMsg);
        setMessages(next2);

        // send actual bytes via rtc
        const path = f.uri.replace('file://', '');
        if (rtc && rtc.dc && rtc.dc.readyState === 'open') {
          await rtc.sendFile({ path, name: f.name, mime: f.type || f.mime });
        } else if (rtcGroup) {
          rtcGroup.broadcastFile({ path, name: f.name, mime: f.type || f.mime });
        } else {
          console.warn('No active RTC channel to send file');
        }
      }

      // cleanup
      setText('');
      setFiles([]);
    } catch (err) {
      console.warn('Error in handleSend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // =============== File picker helpers =
  const acceptedExtensions = ['jpg', 'jpeg', 'png', 'mp4', 'avi', 'mov', 'mkv', 'webm', 'pdf', 'mp3', 'wav'];
  const filterValidFiles = (files) => files.filter((file) => acceptedExtensions.includes(file.name.split('.').pop().toLowerCase()));

  const pickFiles = async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      const selectedFiles = await pick({
        mode: 'import',
        allowMultiSelection: true,
        types: [docTypes.images, docTypes.audio, docTypes.video, docTypes.pdf],
      });

      const validFiles = filterValidFiles(selectedFiles);
      const totalFiles = files.length + validFiles.length;
      if (totalFiles > MAX_FILES) {
        const allowedToAdd = MAX_FILES - files.length;
        const limitedFiles = validFiles.slice(0, allowedToAdd);
        setFiles((prev) => [...prev, ...limitedFiles]);
        ToastAndroid.show(`Max ${MAX_FILES} fichiers`, ToastAndroid.LONG);
      } else {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.userCancelled) console.log('User canceled file pick');
      else console.error('File pick error:', err);
    } finally {
      setIsPicking(false);
    }
  };

  // =============== Call UI =
  if (showCall) {
    return (
      <CallScreen
        localStream={localStream}
        remoteStream={remoteStream}
        onHangup={() => {
          rtc?.close();
          rtcGroup?.closeAll();
          setLocalStream(null);
          setRemoteStream(null);
          setShowCall(false);
        }}
      />
    );
  }

  // =============== Helpers: filename truncation & icon =
  const truncateFileName = (name, maxLength = 30) => {
    if (name.length <= maxLength) return name;
    const start = name.slice(0, 15);
    const end = name.slice(-12);
    return `${start} ... ${end}`;
  };

  const getIconName = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'file-image-outline';
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return 'television-play';
    if (['pdf'].includes(ext)) return 'file-document-outline';
    if (['mp3', 'wav'].includes(ext)) return 'microphone-outline';
    return 'file-outline';
  };

  // =============== UI render =
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={keyboardOffset}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
          {/* Header */}
          <View style={[homeStyles.headerBanner, { backgroundColor: COLORS.white, paddingTop: PADDING.p02, paddingBottom: PADDING.p02, paddingLeft: 0 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name='chevron-left' size={30} color={COLORS.black} />
              </TouchableOpacity>
              <Image source={{ uri: chat_entity_profile }} style={{ width: IMAGE_SIZE.s08, height: IMAGE_SIZE.s08, marginRight: PADDING.p01, borderRadius: IMAGE_SIZE.s13 / 2, borderWidth: 1, borderColor: COLORS.light_secondary }} />
              <Text style={{ fontSize: TEXT_SIZE.paragraph, fontWeight: '500', color: COLORS.black }}>
                {chat_entity_name && chat_entity_name.length > 25 ? chat_entity_name.slice(0, 25) + '...' : chat_entity_name || 'Utilisateur inconnu'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const s = await rtc?.enableAV({ audio: true, video: true });
                    setLocalStream(s);
                    setShowCall(true);
                  } catch (e) {
                    console.warn('enableAV error:', e);
                    ToastAndroid.show('Permission or device error for camera/mic', ToastAndroid.LONG);
                  }
                }}
              >
                <Icon name='phone-plus' size={23} color={COLORS.black} />
              </TouchableOpacity>

              <TouchableOpacity style={{ marginLeft: PADDING.p01 }} onPress={pickFiles}>
                <Icon name='paperclip' size={23} color={COLORS.black} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages */}
          <FlatList
            data={messages}
            keyExtractor={(item, index) => item.id?.toString() || `msg-${index}`}
            renderItem={({ item }) => (item && item.user ? <MessageItem item={item} isOwnMessage={item.user.id === userInfo.id} /> : null)}
            inverted
            style={{ flex: 1, padding: PADDING.p01 }}
          />

          {/* Selected files preview */}
          {files.length > 0 && (
            <>
              <Text style={[homeStyles.authText, { color: COLORS.dark_secondary }]}>{t('work.selected_files')}</Text>
              <FlatList
                data={files}
                scrollEnabled={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.light_secondary, borderRadius: PADDING.p01, padding: PADDING.p01, marginVertical: 4 }}>
                    <Icon name={getIconName(item.name)} size={22} color={COLORS.black} style={{ marginRight: 8 }} />
                    <Text style={{ flex: 1, color: COLORS.black }}>{truncateFileName(item.name)}</Text>
                    <TouchableOpacity style={{ backgroundColor: COLORS.danger, padding: 6, borderRadius: PADDING.p07, marginLeft: 8 }} onPress={() => { const updated = [...files]; updated.splice(index, 1); setFiles(updated); }}>
                      <Icon name='close' size={16} color='white' />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          )}

          {/* Input + send */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', padding: PADDING.p01 }}>
            <View style={{ flex: 1, position: 'relative' }}>
              <TextInput
                multiline
                value={text}
                onChangeText={setText}
                onContentSizeChange={(e) => {
                  const newHeight = e.nativeEvent.contentSize.height;
                  setInputHeight(Math.min(newHeight, 120));
                }}
                scrollEnabled={inputHeight >= 120}
                onFocus={() => {
                  setShowEmojis(false);
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                }}
                placeholder={t('chat.write')}
                placeholderTextColor={COLORS.black}
                style={[homeStyles.authInput, { height: Math.max(44, inputHeight), maxHeight: 120, marginBottom: 0, borderRadius: PADDING.p08, borderColor: COLORS.dark_secondary, color: COLORS.black, textAlignVertical: 'top' }]}
              />
            </View>

            <TouchableOpacity onPress={handleSend} style={{ backgroundColor: COLORS.success, marginLeft: 8, width: 44, height: 44, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}>
              <Icon name='send' size={23} color='white' />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default NewChatScreen;
