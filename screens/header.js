/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { DrawerActions, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PADDING } from '../tools/constants';
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

  if (route.name === '') {
    return '';
  }
};

export default HeaderComponent;