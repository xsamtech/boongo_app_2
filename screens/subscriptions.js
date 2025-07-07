/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import { View, Text, Dimensions, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Button, DataTable, Divider } from 'react-native-paper';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { API, PADDING } from '../tools/constants';
import homeStyles from '../screens/style';
import useColors from '../hooks/useColors';
import HeaderComponent from './header';

const SubscriptionScreen = ({ route }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get parameters ===============
  const { message } = route.params;
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get context ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const [subscriptions, setSubscriptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [prices, setPrices] = useState({});  // État pour stocker les prix des abonnements

  // =============== Refresh control ===============
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);

  useEffect(() => {
    getSubscription();
  }, []);

  useEffect(() => {
    // Vérifier si les abonnements ont été chargés et ensuite appeler les prix
    if (Object.keys(subscriptions).length > 0) {
      Object.keys(subscriptions).forEach(categoryName => {
        subscriptions[categoryName].forEach(item => {
          const subscriptionId = `${categoryName}-${item.id}`;
          if (!prices[subscriptionId]) {
            getPrice(item.price, item.currency.currency_acronym, subscriptionId);
          }
        });
      });
    }
  }, [subscriptions]);  // Ce useEffect sera exécuté lorsque les abonnements changent

  const getSubscription = () => {
    const config = { method: 'GET', url: `${API.boongo_url}/subscription`, headers: { 'X-localization': 'fr' } };

    axios(config)
      .then(res => {
        // Vérification si les données existent
        if (res.data.success && res.data.data) {
          setSubscriptions(res.data.data);  // On stocke directement les catégories dans l'état
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
  };

  // Fonction pour obtenir le prix de l'abonnement avec conversion de devise
  const getPrice = (price, currency_acronym, id) => {
    if (currency_acronym === userInfo.currency.currency_acronym) {
      setPrices(prevPrices => ({ ...prevPrices, [id]: price + ' ' + userInfo.currency.currency_acronym }));
    } else {
      const url = `${API.boongo_url}/currencies_rate/find_currency_rate/${currency_acronym}/${userInfo.currency.currency_acronym}`;
      const mHeaders = {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`,
      };

      axios
        .get(url, { headers: mHeaders })
        .then(response => {
          if (response && response.data && response.data.success && response.data.data) {
            const responseData = response.data.data;
            const userPrice = price * responseData.rate;
            setPrices(prevPrices => ({ ...prevPrices, [id]: userPrice.toFixed(2) + ' ' + userInfo.currency.currency_acronym }));
          } else {
            console.error('Erreur : Données manquantes ou format incorrect', response.data.message);
          }
        })
        .catch(error => {
          console.error('Erreur lors de la récupération du taux de change', error);
        });
    }
  };

  return (
    <>
      {/* Header */}
      <View style={{ paddingVertical: PADDING.p01, backgroundColor: COLORS.white }}>
        <HeaderComponent />
      </View>

      {/* Content */}
      <ScrollView
        style={{
          flex: 1,
          height: Dimensions.get('window').height - 20,
          backgroundColor: COLORS.white,
        }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      >
        <View
          style={[
            homeStyles.cardEmpty,
            {
              flexShrink: 0,
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height + 200,
              marginLeft: 0,
              paddingBottom: 30,
            },
          ]}
        >
          {Object.keys(subscriptions).length > 0 ? (
            // On itère maintenant sur les catégories
            Object.keys(subscriptions).map((categoryName, categoryIndex) => {
              const categorySubscriptions = subscriptions[categoryName];

              return (
                <View key={categoryIndex} style={{ marginVertical: 10 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                    {categoryName}
                  </Text>

                  {/* Table des abonnements */}
                  <DataTable style={{ paddingVertical: 15, paddingHorizontal: 0 }}>
                    <DataTable.Header style={{ backgroundColor: COLORS.secondary }}>
                      <DataTable.Title style={{ minWidth: 80 }}>{t('subscription.type')}</DataTable.Title>
                      <DataTable.Title style={{ maxWidth: 40 }}>{t('subscription.price')}</DataTable.Title>
                      <DataTable.Title></DataTable.Title>
                    </DataTable.Header>

                    {categorySubscriptions.map((item) => {
                      const subscriptionId = `${categoryIndex}-${item.id}`;  // Clé unique pour chaque abonnement
                      const price = prices[subscriptionId];  // On récupère le prix du tableau `prices`

                      return (
                        <DataTable.Row key={item.id}>
                          <DataTable.Cell style={{ minWidth: 80 }}>{item.type.type_name}</DataTable.Cell>
                          <DataTable.Cell style={{ maxWidth: 40 }}>
                            {price ? (
                              price
                            ) : (
                              <ActivityIndicator size="small" color={COLORS.primary} />
                            )}
                          </DataTable.Cell>
                          <DataTable.Cell>
                            <TouchableOpacity
                              style={[homeStyles.workCmd, { backgroundColor: COLORS.success, paddingVertical: 5 }]}
                              onPress={() => {
                                userInfo.id
                                  ? redirectToSubscribe(navigation, item.id, userInfo.id, userInfo.api_token)
                                  : navigation.navigate('Login', {
                                    message: t('error_message.login_before_operation'),
                                  });
                              }}
                            >
                              <Text style={{ color: COLORS.white }}>{t('subscription.link')}</Text>
                            </TouchableOpacity>
                          </DataTable.Cell>
                        </DataTable.Row>
                      );
                    })}
                  </DataTable>
                </View>
              );
            })
          ) : (
            <Text style={[homeStyles.cardEmptyTitle, { marginTop: 20, textAlign: 'center' }]}>
              {t('empty_list.title')}
            </Text>
          )}

          {/* Terms accept */}
          <Divider style={[homeStyles.authDivider, { marginHorizontal: PADDING.horizontal }]} />
          <Text style={[homeStyles.authTermsText, { marginBottom: 40 }]}>
            {t('terms_accept1_')}
            <Text style={homeStyles.link} onPress={() => navigation.navigate('About', { screen: 'Terms' })}>
              {t('navigation.terms')}
            </Text>
            {t('terms_accept2')}{' '}
            <Text style={homeStyles.link} onPress={() => navigation.navigate('About', { screen: 'Privacy' })}>
              {t('navigation.privacy')}
            </Text>
          </Text>

          <View style={{ backgroundColor: '#fea', marginVertical: 30, padding: PADDING.vertical }}>
            <FontAwesome6 style={[homeStyles.workCmdIcon, { fontSize: 20, alignSelf: 'center' }]} name="circle-info" />
            <Text style={[homeStyles.authTermsText, { fontWeight: '600' }]}>{message}</Text>
          </View>

          {/* Submit */}
          <Button
            style={[homeStyles.authButton, { marginHorizontal: PADDING.horizontal }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={homeStyles.authButtonText}>{t('cancel')}</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
};

export default SubscriptionScreen;
