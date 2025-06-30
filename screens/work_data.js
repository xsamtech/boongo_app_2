/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import { View, Text, RefreshControl, Image, TouchableOpacity, FlatList, Linking, ToastAndroid, Dimensions } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { Divider } from 'react-native-paper';
import { NetworkInfo } from 'react-native-network-info';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import UserAgent from 'react-native-user-agent';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { API, PADDING, PHONE, WEB } from '../tools/constants';
import homeStyles from './style';
import useColors from '../hooks/useColors';
import HeaderComponent from './header';

const sendWhatsAppMessage = async () => {
  const phoneNumber = PHONE.admin;
  const message = "Bonjour Boongo.\n\nJe voudrais devenir partenaire pour être en mesure de publier mes ouvrages.\n\nQue dois-je faire ?";
  const text = encodeURIComponent(message);
  const url = `whatsapp://send?phone=${phoneNumber}&text=${text}`;

  try {
    await Linking.openURL(url);

  } catch (error) {
    // An error occurred while configuring the query
    ToastAndroid.show(`${error.message}`, ToastAndroid.LONG);
  }
};

const WorkDataScreen = ({ route, navigation }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Authentication context ===============
  const { userInfo, validateSubscription, invalidateSubscription } = useContext(AuthContext);
  // =============== Get parameters ===============
  const { itemId } = route.params;
  // =============== Get data ===============
  const [work, setWork] = useState({});
  const [categoryCount, setCategoryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const mWidth = Dimensions.get('window').width / 1.7

  // =============== Refresh control ===============
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);

  // =============== Get item API with effect hook ===============
  useEffect(() => {
    if (userInfo.id) {
      const validationInterval = setInterval(() => {
        validateSubscription(userInfo.id);
        invalidateSubscription(userInfo.id);
      }, 1000);

      return () => clearInterval(validationInterval);

    } else {
      console.log('Utilisateur non connecté');
    }
  }, []);

  useEffect(() => {
    getWork();
  }, []);

  const getWork = () => {
    NetworkInfo.getIPAddress().then(ip_address => {
      const config = {
        method: 'GET',
        url: `${API.boongo_url}/work/${itemId}`,
        headers: {
          'X-localization': 'fr',
          'X-user-id': userInfo.id,
          'X-ip-address': ip_address,
          'X-user-agent': UserAgent.getUserAgent(),
          'Authorization': `Bearer ${userInfo.api_token}`,
        }
      };

      axios(config)
        .then(res => {
          const workData = res.data.data;
          const workCategories = res.data.data.categories.length;

          setWork(workData);
          setCategoryCount(workCategories);
          setIsLoading(false);

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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50, backgroundColor: COLORS.white }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}>
        <View style={[homeStyles.workBody, { paddingTop: 0, paddingBottom: PADDING.p01 }]}>
          <View style={homeStyles.workCard}>
            <View style={[homeStyles.workTop, { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <View>
                <Image source={{ uri: work.photo_url }} style={[homeStyles.workImage, { width: mWidth, height: mWidth * 1.6 }]} />
              </View>
              <View style={homeStyles.workDescTop}>
                <Text style={[homeStyles.workTitle, { color: COLORS.black }]}>{work.work_title}</Text>
                <Text style={[homeStyles.workContent, { color: COLORS.black }]}>{work.work_content}</Text>
                {userInfo.id ? (
                  userInfo.has_valid_subscription ?
                    ''
                    :
                    <>
                      <Divider />
                      <View style={[homeStyles.workIconBtns, { justifyContent: 'center', paddingHorizontal: 10 }]}>
                        {work.document_url &&
                          <TouchableOpacity style={{ marginRight: 20 }} onPress={() => navigation.navigate('PDFViewer', { docTitle: work.work_title, docUri: work.document_url, curPage: 1 })}>
                            <Icon name='file-document-outline' style={[homeStyles.workIconBtn, { fontSize: 37, color: COLORS.danger }]} />
                          </TouchableOpacity>
                        }
                        {work.video_url ? (
                          <TouchableOpacity style={{ marginRight: 20 }} onPress={() => navigation.navigate('VideoPlayer', { videoTitle: work.workTitle, videoUri: work.video_url })}>
                            <Icon name='television-play' style={[homeStyles.workIconBtn, { fontSize: 37, color: COLORS.primary }]} />
                          </TouchableOpacity>
                        ) : ''}
                        {work.audio_url ? (
                          <TouchableOpacity onPress={() => navigation.navigate('AudioPlayer', { audioTitle: work.workTitle, audioUri: work.audio_url })}>
                            <Icon name='microphone-outline' style={[homeStyles.workIconBtn, { fontSize: 37, color: COLORS.success }]} />
                          </TouchableOpacity>
                        ) : ''}
                      </View>
                    </>)
                  :
                  ''}
              </View>
            </View>

            <View style={homeStyles.workBottom}>
              {work.user_owner ? (
                <>
                  <View style={homeStyles.workDescBottom}>
                    <Text style={[homeStyles.workDescText, { color: COLORS.dark_secondary }]}>{t('work.author')}</Text>
                    <Text style={[homeStyles.workDescText, { fontWeight: '600', color: COLORS.black }]}>{work.user_owner ? work.user_owner : null}</Text>
                  </View>
                </>
              ) : ''}
              <View style={homeStyles.workDescBottom}>
                <Text style={[homeStyles.workDescText, { color: COLORS.dark_secondary }]}>{t('work.type')}</Text>
                <Text style={[homeStyles.workDescText, { fontWeight: '600', color: COLORS.black }]}>{work.type ? work.type.type_name : null}</Text>
              </View>
              <View style={homeStyles.workDescBottom}>
                <Text style={[homeStyles.workDescText, { color: COLORS.dark_secondary }]}>
                  {categoryCount > 1 ? t('work.categories') : t('work.category')}
                </Text>
                <FlatList
                  data={work.categories}
                  keyExtractor={item => item.id}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  style={homeStyles.workDescBadgesList}
                  contentContainerStyle={homeStyles.workDescBadgesListContents}
                  renderItem={({ item }) => {
                    return (<Text style={homeStyles.workDescBadge}>{item.category_name}</Text>);
                  }} />
              </View>
            </View>
          </View>
          <View style={homeStyles.workCard}>
            <View style={homeStyles.workCmds}>
              {!userInfo.has_valid_subscription &&
                <>
                  <Text style={{ marginBottom: 10, textAlign: 'center', color: COLORS.black }}>{t('subscription.info')}</Text>
                  <TouchableOpacity style={[homeStyles.workCmd, { backgroundColor: COLORS.primary, marginBottom: 10 }]} onPress={() => { navigation.navigate('Subscription', { message: t('error_message.pending_after_payment') }) }}>
                    <FontAwesome6 style={[homeStyles.workCmdIcon, { color: COLORS.white }]} name='money-check-dollar' />
                    <Text style={{ color: COLORS.white }}>{t('subscription.link')}</Text>
                  </TouchableOpacity>
                </>
              }
              {!userInfo.is_partner &&
                <>
                  <TouchableOpacity style={[homeStyles.workCmd, { backgroundColor: COLORS.warning }]} onPress={sendWhatsAppMessage}>
                    <FontAwesome6 style={[homeStyles.workCmdIcon, { color: COLORS.black }]} name='handshake-angle' />
                    <Text style={{ color: COLORS.black }}>{t('auth.my_works.start_button')}</Text>
                  </TouchableOpacity>
                </>
              }
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default WorkDataScreen;