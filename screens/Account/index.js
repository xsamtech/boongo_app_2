/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useEffect } from 'react'
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
const MyWorks = ({ handleScroll, showBackToTop, listRef }) => {
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
            style={{ height: 40, marginTop: 105, flexGrow: 0 }}
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
const MyCart = ({ handleScroll, showBackToTop, listRef }) => {
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
  const [isLoading, setIsLoading] = useState(false);
  const [totalConsultationPrice, setTotalConsultationPrice] = useState('');

  const getTotalConsultationPrice = async () => {
    setIsLoading(true);

    try {
      if (item.currency.currency_acronym === userInfo.currency.currency_acronym) {
        setPrice(item.consultation_price + ' ' + userInfo.currency.currency_acronym);

      } else {
        const qs = require('qs');
        const url = `${API.boongo_url}/currencies_rate/find_currency_rate/${item.currency.currency_acronym}/${userInfo.currency.currency_acronym}`;
        const mParams = { type_id: 33, status_id: 17, page: pageToFetch };
        const mHeaders = {
          'X-localization': 'fr',
          'Authorization': `Bearer ${userInfo.api_token}`
        };
        const response = axios.post(url, qs.stringify(mParams), { headers: mHeaders });
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
    getTotalConsultationPrice();
  }, []);

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
          const qs = require('qs');
          const url = `${API.boongo_url}/currencies_rate/find_currency_rate/${item.currency.currency_acronym}/${userInfo.currency.currency_acronym}`;
          const mParams = { type_id: 33, status_id: 17, page: pageToFetch };
          const mHeaders = {
            'X-localization': 'fr',
            'Authorization': `Bearer ${userInfo.api_token}`
          };
          const response = axios.post(url, qs.stringify(mParams), { headers: mHeaders });
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
                <Text style={{ fontWeight: '500' }}>{totalConsultationPrice}</Text>
              </View>
              <TouchableOpacity style={[homeStyles.linkIcon, { color: COLORS.link_color }]} onPress={() => { navigation.navigate('HomeStack') }}>
                <Text style={homeStyles.link}>{t('unpaid.add')} </Text>
                <MaterialCommunityIcons name='chevron-double-right' size={ICON_SIZE.s3} />
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
              <Text style={homeStyles.listTitle}>{t('unpaid.subscription')}</Text>
              <TouchableOpacity style={[homeStyles.linkIcon, { color: COLORS.link_color }]} onPress={() => { navigation.navigate('Subscription') }}>
                <Text style={homeStyles.link}>{t('unpaid.add')} </Text>
                <MaterialCommunityIcons name='chevron-double-right' size={ICON_SIZE.s3} />
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
  return (
    <View>
      <Text>Account</Text>
    </View>
  )
}

export default AccountScreen