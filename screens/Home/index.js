/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, Animated, SafeAreaView, Dimensions, RefreshControl, ToastAndroid, TouchableHighlight, FlatList, Text } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { API, IMAGE_SIZE, PADDING } from '../../tools/constants';
import HeaderComponent from '../header';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';
import EmptyListComponent from '../../components/empty_list';
import NewsItemComponent from '../../components/news_item';
import WorkItemComponent from '../../components/work_item';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

// News frame
const News = ({ handleScroll, showBackToTop, listRef }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get data ===============
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = listRef || useRef(null);
  // const newsData = [];
  const newsData = [
    {
      "id": 61,
      "work_title": "Lorem enim deserunt Lorem aliquip eu consectetur",
      "work_content": "enim ut cupidatat incididunt laboris irure nostrud et eu sint nisi occaecat incididunt voluptate qui eiusmod ad minim veniam",
      "work_url": "",
      "video_source": "",
      "media_length": 84,
      "is_public": true,
      "created_at": "2025-04-23 08:33:31",
      "photo_url": "",
      "document_url": "",
      "audio_url": "",
      "video_url": ""
    },
    {
      "id": 15,
      "work_title": "et consequat et labore minim id sit minim",
      "work_content": "officia aliquip cupidatat anim incididunt veniam ipsum labore eu duis laboris qui",
      "work_url": "",
      "video_source": "",
      "media_length": 106,
      "is_public": true,
      "created_at": "2025-04-24 08:33:31",
      "photo_url": "",
      "document_url": "",
      "audio_url": "",
      "video_url": ""
    },
    {
      "id": 4,
      "work_title": "qui nisi nisi veniam ipsum cillum est adipisicing ea anim",
      "work_content": "labore in labore ullamco non culpa ipsum pariatur ut pariatur occaecat reprehenderit voluptate cillum est ullamco anim commodo eiusmod",
      "work_url": "",
      "video_source": "",
      "media_length": 106,
      "is_public": true,
      "created_at": "2025-04-25 08:33:31",
      "photo_url": "",
      "document_url": "",
      "audio_url": "",
      "video_url": ""
    },
    {
      "id": 83,
      "work_title": "culpa cupidatat ea occaecat irure aliqua voluptate consectetur consectetur",
      "work_content": "enim in aute qui aute elit sit consectetur sint dolor tempor nostrud reprehenderit mollit sint occaecat consectetur",
      "work_url": "",
      "video_source": "",
      "media_length": 101,
      "is_public": false,
      "created_at": "2025-04-26 08:33:31",
      "photo_url": "",
      "document_url": "",
      "audio_url": "",
      "video_url": ""
    },
    {
      "id": 45,
      "work_title": "tempor excepteur reprehenderit minim esse labore culpa deserunt labore",
      "work_content": "consectetur exercitation reprehenderit culpa amet ex aliquip elit deserunt cillum et labore",
      "work_url": "",
      "video_source": "",
      "media_length": 3,
      "is_public": false,
      "created_at": "2025-04-27 08:33:31",
      "photo_url": "",
      "document_url": "",
      "audio_url": "",
      "video_url": ""
    },
    {
      "id": 67,
      "work_title": "dolore occaecat",
      "work_content": "et culpa nisi ut duis minim magna incididunt Lorem veniam amet dolore ullamco dolor elit ullamco elit magna ad minim",
      "work_url": "",
      "video_source": "",
      "media_length": 31,
      "is_public": true,
      "created_at": "2025-04-28 08:33:31",
      "photo_url": "",
      "document_url": "",
      "audio_url": "",
      "video_url": ""
    },
    {
      "id": 59,
      "work_title": "cillum pariatur fugiat occaecat incididunt proident",
      "work_content": "sit quis occaecat aute magna qui aliqua minim duis in tempor",
      "work_url": "",
      "video_source": "",
      "media_length": 116,
      "is_public": true,
      "created_at": "2025-04-29 08:33:31",
      "photo_url": "",
      "document_url": "",
      "audio_url": "",
      "video_url": ""
    }
  ];

  // =============== Refresh control ===============
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);

  // =============== Handle "scroll top" button ===============
  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {/* Floating button */}
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning, bottom: 30 }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s13} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      {/* News */}
      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height, marginLeft: 0, paddingHorizontal: 2 }]}>
          <Animated.FlatList
            ref={flatListRef}
            data={newsData}
            extraData={newsData}
            keyExtractor={item => item.id}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={homeStyles.scrollableList} // ← Important: Compensates for the height of the Header + TabBar
            windowSize={10}
            ListEmptyComponent={<EmptyListComponent iconName='script-text-outline' title={t('empty_list.title')} description={t('empty_list.description_news')} />}
            renderItem={({ item }) => { return (<NewsItemComponent item={item} />); }}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} progressViewOffset={105} />}
            contentInset={{ top: 105 }}
            contentOffset={{ y: -105 }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

// Books frame
const Books = ({ handleScroll, showBackToTop, listRef }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get data ===============
  const { userInfo } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [idCat, setIdCat] = useState(0);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = listRef || useRef(null);

  // =============== Handle badge press ===============
  const handleBadgePress = useCallback((id) => {
    setIdCat(id);
    books.splice(0, books.length);

    // Reload data
    getBooks2(id);
    console.log('handleReload => Works count: ' + books.length + ', Selected category: ' + idCat);
  }, []);

  // =============== Using the Effect Hook ===============
  // CATEGORIES
  useEffect(() => {
    getCategories();
  }, []);

  // BOOKS
  useEffect(() => {
    getBooks();
  }, [idCat]);

  // =============== Some work functions ===============
  // CATEGORIES
  // Get all categories
  const getCategories = () => {
    setIsLoading(true);

    const config = { method: 'GET', url: `${API.url}/category/find_by_group/Catégorie%20pour%20œuvre`, headers: { 'X-localization': 'fr', 'Authorization': `Bearer ${userInfo.api_token}` } };
    const item_all = { "id": 0, "category_name": t('all_f'), "category_name_fr": "Toutes", "category_name_en": "All", "category_description": null };

    axios(config)
      .then(res => {
        const categoriesData = res.data.data;

        categoriesData.unshift(item_all);

        setIdCat(item_all.id);
        setCategories(categoriesData);
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
      });
  };

  // BOOKS
  const getBooks = () => {
    setIsLoading(true);

    let qs = require('qs');
    const url = `${API.url}/work/filter_by_categories`;
    let mParams = { 'categories_ids[0]': idCat, 'type_id': 29, 'status_id': 17 }
    const mHeaders = {
      'X-localization': 'fr',
      'Authorization': `Bearer ${userInfo.api_token}`
    };

    axios.post(url, qs.stringify(mParams), { headers: mHeaders }).then(res => {
      const booksData = res.data.data;

      setBooks(booksData);
      setIsLoading(false);

      console.log(new Date() + ' : getBooks => Works count: ' + booksData.length + ', Selected category: ' + idCat);

    }).catch(error => {
      if (error.response) {
        // The request was made and the server responded with a status code
        ToastAndroid.show(`${error.response.status} -> ${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
        console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

      } else if (error.request) {
        // The request was made but no response was received
        ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);

      } else {
        // An error occurred while configuring the query
        ToastAndroid.show(`${error}`, ToastAndroid.LONG);
      }
    });
  };

  const getBooks2 = (id) => {
    setIsLoading(true);

    let qs = require('qs');
    const url = `${API.url}/work/filter_by_categories`;
    let mParams = { 'categories_ids[0]': id, 'type_id': 29, 'status_id': 17 }
    const mHeaders = {
      'X-localization': 'fr',
      'Authorization': `Bearer ${userInfo.api_token}`
    };

    axios.post(url, qs.stringify(mParams), { headers: mHeaders }).then(res => {
      const booksData = res.data.data;

      setBooks(booksData);
      setIsLoading(false);

      console.log(new Date() + ' : getBooks2 => Works count: ' + booksData.length + ', Selected category: ' + id);

    }).catch(error => {
      if (error.response) {
        // The request was made and the server responded with a status code
        ToastAndroid.show(`${error.response.status} -> ${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
        console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

      } else if (error.request) {
        // The request was made but no response was received
        ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);

      } else {
        // An error occurred while configuring the query
        ToastAndroid.show(`${error}`, ToastAndroid.LONG);
      }
    });
  };

  // =============== Category Item ===============
  const CategoryItem = ({ item }) => {
    const isSelected = idCat === item.id;
    const Container = isSelected ? TouchableHighlight : TouchableOpacity;

    return (
      <Container
        key={item.id}
        onPress={() => handleBadgePress(item.id)}
        style={isSelected
          ? [homeStyles.categoryBadgeSelected, { backgroundColor: COLORS.white }]
          : [homeStyles.categoryBadge, { backgroundColor: COLORS.warning }]}
        underlayColor={COLORS.light_secondary}
      >
        <Text
          style={isSelected
            ? [homeStyles.categoryBadgeTextSelected, { color: COLORS.black }]
            : [homeStyles.categoryBadgeText, { color: 'black' }]}
        >
          {item.category_name}
        </Text>
      </Container>
    );
  };

  // =============== Refresh control ===============
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);

  // =============== Handle "scroll top" button ===============
  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      {/* Floating button */}
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning, bottom: 30 }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s13} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height, marginLeft: 0, paddingHorizontal: 2 }]}>
          {/* Categories */}
          <FlatList
            data={categories}
            keyExtractor={item => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={{ height: 40, marginTop: 105, flexGrow: 0 }}
            contentContainerStyle={{ alignItems: 'center', paddingHorizontal: PADDING.p00 }}
            renderItem={({ item }) => {
              return (<CategoryItem item={item} />);
            }} />

          {/* Books */}
          <Animated.FlatList
            ref={flatListRef}
            data={books}
            extraData={books}
            keyExtractor={item => item.id}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            windowSize={10}
            ListEmptyComponent={<EmptyListComponent iconName='book-open-page-variant-outline' title={t('empty_list.title')} description={t('empty_list.description_books')} />}
            renderItem={({ item }) => { return (<WorkItemComponent item={item} />); }}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const HomeScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get data ===============
  const newsListRef = useRef(null);
  const booksListRef = useRef(null);
  const [index, setIndex] = useState(0); // State for managing active tab index
  const [showBackToTopByTab, setShowBackToTopByTab] = useState({ news: false, books: false });
  const scrollY = useRef(new Animated.Value(0)).current;
  const savedScrollOffsets = useRef({ news: 0, books: 0 });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -60], // The header hides at -60px
    extrapolate: 'clamp',
  });

  const [routes] = useState([
    { key: 'news', title: t('navigation.home.news') },
    { key: 'books', title: t('navigation.home.books') },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'news':
        return <News handleScroll={handleScroll} showBackToTop={showBackToTopByTab.news} listRef={newsListRef} />;
      case 'books':
        return <Books handleScroll={handleScroll} showBackToTop={showBackToTopByTab.books} listRef={booksListRef} />;
      default:
        return null;
    }
  };

  // Handle scrolling and show/hide the header
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const currentTab = (index === 0 ? 'news' : 'books');

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
    const newTabKey = newIndex === 0 ? 'news' : 'books';
    const offset = savedScrollOffsets.current[newTabKey] || 0;

    // Animate scrollY back to 0 smoothly (for header + tabbar)
    Animated.timing(scrollY, {
      toValue: offset,
      duration: 300, // 300ms for smooth effect
      useNativeDriver: true,
    }).start();

    // Remonte en haut selon l'onglet sélectionné
    if (newIndex === 0 && newsListRef.current) {
      newsListRef.current.scrollToOffset({ offset, animated: true });

    } else if (newIndex === 1 && booksListRef.current) {
      booksListRef.current.scrollToOffset({ offset, animated: true });
    }

    setIndex(newIndex);
  };

  // Custom "TabBar"
  const renderTabBar = (props) => (
    <Animated.View style={{ transform: [{ translateY: headerTranslateY }], zIndex: 1000, position: 'absolute', top: 0, width: '100%', backgroundColor: COLORS.white, paddingTop: 20 }}>
      <HeaderComponent />
      <TabBar
        {...props}
        style={{ backgroundColor: COLORS.white, borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 }}
        indicatorStyle={{ backgroundColor: COLORS.black }}
        activeColor={COLORS.black}
        inactiveColor={COLORS.dark_secondary}
      />
    </Animated.View>

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

export default HomeScreen