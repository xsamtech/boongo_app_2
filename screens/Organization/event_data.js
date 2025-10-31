/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, Animated, SafeAreaView, Dimensions, RefreshControl, TouchableHighlight, Text, Image, StatusBar, ToastAndroid, TextInput, LayoutAnimation } from 'react-native'
import * as RNLocalize from 'react-native-localize';
import { TabBar, TabView } from 'react-native-tab-view';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API, IMAGE_SIZE, PADDING, TEXT_SIZE, WEB } from '../../tools/constants';
import { AuthContext } from '../../contexts/AuthContext';
import EmptyListComponent from '../../components/empty_list';
import FloatingActionsButton from '../../components/floating_actions_button';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';
import Spinner from 'react-native-loading-spinner-overlay';
import CommentItemComponent from '../../components/comment_item';

const TAB_BAR_HEIGHT = 48;

// About frame
const About = ({ handleScroll, showBackToTop, listRef, headerHeight = 0 }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get parameters ===============
  const route = useRoute();
  const { event_id } = route.params;
  // =============== Get data ===============
  const [selectedEvent, setSelectedEvent] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [percent, setPercent] = useState('50%');
  const scrollViewListRef = listRef || useRef(null);

  // Get current event
  useEffect(() => {
    getEvent();
  }, [selectedEvent]);

  const getEvent = () => {
    const config = {
      method: 'GET',
      url: `${API.boongo_url}/event/${event_id}`,
      headers: {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`,
      }
    };

    axios(config)
      .then(res => {
        const eventData = res.data.data;

        setSelectedEvent(eventData);

        return eventData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  // ================= Handlers =================
  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const scrollToTop = () => {
    scrollViewListRef.current?.scrollTo({ y: 0, animated: true });
  };

  const ucfirst = (str) => {
    if (!str) return str;

    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const toggleText = () => {
    setIsExpanded(!isExpanded);

    !isExpanded ? setPercent('24%') : setPercent('50%');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { bottom: 30, backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s09} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: headerHeight + TAB_BAR_HEIGHT }}
        ref={scrollViewListRef}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={{ flex: 1 }}
      >
        <View style={{ backgroundColor: COLORS.white, padding: PADDING.p02 }}>
          {selectedEvent.event_description && (
            <View style={{ flexDirection: 'row', marginBottom: PADDING.p08 }}>
              {/* <Text style={{ fontSize: 16, fontWeight: '300', color: COLORS.black, maxWidth: percent }} onPress={toggleText}>
                {isExpanded ? selectedEvent.event_description : `${selectedEvent.event_description.slice(0, 100)}...`}
              </Text> */}
              <Text style={{ fontSize: 16, fontWeight: '300', color: COLORS.black }}>{selectedEvent.event_description}</Text>
            </View>
          )}
          {selectedEvent.start_at && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: PADDING.p06 }}>
              <Icon name='calendar-outline' size={30} color={COLORS.warning} style={{ marginTop: 1, marginRight: PADDING.p00 }} />
              <View>
                <Text style={{ fontSize: 12, fontWeight: '500', color: COLORS.black }}>{t('event.data.start_at')}</Text>
                <Text style={{ fontSize: 14, fontWeight: '300', color: COLORS.black }}>{ucfirst(selectedEvent.start_at_explicit)}</Text>
              </View>
            </View>
          )}
          {selectedEvent.end_at && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: PADDING.p06 }}>
              <Icon name='calendar-outline' size={30} color={COLORS.warning} style={{ marginTop: 1, marginRight: PADDING.p00 }} />
              <View>
                <Text style={{ fontSize: 12, fontWeight: '500', color: COLORS.black }}>{t('event.data.end_at')}</Text>
                <Text style={{ fontSize: 14, fontWeight: '300', color: COLORS.black }}>{ucfirst(selectedEvent.end_at_explicit)}</Text>
              </View>
            </View>
          )}
          {selectedEvent.event_place && (
            <View style={{ flexDirection: 'row', marginBottom: PADDING.p06 }}>
              <Icon name='map-marker' size={30} color={COLORS.warning} style={{ marginTop: 1, marginRight: PADDING.p00 }} />
              <View>
                {selectedEvent.event_place && (
                  <Text style={{ fontSize: 14, fontWeight: '300', color: COLORS.black, maxWidth: '90%' }}>{selectedEvent.event_place}</Text>
                )}
                {selectedEvent.event_place_address && (
                  <Text style={{ fontSize: 14, fontWeight: '300', color: COLORS.black, maxWidth: '90%' }}>{selectedEvent.event_place_address}</Text>
                )}
              </View>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

// Chat frame
const Chat = ({ handleScroll, showBackToTop, listRef, headerHeight = 0 }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get parameters ===============
  const route = useRoute();
  const { event_id } = route.params;
  // =============== Get data ===============
  const [selectedEvent, setSelectedEvent] = useState({});
  const [comments, seComments] = useState([]);
  const [ad, setAd] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [inputHeight, setInputHeight] = useState(44);
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = listRef || useRef(null);

  // Get current event
  useEffect(() => {
    getEvent();
  }, [selectedEvent]);

  const getEvent = () => {
    const config = {
      method: 'GET',
      url: `${API.boongo_url}/event/${event_id}`,
      headers: {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`,
      }
    };

    axios(config)
      .then(res => {
        const eventData = res.data.data;

        setSelectedEvent(eventData);

        const isAlreadyMember = userInfo.events.some(event => event.id === eventData.id);

        setIsMember(isAlreadyMember);

        return eventData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  const fetchComments = async (pageToFetch = 1) => {
    if (isLoading || pageToFetch > lastPage) return;

    setIsLoading(true);

    // const qs = require('qs');
    const url = `${API.boongo_url}/message/find_by_group/event/${selectedEvent.id}?page=${pageToFetch}`;
    const mHeaders = {
      'X-localization': 'fr',
      'Authorization': `Bearer ${userInfo.api_token}`
    };

    try {
      const response = await axios.get(url, { headers: mHeaders });

      if (pageToFetch === 1) {
        seComments(response.data.data);

      } else {
        seComments(prev => [...prev, ...response.data.data]);
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

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchComments(1);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isLoading && page < lastPage) {
      const nextPage = page + 1;

      setPage(nextPage); // Update the page
    }
  };

  const combinedData = [...comments];

  if (ad) {
    combinedData.push({ ...ad, realId: ad.id, id: 'ad' });
  }

  useEffect(() => {
    if (selectedEvent && selectedEvent.id) {
      fetchComments(1); // Initial loading
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (page > 1) {
      fetchComments(page);
    }
  }, [page]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { bottom: 30, backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s09} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Comments List */}
        <Animated.FlatList
          ref={flatListRef}
          data={combinedData}
          extraData={combinedData}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <CommentItemComponent item={item} />}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
          onScroll={handleScroll}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          scrollEventThrottle={16}
          windowSize={10}
          contentContainerStyle={{
            paddingTop: headerHeight + TAB_BAR_HEIGHT,
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={105} />}
          ListEmptyComponent={<EmptyListComponent iconName="wechat" title={t('empty_list.title')} description={t('empty_list.description_comments_event')} />}
          ListHeaderComponent={() => {
            if (isMember) {
              return (
                <View style={{ flexGrow: 0, flexDirection: 'row' }}>
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
                    placeholder={t('event.comment')}
                    placeholderTextColor={COLORS.black}
                    style={[homeStyles.authInput, { height: Math.max(44, inputHeight), maxHeight: 120, marginBottom: 0, borderRadius: PADDING.p08, borderColor: COLORS.dark_secondary, color: COLORS.black, textAlignVertical: 'top' }]}
                  />
                </View>
              );

            } else {
              <View style={{ flexGrow: 0, padding: PADDING.p00, borderWidth: 1, borderColor: COLORS.dark_secondary, borderRadius: PADDING.p03 }}>
                <Text style={{ fontSize: TEXT_SIZE.normal, textAlign: 'center', color: COLORS.black }}>{t('event.participate_before_comment')}</Text>
              </View>
            }
          }
          }
          ListFooterComponent={() => isLoading ? (<Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01, }} >{t('loading')}</Text>) : null}
        />
      </SafeAreaView>
    </View>
  );
};

const EventScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo, isLoading, addMembership, removeMembership } = useContext(AuthContext);
  // =============== Get parameters ===============
  const route = useRoute();
  const { event_id } = route.params;
  // =============== Get data ===============
  const [selectedEvent, setSelectedEvent] = useState({});
  const [isMember, setIsMember] = useState(false);
  const startAt = new Date(selectedEvent.start_at || '1900-01-01 00:00:00');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; // Array of abbreviated months
  const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jui', 'Aou', 'Sep', 'Oct', 'Nov', 'Déc'];

  const aboutListRef = useRef(null);
  const chatListRef = useRef(null);

  const [index, setIndex] = useState(0); // State for managing active tab index
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showBackToTopByTab, setShowBackToTopByTab] = useState({ about: false, chat: false });

  const scrollY = useRef(new Animated.Value(0)).current;
  const savedScrollOffsets = useRef({ about: 0, chat: 0 });
  const clampedScrollY = Animated.diffClamp(scrollY, 0, headerHeight);

  const headerTranslateY = clampedScrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });

  const [routes] = useState([
    { key: 'about', title: t('event.about') },
    { key: 'chat', title: t('event.chat') },
  ]);

  const renderScene = ({ route }) => {
    const sceneProps = {
      handleScroll,
      headerHeight,
    };

    switch (route.key) {
      case 'about':
        return <About {...sceneProps} handleScroll={handleScroll} showBackToTop={showBackToTopByTab.about} listRef={aboutListRef} />;
      case 'chat':
        return <Chat {...sceneProps} handleScroll={handleScroll} showBackToTop={showBackToTopByTab.chat} listRef={chatListRef} />;
      default:
        return null;
    }
  };

  // Get current event
  useEffect(() => {
    getEvent();
  }, [selectedEvent]);

  const getEvent = () => {
    const config = {
      method: 'GET',
      url: `${API.boongo_url}/event/${event_id}`,
      headers: {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`,
      }
    };

    axios(config)
      .then(res => {
        const eventData = res.data.data;

        setSelectedEvent(eventData);

        const isAlreadyMember = userInfo.events.some(event => event.id === eventData.id);

        setIsMember(isAlreadyMember);

        return eventData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleToggleMembership = (user_id, event_id) => {
    if (isMember) {
      removeMembership(user_id, event_id);
      setIsMember(false);

    } else {
      addMembership(user_id, event_id);
      setIsMember(true);
    }
  };

  // Get system language
  const getLanguage = () => {
    const locales = RNLocalize.getLocales();

    if (locales && locales.length > 0) {
      return locales[0].languageCode;
    }

    return 'fr';
  };

  const startingDay = startAt.getDate(); // Get day
  const startingMonth = (getLanguage() === 'fr' ? mois[startAt.getMonth()] : months[startAt.getMonth()]); // Gets the month and converts it to a 3-letter abbreviation

  // Handle scrolling and show/hide the header
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const currentTab = (index === 0 ? 'about' : 'chat');

        savedScrollOffsets.current[currentTab] = offsetY;

        const isAtTop = (offsetY <= 0);
        setShowBackToTopByTab(prev => ({
          ...prev,
          [currentTab]: !isAtTop,
        }));
      },
    }
  );

  // On "TabBar" index change
  const handleIndexChange = (newIndex) => {
    const newTabKey = (newIndex === 0 ? 'about' : 'chat');
    const offset = savedScrollOffsets.current[newTabKey] || 0;

    // Animate scrollY back to 0 smoothly (for header + tabbar)
    Animated.timing(scrollY, {
      toValue: offset,
      duration: 300, // 300ms for smooth effect
      useNativeDriver: true,
    }).start();

    // Back to top according to selected tab
    if (newIndex === 0 && aboutListRef.current) {
      aboutListRef.current.scrollTo({ offset, animated: true });

    } else if (newIndex === 1 && chatListRef.current) {
      chatListRef.current.scrollToOffset({ offset, animated: true });
    }

    setIndex(newIndex);
  };

  // Custom "TabBar"
  const renderTabBar = (props) => (
    <>
      <Animated.View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)} style={{ transform: [{ translateY: headerTranslateY }], zIndex: 1000, position: 'absolute', top: 0, width: '100%', backgroundColor: COLORS.white, paddingTop: 20 }}>
        {/* Status bar */}
        <StatusBar barStyle='light-content' backgroundColor={COLORS.success} />

        {/* Content */}
        <View style={{ backgroundColor: COLORS.white }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={{ position: 'absolute', left: PADDING.p02, top: -2, zIndex: 10, width: 37, height: 37, backgroundColor: 'rgba(200,200,200,0.5)', borderRadius: 37 / 2 }} onPress={() => navigation.goBack()}>
              <Icon name='chevron-left' size={37} color='black' />
            </TouchableOpacity>
          </View>

          {/* Cover */}
          <Image source={{ uri: selectedEvent.cover_url || `${WEB.boongo_url}/assets/img/banner-event.png` }} style={{ width: Dimensions.get('window').width, height: 250, marginTop: -20, marginBottom: PADDING.p00 }} />

          {/* Title */}
          <View style={{ flexDirection: 'row', width: Dimensions.get('window').width, justifyContent: 'flex-start', alignItems: 'center', marginBottom: PADDING.p03, paddingTop: PADDING.p02, paddingHorizontal: PADDING.p02 }}>
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.black, width: 60, height: 70, borderRadius: PADDING.p01 }}>
              <Text style={{ fontSize: 19, fontWeight: '300', color: COLORS.warning, textTransform: 'uppercase' }}>{startingMonth}</Text>
              <Text style={{ fontSize: 40, fontWeight: '400', color: COLORS.white, marginTop: -12 }}>{startingDay}</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: '400', color: COLORS.black, lineHeight: PADDING.p10, maxWidth: '75%', marginLeft: PADDING.p02 }}>{selectedEvent.event_title || '...'}</Text>
          </View>

          {/* Participation button */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: PADDING.p01, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.light_secondary }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 1, paddingHorizontal: 2, borderRadius: 37 / 2 }} onPress={() => handleToggleMembership(userInfo.id, selectedEvent.id)} disabled={isLoading}>
              <Icon name={isMember ? 'star-circle' : 'star-circle-outline'} size={34} color={isMember ? COLORS.success : COLORS.dark_secondary} />
              <Text style={{ fontSize: 16, fontWeight: '400', color: (isMember ? COLORS.success : COLORS.dark_secondary), marginLeft: PADDING.p00 }}>{isMember ? t('event.i_participate') : t('event.i_m_not_participating')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ translateY: headerTranslateY }],
          position: 'absolute',
          top: headerHeight, // Positionnée juste en dessous du header
          zIndex: 999,
          width: '100%',
          height: TAB_BAR_HEIGHT,
          backgroundColor: COLORS.white,
        }}>
        <TabBar
          {...props}
          style={{ backgroundColor: COLORS.white, borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 }}
          indicatorStyle={{ backgroundColor: COLORS.black }}
          activeColor={COLORS.black}
          inactiveColor={COLORS.dark_secondary}
        />
      </Animated.View>
      {/* <FloatingActionsButton /> */}
    </>
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={handleIndexChange}
      initialLayout={{ width: 100 }}
      renderTabBar={renderTabBar} // Using the Custom TabBar
    />
  );
};

export default EventScreen;