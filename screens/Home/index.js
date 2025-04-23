/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { Tabs } from 'react-native-collapsible-tab-view';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PADDING } from '../../tools/constants';
import TextBrand from '../../assets/img/brand.svg';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';
import HeaderComponent from '../header';

// News component
const News = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      <View style={{ height: 200, marginBottom: 10, backgroundColor: COLORS.dark_secondary }}>
        <Text style={homeStyles.heading}>{t('navigation.home.news')}</Text>
      </View>
      <View style={{ height: 200, marginBottom: 10, backgroundColor: COLORS.dark_secondary }}>
        <Text style={homeStyles.heading}>{t('navigation.home.news')}</Text>
      </View>
      <View style={{ height: 200, marginBottom: 10, backgroundColor: COLORS.dark_secondary }}>
        <Text style={homeStyles.heading}>{t('navigation.home.news')}</Text>
      </View>
      <View style={{ height: 200, marginBottom: 10, backgroundColor: COLORS.dark_secondary }}>
        <Text style={homeStyles.heading}>{t('navigation.home.news')}</Text>
      </View>
      <View style={{ height: 200, marginBottom: 10, backgroundColor: COLORS.dark_secondary }}>
        <Text style={homeStyles.heading}>{t('navigation.home.news')}</Text>
      </View>
      <View style={{ height: 200, marginBottom: 10, backgroundColor: COLORS.dark_secondary }}>
        <Text style={homeStyles.heading}>{t('navigation.home.news')}</Text>
      </View>
      <View style={{ height: 200, marginBottom: 10, backgroundColor: COLORS.dark_secondary }}>
        <Text style={homeStyles.heading}>{t('navigation.home.news')}</Text>
      </View>
      <View style={{ height: 200, marginBottom: 10, backgroundColor: COLORS.dark_secondary }}>
        <Text style={homeStyles.heading}>{t('navigation.home.news')}</Text>
      </View>
    </ScrollView>
  );
};

// Books component
const Books = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.light_secondary }}>
      <Text style={homeStyles.heading}>{t('navigation.home.books')}</Text>
    </View>
  );
};

const HomeScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();

  return (
    <Tabs.Container renderHeader={({ title }) => <HeaderComponent title={title} />} headerHeight={250}>
      {/* News tab */}
      <Tabs.Tab name="News" label={t('navigation.home.news')}>
        <News />
      </Tabs.Tab>

      {/* Books tab */}
      <Tabs.Tab name="Books" label={t('navigation.home.books')}>
        <Books />
      </Tabs.Tab>
    </Tabs.Container>
  );
};

export default HomeScreen