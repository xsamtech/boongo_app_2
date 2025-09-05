/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, UIManager, LayoutAnimation } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import axios from 'axios';
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
  // =============== Get parameters ===============
  const { chat_entity, chat_entity_id, chat_entity_name, chat_entity_profile, doc_title, doc_page, doc_note } = route.params || {};
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const [keyboardOffset, setKeyboardOffset] = useState(0); // Manage the "TextInput" position when the keyboard appears/disappears
  const [messages, setMessages] = useState([]);
  const [isPicking, setIsPicking] = useState(false);
  const [files, setFiles] = useState([]);
  const MAX_FILES = 20;

  const [rtc, setRtc] = useState(null);
  const [rtcGroup, setRtcGroup] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [showCall, setShowCall] = useState(false);

  // Clé de stockage local (1-1 user)
  const chatKey = `chat:${chat_entity}:${chat_entity_id}:with:${userInfo.id}`;
  // RoomName de signalisation (1-1)
  const roomName = (() => {
    if (chat_entity === 'user') {
      const a = Math.min(userInfo.id, chat_entity_id);
      const b = Math.max(userInfo.id, chat_entity_id);
      return `webrtc.user.${a}-${b}`;
    }
    // Pour circle/org/event, on peut faire: `webrtc.circle.${chat_entity_id}` (mesh P2P, à itérer plus tard)
    return `webrtc.${chat_entity}.${chat_entity_id}`;
  })();

  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojis, setEmojis] = useState([]);
  const [answeredFor, setAnsweredFor] = useState(null);
  const [inputHeight, setInputHeight] = useState(44);
  const [isLoading, setIsLoading] = useState(false);
  const endpoint = `${API.boongo_url}/message/selected_chat/fr/Discussion/${userInfo.id}/${chat_entity}/${chat_entity_id}`;

  console.log(`Document title: ${doc_title}`);
  console.log(`Document page: ${doc_page}`);
  console.log(`My note: ${doc_note}`);

  // Fixing the error is often related to using LayoutAnimation or Keyboard.scheduleLayoutAnimation()
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Listen to the keyboard opening/closing
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => { setKeyboardOffset(30); });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => { setKeyboardOffset(0); });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Distinguer les cas 1-to-1 (RTCManager) et groupes (RTCGroupManager)
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
      const socketId = echo.socketId();
      console.log('📡 Socket ID connecté :', socketId);
    });

    // Canal Laravel Echo (pour compatibilité avec events backend)
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

    channel.listen('MessageSent', (e) => {
      console.log('📡 Nouveau message reçu :', e.message);
      setMessages((prev) => [e.message, ...prev]);
    });

    // =============================
    // 🎯 WebRTC init
    // =============================
    if (chat_entity === 'user') {
      // 👉 Cas 1-to-1
      const roomName = `webrtc.user.${Math.min(userInfo.id, chat_entity_id)}-${Math.max(userInfo.id, chat_entity_id)}`;

      const rtcMgr = new RTCManager({
        echo,
        roomName,
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

      rtcMgr.attachSignaling();
      rtcMgr.connectAsCaller().catch(console.warn);
      setRtc(rtcMgr);

      return () => {
        echo.leave(channelName);
        rtcMgr.close();
      };
    }

    if (chat_entity === 'circle') {
      // 👉 Cas groupe (mesh)
      const roomName = `webrtc.circle.${chat_entity_id}`;

      // ⚠️ Tu dois récupérer la liste des membres du cercle (ex via ton API circle_user)
      const members = []; // <- remplis avec [id1, id2, id3...]

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
            user: { id: 0 }, // TODO: ajoute "from" dans RTCManager pour indiquer expéditeur
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
        echo.leave(channelName);
        rtcGrp.closeAll();
      };
    }

    // Tu peux étendre pour organization/event comme pour circle
  }, [userInfo, chat_entity, chat_entity_id]);


  // Selected chat (Messages list)
  // Charger les messages locaux à l'ouverture
  useEffect(() => {
    (async () => {
      const local = await RTCManager.loadLocalMessages(chatKey);
      setMessages(local);
    })();
  }, [chatKey]);

  // Emojis
  useEffect(() => {
    if (!showEmojis || emojis.length > 0) return;

    axios.get(`https://emoji-api.com/emojis?access_key=${API.open_emoji_key}`)
      .then(res => {
        setEmojis(res.data.slice(0, 500)); // Initial limit for performance
      })
      .catch(error => {
        console.error(t('error'), error);
      });
  }, [showEmojis]);

  const handleSend = () => {
    setIsLoading(true);

    // if (!text.trim()) return;
    if (!text.trim()) { setIsLoading(false); return; }
  };

  // Construire un objet compatible MessageItem
  const messageObj = {
    id: Date.now(),
    message_content: text,
    user: { id: userInfo.id, avatar_url: userInfo.avatar_url || null },
    created_at: new Date().toISOString(),
    answered_for: answeredFor,
    type_id: 27,
  };

  // 1) j'affiche et persiste localement
  RTCManager.appendLocalMessage(chatKey, messageObj).then((next) => {
    setMessages(next);
  });

  // 2) j'envoie au pair via DataChannel
  rtc?.sendTextMessage(messageObj);

  setText('');
  setIsLoading(false);

  if (!endpoint) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.light_secondary }}>
        <Text style={{ fontSize: TEXT_SIZE.header }}>{t('error_message.no_addressee_selected')}</Text>
      </View>
    );
  }

  // =============== Truncate long file name ===============
  const truncateFileName = (name, maxLength = 30) => {
    if (name.length <= maxLength) return name;
    const start = name.slice(0, 15);
    const end = name.slice(-12);
    return `${start} ... ${end}`;
  };

  // =============== Get icon according to file type ===============
  const getIconName = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'file-image-outline';
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return 'television-play';
    if (['pdf'].includes(ext)) return 'file-document-outline';
    if (['mp3', 'wav'].includes(ext)) return 'microphone-outline';
    return 'file-outline';
  };

  const acceptedExtensions = ['jpg', 'jpeg', 'png', 'mp4', 'avi', 'mov', 'mkv', 'webm', 'pdf', 'mp3', 'wav'];

  const filterValidFiles = (files) => {
    return files.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return acceptedExtensions.includes(ext);
    });
  };

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

        setFiles(prev => [...prev, ...limitedFiles]);
        ToastAndroid.show(`Max ${MAX_FILES} fichiers`, ToastAndroid.LONG);
        console.warn(`Limite de ${MAX_FILES} fichiers atteinte.`);
      } else {
        setFiles(prev => [...prev, ...validFiles]);
      }

      // Envoi direct via WebRTC
      for (let f of validFiles) {
        await rtc?.sendFile({
          path: f.uri.replace('file://', ''),
          name: f.name,
          mime: f.type,
        });
      }

    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.userCancelled) {
        console.log('Annulé.');
      } else {
        console.error('Erreur sélection:', err);
      }
    } finally {
      setIsPicking(false);
    }
  };

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>

          {/* Header */}
          <View style={[homeStyles.headerBanner, {
            backgroundColor: COLORS.white,
            paddingTop: PADDING.p02,
            paddingBottom: PADDING.p02,
            paddingLeft: 0
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name='chevron-left' size={30} color={COLORS.black} />
              </TouchableOpacity>
              <Image source={{ uri: chat_entity_profile }} style={{ width: IMAGE_SIZE.s08, height: IMAGE_SIZE.s08, marginRight: PADDING.p01, borderRadius: IMAGE_SIZE.s13 / 2, borderWidth: 1, borderColor: COLORS.light_secondary }} />
              <Text style={{ fontSize: TEXT_SIZE.paragraph, fontWeight: '500', color: COLORS.black }}>
                {chat_entity_name.length > 25 ? chat_entity_name.slice(0, 25) + '...' : chat_entity_name}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const s = await rtc?.enableAV({ audio: true, video: true });
                    setLocalStream(s);
                    setShowCall(true);
                  } catch (e) { console.warn(e); }
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
            // renderItem={({ item }) => <MessageItem item={item} isOwnMessage={item.user.id === userInfo.id} />}
            renderItem={({ item }) => {
              if (!item || !item.id || !item.user || !item.user.id) {
                console.warn("Message mal formé", item);

                return null;
              }
              return <MessageItem item={item} isOwnMessage={item.user.id === userInfo.id} />;
            }}
            inverted
            style={{ flex: 1, padding: PADDING.p01 }}
          />

          {/* Emoji Panel */}
          {showEmojis && (
            <View style={{
              width: 300,
              height: 300,
              backgroundColor: COLORS.white,
              padding: 10,
              alignSelf: 'flex-end',
              borderTopWidth: 1,
              borderTopColor: COLORS.dark_secondary
            }}>
              {emojis.length === 0 ?
                (<View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, color: COLORS.black }}>{t('loading')}</Text>
                </View>)
                :
                (<FlatList
                  data={emojis}
                  keyExtractor={(item) => item.slug}
                  numColumns={7}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ padding: 5, alignItems: 'center', justifyContent: 'center' }}
                      onPress={() => setText(prev => prev + item.character)}
                    >
                      <Text style={{ fontSize: 24, color: COLORS.black }}>{item.character}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />)
              }
            </View>
          )}

          {/* Input + Send */}
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
                style={[
                  homeStyles.authInput,
                  {
                    height: Math.max(44, inputHeight),
                    maxHeight: 120,
                    marginBottom: 0,
                    borderRadius: PADDING.p08,
                    borderColor: COLORS.dark_secondary,
                    color: COLORS.black,
                    textAlignVertical: 'top',
                  }
                ]}
              />
              <TouchableOpacity
                style={{ position: 'absolute', top: PADDING.p01, right: PADDING.p01 }}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowEmojis(prev => !prev);
                }}
              >
                <Icon name={showEmojis ? 'close' : 'sticker-emoji'} size={25} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSend}
              style={{
                backgroundColor: COLORS.success,
                marginLeft: 8,
                width: 44,
                height: 44,
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Icon name='send' size={23} color='white' />
            </TouchableOpacity>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default NewChatScreen;