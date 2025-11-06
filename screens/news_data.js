/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, RefreshControl, Image, Dimensions, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { NetworkInfo } from 'react-native-network-info';
import * as RNLocalize from 'react-native-localize';
import UserAgent from 'react-native-user-agent';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { API, PADDING, TEXT_SIZE } from '../tools/constants';
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

  // =============== First letter uppercase ===============
  const ucfirst = (str) => {
    if (!str) return str;

    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // =============== First word from splitted word ===============
  const getFirstPart = (str) => {
    if (!str) return str;

    const parts = str.split('_');

    return parts[0];
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

          console.log(workData.organization_owner.type.alias);

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
                <Image source={{ uri: work.photo_url }} style={[homeStyles.workImage, { width: Dimensions.get('window').width, height: Dimensions.get('window').width, marginLeft: -25, marginTop: 0, borderRadius: 0 }]} />
              </View>
              <View style={homeStyles.workDescTop}>
                <Text style={[homeStyles.workTitle, { color: COLORS.black }]}>{work.work_title}</Text>
                <Text style={[homeStyles.workContent, { color: COLORS.black, textAlign: 'justify' }]}>{work.work_content}</Text>
              </View>
              {work.user_id ?
                <View style={{ width: Dimensions.get('window').width - 50 }}>
                  <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={() => { navigation.navigate('Profile', { user_id: work.user_owner.id }); }}>
                    <Image source={{ uri: work.user_owner.avatar_url }} style={{ width: 37, height: 37, marginRight: PADDING.p02, borderRadius: 37 / 2 }} />
                    <Text style={{ fontSize: TEXT_SIZE.normal, color: COLORS.black }}>{`${work.user_owner.firstname} ${work.user_owner.lastname}`}</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: TEXT_SIZE.label, color: COLORS.dark_secondary, textAlign: 'center' }}>{`${t('work.publication_date')} ${ucfirst(work.created_at_explicit)}`}</Text>
                </View>
                : ''}
              {work.organization_id ?
                <View style={{ width: Dimensions.get('window').width - 50 }}>
                  <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={() => { navigation.navigate('Profile', { organization_id: work.organization_owner.id, type: getFirstPart(work.organization_owner.type.alias) }); }}>
                    <Image source={{ uri: work.organization_owner.cover_url }} style={{ width: 37, height: 37, marginRight: PADDING.p02, borderRadius: 37 / 2 }} />
                    <Text style={{ fontSize: TEXT_SIZE.normal, color: COLORS.black }}>{work.organization_owner.org_name}</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: TEXT_SIZE.label, color: COLORS.dark_secondary, textAlign: 'center' }}>{`${t('work.publication_date')} ${ucfirst(work.created_at_explicit)}`}</Text>
                </View>
                : ''}
            </View>

          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default NewsDataScreen;