/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Linking } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { AuthContext } from '../../contexts/AuthContext';
import { PADDING } from '../../tools/constants';
import TextBrand from '../../assets/img/text.svg';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';
import FooterComponent from '../footer';

const LoginScreen = ({ route }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Authentication context ===============
  const { isLoading, login, loginTest } = useContext(AuthContext);
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== User data ===============
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);

  if (route.params) {
    // =============== Get parameters ===============
    const { message } = route.params;

    return (
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <Spinner visible={isLoading} />

        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: PADDING.p10, paddingHorizontal: PADDING.p10 }}>

          {/* Brand / Title */}
          <View style={homeStyles.authlogo}>
            <TextBrand width={154} height={50} />
          </View>
          <Text style={[homeStyles.authTitle, { color: COLORS.black }]}>{t('i_login')}</Text>

          {/* Username */}
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={username}
            placeholder={t('auth.login_username')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setUsername(text)} />

          {/* Password */}
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={password}
            placeholder={t('auth.password.label')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setPassword(text)} secureTextEntry />

          {/* Forgotten password */}
          <TouchableOpacity onPress={() => navigation.navigate('PasswordReset')}>
            <Text style={[homeStyles.authText, { textAlign: 'center', color: COLORS.link_color }]}>{t('auth.password.forgotten')}</Text>
          </TouchableOpacity>

          {/* Submit */}
          <Button style={[homeStyles.authButton, { backgroundColor: COLORS.primary }]} onPress={() => { loginTest }}>
            <Text style={[homeStyles.authButtonText, { color: 'white' }]}>{t('login')}</Text>
          </Button>

          {message ?
            <View style={{ backgroundColor: '#fea', marginVertical: 0, paddingVertical: PADDING.vertical }}>
              <Text style={[homeStyles.authTermsText, { fontWeight: '600' }]}>{message}</Text>
            </View>
            :
            ''}

          {/* Register link */}
          <View style={{ marginVertical: PADDING.p05 }}>
            <Text style={[homeStyles.authText, { textAlign: 'center', color: COLORS.black }]}>{t('no_account')}</Text>
            <Text style={[homeStyles.authText, { textAlign: 'center', color: COLORS.link_color }]} onPress={() => navigation.navigate('Register')}>{t('i_register')}</Text>
          </View>

          {/* Copyright */}
          <FooterComponent color={COLORS.dark_secondary} />
        </ScrollView>
      </View>
    );

  } else {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <Spinner visible={isLoading} />

        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: PADDING.p10, paddingHorizontal: PADDING.p10 }}>

          {/* Brand / Title */}
          <View style={homeStyles.authlogo}>
            <TextBrand width={154} height={50} />
          </View>
          <Text style={[homeStyles.authTitle, { color: COLORS.black }]}>{t('i_login')}</Text>

          {/* Username */}
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={username}
            placeholder={t('auth.login_username')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setUsername(text)} />

          {/* Password */}
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={password}
            placeholder={t('auth.password.label')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setPassword(text)} secureTextEntry />

          {/* Forgotten password */}
          <TouchableOpacity onPress={() => navigation.navigate('PasswordReset')}>
            <Text style={[homeStyles.authText, { textAlign: 'center', color: COLORS.link_color }]}>{t('auth.password.forgotten')}</Text>
          </TouchableOpacity>

          {/* Submit */}
          <Button style={[homeStyles.authButton, { backgroundColor: COLORS.primary }]} onPress={() => { loginTest }}>
            <Text style={[homeStyles.authButtonText, { color: 'white' }]}>{t('login')}</Text>
          </Button>

          {/* Register link */}
          <View style={{ marginVertical: PADDING.p05 }}>
            <Text style={[homeStyles.authText, { textAlign: 'center', color: COLORS.black }]}>{t('no_account')}</Text>
            <Text style={[homeStyles.authText, { textAlign: 'center', color: COLORS.link_color }]} onPress={() => navigation.navigate('Register')}>{t('i_register')}</Text>
          </View>

          {/* Copyright */}
          <FooterComponent color={COLORS.dark_secondary} />
        </ScrollView>
      </View>
    );
  }
};

export default LoginScreen;