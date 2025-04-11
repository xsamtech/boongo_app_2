/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { Divider } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PADDING } from '../../tools/constants';
import FooterComponent from '../footer';
import TextBrand from '../../assets/img/brand.svg';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';

const HomeScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ padding: PADDING.p05 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        {/* Open drawer */}
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Icon name='menu' color={COLORS.black} style={{ fontSize: 28, marginVertical: 7 }} />
        </TouchableOpacity>

        {/* Brand / Title */}
        <View style={homeStyles.authlogo}>
          <TextBrand width={154} height={50} />
        </View>



        {/* Footer content */}
        <Divider style={{ backgroundColor: COLORS.dark_secondary, marginTop: PADDING.p12, marginBottom: PADDING.p05 }} />
        <FooterComponent />
      </ScrollView>
    </View>
  )
}

export default HomeScreen