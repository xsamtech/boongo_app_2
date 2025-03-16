/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, ScrollView, Linking, ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import homeStyles from '../Home/style';
import Spinner from 'react-native-loading-spinner-overlay';
import { AuthContext } from '../../contexts/AuthContext';
import TextBrand from '../../assets/img/text.svg';
import { COLORS, PHONE } from '../../tools/constants';

const sendWhatsAppMessage = async (message) => {
  const phoneNumber = PHONE.admin;
  const text = encodeURIComponent(message);
  const url = `whatsapp://send?phone=${phoneNumber}&text=${text}`;

  try {
    await Linking.openURL(url);

  } catch (error) {
      // An error occurred while configuring the query
      ToastAndroid.show(`${error.message}`, ToastAndroid.LONG);
  }
};

const PasswordResetScreen = () => {
  // =============== Language ===============
  const { t } = useTranslation();

  // =============== Authentication context ===============
  const { isLoading, login } = useContext(AuthContext);

  // =============== Navigation ===============
  const navigation = useNavigation();

  // =============== User data ===============
  const [phone, setPhone] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <Spinner visible={isLoading} />

      <ScrollView style={{ paddingVertical: 50, paddingHorizontal: 30 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>

        {/* Brand / Title */}
        <View style={homeStyles.authlogo}>
          <TextBrand width={154} height={50} />
        </View>

        {/* Phone */}
        <TextInput
          style={[homeStyles.authInput, { marginBottom: 20 }]}
          value={phone}
          placeholder={t('auth.phone')}
          onChangeText={text => setPhone(text)} />

        {/* Submit */}
        <Button style={[homeStyles.authButton, { backgroundColor: COLORS.danger }]} onPress={() => { sendWhatsAppMessage("Bonjour.\n\nJe voudrais modifier mon mot de passe.\n\nMon n° de téléphone : " + phone); }} disabled={phone.trim() === ''}>
          <Text style={homeStyles.authButtonText}>{t('send')}</Text>
        </Button>

        {/* Terms accept */}
        <View style={{ backgroundColor: '#fea', marginVertical: 30, padding: 20 }}>
          <Text style={[homeStyles.authTermsText, { fontSize: 14, fontWeight: '300', color: COLORS.black, marginBottom: 0 }]}>{t('auth.password.reset_message')}</Text>
        </View>

        {/* Submit */}
        <Button style={[homeStyles.authCancel, { paddingVertical: 0 }]} onPress={() => navigation.navigate('Login')}>
          <Text style={homeStyles.authCancelText}>{t('i_login')}</Text>
        </Button>

        {/* Copyright */}
        <Text style={homeStyles.authBottomText}>{t('copyright')} | {t('all_rights_reserved')}</Text>
        <Text style={homeStyles.authBottomText}>
          Designed by <Text style={homeStyles.authBottomLink} onPress={() => Linking.openURL('https://xsamtech.com')}> Xsam Technologies</Text>
        </Text>
      </ScrollView>
    </View>
  );
};

export default PasswordResetScreen;