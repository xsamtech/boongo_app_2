/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import * as RNLocalize from 'react-native-localize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { API, PADDING, TEXT_SIZE } from '../tools/constants';
import homeStyles from '../screens/style';
import useColors from '../hooks/useColors';
import HeaderComponent from './header';
import EmptyListComponent from '../components/empty_list';

const SubscriptionScreen = ({ route }) => {
  const COLORS = useColors();
  const { t } = useTranslation();
  const { message } = route.params;
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);
  const [subscriptions, setSubscriptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [prices, setPrices] = useState({});

  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    getSubscription();
  }, []);

  useEffect(() => {
    if (Object.keys(subscriptions).length > 0) {
      Object.keys(subscriptions).forEach((categoryName) => {
        subscriptions[categoryName].forEach((item) => {
          const subscriptionId = `${categoryName}-${item.id}`;
          if (!prices[subscriptionId]) {
            getPrice(item.price, item.currency.currency_acronym, subscriptionId);
          }
        });
      });
    }
  }, [subscriptions]);

  // Get system language
  const getLanguage = () => {
    const locales = RNLocalize.getLocales();

    if (locales && locales.length > 0) {
      return locales[0].languageCode;
    }

    return 'fr';
  };

  // Get all subscription
  const getSubscription = () => {
    axios
      .get(`${API.boongo_url}/subscription`, { headers: { 'X-localization': 'fr' } })
      .then((res) => {
        if (res.data.success && res.data.data) {
          setSubscriptions(res.data.data);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  // Get price according to user currency
  const getPrice = (price, currency_acronym, id) => {
    const userLang = getLanguage();

    // Apply language-specific formatting
    let formattedPrice = price.toLocaleString(userLang, {
      style: 'decimal',
      useGrouping: true,
      minimumFractionDigits: 0, // No digits after the decimal point
      maximumFractionDigits: 0, // No digits after the decimal point
    });

    if (currency_acronym === userInfo.currency.currency_acronym) {
      setPrices((prevPrices) => ({ ...prevPrices, [id]: `${formattedPrice} ${userInfo.currency.currency_acronym}` }));

    } else {
      const url = `${API.boongo_url}/currencies_rate/find_currency_rate/${currency_acronym}/${userInfo.currency.currency_acronym}`;
      const mHeaders = {
        'X-localization': 'fr',
        Authorization: `Bearer ${userInfo.api_token}`,
      };

      axios.get(url, { headers: mHeaders }).then((response) => {
        if (response.data.success && response.data.data) {
          const responseData = response.data.data;
          const userPrice = price * responseData.rate;
          const formattedUserPrice = userPrice.toLocaleString(userLang, {
            style: 'decimal',
            useGrouping: true,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });

          setPrices((prevPrices) => ({ ...prevPrices, [id]: `${formattedUserPrice} ${userInfo.currency.currency_acronym}` }));
        }
      })
        .catch((error) => {
          console.error('Erreur lors de la récupération du taux de change', error);
        });
    }
  };

  const renderCategory = ({ item, index }) => (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.link_color }}>
        {item}
      </Text>
      <FlatList
        data={subscriptions[item]}
        keyExtractor={(subItem) => subItem.id.toString()}
        renderItem={({ item: subItem }) => (
          <SubscriptionItem
            item={subItem}
            categoryName={item}
            prices={prices}
            getPrice={getPrice}
            userInfo={userInfo}
          />
        )}
        ListEmptyComponent={<Text>{t('empty_list.title')}</Text>}
      />
    </View>
  );

  const categories = Object.keys(subscriptions);

  const SubscriptionItem = ({ item, categoryName, prices, getPrice, userInfo }) => {
    const subscriptionId = `${categoryName}-${item.id}`;
    const price = prices[subscriptionId];
    // Check if user has added subscription in the 
    const isInCart = userInfo.unpaid_subscriptions && userInfo.unpaid_subscriptions.some(subscription => subscription.id === item.id);

    useEffect(() => {
      if (!prices[subscriptionId]) {
        getPrice(item.price, item.currency.currency_acronym, subscriptionId);
      }
    }, [prices, item, categoryName, subscriptionId, getPrice]);

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.light_secondary }}>
        <View style={{ flexDirection: 'column' }}>
          <Text style={{ flex: 2, color: COLORS.dark_secondary }}>{item.type.type_name}</Text>
          <Text style={{ flex: 1, fontWeight: '500', color: COLORS.black }}>{price ? price : <ActivityIndicator size="small" />}</Text>
        </View>
        {isInCart ?
          <TouchableOpacity style={[homeStyles.workCmd, { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.light_secondary, paddingVertical: 5 }]}>
            <Icon name="window-close" size={20} color={COLORS.danger} />
            <Text style={{ color: COLORS.danger, fontWeight: '600', marginLeft: PADDING.p00 }}>{t('withdraw_from_cart')}</Text>
          </TouchableOpacity>
          :
          <TouchableOpacity style={[homeStyles.workCmd, { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.light_secondary, paddingVertical: 5 }]}>
            <Icon name="plus" size={20} color={COLORS.success} />
            <Text style={{ color: COLORS.success, fontWeight: '600', marginLeft: PADDING.p00 }}>{t('add_to_cart')}</Text>
          </TouchableOpacity>
        }
      </View>
    );
  };

  return (
    <>
      <View style={{ backgroundColor: COLORS.white, paddingVertical: PADDING.p01 }}>
        <HeaderComponent />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: COLORS.white, paddingHorizontal: PADDING.p01 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}>
        <SafeAreaView style={{ padding: PADDING.p01 }}>
          <FlatList
            data={categories}
            scrollEnabled={false}
            nestedScrollEnabled
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderCategory}
            ListHeaderComponent={<Text style={[homeStyles.cardEmptyTitle, { color: COLORS.black, textAlign: 'center' }]}>{t('subscription.title')}</Text>}
            ListEmptyComponent={<EmptyListComponent iconName="credit-card-outline" title={t('empty_list.title')} description={t('empty_list.description_subscription')} />}
          />
        </SafeAreaView>
      </ScrollView>
    </>
  );
};

export default SubscriptionScreen;
