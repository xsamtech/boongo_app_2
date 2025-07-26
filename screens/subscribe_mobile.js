/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ScrollView, SafeAreaView, Dimensions, TouchableOpacity, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button, Divider } from 'react-native-paper';
import * as RNLocalize from 'react-native-localize';
import DropDownPicker from 'react-native-dropdown-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { API, PADDING, TEXT_SIZE } from '../tools/constants';
import HeaderComponent from './header';
import useColors from '../hooks/useColors';
import homeStyles from './style';

const MobileSubscribeScreen = ({ route }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get context ===============
  const { userInfo, isLoading } = useContext(AuthContext);
  // =============== Get parameters ===============
  const { amount, currency, paid } = route.params;
  // =============== Get data ===============
  const [phone, setPhone] = useState('');
  // Get type "Mobile money"
  const [mobileMoneyType, setMobileMoneyType] = useState(null);
  const [bankCardType, setBankCardType] = useState(null);

  // OPERATOR dropdown
  const [channel, setChannel] = useState(null);
  const [channelOpen, setChannelOpen] = useState(false);
  const [channelItems, setChannelItems] = useState([
    { label: 'M-Pesa', value: 'M-Pesa' },
    { label: 'Orange money', value: 'Orange money' },
    { label: 'Airtel money', value: 'Airtel money' },
    { label: 'Afrimoney', value: 'Afrimoney' }
  ]);

  useEffect(() => {
    axios({ method: 'GET', url: `${API.boongo_url}/type/search/fr/Mobile%20money` })
      .then(function (res) {
        let typeData = res.data.data;

        setMobileMoneyType(typeData);
        console.log(`${JSON.stringify(typeData)}`);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    axios({ method: 'GET', url: `${API.boongo_url}/type/search/fr/Carte%20bancaire` })
      .then(function (res) {
        let typeData = res.data.data;

        setBankCardType(typeData);
        console.log(`${JSON.stringify(typeData)}`);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  // Get system language
  const getLanguage = () => {
    const locales = RNLocalize.getLocales();

    if (locales && locales.length > 0) {
      return locales[0].languageCode;
    }

    return 'fr';
  };

  return (
    <>
      {/* Header */}
      <View style={{ backgroundColor: COLORS.white, paddingVertical: PADDING.p01 }}>
        <HeaderComponent />
      </View>

      {/* Spinner (for AuthContext requests) */}
      <Spinner visible={isLoading} />

      {/* Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: COLORS.white, paddingHorizontal: PADDING.p01 }}>
        <SafeAreaView style={{ height: Dimensions.get('screen').height - 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: PADDING.p01 }}>
          {/* Image */}
          <Image style={{ width: 100, height: 100, borderRadius: 100 / 2, marginBottom: PADDING.p07 }} source={require('../assets/img/mobile_money_payment.png')} />

          {/* Title / Description */}
          <Text style={[homeStyles.cardEmptyTitle, { color: COLORS.black, textAlign: 'center', marginBottom: PADDING.p02, paddingHorizontal: PADDING.p02 }]}>{t('payment_method.mobile_money.title')}</Text>
          <Text style={{ color: COLORS.black, textAlign: 'center', paddingHorizontal: PADDING.p02 }}>{t('payment_method.mobile_money.descrciption')}</Text>

          {/* Amount */}
          <Divider style={[homeStyles.authDivider, { width: '100%', backgroundColor: COLORS.light_secondary }]} />
          <Text style={{ fontSize: TEXT_SIZE.normal, color: COLORS.dark_secondary, textAlign: 'center', marginBottom: PADDING.p00 }}>{t('amount_to_pay')}</Text>
          <Text style={{ fontSize: TEXT_SIZE.header, fontWeight: '700', color: COLORS.link_color, textAlign: 'center' }}>{`${amount} ${currency}`}</Text>
          <Divider style={[homeStyles.authDivider, { width: '100%', backgroundColor: COLORS.light_secondary }]} />

          {/* Operator */}
          <DropDownPicker
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            listItemContainerStyle={{ backgroundColor: COLORS.white }}
            containerStyle={{ backgroundColor: COLORS.white }}
            textStyle={{ fontSize: TEXT_SIZE.paragraph, color: COLORS.black }}
            placeholderStyle={{ fontSize: TEXT_SIZE.paragraph, color: COLORS.dark_secondary }}
            arrowIconStyle={{ tintColor: COLORS.dark_secondary }}
            tickIconStyle={{ tintColor: COLORS.black }}
            open={channelOpen}
            value={channel}
            placeholder={t('payment_method.mobile_money.operator')}
            placeholderTextColor={COLORS.dark_secondary}
            items={channelItems}
            setOpen={setChannelOpen}
            setValue={setChannel}
            setItems={setChannelItems}
            listMode="SCROLLVIEW" />

          {/* Submit / Cancel */}
          <Button style={[homeStyles.authButton, { backgroundColor: COLORS.success }]}>
            <Text style={[homeStyles.authButtonText, { color: 'white' }]}>{t('send')}</Text>
          </Button>
          <TouchableOpacity style={[homeStyles.authCancel, { borderColor: COLORS.black }]} onPress={() => navigation.navigate('BankCardSubscribe', { amount: amount, currency: currency })}>
            <Text style={[homeStyles.authButtonText, { color: COLORS.black }]}>{t('payment_method.mobile_money.go_bank_card')}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    </>
  );
};

export default MobileSubscribeScreen;