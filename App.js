/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useEffect } from 'react'
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { forbid } from 'react-native-secure-screen';
import Orientation from 'react-native-orientation-locker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PADDING } from './tools/constants';
import DrawerContent from './DrawerContent';
import Logo from './assets/img/logo.svg';
import useColors from './hooks/useColors';
import SplashScreen from './screens/splash_screen';
import OnboardScreen from './screens/Auth';
import RegisterScreen from './screens/Auth/register';
import CheckEmailOTPScreen from './screens/Auth/check-email-otp';
import CheckPhoneOTPScreen from './screens/Auth/check-phone-otp';
import ContinueRegisterScreen from './screens/Auth/continue-register';
import LoginScreen from './screens/Auth/login';
import PasswordResetScreen from './screens/Auth/password-reset';
import AboutScreen from './screens/About';
import TermsScreen from './screens/About/terms';
import PrivacyScreen from './screens/About/privacy';
import ContactScreen from './screens/About/contact';
import HomeScreen from './screens/Home';
import LanguageScreen from './screens/language';

// =============== Bottom tab ===============
const BottomTab = createBottomTabNavigator();
// =============== Stack nav ===============
const Stack = createNativeStackNavigator();
// =============== Drawer ===============
const Drawer = createDrawerNavigator();

const AboutBottomTab = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();

  return (
    <BottomTab.Navigator
      initialRouteName='AboutTab'
      screenOptions={{
        tabBarActiveTintColor: COLORS.black,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          paddingTop: PADDING.p00,
        },
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTitleStyle: {
          color: COLORS.black,
        },
        headerLeft: () => {
          return (
            <>
              <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'HomeStack' })}>
                <Icon name='arrow-left' color={COLORS.black} style={{ fontSize: 24, marginLeft: PADDING.p01 }} />
              </TouchableOpacity>
              <Logo width={41} height={41} style={{ marginHorizontal: PADDING.p01 }} />
            </>
          );
        },
      }}>
      <BottomTab.Screen
        name='AboutTab' component={AboutScreen}
        options={{
          title: t('navigation.about'),
          tabBarLabel: t('navigation.about'),
          tabBarIcon: ({ color, size, focused }) => (
            focused ?
              <Icon name='help-circle' color={COLORS.black} size={size} />
              :
              <Icon name='help-circle-outline' color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen
        name='Terms' component={TermsScreen}
        options={{
          title: t('navigation.terms'),
          tabBarLabel: t('navigation.terms'),
          tabBarIcon: ({ color, size, focused }) => (
            focused ?
              <Icon name='file-check' color={COLORS.black} size={size} />
              :
              <Icon name='file-check-outline' color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen
        name='Privacy' component={PrivacyScreen}
        options={{
          title: t('navigation.privacy'),
          tabBarLabel: t('navigation.privacy'),
          tabBarIcon: ({ color, size, focused }) => (
            focused ?
              <Icon name='shield-star' color={COLORS.black} size={size} />
              :
              <Icon name='shield-star-outline' color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen
        name='Contact' component={ContactScreen}
        options={{
          title: t('navigation.contact'),
          tabBarLabel: t('navigation.contact'),
          tabBarIcon: ({ color, size, focused }) => (
            focused ?
              <Icon name='phone' color={COLORS.black} size={size} />
              :
              <Icon name='phone-outline' color={color} size={size} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

const LoginStackNav = () => {
  // =============== Colors ===============
  const COLORS = useColors();

  return (
    <Stack.Navigator
      initialRouteName='Onboard'
      screenOptions={{
        headerShown: false,
        statusBarColor: COLORS.white,
        headerTintColor: COLORS.dark_secondary
      }}>
      <Stack.Screen name='Onboard' component={OnboardScreen} />
      <Stack.Screen name='Login' component={LoginScreen} />
      <Stack.Screen name='Register' component={RegisterScreen} />
      <Stack.Screen name='ContinueRegister' component={ContinueRegisterScreen} />
      <Stack.Screen name='PasswordReset' component={PasswordResetScreen} />
      <Stack.Screen name='CheckEmailOTP' component={CheckEmailOTPScreen} />
      <Stack.Screen name='CheckPhoneOTP' component={CheckPhoneOTPScreen} />
      <Stack.Screen name='About' component={AboutBottomTab} />
    </Stack.Navigator>
  );
};

const HomeStackNav = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName='HomeStack'
      screenOptions={{
        headerShown: false,
        statusBarColor: COLORS.white,
        headerTintColor: COLORS.dark_secondary
      }}>
      <Stack.Screen name='HomeStack' component={HomeScreen} />
      <Stack.Screen name='Language' component={LanguageScreen}
        options={{
          headerShown: true,
          title: t('change_lang'),
          headerLeft: () => {
            return (
              <>
                <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'HomeStack' })}>
                  <Icon name='arrow-left' color={COLORS.black} style={{ fontSize: 24 }} />
                </TouchableOpacity>
                <Logo width={41} height={41} style={{ marginHorizontal: PADDING.p01 }} />
                <Icon name='translate' color={COLORS.black} style={{ fontSize: 28, marginRight: PADDING.p01 }} />
              </>
            );
          }
        }} />
      <Stack.Screen name='About' component={AboutBottomTab} />
    </Stack.Navigator>
  );
};

const DrawerNav = () => {
  return (
    <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />} screenOptions={{ headerShown: false }}>
      <Drawer.Screen name='Home' component={HomeStackNav} />
    </Drawer.Navigator>
  );
};

const App = () => {
  // =============== Get data ===============
  const { userInfo, splashLoading } = useContext(AuthContext);

  // =============== Lock screen orientation ===============
  useEffect(() => {
    Orientation.lockToPortrait();

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  // =============== Lock screen captures ===============
  useEffect(() => {
    const applySecurity = async () => {
      await forbid();
    };

    applySecurity();
  }, []);

  if (splashLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {userInfo.id ? (
        <DrawerNav />
      ) : (
        <LoginStackNav />
      )}
    </NavigationContainer>
  );
}

export default () => (
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);