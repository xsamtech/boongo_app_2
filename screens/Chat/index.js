/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, SafeAreaView, Animated, TouchableOpacity, RefreshControl, FlatList, ToastAndroid, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { API, IMAGE_SIZE, PADDING } from '../../tools/constants';
import useColors from '../../hooks/useColors';
import homeStyles from '../style';
import EmptyListComponent from '../../components/empty_list';
import ChatItemComponent from '../../components/chat_item';
import HeaderComponent from '../header';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';

const ChatsScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Context ===============
  const { userInfo } = useContext(AuthContext);
  // =============== States ===============
  const [discussions, setDiscussions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // =============== Load local discussions (AsyncStorage) ===============
  const loadLocalDiscussions = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const metas = keys.filter((k) => k.startsWith('chatmeta:'));
      const chats = [];

      for (const key of metas) {
        const metaStr = await AsyncStorage.getItem(key);
        const meta = JSON.parse(metaStr);

        if (meta && meta.chat_entity && meta.chat_entity_id) {
          const chatKey = `chat:${meta.chat_entity}:${meta.chat_entity_id}:with:${userInfo.id}`;
          const msgs = await AsyncStorage.getItem(chatKey);

          let lastMessage = null;
          let latest_at = null;

          if (msgs) {
            const parsed = JSON.parse(msgs);
            if (parsed.length > 0) {
              // 🧠 The latest message is at index 0 (prepend style)
              lastMessage = parsed[0];
              latest_at = parsed[0]?.created_at || null;
            }
          }

          chats.push({
            ...meta,
            lastMessage,
            latest_at,
          });
        }
      }

      // Sort by most recent
      chats.sort((a, b) => new Date(b.latest_at || 0) - new Date(a.latest_at || 0));

      setDiscussions(chats);
    } catch (err) {
      console.error('❌ Error loading local discussions:', err);
    }
  };

  // =============== Refresh manually ===============
  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocalDiscussions();
    setRefreshing(false);
  };

  // =============== Scroll to top ===============
  const scrollToTop = () => flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowBackToTop(offsetY > 0);
      },
    }
  );

  // =============== Listen to local message updates ===============
  useEffect(() => {
    const interval = setInterval(() => {
      loadLocalDiscussions();
    }, 2000); // check every 2s for changes in AsyncStorage

    return () => clearInterval(interval);
  }, []);

  // =============== Realtime Echo (Pusher) for new chats ===============
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

    echo.private(`chat.${userInfo.id}`).listen('MessageSent', async (e) => {
      console.log('📡 Message reçu (Realtime):', e.message);
      ToastAndroid.show(`💬 Nouveau message de ${e.message.user?.firstname || 'Contact'}`, ToastAndroid.SHORT);
      await loadLocalDiscussions();
    });

    return () => {
      echo.leave(`chat.${userInfo.id}`);
    };
  }, [userInfo]);

  // =============== Initial load ===============
  useEffect(() => {
    loadLocalDiscussions();
  }, []);

  // =============== Render ===============
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {/* Header */}
      <View style={{ paddingVertical: PADDING.p01, backgroundColor: COLORS.white }}>
        <HeaderComponent />
      </View>

      {/* Floating buttons */}
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s09} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[homeStyles.floatingButton, { backgroundColor: COLORS.primary, bottom: 30 }]}
        onPress={() => navigation.navigate('ChatEntity')}
      >
        <Icon name="pencil-outline" size={IMAGE_SIZE.s07} style={{ color: 'white' }} />
      </TouchableOpacity>

      {/* Discussions list */}
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.FlatList
          ref={flatListRef}
          data={discussions}
          keyExtractor={(item) => (item.chat_entity_id ?? Math.random().toString()).toString()}
          renderItem={({ item }) => {
            const name =
              item.chat_entity_name && item.chat_entity_name !== 'undefined'
                ? item.chat_entity_name
                : 'Utilisateur inconnu';
            const avatar =
              item.chat_entity_profile && item.chat_entity_profile !== 'null'
                ? item.chat_entity_profile
                : 'https://cdn-icons-png.flaticon.com/512/847/847969.png'; // default avatar

            return (
              <ChatItemComponent
                item={{
                  ...item,
                  chat_entity_name: name,
                  chat_entity_profile: avatar,
                }}
                onPress={() =>
                  navigation.navigate('NewChatScreen', {
                    chat_entity: item.chat_entity,
                    chat_entity_id: item.chat_entity_id,
                    chat_entity_name: name,
                    chat_entity_profile: avatar,
                  })
                }
              />
            );
          }}
          onScroll={handleScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={105} />
          }
          contentInset={{ top: 105 }}
          contentOffset={{ y: -105 }}
          ListEmptyComponent={
            <EmptyListComponent
              iconName='wechat'
              title="Aucune discussion"
              description="Vous n’avez encore discuté avec personne."
            />
          }
        />
      </SafeAreaView>
    </View>
  );
};

export default ChatsScreen;
