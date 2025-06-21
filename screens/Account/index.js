/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, Animated, SafeAreaView, Dimensions, RefreshControl, TouchableHighlight, FlatList, Text, Image, ScrollView, ActivityIndicator } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API, IMAGE_SIZE, PADDING } from '../../tools/constants';
import { AuthContext } from '../../contexts/AuthContext';
import HeaderComponent from '../header';
import EmptyListComponent from '../../components/empty_list';
import WorkItemComponent from '../../components/work_item';
import FloatingActionsButton from '../../components/floating_actions_button';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';
import { useNavigation } from '@react-navigation/native';
import { DataTable } from 'react-native-paper';

// Works frame
const MyWorks = ({ handleScroll, showBackToTop, listRef, headerHeight = 0 }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
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
  useEffect(() => {
    fetchWorks();
  }, [page, idCat]);

  const fetchWorks = async () => {
    if (isLoading || page > lastPage) return;
    setIsLoading(true);

    const qs = require('qs');
    const url = `${API.boongo_url}/work/filter_by_categories?page=${page}`;
    const params = {
      'categories_ids[0]': idCat
    };

    const headers = {
      'X-localization': 'fr',
      Authorization: `Bearer ${userInfo.api_token}`,
    };

    try {
      const response = await axios.post(url, qs.stringify(params), { headers });
      const data = response.data.data || [];

      setWorks(prev => (page === 1 ? data : [...prev, ...data]));
      setAd(response.data.ad || null);
      setLastPage(response.data.lastPage || page);
      setCount(response.data.count || 0);

      console.log(response.data);

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
        <TouchableOpacity
          style={[homeStyles.floatingButton, { backgroundColor: COLORS.warning, bottom: 30 }]}
          onPress={scrollToTop}
        >
          <Icon name="chevron-double-up" size={IMAGE_SIZE.s13} style={{ color: 'black' }} />
        </TouchableOpacity>
      )}

      <SafeAreaView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[homeStyles.cardEmpty, { height: Dimensions.get('window').height, marginLeft: 0, paddingHorizontal: 2 }]}>
          {/* Categories */}
          <FlatList
            data={categories}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ height: 40, marginTop: headerHeight, flexGrow: 0 }}
            contentContainerStyle={{
              alignItems: 'center',
              paddingHorizontal: PADDING.p00,
            }}
            renderItem={({ item }) => <CategoryItem item={item} />}
          />

          {/* Works List */}
          <Animated.FlatList
            ref={flatListRef}
            data={combinedData}
            extraData={combinedData}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <WorkItemComponent item={item} />}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            // contentContainerStyle={{ paddingTop: headerHeight }}
            onScroll={handleScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1}
            scrollEventThrottle={16}
            windowSize={10}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={105} />}
            contentInset={{ top: 105 }}
            contentOffset={{ y: -105 }}
            ListEmptyComponent={<EmptyListComponent iconName="book-open-page-variant-outline" title={t('empty_list.title')} description={t('empty_list.description_books')} />}
            ListFooterComponent={() => isLoading ? (<Text style={{ color: COLORS.black, textAlign: 'center', padding: PADDING.p01, }} >{t('loading')}</Text>) : null}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

