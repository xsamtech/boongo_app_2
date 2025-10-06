/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, SafeAreaView, RefreshControl, Animated, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useColors from '../../hooks/useColors';
import { AuthContext } from '../../contexts/AuthContext';
import { API, IMAGE_SIZE, PADDING, TEXT_SIZE } from '../../tools/constants';
import homeStyles from '../style';
import ChatItemComponent from '../../components/chat_item';
import EmptyListComponent from '../../components/empty_list';
import HeaderComponent from '../header';

const ChatsScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const [discussions, setDiscussions] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ad, setAd] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Load discussions from local storage
  const fetchDiscussions = async () => {
    try {
      setIsLoading(true);
      const allKeys = await AsyncStorage.getAllKeys();
      const chatKeys = allKeys.filter(k => k.startsWith('chat:'));
      const metaKeys = allKeys.filter(k => k.startsWith('chatmeta:'));

      const metas = {};
      for (let key of metaKeys) {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          metas[key.replace('chatmeta:', 'chat:')] = data; // map to corresponding chat key
        }
      }

      const result = [];
      for (let key of chatKeys) {
        const raw = await AsyncStorage.getItem(key);
        const messages = raw ? JSON.parse(raw) : [];
        if (messages.length > 0) {
          const last = messages[0];
          const meta = metas[key] || {};

          result.push({
            id: key,
            keyName: key,
            lastMessage: last.message_content,
            date: last.created_at,
            chat_entity: meta.chat_entity,
            chat_entity_id: meta.chat_entity_id,
            chat_entity_name: meta.chat_entity_name || (last.user?.firstname ?? 'Utilisateur'),
            chat_entity_profile: meta.chat_entity_profile || last.user?.avatar_url || null,
          });
        }
      }

      result.sort((a, b) => new Date(b.date) - new Date(a.date));
      setDiscussions(result);
    } catch (err) {
      console.warn('Error loading local discussions:', err);
    } finally {
      setIsLoading(false);
    }
  };
  // const fetchDiscussions = async (pageToFetch = 1) => {
  //   if (isLoading || pageToFetch > lastPage) return;

  //   setIsLoading(true);

  //   try {
  //     const response = await axios.get(`${API.boongo_url}/message/user_chats_list/fr/Discussion/${userInfo.id}`, {
  //       headers: { 'X-localization': 'fr', 'Authorization': `Bearer ${userInfo.api_token}` }, params: { page: pageToFetch }
  //     });

  //     const data = response.data.data || [];

  //     if (pageToFetch === 1) {
  //       setDiscussions(data);

  //     } else {
  //       setDiscussions(prev => [...prev, ...data]);
  //     }

  //     setLastPage(response.data.lastPage || 1);
  //     setAd(response.data.ad || null);

  //   } catch (error) {
  //     console.error(error);

  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchDiscussions(1);
  }, []);

  useEffect(() => {
    if (page > 1) fetchDiscussions(page);
  }, [page]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);

    await fetchDiscussions(1);

    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isLoading && page < lastPage) setPage(prev => prev + 1);
  };

  const scrollToTop = () => flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

  const combinedData = [...discussions];

  if (ad) combinedData.push({ ...ad, id: 'ad', realId: ad.id });

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

  return (
    <>
      {/* Header */}
      <View style={{ paddingVertical: PADDING.p01, backgroundColor: COLORS.white }}>
        <HeaderComponent />
      </View>

      {/* Content */}
      <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
        {showBackToTop && (
          <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
            <Icon name='chevron-double-up' size={IMAGE_SIZE.s07} style={{ color: 'black' }} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[homeStyles.floatingButton, { backgroundColor: COLORS.primary, bottom: 30 }]}
          onPress={() => navigation.navigate('ChatEntity')}
        >
          <Icon name="pencil-outline" size={IMAGE_SIZE.s07} style={{ color: 'white' }} />
        </TouchableOpacity>

        <SafeAreaView style={{ flex: 1 }}>
          <Animated.FlatList
            ref={flatListRef}
            data={combinedData}
            keyExtractor={item => (item.id ?? Math.random().toString()).toString()}
            // renderItem={({ item }) => <ChatItemComponent item={item} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('NewChat', {
                    chat_entity: item.chat_entity,
                    chat_entity_id: item.chat_entity_id,
                    chat_entity_name: item.chat_entity_name,
                    chat_entity_profile: item.chat_entity_profile,
                  })
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.white,
                  padding: PADDING.p01,
                  marginVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Image
                  source={{ uri: item.chat_entity_profile }}
                  style={{
                    width: IMAGE_SIZE.s08,
                    height: IMAGE_SIZE.s08,
                    borderRadius: IMAGE_SIZE.s08 / 2,
                    marginRight: 10,
                    backgroundColor: COLORS.light_secondary,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', color: COLORS.black }}>
                    {item.chat_entity_name}
                  </Text>
                  <Text style={{ color: COLORS.dark_secondary }} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            onScroll={handleScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                progressViewOffset={105}
              />
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
            ListFooterComponent={() =>
              isLoading ? (
                <Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01 }}>Chargement...</Text>
              ) : null
            }
          />
        </SafeAreaView>
      </View>
    </>
  );
};

export default ChatsScreen;