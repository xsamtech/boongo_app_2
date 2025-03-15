/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useEffect, useState } from 'react';
import { DrawerActions, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Image, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { API, IMAGE_SIZE, PADDING } from './tools/constants';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HouseIcon from "react-native-bootstrap-icons/icons/house";
import HouseFillIcon from "react-native-bootstrap-icons/icons/house-fill";
import CompassIcon from "react-native-bootstrap-icons/icons/compass";
import CompassFillIcon from "react-native-bootstrap-icons/icons/compass-fill";
import BasketIcon from "react-native-bootstrap-icons/icons/basket3";
import BasketFillIcon from "react-native-bootstrap-icons/icons/basket3-fill";
import BellIcon from "react-native-bootstrap-icons/icons/bell";
import BellFillIcon from "react-native-bootstrap-icons/icons/bell-fill";
import PeopleIcon from "react-native-bootstrap-icons/icons/people";
import PeopleFillIcon from "react-native-bootstrap-icons/icons/people-fill";
import CalendarEventIcon from "react-native-bootstrap-icons/icons/calendar-event";
import CalendarEventFillIcon from "react-native-bootstrap-icons/icons/calendar-event-fill";
import ChatQuoteIcon from "react-native-bootstrap-icons/icons/chat-quote";
import ChatQuoteFillIcon from "react-native-bootstrap-icons/icons/chat-quote-fill";
import HomeScreen from './screens/Home';
import DiscoverScreen from './screens/Home/discover';
import OrderScreen from './screens/Home/orders';
import CommunityScreen from './screens/Home/communities';
import EventScreen from './screens/Home/events';
import MessageScreen from './screens/Home/messages';
import Logo from './assets/img/logo.svg';
import AvatarM from './assets/img/avatar-M.svg';
import DrawerContent from './DrawerContent';
import AboutScreen from './screens/About';
import LanguageScreen from './screens/Language';
import SettingsScreen from './screens/Settings';
import CreateAdScreen from './screens/Ad';
import TermsScreen from './screens/About/terms';
import PrivacyScreen from './screens/About/privacy';
import NotificationScreen from './screens/Account/notification';
import useColors from './hooks/useColors';
import LoginScreen from './screens/Auth';
import RegisterScreen from './screens/Auth/register';
import PasswordResetScreen from './screens/Auth/password-reset';
import ContactScreen from './screens/About/contact';
import AccountScreen from './screens/Account';
import homeStyles from './screens/style';

// =============== Bottom tab ===============
const BottomTab = createBottomTabNavigator();
// =============== Stack nav ===============
const Stack = createNativeStackNavigator();
// =============== Drawer ===============
const Drawer = createDrawerNavigator();

const HomeBottomTab = () => {
    // =============== Colors ===============
    const COLORS = useColors();
    // =============== Navigation ===============
    const navigation = useNavigation();
    // =============== Language ===============
    const { t } = useTranslation();
    // =============== Get data ===============
    const { userInfo } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);

    // =============== Using the Effect Hook ===============
    useEffect(() => {
        getNotifications();
    }, []);

    // =============== Some functions ===============
    const getNotifications = () => {
        const config = { method: 'GET', url: `${API.url}/notification/select_by_user/${userInfo.id}/notification_unread`, headers: { 'X-localization': 'fr', 'Authorization': `Bearer ${userInfo.api_token}` } };

        axios(config)
            .then(res => {
                const notificationsData = res.data.data;

                setNotifications(notificationsData);
            })
            .catch(error => {
                console.log(error);
            });
    };

    return (
        <BottomTab.Navigator
            initialRouteName='NewsFeed'
            screenOptions={{
                tabBarActiveTintColor: COLORS.black,
                tabBarStyle: {
                    backgroundColor: COLORS.white,
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
                            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                                <Icon name='menu' style={{ fontSize: 28, marginLeft: 7, color: COLORS.black }} />
                            </TouchableOpacity>
                            <Logo width={41} height={41} style={{ marginHorizontal: 7 }} />
                        </>
                    );
                },
                headerRight: () => {
                    return (
                        <>
                            <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => navigation.navigate('Notification')}>
                                {
                                    notifications.length > 0
                                        ?
                                        <View style={{ position: 'relative' }}>
                                            <View style={{ position: 'absolute', top: 0, left: -5, zIndex: 100, backgroundColor: COLORS.danger, padding: 5, borderRadius: 10 }}></View>
                                            <BellFillIcon fill={COLORS.black} width={25} height={28} viewBox='0 0 16 16' />
                                        </View>
                                        :
                                        <BellIcon fill={COLORS.black} width={25} height={28} viewBox='0 0 16 16' />
                                }
                            </TouchableOpacity>
                            <TouchableOpacity style={homeStyles.headingImageWrapper} onPress={() => navigation.navigate('Account')}>
                                <Image style={homeStyles.headingImage} source={{ uri: userInfo.profile_photo_path }} />
                            </TouchableOpacity>
                        </>
                    );
                }
            }}>
            <BottomTab.Screen
                name='NewsFeed' component={HomeScreen}
                options={{
                    title: t('navigation.home'),
                    tabBarLabel: t('navigation.home'),
                    tabBarIcon: ({ color, size, focused }) => (
                        focused ?
                            <HouseFillIcon width={21} height={28} viewBox='0 0 15 10' fill={color} />
                            :
                            <HouseIcon width={21} height={28} viewBox='0 0 15 10' fill={color} />
                    ),
                }}
            />
            <BottomTab.Screen
                name='Discover' component={DiscoverScreen}
                options={{
                    title: t('navigation.discover'),
                    tabBarLabel: t('navigation.discover'),
                    tabBarIcon: ({ color, size, focused }) => (
                        focused ?
                            <CompassFillIcon width={22} height={31} viewBox='0 0 15.5 10' fill={color} />
                            :
                            <CompassIcon width={22} height={31} viewBox='0 0 15.5 10' fill={color} />
                    )
                }}
            />
            <BottomTab.Screen
                name='Order' component={OrderScreen}
                options={{
                    title: t('navigation.orders.title'),
                    tabBarLabel: t('navigation.orders.title'),
                    tabBarIcon: ({ color, size, focused }) => (
                        focused ?
                            <BasketFillIcon width={21} height={29} viewBox='0 0 16 10' fill={color} />
                            :
                            <BasketIcon width={21} height={29} viewBox='0 0 16 10' fill={color} />
                    )
                }}
            />
            <BottomTab.Screen
                name='Community' component={CommunityScreen}
                options={{
                    title: t('navigation.communities.title'),
                    tabBarLabel: t('navigation.communities.title'),
                    tabBarIcon: ({ color, size, focused }) => (
                        focused ?
                            <PeopleFillIcon width={25} height={29} viewBox='0 0 16 10' fill={color} />
                            :
                            <PeopleIcon width={25} height={29} viewBox='0 0 16 10' fill={color} />
                    )
                }}
            />
            <BottomTab.Screen
                name='Event' component={EventScreen}
                options={{
                    title: t('navigation.events.title'),
                    tabBarLabel: t('navigation.events.title'),
                    tabBarIcon: ({ color, size, focused }) => (
                        focused ?
                            <CalendarEventFillIcon width={23} height={28} viewBox='0 0 18 10' fill={color} />
                            :
                            <CalendarEventIcon width={23} height={28} viewBox='0 0 18 10' fill={color} />
                    )
                }}
            />
            <BottomTab.Screen
                name='Message' component={MessageScreen}
                options={{
                    title: t('navigation.messages'),
                    tabBarLabel: t('navigation.messages'),
                    tabBarIcon: ({ color, size, focused }) => (
                        focused ?
                            <ChatQuoteFillIcon width={23} height={31} viewBox='0 0 16 10' fill={color} />
                            :
                            <ChatQuoteIcon width={23} height={31} viewBox='0 0 16 10' fill={color} />
                    )
                }}
            />
        </BottomTab.Navigator>
    );
}

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
                            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                                <Icon name='menu' color={COLORS.black} style={{ fontSize: 28, marginLeft: 7 }} />
                            </TouchableOpacity>
                            <Logo width={41} height={41} style={{ marginHorizontal: 7 }} />
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
                    title: t('help'),
                    tabBarLabel: t('help'),
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

