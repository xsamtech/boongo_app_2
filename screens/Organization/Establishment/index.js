/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, RefreshControl, Image, TouchableOpacity, FlatList, Linking, ToastAndroid, Dimensions, TouchableHighlight } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../../../contexts/AuthContext';
import { API, PADDING, TEXT_SIZE } from '../../../tools/constants';
import homeStyles from '../../style';
import useColors from '../../../hooks/useColors';
import HeaderComponent from '../../header';

const EstablishmentScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Authentication context ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get data ===============
  const [isLoading, setIsLoading] = useState(true);

  // =============== Refresh control ===============
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);

  return (
    <>
      {/* Header */}
      <View style={{ paddingVertical: PADDING.p01, backgroundColor: COLORS.white }}>
        <HeaderComponent />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50, backgroundColor: COLORS.white }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}>
        <View style={[homeStyles.workBody, { paddingTop: 0, paddingBottom: PADDING.p01 }]}>
          <Text style={homeStyles.heading}>Establishment</Text>
        </View>
      </ScrollView>
    </>
  );
};

export default EstablishmentScreen;