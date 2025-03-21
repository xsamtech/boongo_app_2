/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, Divider } from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import { PADDING } from '../../tools/constants';
import { AuthContext } from '../../contexts/AuthContext';
import ThemeContext from '../../contexts/ThemeContext';
import FooterComponent from '../footer';
import TextBrand from '../../assets/img/text.svg';
import useColors from '../../hooks/useColors';
import homeStyles from '../style';
import axios from 'axios';

const RegisterScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Authentication context ===============
  const { isLoading, register } = useContext(AuthContext);
  // =============== Handle theme ===============
  const { theme } = useContext(ThemeContext);
  // =============== Get data ===============
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [email, setEmail] = useState(null);
  const [phone, setPhone] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirm_password, setConfirmPassword] = useState(null);
  // COUNTRY dropdown
  const [isFocus, setIsFocus] = useState(false);
  const [country, setCountry] = useState('');
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    axios({ method: 'GET', url: 'https://restcountries.com/v3.1/all' })
      .then(function (response) {
        const count = Object.keys(response.data).length;
        let countryArray = [];

        for (let i = 0; i < count; i++) {
          const countryData = response.data[i];

          countryArray.push({
            value: countryData.name.common,
            label: countryData.name.common,
            phoneCode: countryData.idd.root ? `${countryData.idd.root}${(countryData.idd.suffixes[0] ? `${countryData.idd.suffixes[0]}` : '')}` : ''
          });
        }

        setCountries(countryArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  const handleCountryChange = (item) => {
    setCountry(item.value);
    setIsFocus(false);
    setPhone(item.phoneCode); // Updates the phone field with the phone code
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Spinner visible={isLoading} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: PADDING.p16, paddingHorizontal: PADDING.p10 }}>
        {/* Brand / Title */}
        <View style={homeStyles.authlogo}>
          <TextBrand width={190} height={46} />
        </View>
        <Text style={[homeStyles.authTitle, { color: COLORS.black }]}>{t('i_register')}</Text>

        {/* First name */}
        <TextInput
          style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
          value={firstname}
          placeholder={t('auth.firstname')}
          placeholderTextColor={COLORS.dark_secondary}
          onChangeText={text => setFirstname(text)} />

        {/* Last name */}
        <TextInput
          style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
          value={lastname}
          placeholder={t('auth.lastname')}
          placeholderTextColor={COLORS.dark_secondary}
          onChangeText={text => setLastname(text)} />

        {/* E-mail */}
        <TextInput
          style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
          value={email}
          placeholder={t('auth.email')}
          placeholderTextColor={COLORS.dark_secondary}
          onChangeText={text => setEmail(text)} />

        {/* Country  */}
        <Text style={{ color: COLORS.dark_secondary, paddingVertical: PADDING.p00, paddingHorizontal: PADDING.p01 }}>{t('auth.country.label')}</Text>
        <Dropdown
          style={[homeStyles.authInput, { color: COLORS.black, height: 50, borderColor: COLORS.light_secondary }]}
          data={countries}
          search
          labelField='label'
          valueField='value'
          placeholder={!isFocus ? t('auth.country.title') : '...'}
          placeholderStyle={{ color: (theme === 'light' ? COLORS.dark_secondary : COLORS.secondary) }}
          selectedTextStyle={{ color: (theme === 'light' ? COLORS.dark_secondary : COLORS.secondary) }}
          searchPlaceholder={t('search')}
          maxHeight={300}
          value={country}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={handleCountryChange} />

        {/* Phone number */}
        <TextInput
          style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
          keyboardType='phone-pad'
          value={phone}
          placeholder={t('auth.phone')}
          placeholderTextColor={COLORS.dark_secondary}
          onChangeText={text => setPhone(text)} />

        {/* Username */}
        <TextInput
          style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
          value={username}
          placeholder={t('auth.username')}
          placeholderTextColor={COLORS.dark_secondary}
          onChangeText={text => setUsername(text)} />

        {/* Password */}
        <TextInput
          style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
          value={password}
          placeholder={t('auth.password.label')}
          placeholderTextColor={COLORS.dark_secondary}
          onChangeText={text => setPassword(text)} secureTextEntry />

        {/* Confirm password */}
        <TextInput
          style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
          value={confirm_password}
          placeholder={t('auth.confirm_password.label')}
          placeholderTextColor={COLORS.dark_secondary}
          onChangeText={text => setConfirmPassword(text)} secureTextEntry />

        {/* Submit / Cancel */}
        {/* <Button style={[homeStyles.authButton, { backgroundColor: COLORS.success }]} onPress={() => {
          register(firstname, lastname, null, null, null, null, null, null, null, null, email, phone, username, password, confirm_password, 4);
          navigation.navigate('Login'); */}
        <Button style={[homeStyles.authButton, { backgroundColor: COLORS.success }]} onPress={() => { navigation.navigate('Login') }}>
          <Text style={[homeStyles.authButtonText, { color: 'white' }]}>{t('register')}</Text>
        </Button>
        <TouchableOpacity style={[homeStyles.authCancel, { borderColor: COLORS.black }]} onPress={() => navigation.navigate('Login')}>
          <Text style={[homeStyles.authButtonText, { color: COLORS.black }]}>{t('cancel')}</Text>
        </TouchableOpacity>

        {/* Terms accept */}
        <Text style={[homeStyles.authTermsText, { color: COLORS.dark_secondary }]}>
          {t('terms_accept1')} <Text style={{ color: COLORS.link_color }} onPress={() => navigation.navigate('About', { screen: 'Terms' })}>{t('navigation.terms')}</Text>
          {t('terms_accept2')} <Text style={{ color: COLORS.link_color }} onPress={() => navigation.navigate('About', { screen: 'Privacy' })}>{t('navigation.privacy')}</Text>
        </Text>

        {/* Copyright */}
        <Divider style={[homeStyles.authDivider, { backgroundColor: COLORS.light_secondary }]} />
        <FooterComponent color={COLORS.dark_secondary} />
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;