/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
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
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const endpoint = `${API.url}/message/selected_chat/fr/Discussion/${userInfo.id}/${chat_entity}/${chat_entity_id}`;

  useEffect(() => {
    if (!endpoint) return;

    axios.get(endpoint).then(res => {
      setMessages(res.data);
      setLoading(false);
    });
  }, [endpoint]);

  const handleSend = () => {
    if (!text.trim()) return;

    axios.post(endpoint, { message_content: text }).then(res => {
      setMessages([res.data, ...messages]);
      setText('');
    });
  };

  if (!endpoint) {
    return <Text>Aucun destinataire défini.</Text>;
  }

  return (
    <View style={{ flex: 1, padding: PADDING.p01, backgroundColor: COLORS.light_secondary }}>
      {/* Messages header */}
      <View style={[homeStyles.headerBanner, { backgroundColor: COLORS.white }]}>
        {/* Entity data */}
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name='chevron-thin-left' size={28} color={COLORS.black} />
          </TouchableOpacity>
          <Image source={{ uri: chat_entity_profile }} style={{ width: IMAGE_SIZE.s13, height: IMAGE_SIZE.s13, borderRadius: IMAGE_SIZE.s13 / 2, marginRight: PADDING.p03, borderWidth: 1, borderColor: COLORS.light_secondary }} />
          <Text style={{ fontSize: TEXT_SIZE.normal, fontWeight: '500', color: COLORS.black }}>{chat_entity_name}</Text>
        </View>

        {/* Right links */}
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity>
            <Icon name='paperclip' size={28} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages list */}
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageItem message={item} />}
        keyExtractor={(item, index) => index.toString()}
        inverted
      />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Écrire un message..."
          style={[homeStyles.authInput, { width: Dimensions.get('window').width - 85, marginBottom: 5, borderWidth: 1, borderRadius: 20 }]}
        />
        <TouchableOpacity onPress={handleSend} style={{ marginLeft: 8 }}>
          <Text>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NewChatScreen;