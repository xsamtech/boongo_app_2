/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Linking } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import homeStyles from '../Home/style';
import Spinner from 'react-native-loading-spinner-overlay';
import { AuthContext } from '../../contexts/AuthContext';
import TextBrand from '../../assets/img/text.svg';
import { PADDING } from '../../tools/constants';

const LoginScreen = ({ route }) => {
  // =============== Language ===============
  const { t } = useTranslation();

  // =============== Authentication context ===============
  const { isLoading, login } = useContext(AuthContext);

  // =============== Navigation ===============
  const navigation = useNavigation();

  // =============== User data ===============
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);

  if (route.params) {
    // =============== Get parameters ===============
    const { message } = route.params;

    return (
      <View style={{ flex: 1 }}>
        <Spinner visible={isLoading} />

        <ScrollView style={{ paddingVertical: 50, paddingHorizontal: 30 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>

          {/* Brand / Title */}
          <View style={homeStyles.authlogo}>
            <TextBrand width={154} height={50} />
            {/* <Image source={require('../../assets/img/brand.png')} /> */}
          </View>
          {/* <Text style={homeStyles.authTitle}>{t('login')}</Text> */}

          {/* Username */}
          <TextInput
            style={homeStyles.authInput}
            value={username}
            placeholder={t('auth.login_username')}
            onChangeText={text => setUsername(text)} />

          {/* Password */}
          <TextInput
            style={homeStyles.authInput}
            value={password}
            placeholder={t('auth.password.label')}
            onChangeText={text => setPassword(text)} secureTextEntry />

          {/* Submit */}
          <Button style={homeStyles.authButton} onPress={() => { login(username, password); }}>
            <Text style={homeStyles.authButtonText}>{t('login')}</Text>
          </Button>

          {/* Register link */}
          <View>
            <Text style={homeStyles.authText}>{t('no_account')} <Text style={homeStyles.authLink} onPress={() => navigation.navigate('Register')}>{t('register')}</Text></Text>
            <TouchableOpacity onPress={() => navigation.navigate('PasswordReset')}>
              <Text style={homeStyles.authLink}>{t('auth.password.forgotten')}</Text>
            </TouchableOpacity>
          </View>
          {message ?
            <View style={{ backgroundColor: '#fea', marginVertical: 0, paddingVertical: PADDING.vertical }}>
              <Text style={[homeStyles.authTermsText, { fontWeight: '600' }]}>{message}</Text>
            </View>
            :
            ''}

          {/* Terms accept */}
          <Divider style={homeStyles.authDivider} />
          <Text style={homeStyles.authTermsText}>
            {t('terms_accept1')} <Text style={homeStyles.link} onPress={() => navigation.navigate('About', { screen: 'Terms' })}>{t('navigation.terms')}</Text>
            {t('terms_accept2')} <Text style={homeStyles.link} onPress={() => navigation.navigate('About', { screen: 'Privacy' })}>{t('navigation.privacy')}</Text>
          </Text>

          {/* Submit */}
          <Button style={homeStyles.authCancel} onPress={() => navigation.navigate('Home_')}>
            <Text style={homeStyles.authCancelText}>{t('back_home')}</Text>
          </Button>

          {/* Copyright */}
          <Text style={homeStyles.authBottomText}>{t('copyright')} | {t('all_rights_reserved')}</Text>
          <Text style={homeStyles.authBottomText}>
            Designed by <Text style={homeStyles.authBottomLink} onPress={() => Linking.openURL('https://xsamtech.com')}> Xsam Technologies</Text>
          </Text>
        </ScrollView>
      </View>
    );

  } else {
    return (
      <View style={{ flex: 1 }}>
        <Spinner visible={isLoading} />

        <ScrollView style={{ paddingVertical: 50, paddingHorizontal: 30 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>

          {/* Brand / Title */}
          <View style={homeStyles.authlogo}>
            <TextBrand width={154} height={50} />
            {/* <Image source={require('../../assets/img/brand.png')} /> */}
          </View>
          {/* <Text style={homeStyles.authTitle}>{t('login')}</Text> */}

          {/* Username */}
          <TextInput
            style={homeStyles.authInput}
            value={username}
            placeholder={t('auth.login_username')}
            onChangeText={text => setUsername(text)} />

          {/* Password */}
          <TextInput
            style={homeStyles.authInput}
            value={password}
            placeholder={t('auth.password.label')}
            onChangeText={text => setPassword(text)} secureTextEntry />

          {/* Submit */}
          <Button style={homeStyles.authButton} onPress={() => { login(username, password); }}>
            <Text style={homeStyles.authButtonText}>{t('login')}</Text>
          </Button>

          {/* Register link */}
          <View>
            <Text style={homeStyles.authText}>{t('no_account')} <Text style={homeStyles.authLink} onPress={() => navigation.navigate('Register')}>{t('register')}</Text></Text>
            <TouchableOpacity onPress={() => navigation.navigate('PasswordReset')}>
              <Text style={homeStyles.authLink}>{t('auth.password.forgotten')}</Text>
            </TouchableOpacity>
          </View>

          {/* Terms accept */}
          <Divider style={homeStyles.authDivider} />
          <Text style={homeStyles.authTermsText}>
            {t('terms_accept1')} <Text style={homeStyles.link} onPress={() => navigation.navigate('About', { screen: 'Terms' })}>{t('navigation.terms')}</Text>
            {t('terms_accept2')} <Text style={homeStyles.link} onPress={() => navigation.navigate('About', { screen: 'Privacy' })}>{t('navigation.privacy')}</Text>
          </Text>

          {/* Submit */}
          <Button style={[homeStyles.authCancel, { paddingVertical: 0 }]} onPress={() => navigation.navigate('Home_')}>
            <Text style={homeStyles.authCancelText}>{t('back_home')}</Text>
          </Button>

          {/* Copyright */}
          <Text style={homeStyles.authBottomText}>{t('copyright')} | {t('all_rights_reserved')}</Text>
          <Text style={homeStyles.authBottomText}>
            Designed by <Text style={homeStyles.authBottomLink} onPress={() => Linking.openURL('https://xsamtech.com')}> Xsam Technologies</Text>
          </Text>
        </ScrollView>
      </View>
    );
  }
};

export default LoginScreen;