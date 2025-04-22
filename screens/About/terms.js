/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import { WEB } from '../../tools/constants';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import homeStyles from '../style';

const TermsScreen = () => {
  // =============== Language ===============
  const { t } = useTranslation();

  // =============== Get data ===============
  const [isLoading, setIsLoading] = useState(false);

  // =============== Refresh control ===============
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}>
      <View style={[homeStyles.headingArea, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={homeStyles.heading}>{t('navigation.terms')}</Text>
      </View>
    </ScrollView>
  );
};

export default TermsScreen;