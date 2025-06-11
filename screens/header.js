/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DrawerActions, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { IMAGE_SIZE, PADDING } from '../tools/constants';
import Logo from '../assets/img/logo.svg';
import LogoText from '../assets/img/text.svg';
import homeStyles from './style';
import useColors from '../hooks/useColors';

const HeaderComponent = ({ title }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Navigation ===============
  const navigation = useNavigation();
  const route = useRoute();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get data ===============
  const { userInfo } = useContext(AuthContext);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [datas, setDatas] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data from API
  const fetchData = async (searchTerm) => {
    if (isLoading) return;
    setIsLoading(true);

    const qs = require('qs');

    const params = {
      data: searchTerm,
      type_id: selectedType,
      categories_ids: selectedCategories,
    };

    try {
      const response = await axios.post(
        `${API.url}/work/search`,
        qs.stringify(params, { arrayFormat: 'brackets' }), // 👈 key here
        {
          headers: {
            'X-localization': 'fr',
            'Authorization': `Bearer ${userInfo.api_token}`,
            'X-user-id': userInfo.id,
            'Content-Type': 'application/x-www-form-urlencoded', // consistent
          },
        }
      );

      setDatas(response.data.data);
      console.log('Réponse API:', response.data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scroll to top
  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    setShowBackToTop(contentOffset.y > 200);
  };

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  // Handle refreshing
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  // Handle search event
  const handleSearch = (text) => {
    setInputValue(text);
    fetchData(text);
  };

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