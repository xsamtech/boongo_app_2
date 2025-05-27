/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import MessageItem from '../../components/message_item';

const NewChatScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const { addressee_user_id, addressee_organization_id, addressee_circle_id, event_id } = route.params || {};

  const endpoint = addressee_user_id ? `/api/messages/user/${addressee_user_id}`
                    : addressee_organization_id ? `/api/messages/organization/${addressee_organization_id}`
                    : addressee_circle_id ? `/api/messages/circle/${addressee_circle_id}`
                    : event_id ? `/api/messages/event/${event_id}` : null;

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
    <View style={{ flex: 1, padding: 16 }}>
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
          style={{ flex: 1, borderWidth: 1, borderRadius: 20, padding: 10 }}
        />
        <TouchableOpacity onPress={handleSend} style={{ marginLeft: 8 }}>
          <Text>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NewChatScreen;