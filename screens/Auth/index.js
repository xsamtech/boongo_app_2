/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import homeStyles from '../style';

const OnboardScreen = ({ route }) => {
  // =============== Language ===============
  const { t } = useTranslation();

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}>
      <View style={[homeStyles.headingArea, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={homeStyles.heading}>Onboard</Text>
      </View>
    </ScrollView>
  );
};

export default OnboardScreen;