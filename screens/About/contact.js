/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useState } from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import homeStyles from '../style';

const ContactScreen = () => {
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
          <Text style={homeStyles.heading}>{t('navigation.contact')}</Text>
        </View>
      </ScrollView>
  );
};

export default ContactScreen;