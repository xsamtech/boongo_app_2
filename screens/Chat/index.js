/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, SafeAreaView, RefreshControl, Animated, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useColors from '../../hooks/useColors';
import { AuthContext } from '../../contexts/AuthContext';
import { API, IMAGE_SIZE, PADDING } from '../../tools/constants';
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

  const fetchDiscussions = async (pageToFetch = 1) => {
    if (isLoading || pageToFetch > lastPage) return;

    setIsLoading(true);

    try {
      const response = await axios.get(`${API.boongo_url}/message/user_chats_list/fr/Discussion/${userInfo.id}`, {
        headers: { 'X-localization': 'fr', 'Authorization': `Bearer ${userInfo.api_token}` }, params: { page: pageToFetch }
      });

      const data = response.data.data || [];

      if (pageToFetch === 1) {
        setDiscussions(data);

      } else {
        setDiscussions(prev => [...prev, ...data]);
      }

      setLastPage(response.data.lastPage || 1);
      setAd(response.data.ad || null);

    } catch (error) {
      console.error(error);

    } finally {
      setIsLoading(false);
    }
  };

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
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      <HeaderComponent />
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
          renderItem={({ item }) => <ChatItemComponent item={item} />}
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
  );
};

export default ChatsScreen;