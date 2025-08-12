/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, Image, ToastAndroid, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, UIManager, LayoutAnimation } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import MessageItem from '../../components/message_item';
import { API, IMAGE_SIZE, PADDING, TEXT_SIZE } from '../../tools/constants';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';

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

  // 
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
          'X-localization': 'fr'
        }
      }
    });

    echo.connector.pusher.connection.bind('connected', () => {
      const socketId = echo.socketId();
      console.log('📡 Socket ID connecté :', socketId);
    });


    // Canal à écouter
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
      setMessages(prev => [e.message, ...prev]);
    });

    return () => {
      echo.leave(channelName);
    };
  }, [userInfo, chat_entity, chat_entity_id]);



  // Selected chat (Messages list)
  useEffect(() => {
    // if (!endpoint) return;

    axios.get(endpoint, {
      headers: {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`,
        'X-user-id': userInfo.id,
      }
    }).then(res => {
      setMessages(res.data.data);
      setIsLoading(false);
    });
  }, [endpoint]);

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

    if (!text.trim()) return;

    let dataToSend = {};
    const commonData = {
      message_content: text,
      answered_for: answeredFor,
      type_id: 27,
      user_id: userInfo.id,
    };

    switch (chat_entity) {
      case 'user':
        dataToSend = {
          ...commonData,
          addressee_user_id: chat_entity_id
        };
        break;
      case 'circle':
        dataToSend = {
          ...commonData,
          addressee_circle_id: chat_entity_id
        };
        break;
      case 'organization':
        dataToSend = {
          ...commonData,
          addressee_organization_id: chat_entity_id
        };
        break;
      case 'event':
        dataToSend = {
          ...commonData,
          event_id: chat_entity_id
        };
        break;
    }

    axios.post(`${API.boongo_url}/message`, dataToSend, {
      headers: {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`,
        'X-user-id': userInfo.id,
      }
    })
      .then(res => {
        setMessages(prevMessages => [res.data.data, ...prevMessages]);
        setText('');
        setIsLoading(false);
      })
      .catch(error => {
        console.error(t('error'), error);
        ToastAndroid.show(`${t('error')} ${error}`, ToastAndroid.LONG)
        setIsLoading(false);
      });
  };

  if (!endpoint) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.light_secondary }}>
        <Text style={{ fontSize: TEXT_SIZE.header }}>{t('error_message.no_addressee_selected')}</Text>
      </View>
    );
  }

  // return (
  //   <View style={{ flex: 1, backgroundColor: COLORS.white }}>
  //     {messages.map((message, index) => (
  //       <Text key={message.id || index} style={{ fontSize: TEXT_SIZE.paragraph, fontWeight: '500', color: COLORS.black }}>
  //         {message.message_content}
  //       </Text>
  //     ))}
  //   </View>
  // );

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
              <TouchableOpacity>
                <Icon name='phone-plus' size={23} color={COLORS.black} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: PADDING.p01 }}>
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