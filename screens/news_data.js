/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, RefreshControl, Image, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { NetworkInfo } from 'react-native-network-info';
import * as RNLocalize from 'react-native-localize';
import UserAgent from 'react-native-user-agent';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { API, PADDING } from '../tools/constants';
import homeStyles from './style';
import useColors from '../hooks/useColors';
import HeaderComponent from './header';

const NewsDataScreen = ({ route, navigation }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get contexts ===============
  const { userInfo } = useContext(AuthContext);
  // =============== Get parameters ===============
  const { itemId } = route.params;
  // =============== Get data ===============
  const [work, setWork] = useState({});
  const [loading, setLoading] = useState(true);

  // =============== Get system language ===============
  const getLanguage = () => {
    const locales = RNLocalize.getLocales();

    if (locales && locales.length > 0) {
      return locales[0].languageCode;
    }

    return 'fr';
  };

  // =============== Refresh control ===============
  const onRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => { setLoading(false); }, 2000);
  }, []);

  useEffect(() => {
    getWork();
  }, [work]);

  const getWork = () => {
    NetworkInfo.getIPAddress().then(ip_address => {
      const config = {
        method: 'GET',
        url: `${API.boongo_url}/work/${itemId}`,
        headers: {
          'X-localization': getLanguage(),
          'X-user-id': userInfo.id,
          'X-ip-address': ip_address,
          'X-user-agent': UserAgent.getUserAgent(),
          'Authorization': `Bearer ${userInfo.api_token}`,
        }
      };

      axios(config)
        .then(res => {
          const workData = res.data.data;

          setWork(workData);
          setLoading(false);

          return workData;
        })
        .catch(error => {
          console.log(error);
        });
    })
  };

  return (
    <>
      {/* Header */}
      <View style={{ paddingVertical: PADDING.p01, backgroundColor: COLORS.white }}>
        <HeaderComponent />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50, backgroundColor: COLORS.white }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
        <View style={[homeStyles.workBody, { paddingTop: 0, paddingBottom: PADDING.p01 }]}>
          <View style={homeStyles.workCard}>
            <View style={[homeStyles.workTop, { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <View>
                <Image source={{ uri: work.photo_url }} style={[homeStyles.workImage, { width: Dimensions.get('window').width - 10, height: Dimensions.get('window').width - 10 }]} />
              </View>
              <View style={homeStyles.workDescTop}>
                <Text style={[homeStyles.workTitle, { color: COLORS.black }]}>{work.work_title}</Text>
                <Text style={[homeStyles.workContent, { color: COLORS.black, textAlign: 'justify' }]}>{work.work_content}</Text>
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default NewsDataScreen;