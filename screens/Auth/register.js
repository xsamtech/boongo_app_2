/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Linking } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import homeStyles from '../Home/style';
import { AuthContext } from '../../contexts/AuthContext';
import Spinner from 'react-native-loading-spinner-overlay';
import { COLORS } from '../../tools/constants';
import TextBrand from '../../assets/img/text.svg';

const RegisterScreen = () => {
  // =============== Language ===============
  const { t } = useTranslation();

  // =============== Navigation ===============
  const navigation = useNavigation();

  // =============== Authentication context ===============
  const { isLoading, register } = useContext(AuthContext);

  // =============== User data ===============
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [email, setEmail] = useState(null);
  const [phone, setPhone] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirm_password, setConfirmPassword] = useState(null);

  return (
    <View style={{ flex: 1 }}>
      <Spinner visible={isLoading} />

      <ScrollView nestedScrollEnabled={true}
        style={{ paddingVertical: 50, paddingHorizontal: 30 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        {/* Brand / Title */}
        <View style={homeStyles.authlogo}>
          <TextBrand width={154} height={50} />
        </View>

        {/* First name */}
        <TextInput
          style={homeStyles.authInput}
          value={firstname}
          placeholder={t('auth.firstname')}
          onChangeText={text => setFirstname(text)} />

        {/* Last name */}
        <TextInput
          style={homeStyles.authInput}
          value={lastname}
          placeholder={t('auth.lastname')}
          onChangeText={text => setLastname(text)} />

        {/* E-mail */}
        <TextInput
          style={homeStyles.authInput}
          value={email}
          placeholder={t('auth.email')}
          onChangeText={text => setEmail(text)} />

        {/* Phone number */}
        <TextInput
          style={homeStyles.authInput}
          value={phone}
          placeholder={t('auth.phone')}
          onChangeText={text => setPhone(text)} />

        {/* Username */}
        <TextInput
          style={homeStyles.authInput}
          value={username}
          placeholder={t('auth.username')}
          onChangeText={text => setUsername(text)} />

        {/* Password */}
        <TextInput
          style={homeStyles.authInput}
          value={password}
          placeholder={t('auth.password.label')}
          onChangeText={text => setPassword(text)} secureTextEntry />

        {/* Confirm password */}
        <TextInput
          style={homeStyles.authInput}
          value={confirm_password}
          placeholder={t('auth.confirm_password.label')}
          onChangeText={text => setConfirmPassword(text)} secureTextEntry />

        {/* Submit */}
        <Button style={[homeStyles.authButton, { backgroundColor: COLORS.success }]} onPress={() => {
          register(firstname, lastname, null, null, null, null, null, null, null, null, email, phone, username, password, confirm_password, 4);
          navigation.navigate('Login');
        }}>
          <Text style={homeStyles.authButtonText}>{t('register')}</Text>
        </Button>

        {/* Terms accept */}
        <Divider style={homeStyles.authDivider} />
        <Text style={homeStyles.authTermsText}>
          {t('terms_accept1')} <Text style={homeStyles.link} onPress={() => navigation.navigate('About', { screen: 'Terms' })}>{t('navigation.terms')}</Text>
          {t('terms_accept2')} <Text style={homeStyles.link} onPress={() => navigation.navigate('About', { screen: 'Privacy' })}>{t('navigation.privacy')}</Text>
        </Text>

        {/* Login link */}
        <View>
          <Text style={homeStyles.authText}>{t('have_account')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={homeStyles.authLink}>{t('login')}</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text style={homeStyles.authBottomText}>{t('copyright')} | {t('all_rights_reserved')}</Text>
        <Text style={homeStyles.authBottomText}>
          Designed by <Text style={homeStyles.authBottomLink} onPress={() => Linking.openURL('https://xsamtech.com')}> Xsam Technologies</Text>
        </Text>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;