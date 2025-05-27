/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Animated, Dimensions, SafeAreaView, ToastAndroid } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import useColors from '../../hooks/useColors';
import { useTranslation } from 'react-i18next';
import HeaderComponent from '../header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FloatingActionsButton from '../../components/floating_actions_button';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import homeStyles from '../style';
import { API, IMAGE_SIZE, PADDING } from '../../tools/constants';
import EntityItemComponent from '../../components/entity_item';
import EmptyListComponent from '../../components/empty_list';

const MembersTab = ({ handleScroll, showBackToTop, listRef }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const [addressees, setAddressees] = useState([]);
  const [ad, setAd] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = listRef || useRef(null);

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  const fetchAddressees = async (pageToFetch = 1) => {
    if (isLoading || pageToFetch > lastPage) return;

    setIsLoading(true);

    const url = `${API.url}/user/find_by_role/Membre`;
    const mHeaders = {
      'X-localization': 'fr',
      'Authorization': `Bearer ${userInfo.api_token}`
    };

    try {
      const response = await axios.get(url, { headers: mHeaders });

      console.log(response);

      if (pageToFetch === 1) {
        setAddressees(response.data.data);

      } else {
        setAddressees(prev => [...prev, ...response.data.data]);
      }

      console.log(response);

      setAd(response.data.ad);
      setLastPage(response.data.lastPage);
      setCount(response.data.count);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn("Trop de requêtes envoyées. Attendez avant de réessayer.");
      } else {
        console.warn(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddressees(1); // Initial loading
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchAddressees(page);
    }
  }, [page]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchAddressees(1);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isLoading && page < lastPage) {
      setPage(prev => prev + 1);
    }
  };

  const combinedData = [...addressees];

  if (ad) {
    combinedData.push({ ...ad, realId: ad.id, id: 'ad' });
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { bottom: 30, backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s07} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}
      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height, marginLeft: 0, paddingHorizontal: 2 }]}>
          <Animated.FlatList
            ref={flatListRef}
            data={combinedData}
            keyExtractor={(item, index) => `${item.id || 'no-id'}-${index}`}
            renderItem={({ item }) => (
              <EntityItemComponent item={item} entity='user' entity_id={item.id} />
            )}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            scrollEventThrottle={16}
            contentContainerStyle={homeStyles.scrollableList}
            windowSize={10}
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
                title={t('empty_list.title')}
                description={t('empty_list.description_chat_user')}
              />
            }
            ListFooterComponent={() =>
              isLoading ? (
                <Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01 }}>{t('loading')}</Text>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const OrganizationsTab = ({ handleScroll, showBackToTop, listRef }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const [organizations, setOrganizations] = useState([]);
  const [ad, setAd] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = listRef || useRef(null);

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  const fetchOrganizations = async (pageToFetch = 1) => {
    if (isLoading || pageToFetch > lastPage) return;

    setIsLoading(true);

    const qs = require('qs');
    // const url = `${API.url}/user/member_groups/organization/${userInfo.id}/15`;
    const url = `${API.url}/organization`;
    const mHeaders = {
      'X-localization': 'fr',
      'Authorization': `Bearer ${userInfo.api_token}`
    };

    try {
      const response = await axios.get(url, { headers: mHeaders });

      if (pageToFetch === 1) {
        setOrganizations(response.data.data);

      } else {
        setOrganizations(prev => [...prev, ...response.data.data]);
      }

      setAd(response.data.ad);
      setLastPage(response.data.lastPage);
      setCount(response.data.count);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn("Trop de requêtes envoyées. Attendez avant de réessayer.");
      } else {
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations(1); // Initial loading
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchOrganizations(page);
    }
  }, [page]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchOrganizations(1);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isLoading && page < lastPage) {
      setPage(prev => prev + 1);
    }
  };

  const combinedData = [...organizations];

  if (ad) {
    combinedData.push({ ...ad, realId: ad.id, id: 'ad' });
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { bottom: 30, backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s07} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}
      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height, marginLeft: 0, paddingHorizontal: 2 }]}>
          <Animated.FlatList
            ref={flatListRef}
            data={combinedData}
            keyExtractor={(item, index) => `${item.id || 'no-id'}-${index}`}
            renderItem={({ item }) => (
              <EntityItemComponent item={item} entity='organization' entity_id={item.id} />
            )}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            scrollEventThrottle={16}
            contentContainerStyle={homeStyles.scrollableList}
            windowSize={10}
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
                title={t('empty_list.title')}
                description={t('empty_list.description_chat_organization')}
              />
            }
            ListFooterComponent={() =>
              isLoading ? (
                <Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01 }}>{t('loading')}</Text>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const CirclesTab = ({ handleScroll, showBackToTop, listRef }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const [circles, setCircles] = useState([]);
  const [ad, setAd] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = listRef || useRef(null);

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  const fetchCircles = async (pageToFetch = 1) => {
    if (isLoading || pageToFetch > lastPage) return;

    setIsLoading(true);

    const qs = require('qs');
    const url = `${API.url}/user/member_groups/circle/${userInfo.id}/15`;
    const mHeaders = {
      'X-localization': 'fr',
      'Authorization': `Bearer ${userInfo.api_token}`
    };

    try {
      const response = await axios.get(url, { headers: mHeaders });

      if (pageToFetch === 1) {
        setCircles(response.data.data);

      } else {
        setCircles(prev => [...prev, ...response.data.data]);
      }

      setAd(response.data.ad);
      setLastPage(response.data.lastPage);
      setCount(response.data.count);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn("Trop de requêtes envoyées. Attendez avant de réessayer.");
      } else {
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCircles(1); // Initial loading
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchCircles(page);
    }
  }, [page]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchCircles(1);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isLoading && page < lastPage) {
      setPage(prev => prev + 1);
    }
  };

  const combinedData = [...circles];

  if (ad) {
    combinedData.push({ ...ad, realId: ad.id, id: 'ad' });
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { bottom: 30, backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s07} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}
      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height, marginLeft: 0, paddingHorizontal: 2 }]}>
          <Animated.FlatList
            ref={flatListRef}
            data={combinedData}
            keyExtractor={(item, index) => `${item.id || 'no-id'}-${index}`}
            renderItem={({ item }) => (
              <EntityItemComponent item={item} entity='circle' entity_id={item.id} />
            )}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            scrollEventThrottle={16}
            contentContainerStyle={homeStyles.scrollableList}
            windowSize={10}
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
                title={t('empty_list.title')}
                description={t('empty_list.description_chat_circle')}
              />
            }
            ListFooterComponent={() =>
              isLoading ? (
                <Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01 }}>{t('loading')}</Text>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const EventsTab = ({ handleScroll, showBackToTop, listRef }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const [events, setEvents] = useState([]);
  const [ad, setAd] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = listRef || useRef(null);

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  const fetchEvents = async (pageToFetch = 1) => {
    if (isLoading || pageToFetch > lastPage) return;

    setIsLoading(true);

    const qs = require('qs');
    const url = `${API.url}/user/member_groups/event/${userInfo.id}/15`;
    const mHeaders = {
      'X-localization': 'fr',
      'Authorization': `Bearer ${userInfo.api_token}`
    };

    try {
      const response = await axios.get(url, { headers: mHeaders });

      if (pageToFetch === 1) {
        setEvents(response.data.data);

      } else {
        setEvents(prev => [...prev, ...response.data.data]);
      }

      setAd(response.data.ad);
      setLastPage(response.data.lastPage);
      setCount(response.data.count);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn("Trop de requêtes envoyées. Attendez avant de réessayer.");
      } else {
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(1); // Initial loading
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchEvents(page);
    }
  }, [page]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchEvents(1);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isLoading && page < lastPage) {
      setPage(prev => prev + 1);
    }
  };

  const combinedData = [...events];

  if (ad) {
    combinedData.push({ ...ad, realId: ad.id, id: 'ad' });
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { bottom: 30, backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s07} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}
      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height, marginLeft: 0, paddingHorizontal: 2 }]}>
          <Animated.FlatList
            ref={flatListRef}
            data={combinedData}
            keyExtractor={(item, index) => `${item.id || 'no-id'}-${index}`}
            renderItem={({ item }) => (
              <EntityItemComponent item={item} entity='event' entity_id={item.id} />
            )}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            scrollEventThrottle={16}
            contentContainerStyle={homeStyles.scrollableList}
            windowSize={10}
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
                title={t('empty_list.title')}
                description={t('empty_list.description_chat_event')}
              />
            }
            ListFooterComponent={() =>
              isLoading ? (
                <Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01 }}>{t('loading')}</Text>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const ChatEntityScreen = () => {
  const { t } = useTranslation();
  const COLORS = useColors();

  const membersListRef = useRef(null);
  const orgsListRef = useRef(null);
  const circlesListRef = useRef(null);
  const eventsListRef = useRef(null);

  const [index, setIndex] = useState(0);
  const [showBackToTopByTab, setShowBackToTopByTab] = useState({
    members: false,
    organizations: false,
    circles: false,
    events: false,
  });

  const scrollY = useRef(new Animated.Value(0)).current;
  const savedScrollOffsets = useRef({
    members: 0,
    organizations: 0,
    circles: 0,
    events: 0,
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  const [routes] = useState([
    { key: 'members', title: t('navigation.chat.members') },
    { key: 'circles', title: t('navigation.chat.circles') },
    { key: 'organizations', title: t('navigation.chat.organizations') },
    { key: 'events', title: t('navigation.chat.events') },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'members':
        return <MembersTab handleScroll={handleScroll} showBackToTop={showBackToTopByTab.members} listRef={membersListRef} />;
      case 'circles':
        return <CirclesTab handleScroll={handleScroll} showBackToTop={showBackToTopByTab.circles} listRef={circlesListRef} />;
      case 'organizations':
        return <OrganizationsTab handleScroll={handleScroll} showBackToTop={showBackToTopByTab.organizations} listRef={orgsListRef} />;
      case 'events':
        return <EventsTab handleScroll={handleScroll} showBackToTop={showBackToTopByTab.events} listRef={eventsListRef} />;
      default:
        return null;
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const currentTab = ['members', 'circles', 'organizations', 'events'][index];

        savedScrollOffsets.current[currentTab] = offsetY;
        const isAtTop = offsetY <= 0;

        setShowBackToTopByTab((prev) => ({
          ...prev,
          [currentTab]: !isAtTop,
        }));
      },
    }
  );

  const handleIndexChange = (newIndex) => {
    const tabKeys = ['members', 'circles', 'organizations', 'events'];
    const newTabKey = tabKeys[newIndex];
    const offset = savedScrollOffsets.current[newTabKey] || 0;

    Animated.timing(scrollY, {
      toValue: offset,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const refMap = {
      members: membersListRef,
      organizations: orgsListRef,
      circles: circlesListRef,
      events: eventsListRef,
    };

    const listRef = refMap[newTabKey];
    listRef.current?.scrollToOffset({ offset, animated: true });

    setIndex(newIndex);
  };

  const renderTabBar = (props) => (
    <>
      <Animated.View style={{ transform: [{ translateY: headerTranslateY }], zIndex: 1000, position: 'absolute', top: 0, width: '100%', backgroundColor: COLORS.white, paddingTop: 20 }}>
        <HeaderComponent />
        <TabBar
          {...props}
          scrollEnabled
          style={{ backgroundColor: COLORS.white }}
          indicatorStyle={{ backgroundColor: COLORS.black }}
          tabStyle={{ width: 140 }}
          labelStyle={{ flexShrink: 1 }}
          activeColor={COLORS.black}
          inactiveColor={COLORS.dark_secondary}
        />
      </Animated.View>
    </>
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={handleIndexChange}
      initialLayout={{ width: Dimensions.get('window').width }}
      renderTabBar={renderTabBar}
    />
  );
};

export default ChatEntityScreen;
