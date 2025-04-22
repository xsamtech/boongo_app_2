/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { TabView, SceneMap } from 'react-native-tab-view';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PADDING } from '../../tools/constants';
import TextBrand from '../../assets/img/brand.svg';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';

// News frame
const News = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
      <Text style={homeStyles.heading}>{t('navigation.home.news')}</Text>
    </View>
  );
};

// Books frame
const Books = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
      <Text style={homeStyles.heading}>{t('navigation.home.books')}</Text>
    </View>
  );
};

const HomeScreen = () => {
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get data ===============
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'news', title: t('navigation.home.news') },
    { key: 'books', title: t('navigation.home.books') },
  ]);

  const renderScene = SceneMap({
    news: News,
    books: Books,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: 100 }} />
  );
};

export default HomeScreen