const StackNav = () => {
    // =============== Colors ===============
    const COLORS = useColors();
    // =============== Get data ===============
    const { userInfo } = useContext(AuthContext);

    return (
        <Stack.Navigator
            initialRouteName={userInfo.id ? 'HomeStack' : 'Login'}
            screenOptions={{
                headerShown: false,
                statusBarColor: COLORS.white,
                headerTintColor: COLORS.dark_secondary
            }}>
            {userInfo.id ? (
                <>
                    <Stack.Screen name='HomeStack' component={HomeBottomTab} />
                    <Stack.Screen name='CreateAd' component={CreateAdScreen} />
                    <Stack.Screen name='Account' component={AccountScreen} />
                    <Stack.Screen name='Notification' component={NotificationScreen} />
                    <Stack.Screen name='Settings' component={SettingsScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name='Login' component={LoginScreen} />
                    <Stack.Screen name='Register' component={RegisterScreen} />
                    <Stack.Screen name='PasswordReset' component={PasswordResetScreen} />
                </>
            )}
            <Stack.Screen name='Language' component={LanguageScreen} />
            <Stack.Screen name='About' component={AboutBottomTab} />
        </Stack.Navigator>
    );
};

const DrawerNav = () => {
    return (
        <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />} screenOptions={{ headerShown: false }}>
            <Drawer.Screen name='Home' component={StackNav} />
        </Drawer.Navigator>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <NavigationContainer>
                    <DrawerNav />
                </NavigationContainer>
            </ThemeProvider>
        </AuthProvider>
    );
}
