/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { DrawerActions, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PADDING, TEXT_SIZE } from '../tools/constants';
// import Logo from '../assets/img/logo.svg';
import LogoText from '../assets/img/text.svg';
import homeStyles from './style';
import useColors from '../hooks/useColors';

const HeaderComponent = ({ title }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  const route = useRoute();

  if (route.name === 'HomeStack') {
    return (
      <>
        {/* Status bar */}
        <StatusBar barStyle='light-content' backgroundColor={COLORS.danger} />

        {/* Content */}
        <View style={[homeStyles.headerBanner, { backgroundColor: COLORS.white }]}>
          {/* Brand */}
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <Icon name='menu' size={28} color={COLORS.black} />
            </TouchableOpacity>
            <LogoText width={120} height={32} style={{ marginLeft: PADDING.p00 }} />
            {title ?
              <Text style={{ fontSize: 20, fontWeight: '500', color: COLORS.black }}>{title}</Text>
              : ''}
          </View>

          {/* Right links */}
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Icon name='magnify' size={28} color={COLORS.black} />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: PADDING.p03 }} onPress={() => navigation.navigate('Dictionary')}>
              <Icon name='book-open-blank-variant' size={28} color={COLORS.black} />
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  if (route.name === 'Account') {
    const { userInfo } = useContext(AuthContext);

    return (
      <>
        {/* Status bar */}
        <StatusBar barStyle={COLORS.bar_style} backgroundColor={COLORS.white} />

        {/* Content */}
        <View style={[homeStyles.headerBanner, { backgroundColor: COLORS.white }]}>
          {/* Username */}
          <View style={{ paddingVertical: PADDING.p00 }}>
            <Text style={{ fontSize: TEXT_SIZE.normal, fontWeight: '500', color: COLORS.black }}>{userInfo.username}</Text>
          </View>
          {/* Profile */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <Image style={{ width: 100, height: 100, borderRadius: 50 }} source={{ uri: userInfo.avatar_url }} />
            <View style={{ flexDirection: 'column' }}>
              <View style={{ width: 'column' }}>
              </View>
            </View>
          </View>

          {/* Right links */}
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Icon name='magnify' size={28} color={COLORS.black} />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: PADDING.p03 }} onPress={() => navigation.navigate('Dictionary')}>
              <Icon name='book-open-blank-variant' size={28} color={COLORS.black} />
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }
};

export default HeaderComponent;