/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useEffect } from 'react'
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import SecureScreen from 'react-native-secure-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, PADDING } from './tools/constants';
import { AuthContext } from './contexts/AuthContext';
import DrawerContent from './DrawerContent';
import Logo from './assets/img/logo.svg';
import AboutScreen from './screens/About';
import TermsScreen from './screens/About/terms';
import PrivacyScreen from './screens/About/privacy';
import ContactScreen from './screens/About/contact';
import OnboardScreen from './screens/Auth';
import LoginScreen from './screens/Auth/login';
import RegisterScreen from './screens/Auth/register';
import PasswordResetScreen from './screens/Auth/password-reset';
import HomeScreen from './screens/Home';
import LanguageScreen from './screens/language';

// =============== Bottom tab ===============
const BottomTab = createBottomTabNavigator();
// =============== Stack nav ===============
const Stack = createNativeStackNavigator();
// =============== Drawer ===============
const Drawer = createDrawerNavigator();

const AboutBottomTab = () => {
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
      <Stack.Screen name='PasswordReset' component={PasswordResetScreen} />
      <Stack.Screen name='About' component={AboutBottomTab} />
    </Stack.Navigator>
  );
};

const HomeStackNav = () => {
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
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    SecureScreen.set();
  }, []);

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

export default App