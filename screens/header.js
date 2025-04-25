/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { PADDING } from '../tools/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Logo from '../assets/img/text-2.svg';
import homeStyles from './style';
import useColors from '../hooks/useColors';

const HeaderComponent = ({ title }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();

  return (
    <>
      {/* Status bar */}
      <StatusBar barStyle={COLORS.bar_style} backgroundColor={COLORS.white} />

      {/* Content */}
      <View style={[homeStyles.headerBanner, { backgroundColor: COLORS.white }]}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Icon name='menu' size={28} color={COLORS.black} />
          </TouchableOpacity>
          <Logo width={120} height={30} style={{ marginLeft: PADDING.p00 }} />
          {title ?
          <Text style={{ fontSize: 20, fontWeight: '500', color: COLORS.black }}>{title}</Text>
          : ''}
        </View>
      </View>
    </>
  );
};

export default HeaderComponent;