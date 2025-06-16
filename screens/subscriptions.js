/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import { View, Text, Dimensions, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
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

const SubscriptionScreen = ({ route }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();

  // =============== Get parameters ===============
  const { message } = route.params;

  // =============== Navigation ===============
  const navigation = useNavigation();

  // =============== Authentication context ===============
  const { userInfo, validateSubscription, invalidateSubscription } = useContext(AuthContext);

  // =============== Get data ===============
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // =============== Refresh control ===============
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);

  // =============== Get item API with effect hook ===============
  useEffect(() => {
    if (userInfo.id) {
      const validationInterval = setInterval(() => {
        validateSubscription(userInfo.id);
        invalidateSubscription(userInfo.id);
      }, 1000);

      return () => clearInterval(validationInterval);

    } else {
      console.log('Utilisateur non connecté');
    }
  }, []);

  useEffect(() => {
    getSubscription();
  }, []);

  const getSubscription = () => {
    const config = { method: 'GET', url: `${API.boongo_url}/subscription`, headers: { 'X-localization': 'fr' } };

    axios(config)
      .then(res => {
        const subscriptionData = res.data.data;

        setSubscriptions(subscriptionData);
        setIsLoading(false);

        return subscriptionData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  const redirectToSubscribe = (nav, subscr_id, user_id, api_token) => {
    nav.navigate('Subscribe', { subscrId: subscr_id, userId: user_id, apiToken: api_token });
  };

  return (
    <ScrollView style={{ flex: 1, height: Dimensions.get('window').height - 20 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}>
      <View style={[homeStyles.cardEmpty, { flexShrink: 0, width: Dimensions.get('window').width, height: Dimensions.get('window').height + 200, marginLeft: 0, paddingBottom: 30 }]}>
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
                  <TouchableOpacity style={[homeStyles.workCmd, { backgroundColor: COLORS.success, paddingVertical: 5 }]} onPress={() => { userInfo.id ? redirectToSubscribe(navigation, item.id, userInfo.id, userInfo.api_token) : navigation.navigate('Login', { message: t('error_message.login_before_operation') }) }}>
                    <Text style={{ color: COLORS.white }}>{t('subscription.link')}</Text>
                  </TouchableOpacity>
                </DataTable.Cell>
              </DataTable.Row>
            )}
          </DataTable>
          :
          <Text style={[homeStyles.cardEmptyTitle, { marginTop: 20, textAlign: 'center' }]}>{t('empty_list.title')}</Text>
        }

        {/* Terms accept */}
        <Divider style={[homeStyles.authDivider, { marginHorizontal: PADDING.horizontal }]} />
        <Text style={[homeStyles.authTermsText, { marginBottom: 40 }]}>
          {t('terms_accept1_')} <Text style={homeStyles.link} onPress={() => navigation.navigate('About', { screen: 'Terms' })}>{t('navigation.terms')}</Text>
          {t('terms_accept2')} <Text style={homeStyles.link} onPress={() => navigation.navigate('About', { screen: 'Privacy' })}>{t('navigation.privacy')}</Text>
        </Text>

        <View style={{ backgroundColor: '#fea', marginVertical: 30, padding: PADDING.vertical }}>
          <FontAwesome6 style={[homeStyles.workCmdIcon, { fontSize: 20, alignSelf: 'center' }]} name='circle-info' />
          <Text style={[homeStyles.authTermsText, { fontWeight: '600' }]}>{message}</Text>
        </View>

        {/* Submit */}
        <Button style={[homeStyles.authButton, { marginHorizontal: PADDING.horizontal }]} onPress={() => navigation.goBack()}>
          <Text style={homeStyles.authButtonText}>{t('cancel')}</Text>
        </Button>
      </View>
    </ScrollView>
  );
};

export default SubscriptionScreen;