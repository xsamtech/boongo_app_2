/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Dimensions, FlatList, Image, NativeModules, Platform, RefreshControl, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import axios from 'axios';
import Logo from '../assets/img/logo.svg';
import homeStyles from './style';
import { API, IMAGE_SIZE } from '../tools/constants';
import useColors from '../hooks/useColors';

const SearchScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();

  // =============== Navigation ===============
  const navigation = useNavigation();

  // =============== Float button ===============
  const [showBackToTop, setShowBackToTop] = useState(false);
  const flatListRef = useRef(null);

  // =============== Search data ===============
  const [datas, setDatas] = useState([]);
  const [inputValue, setInputValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // =============== Get device language ===============
  // const getDeviceLang = () => {
  //   const appLanguage = Platform.OS === 'ios' ? NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0] : NativeModules.I18nManager.localeIdentifier;

  //   return appLanguage.search(/-|_/g) !== -1 ? appLanguage.slice(0, 2) : appLanguage;
  // };

  // =============== Handle "scroll top" button ===============
  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const isAtTop = contentOffset.y === 0;

    setShowBackToTop(!isAtTop);
  };

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  // =============== Refresh control ===============
  const handleButtonPress = (text) => {
    setIsLoading(true);
    searchData(text);
  };

  // =============== Refresh control ===============
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);

  // =============== Search work function ===============
  const searchData = (data) => {
    setIsLoading(true);
    setInputValue(data);

    const config = { method: 'GET', url: `${API.url}/work/search/${data}`, headers: { 'X-localization': 'fr' } };

    axios(config)
      .then(res => {
        datas.splice(0, datas.length);

        const resultsData = res.data.data;

        setDatas(resultsData);
        setIsLoading(false);
      })
      .catch(error => {
        setDatas([]);
        setIsLoading(false);
      });
  };

  // =============== Work Item ===============
  const WorkItem = ({ item }) => {
    return (
      <View style={homeStyles.searchResult}>
        <View style={homeStyles.searchResultImage}>
          <Image source={{ uri: item.image_url ? item.image_url : `${WEB.url}/assets/img/ad.png` }} style={{ width: '100%', height: '100%', borderRadius: 5 }} />
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={homeStyles.searchResultTitle}>
            {((item.work_title).length > 25) ? (((item.work_title).substring(0, 25 - 3)) + '...') : item.work_title}
          </Text>
          <Text style={homeStyles.searchResultText}>
            {((item.work_content).length > 33) ? (((item.work_content).substring(0, 33 - 3)) + '...') : item.work_content}
          </Text>
          <TouchableOpacity style={homeStyles.linkIcon} onPress={() => navigation.navigate('WorkData', { itemId: item.id })}>
            <Text style={[homeStyles.link]}>{t('see_details')} </Text>
            <FontAwesome6 name='angle-right' size={IMAGE_SIZE.s01} />
          </TouchableOpacity>
        </View>
      </View>
    )
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 20 }}>
      {/* Floating button */}
      {showBackToTop && (
        <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.success, bottom: 80 }]} onPress={scrollToTop}>
          <MaterialCommunityIcons name='chevron-double-up' size={IMAGE_SIZE.s13} style={{ color: COLORS.white }} />
        </TouchableOpacity>
      )}

      {/* Search container */}
      <View style={homeStyles.searchContainer}>
        <Logo width={60} height={60} />
        <View style={homeStyles.searchInput}>
          <TextInput placeholder={t('search')} onChangeText={text => searchData(text)} style={homeStyles.searchInputText} />
          <TouchableOpacity style={homeStyles.searchInputSubmit} onPress={() => handleButtonPress(inputValue)}>
            <FontAwesome6 name='magnifying-glass' size={IMAGE_SIZE.s04} style={{ color: COLORS.white }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search results list */}
      <FlatList
        ref={flatListRef}
        data={datas}
        keyExtractor={item => item.id}
        onScroll={handleScroll}
        ListEmptyComponent={() => {
          return (
            <View style={[homeStyles.cardEmpty, { width: Dimensions.get('window').width - 20, backgroundColor: 'rgba(255, 255, 255, 0)', elevation: 0 }]}>
              <Text style={[homeStyles.cardEmptyText, { marginBottom: 30, textAlign: 'center', fontSize: 19, fontWeight: '300', letterSpacing: 0.3 }]}>{t('search_description')}</Text>
            </View>
          )
        }}
        renderItem={({ item }) => {
          return (<WorkItem item={item} />);
        }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />} />
    </SafeAreaView>
  );
}

export default SearchScreen;