/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, Animated, SafeAreaView, Dimensions, RefreshControl, TouchableHighlight, Text, Image, StatusBar } from 'react-native'
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

const TAB_BAR_HEIGHT = 48;

// About frame
const About = ({ handleScroll, showBackToTop, listRef, headerHeight = 0 }) => {
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
  const [categories, setCategories] = useState([]);
  const [idCat, setIdCat] = useState(0);
  const [works, setWorks] = useState([]);
  const [ad, setAd] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [count, setCount] = useState(0);
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

        return eventData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  // ================= Get categories =================
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const headers = {
      'X-localization': 'fr',
      Authorization: `Bearer ${userInfo.api_token}`,
    };

    try {
      const res = await axios.get(`${API.boongo_url}/category/find_by_group/Catégorie%20pour%20œuvre`, { headers });
      const data = res.data.data;
      const itemAll = { id: 0, category_name: t('all_f'), category_name_fr: "Toutes", category_name_en: "All", category_name_ln: "Nioso", category_description: null, };

      data.unshift(itemAll);
      setCategories(data);
      setIdCat(itemAll.id);

    } catch (error) {
      console.error('Erreur fetchCategories', error);
    }
  };

  // ================= Fetch works when idCat or page changes =================
  // useEffect(() => {
  //   fetchWorks();
  // }, [page, idCat]);
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (selectedEvent && selectedEvent.id) {
        fetchWorks();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [selectedEvent, page, idCat]);

  const fetchWorks = async () => {
    if (isLoading || page > lastPage) return;
    setIsLoading(true);

    const qs = require('qs');
    const url = `${API.boongo_url}/work/filter_by_categories?page=${page}`;
    const params = {
      'categories_ids[0]': idCat,
      user_id: selectedEvent.id,
    };
    const headers = {
      'X-localization': 'fr',
      Authorization: `Bearer ${userInfo.api_token}`,
      'X-user-id': userInfo.id,
    };

    try {
      const response = await axios.post(url, qs.stringify(params), { headers });
      const data = response.data.data || [];

      setWorks(prev => (page === 1 ? data : [...prev, ...data]));
      setAd(response.data.ad || null);
      setLastPage(response.data.lastPage || page);
      setCount(response.data.count || 0);

      // console.log(response.data);

    } catch (error) {
      console.error('Erreur fetchWorks', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= Combined data =================
  const combinedData = [...works];
  if (ad) {
    combinedData.push({ ...ad, id: 'ad', realId: ad.id });
  }

  // ================= Handlers =================
  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setWorks([]);
    await fetchWorks();
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isLoading && page < lastPage) {
      setPage(prev => prev + 1);
    }
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleBadgePress = useCallback((id) => {
    setIdCat(id);
    setPage(1);
    setWorks([]);
    setLastPage(1);
  }, []);

  const CategoryItem = ({ item }) => {
    const isSelected = idCat === item.id;
    const Container = isSelected ? TouchableHighlight : TouchableOpacity;

    return (
      <Container
        key={item.id}
        onPress={() => handleBadgePress(item.id)}
        style={
          isSelected
            ? [homeStyles.categoryBadgeSelected, { backgroundColor: COLORS.white }]
            : [homeStyles.categoryBadge, { backgroundColor: COLORS.warning }]
        }
        underlayColor={COLORS.light_secondary}
      >
        <Text
          style={
            isSelected
              ? [homeStyles.categoryBadgeTextSelected, { color: COLORS.black }]
              : [homeStyles.categoryBadgeText, { color: 'black' }]
          }
        >
          {item.category_name}
        </Text>
      </Container>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s13} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>

      </SafeAreaView>
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
  const [circles, setCircles] = useState([]);
  const [ad, setAd] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
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

        return eventData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  // Fetch data from API
  const fetchSearchData = async (searchTerm) => {
    if (isLoading) return;

    setIsLoading(true);

    const qs = require('qs');
    const params = {
      data: searchTerm,
      user_id: selectedEvent.id
    };

    try {
      const response = await axios.post(
        `${API.boongo_url}/circle/search`,
        qs.stringify(params, { arrayFormat: 'brackets' }), // 👈 key here
        {
          headers: {
            'X-localization': 'fr',
            'Authorization': `Bearer ${userInfo.api_token}`,
            'X-user-id': userInfo.id,
            'Content-Type': 'application/x-www-form-urlencoded', // consistent
          },
        }
      );

      setAddressees(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search event
  const handleSearch = (text) => {
    setInputValue(text);
    fetchSearchData(text);
  };

  const fetchCircles = async (pageToFetch = 1) => {
    if (isLoading || pageToFetch > lastPage) return;

    setIsLoading(true);

    const qs = require('qs');
    const url = `${API.boongo_url}/user/member_groups/circle/${selectedEvent.id}/15?page=${pageToFetch}`;
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

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchCircles(1);
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!isLoading && page < lastPage) {
      const nextPage = page + 1;

      setPage(nextPage); // Update the page
    }
  };

  const combinedData = [...circles];

  if (ad) {
    combinedData.push({ ...ad, realId: ad.id, id: 'ad' });
  }

  useEffect(() => {
    if (selectedEvent && selectedEvent.id) {
      fetchCircles(1); // Initial loading
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (page > 1) {
      fetchCircles(page);
    }
  }, [page]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s07} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>

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
  const { userInfo } = useContext(AuthContext);
  // =============== Get parameters ===============
  const route = useRoute();
  const { event_id } = route.params;
  // =============== Get data ===============
  const [selectedEvent, setSelectedEvent] = useState({});
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
      aboutListRef.current.scrollToOffset({ offset, animated: true });

    } else if (newIndex === 1 && chatListRef.current) {
      chatListRef.current.scrollToOffset({ offset, animated: true });
    }

    setIndex(newIndex);
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

        return eventData;
      })
      .catch(error => {
        console.log(error);
      });
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
          <View style={{ flexDirection: 'row', width: Dimensions.get('window').width, justifyContent: 'flex-start', alignItems: 'center', paddingTop: PADDING.p02, paddingHorizontal: PADDING.p02 }}>
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.black, width: 60, height: 70, borderRadius: PADDING.p01 }}>
              <Text style={{ fontSize: 19, fontWeight: '300', color: COLORS.warning, textTransform: 'uppercase' }}>{startingMonth}</Text>
              <Text style={{ fontSize: 40, fontWeight: '400', color: COLORS.white, marginTop: -12 }}>{startingDay}</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: '400', color: COLORS.black, lineHeight: PADDING.p10, maxWidth: '75%', marginLeft: PADDING.p02 }}>{selectedEvent.event_title || '...'}</Text>
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
      <FloatingActionsButton />
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