// Works frame
const MyCart = ({ handleScroll, showBackToTop, listRef, headerHeight = 0 }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const consultations = userInfo.unpaid_consultations;
  const subscriptions = userInfo.unpaid_subscriptions;
  const totalConsultations = userInfo.total_unpaid_consultations;
  const totalSubscriptions = userInfo.total_unpaid_subscriptions;
  const [isLoading, setIsLoading] = useState(false);

  // ================= Handlers =================
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);

  const InnerWorkItem = ({ item }) => {
    // =============== Colors ===============
    const COLORS = useColors();
    // =============== Language ===============
    const { t } = useTranslation();
    // =============== Navigation ===============
    const navigation = useNavigation();
    // =============== Get data ===============
    const [price, setPrice] = useState('');

    const getPrice = async () => {
      setIsLoading(true);

      try {
        if (item.currency.currency_acronym === userInfo.currency.currency_acronym) {
          setPrice(item.consultation_price + ' ' + userInfo.currency.currency_acronym);

        } else {
          const url = `${API.boongo_url}/currencies_rate/find_currency_rate/${item.currency.currency_acronym}/${userInfo.currency.currency_acronym}`;
          const mHeaders = {
            'X-localization': 'fr',
            'Authorization': `Bearer ${userInfo.api_token}`
          };
          const response = axios.get(url, { headers: mHeaders });
          const responseData = response.data.data;
          const userPrice = item.consultation_price * responseData.rate;

          setPrice(userPrice + ' ' + userInfo.currency.currency_acronym);
        }

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
      getPrice();
    }, []);

    return (
      <TouchableOpacity style={homeStyles.homeScrollableListItem} onPress={() => navigation.navigate('WorkData', { itemId: item.id })}>
        <Image source={{ uri: item.image_url }} style={homeStyles.homeThumbnail} />
        <Text style={[homeStyles.homeTitleOne, { color: COLORS.black }]}>
          {((item.work_title).length > 25) ? (((item.work_title).substring(0, 25 - 3)) + '...') : item.work_title}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontWeight: '500', color: COLORS.black }}>{t('work.consultation_price')}</Text>
          <Text style={{ color: COLORS.black }}>{`${price}`}</Text>
        </View>
      </TouchableOpacity>
    )
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}>
        <View style={homeStyles.headingArea}>
          <Text style={[homeStyles.heading, { color: COLORS.black }]}>{t('navigation.cart')}</Text>
        </View>

        {isLoading
          ? <ActivityIndicator color={COLORS.primary} size='large' />
          :
          <>
            {/* CONSULTATIONS */}
            <View style={homeStyles.listTitleArea}>
              <View style={{ flexDirection: 'column' }}>
                <Text style={homeStyles.listTitle}>{t('unpaid.consultation')}</Text>
                <Text style={{ fontWeight: '500' }}>{totalConsultations + ' ' + userInfo.currency.currency_acronym}</Text>
              </View>
              <TouchableOpacity style={[homeStyles.linkIcon, { color: COLORS.link_color }]} onPress={() => { navigation.navigate('HomeStack') }}>
                <Text style={homeStyles.link}>{t('unpaid.add')} </Text>
                <Icon name='chevron-double-right' size={IMAGE_SIZE.s04} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={consultations}
              keyExtractor={item => item.id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={homeStyles.scrollableList}
              ListEmptyComponent={<EmptyListComponent iconName="book-open-page-variant-outline" title={t('empty_list.title')} description={t('empty_list.description_unpaid_consultation')} />}
              renderItem={({ item }) => {
                return (<InnerWorkItem item={item} />);
              }} />

            {/* SUBSCRIPTIONS */}
            <View style={homeStyles.listTitleArea}>
              <View style={{ flexDirection: 'column' }}>
                <Text style={homeStyles.listTitle}>{t('unpaid.subscription')}</Text>
                <Text style={{ fontWeight: '500' }}>{totalSubscriptions + ' ' + userInfo.currency.currency_acronym}</Text>
              </View>
              <TouchableOpacity style={[homeStyles.linkIcon, { color: COLORS.link_color }]} onPress={() => { navigation.navigate('Subscription') }}>
                <Text style={homeStyles.link}>{t('unpaid.add')} </Text>
                <Icon name='chevron-double-right' size={IMAGE_SIZE.s04} />
              </TouchableOpacity>
            </View>
            {subscriptions.length > 0 ?
              <DataTable style={{ paddingVertical: 15, paddingHorizontal: 0 }}>
                <DataTable.Header style={{ backgroundColor: COLORS.secondary }}>
                  <DataTable.Title style={{ minWidth: 80 }}>{t('subscription.type')}</DataTable.Title>
                  <DataTable.Title style={{ maxWidth: 40 }}>{t('subscription.price')}</DataTable.Title>
                  <DataTable.Title></DataTable.Title>
                </DataTable.Header>
                {subscriptions.map(item =>
                  <DataTable.Row key={item.id}>
                    <DataTable.Cell style={{ minWidth: 80 }}>{item.type.type_name}</DataTable.Cell>
                    <DataTable.Cell style={{ maxWidth: 40 }}>{Math.round(item.price) + '$'}</DataTable.Cell>
                    <DataTable.Cell>
                      <TouchableOpacity style={[homeStyles.workCmd, { backgroundColor: COLORS.success, paddingVertical: 5 }]} onPress={() => { redirectToSubscribe(navigation, item.id, userInfo.id, userInfo.api_token) }}>
                        <Text style={{ color: COLORS.white }}>{t('subscription.link')}</Text>
                      </TouchableOpacity>
                    </DataTable.Cell>
                  </DataTable.Row>
                )}
              </DataTable>
              :
              <EmptyListComponent iconName="credit-card-outline" title={t('empty_list.title')} description={t('empty_list.description_unpaid_subscription')} />
            }
          </>
        }
      </ScrollView>
    </View>
  );
};

const AccountScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get data ===============
  const myWorksListRef = useRef(null);
  const [index, setIndex] = useState(0); // State for managing active tab index
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showBackToTopByTab, setShowBackToTopByTab] = useState({ my_works: false });
  const scrollY = useRef(new Animated.Value(0)).current;
  const savedScrollOffsets = useRef({ my_works: 0 });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight], // The header hides at -60px
    extrapolate: 'clamp',
  });

  const [routes] = useState([
    { key: 'my_works', title: t('navigation.account.my_works') },
    { key: 'my_cart', title: t('navigation.account.my_cart') },
  ]);

  const renderScene = ({ route }) => {
    const sceneProps = {
      handleScroll,
      headerHeight,
    };

    switch (route.key) {
      case 'my_works':
        return <MyWorks {...sceneProps} handleScroll={handleScroll} showBackToTop={showBackToTopByTab.my_works} listRef={myWorksListRef} />;
      case 'my_cart':
        return <MyCart {...sceneProps} />;
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
        const currentTab = (index === 0 ? 'my_works' : 'my_cart');

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
    const newTabKey = newIndex === 0 ? 'my_works' : 'my_cart';
    const offset = savedScrollOffsets.current[newTabKey] || 0;

    // Animate scrollY back to 0 smoothly (for header + tabbar)
    Animated.timing(scrollY, {
      toValue: offset,
      duration: 300, // 300ms for smooth effect
      useNativeDriver: true,
    }).start();

    // Remonte en haut selon l'onglet sélectionné
    if (newIndex === 0 && myWorksListRef.current) {
      myWorksListRef.current.scrollToOffset({ offset, animated: true });
    }

    setIndex(newIndex);
  };

  // Custom "TabBar"
  const renderTabBar = (props) => (
    <>
      <Animated.View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)} style={{ transform: [{ translateY: headerTranslateY }], zIndex: 1000, position: 'absolute', top: 0, width: '100%', backgroundColor: COLORS.white, paddingTop: 20 }}>
        <HeaderComponent />
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

export default AccountScreen