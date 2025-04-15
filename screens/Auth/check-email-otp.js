/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button, Divider } from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { PADDING, TEXT_SIZE } from '../../tools/constants';
import { AuthContext } from '../../contexts/AuthContext';
import FooterComponent from '../footer';
import TextBrand from '../../assets/img/text.svg';
import useColors from '../../hooks/useColors';
import homeStyles from '../style';

const CheckEmailOTPScreen = ({ route }) => {
  // =============== Get parameters ===============
  const { emailAddress, phoneNumber } = route.params;
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { isLoading, checkOTP } = useContext(AuthContext);
  // =============== Get data ===============
  const [code, setCode] = useState('');

  const handleCheckEmailCode = async () => {
    const result = await checkOTP(emailAddress, phoneNumber, code);

    if (result === 'email_validated') {
      navigation.navigate('CheckPhoneOTP', { emailAddress: emailAddress, phoneNumber: phoneNumber });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Spinner visible={isLoading} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: PADDING.p16, paddingHorizontal: PADDING.p10 }}>
        {/* Brand / Title */}
        <View style={homeStyles.authlogo}>
          <TextBrand width={190} height={46} />
        </View>
        <Text style={[homeStyles.authTitle, { color: COLORS.black }]}>{t('auth.otp_code.title', { reference: t('auth.email') })}</Text>

        <Icon name='envelope' color={COLORS.black} size={50} style={{ alignSelf: 'center' }} />
        <Text style={{ color: COLORS.black, textAlign: 'center', marginBottom: PADDING.p05 }}>{t('auth.otp_code.message_email')}</Text>

        {/* Code to check */}
        <TextInput
          style={[homeStyles.authInput, { fontSize: TEXT_SIZE.title, color: COLORS.black, textAlign: 'center', borderColor: COLORS.light_secondary }]}
          keyboardType='numeric'
          value={code}
          placeholder={t('auth.otp_code.placeholder')}
          placeholderTextColor={COLORS.dark_secondary}
          onChangeText={text => setCode(text)} />

        <Button style={[homeStyles.authButton, { backgroundColor: COLORS.danger }]} onPress={handleCheckEmailCode}>
          <Text style={[homeStyles.authButtonText, { color: 'white' }]}>{t('auth.otp_code.send')}</Text>
        </Button>

        {/* Message */}
        <View style={homeStyles.messageContainer}>
          <Text style={[homeStyles.messageText, { fontSize: TEXT_SIZE.paragraph, textAlign: 'center', paddingHorizontal: PADDING.p12 }]}>{t('auth.otp_code.warning')}</Text>
        </View>

        {/* Copyright */}
        <Divider style={[homeStyles.authDivider, { backgroundColor: COLORS.light_secondary }]} />
        <FooterComponent color={COLORS.dark_secondary} />
      </ScrollView>
    </View>
  );
};

export default CheckEmailOTPScreen;