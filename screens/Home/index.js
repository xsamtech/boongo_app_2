/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, Animated, SafeAreaView, FlatList, Dimensions, RefreshControl } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { IMAGE_SIZE, PADDING } from '../../tools/constants';
import HeaderComponent from '../header';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';

// News frame
const News = ({ handleScroll, showBackToTop }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get data ===============
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.light_secondary }}>
      {/* Floating button */}
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.success, bottom: 80 }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s13} style={{ color: COLORS.white }} />
        </TouchableOpacity>
      )}

      {/* News */}
      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height - 70, marginLeft: 0, paddingHorizontal: 2, paddingBottom: 30 }]}>
          <FlatList
            ref={flatListRef}
            data={newsData}
            extraData={newsData}
            keyExtractor={item => item.id}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={homeStyles.scrollableList}
            windowSize={10}
            ListEmptyComponent={() => {
              return (
                <>
                  <Text style={homeStyles.cardEmptyTitle}>{t('empty_list.title')}</Text>
                  <Text style={[homeStyles.cardEmptyText, { marginBottom: 25 }]}>{t('empty_list.description_news')}</Text>
                </>
              )
            }}
            renderItem={({ item }) => {
              return (
                <View style={[homeStyles.workTop, { backgroundColor: COLORS.white, marginBottom: PADDING.p01, paddingHorizontal: PADDING.p03 }]}>
                  <View style={homeStyles.workDescTop}>
                    <Text style={[homeStyles.workTitle, { color: COLORS.dark_secondary }]} numberOfLines={2}>{item.work_title}</Text>
                    <Text style={[homeStyles.workContent, { color: COLORS.black }]} numberOfLines={4}>{item.work_content}</Text>
                    <TouchableOpacity style={homeStyles.linkIcon} onPress={() => navigation.navigate('NewsData', { itemId: item.id })}>
                      <Text style={[homeStyles.link, { color: COLORS.link_color }]}>{t('see_details')} </Text>
                      <Icon name='chevron-right' size={IMAGE_SIZE.s05} color={COLORS.link_color} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
             />
        </View>
      </SafeAreaView>
    </View>
  );
};

// Books frame
const Books = ({ handleScroll }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get data ===============
  // const [isLoading, setIsLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const flatListRef = useRef(null);
  const booksData = [
    {
      "id": 51,
      "work_title": "sit commodo ea cupidatat labore nisi",
      "work_content": "officia nisi consectetur deserunt amet incididunt anim est aute ex officia ex excepteur minim laboris exercitation eu laborum",
      "work_url": "",
      "video_source": "",
      "media_length": 97,
      "is_public": true,
      "created_at": "2025-04-23 08:33:31",
      "photo_url": "",
      "document_url": "",
      "audio_url": "",
      "video_url": ""
    },
    {
      "id": 78,
      "work_title": "enim ex",
      "work_content": "eu excepteur ad ad aute officia consequat et nostrud minim ipsum fugiat occaecat",
      "work_url": "",
      "video_source": "",
      "media_length": 58,
      "is_public": true,
      "created_at": "2025-04-24 08:33:31",
      "photo_url": "",
      "document_url": "",
      "audio_url": "",
      "video_url": ""
    },
    {
      "id": 9,
      "work_title": "enim qui incididunt id enim et",
      "work_content": "aute eiusmod anim aute et adipisicing aute ullamco in commodo aute officia enim nisi id mollit adipisicing occaecat nulla ullamco",
      "work_url": "",
      "video_source": "",
      "media_length": 30,
      "is_public": true,
      "created_at": "2025-04-25 08:33:31",
      "photo_url": "",
      "document_url": "",
      "audio_url": "",
      "video_url": ""
    },
    {
      "id": 65,
      "work_title": "reprehenderit nulla dolore laborum adipisicing Lorem esse amet deserunt sit",
      "work_content": "id commodo ullamco eiusmod commodo consectetur laboris ullamco aute deserunt quis deserunt occaecat anim sunt nostrud fugiat Lorem",
      "work_url": "",
      "video_source": "",
      "media_length": 86,
      "is_public": true,
      "created_at": "2025-04-26 08:33:31",
      "photo_url": "",
      "document_url": "",
      "audio_url": "",
      "video_url": ""
    },
    {
      "id": 22,
      "work_title": "adipisicing occaecat aliqua",
      "work_content": "et ut incididunt esse sint nulla minim velit nostrud esse proident fugiat cupidatat consectetur proident",
      "work_url": "",
      "video_source": "",
      "media_length": 48,
      "is_public": false,
      "created_at": "2025-04-27 08:33:31",
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.light_secondary }}>
      {/* Floating button */}
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.success, bottom: 80 }]} onPress={scrollToTop}>
          <Icon name='chevron-double-up' size={IMAGE_SIZE.s13} style={{ color: COLORS.white }} />
        </TouchableOpacity>
      )}

      {/* Books */}
      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height - 70, marginLeft: 0, paddingHorizontal: 2, paddingBottom: 30 }]}>
          <FlatList
            ref={flatListRef}
            data={booksData}
            extraData={booksData}
            keyExtractor={item => item.id}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={homeStyles.scrollableList}
            windowSize={10}
            ListEmptyComponent={() => {
              return (
                <>
                  <Text style={homeStyles.cardEmptyTitle}>{t('empty_list.title')}</Text>
                  <Text style={[homeStyles.cardEmptyText, { marginBottom: 25 }]}>{t('empty_list.description_books')}</Text>
                </>
              )
            }}
            renderItem={({ item }) => {
              return (
                <View style={[homeStyles.workTop, { backgroundColor: COLORS.white, marginBottom: PADDING.p01, paddingHorizontal: PADDING.p03 }]}>
                  <View style={homeStyles.workDescTop}>
                    <Text style={[homeStyles.workTitle, { color: COLORS.dark_secondary }]} numberOfLines={2}>{item.work_title}</Text>
                    <Text style={[homeStyles.workContent, { color: COLORS.black }]} numberOfLines={4}>{item.work_content}</Text>
                    <TouchableOpacity style={homeStyles.linkIcon} onPress={() => navigation.navigate('BookData', { itemId: item.id })}>
                      <Text style={[homeStyles.link, { color: COLORS.link_color }]}>{t('see_details')} </Text>
                      <Icon name='chevron-right' size={IMAGE_SIZE.s05} color={COLORS.link_color} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            // refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />} 
            />
        </View>
      </SafeAreaView>
    </View>
  );
};

const HomeScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== State for managing active tab index ===============
  const [index, setIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollY, setScrollY] = useState(new Animated.Value(0)); // Animation to make the Header move
  const [headerVisible, setHeaderVisible] = useState(true); // Logic to show or hide the header

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -60], // The header hides at -60px
    extrapolate: 'clamp',
  });

  // Handle scrolling and show/hide the header
  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const currentOffset = contentOffset.y;
    const isAtTop = contentOffset.y === 0;

    if (currentOffset > 50) {
      setHeaderVisible(false); // Masquer le header
    } else {
      setHeaderVisible(true); // Afficher le header
    }

    setShowBackToTop(!isAtTop);
  };

  const [routes] = useState([
    { key: 'news', title: t('navigation.home.news') },
    { key: 'books', title: t('navigation.home.books') },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'news':
        return <News handleScroll={handleScroll} showBackToTop={showBackToTop} />;
      case 'books':
        return <Books handleScroll={handleScroll} />;
      default:
        return null;
    }
  };

  // Custom TabBar
  const renderTabBar = (props) => (
    <>
      <Animated.View
        style={[
          { backgroundColor: COLORS.white, paddingTop: 20 },
          { transform: [{ translateY: headerTranslateY }] }, // Applies header animation
        ]}
      >
        <HeaderComponent />
      </Animated.View>
      <TabBar
        {...props}
        style={{ backgroundColor: COLORS.white, color: COLORS.black, elevation: 0 }}
        indicatorStyle={{ backgroundColor: COLORS.black }}
        labelStyle={{ color: COLORS.black }}
      />
    </>
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: 100 }}
      renderTabBar={renderTabBar} // Using the Custom TabBar
    />
  );
};

export default HomeScreen