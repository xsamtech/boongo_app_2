/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  UIManager,
  LayoutAnimation
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import MessageItem from '../../components/message_item';
import { API, IMAGE_SIZE, PADDING, TEXT_SIZE } from '../../tools/constants';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';

const NewChatScreen = ({ route }) => {
  // =============== Get parameters ===============
  const { chat_entity, chat_entity_id, chat_entity_name, chat_entity_profile } = route.params || {};
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
  const [loading, setLoading] = useState(true);
  const endpoint = `${API.boongo_url}/message/selected_chat/fr/Discussion/${userInfo.id}/${chat_entity}/${chat_entity_id}`;

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

  // Endpoint
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
      setLoading(false);
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
        setMessages([res.data.data, ...messages]);
        setText('');
      })
      .catch(error => {
        console.error(t('error'), error);
        ToastAndroid.show(`${t('error')} ${error}`, ToastAndroid.LONG)
      });
  };

  if (!endpoint) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.light_secondary }}>
        <Text style={{ fontSize: TEXT_SIZE.header }}>{t('error_message.no_addressee_selected')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      {messages.map((message, index) => (
        <Text style={{ fontSize: TEXT_SIZE.paragraph, fontWeight: '500', color: COLORS.black }}>
          {message.message_content}
        </Text>
      ))}
    </View>
  );

  // return (
  //   <KeyboardAvoidingView
  //     style={{ flex: 1 }}
  //     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  //     keyboardVerticalOffset={keyboardOffset}
  //   >
  //     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  //       <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>

  //         {/* Header */}
  //         <View style={[homeStyles.headerBanner, {
  //           backgroundColor: COLORS.white,
  //           paddingTop: PADDING.p02,
  //           paddingBottom: PADDING.p02,
  //           paddingLeft: 0
  //         }]}>
  //           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  //             <TouchableOpacity onPress={() => navigation.goBack()}>
  //               <Icon name='chevron-left' size={30} color={COLORS.black} />
  //             </TouchableOpacity>
  //             <Image source={{ uri: chat_entity_profile }} style={{ width: IMAGE_SIZE.s08, height: IMAGE_SIZE.s08, marginRight: PADDING.p01, borderRadius: IMAGE_SIZE.s13 / 2, borderWidth: 1, borderColor: COLORS.light_secondary }} />
  //             <Text style={{ fontSize: TEXT_SIZE.paragraph, fontWeight: '500', color: COLORS.black }}>
  //               {chat_entity_name.length > 25 ? chat_entity_name.slice(0, 25) + '...' : chat_entity_name}
  //             </Text>
  //           </View>
  //           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  //             <TouchableOpacity>
  //               <Icon name='phone-plus' size={23} color={COLORS.black} />
  //             </TouchableOpacity>
  //             <TouchableOpacity style={{ marginLeft: PADDING.p01 }}>
  //               <Icon name='paperclip' size={23} color={COLORS.black} />
  //             </TouchableOpacity>
  //           </View>
  //         </View>

  //         {/* Messages */}
  //         <FlatList
  //           data={messages}
  //           renderItem={({ item }) => <MessageItem message={item} />}
  //           keyExtractor={(item, index) => index.toString()}
  //           inverted
  //           style={{ flex: 1 }}
  //         />

  //         {/* Emoji Panel */}
  //         {showEmojis && (
  //           <View style={{
  //             width: 300,
  //             height: 300,
  //             backgroundColor: COLORS.white,
  //             padding: 10,
  //             alignSelf: 'flex-end',
  //             borderTopWidth: 1,
  //             borderTopColor: COLORS.dark_secondary
  //           }}>
  //             {emojis.length === 0 ?
  //               (<View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
  //                 <Text style={{ fontSize: 24, color: COLORS.black }}>{t('loading')}</Text>
  //               </View>)
  //               :
  //               (<FlatList
  //                 data={emojis}
  //                 keyExtractor={(item) => item.slug}
  //                 numColumns={7}
  //                 renderItem={({ item }) => (
  //                   <TouchableOpacity
  //                     style={{ padding: 5, alignItems: 'center', justifyContent: 'center' }}
  //                     onPress={() => setText(prev => prev + item.character)}
  //                   >
  //                     <Text style={{ fontSize: 24, color: COLORS.black }}>{item.character}</Text>
  //                   </TouchableOpacity>
  //                 )}
  //                 showsVerticalScrollIndicator={false}
  //               />)
  //             }
  //           </View>
  //         )}

  //         {/* Input + Send */}
  //         <View style={{ flexDirection: 'row', alignItems: 'flex-end', padding: PADDING.p01 }}>
  //           <View style={{ flex: 1, position: 'relative' }}>
  //             <TextInput
  //               multiline
  //               value={text}
  //               onChangeText={setText}
  //               onContentSizeChange={(e) => {
  //                 const newHeight = e.nativeEvent.contentSize.height;
  //                 setInputHeight(Math.min(newHeight, 120));
  //               }}
  //               scrollEnabled={inputHeight >= 120}
  //               onFocus={() => {
  //                 setShowEmojis(false);
  //                 LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  //               }}
  //               placeholder={t('chat.write')}
  //               placeholderTextColor={COLORS.black}
  //               style={[
  //                 homeStyles.authInput,
  //                 {
  //                   height: Math.max(44, inputHeight),
  //                   maxHeight: 120,
  //                   marginBottom: 0,
  //                   borderRadius: PADDING.p08,
  //                   borderColor: COLORS.dark_secondary,
  //                   color: COLORS.black,
  //                   textAlignVertical: 'top',
  //                 }
  //               ]}
  //             />
  //             <TouchableOpacity
  //               style={{ position: 'absolute', top: PADDING.p01, right: PADDING.p01 }}
  //               onPress={() => {
  //                 Keyboard.dismiss();
  //                 setShowEmojis(prev => !prev);
  //               }}
  //             >
  //               <Icon name={showEmojis ? 'close' : 'sticker-emoji'} size={25} color={COLORS.black} />
  //             </TouchableOpacity>
  //           </View>

  //           <TouchableOpacity
  //             onPress={handleSend}
  //             style={{
  //               backgroundColor: COLORS.primary,
  //               marginLeft: 8,
  //               width: 44,
  //               height: 44,
  //               borderRadius: 25,
  //               justifyContent: 'center',
  //               alignItems: 'center'
  //             }}
  //           >
  //             <Icon name='send' size={23} color='white' />
  //           </TouchableOpacity>
  //         </View>

  //       </View>
  //     </TouchableWithoutFeedback>
  //   </KeyboardAvoidingView>
  // );
};

export default NewChatScreen;