/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import { View, Text, RefreshControl, Image, TouchableOpacity, FlatList, Linking, ToastAndroid } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { Divider } from 'react-native-paper';
import { NetworkInfo } from 'react-native-network-info';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import UserAgent from 'react-native-user-agent';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { API, PHONE, WEB } from '../../tools/constants';
import homeStyles from '../style';
import useColors from '../../hooks/useColors';

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
        url: `${API.url}/work/${itemId}`,
        headers: {
          'X-localization': 'fr',
          'X-user-id': userInfo.id ? userInfo.id : null,
          'X-ip-address': ip_address,
          'X-user-agent': UserAgent.getUserAgent()
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
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}>
      <View style={homeStyles.workBody}>
        <View style={homeStyles.workCard}>
          <View style={homeStyles.workTop}>
            <View>
              <Image source={{ uri: work.image_url ? work.image_url : `${WEB.url}/assets/img/cover.png` }} style={homeStyles.workImage} />
            </View>
            <View style={homeStyles.workDescTop}>
              <Text style={homeStyles.workTitle}>{work.work_title}</Text>
              <Text style={homeStyles.workContent}>{work.work_content}</Text>
              {userInfo.id ? (
                userInfo.is_subscribed == false ?
                  ''
                  :
                  <>
                    <Divider />
                    <View style={[homeStyles.workIconBtns, { justifyContent: 'center', paddingHorizontal: 20 }]}>
                      <TouchableOpacity onPress={() => navigation.navigate('PDFViewer', { docTitle: work.work_title, docUri: work.document_url, curPage: 1 })}>
                        <FontAwesome6 style={[homeStyles.workIconBtn, { color: COLORS.danger }]} name='file-lines' />
                      </TouchableOpacity>
                      {work.video_url ? (
                        <>
                          <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => navigation.navigate('VideoPlayer', { videoTitle: work.workTitle, videoUri: work.video_url })}>
                            <FontAwesome6 style={[homeStyles.workIconBtn, { color: COLORS.primary }]} name='play-circle' />
                          </TouchableOpacity>
                        </>
                      ) : ''}
                      {/* <TouchableOpacity>
                        <FontAwesome6 style={[homeStyles.workIconBtn, { color: COLORS.success }]} name='headphones' />
                      </TouchableOpacity> */}
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
                  <Text style={[homeStyles.workDescText, { color: COLORS.dark_secondary }]}>{t('work_details.author')}</Text>
                  <Text style={[homeStyles.workDescText, { fontWeight: '600' }]}>{work.user_owner ? work.user_owner : null}</Text>
                </View>
              </>
            ) : ''}
            <View style={homeStyles.workDescBottom}>
              <Text style={[homeStyles.workDescText, { color: COLORS.dark_secondary }]}>{t('work_details.type')}</Text>
              <Text style={[homeStyles.workDescText, { fontWeight: '600' }]}>{work.type ? work.type.type_name : null}</Text>
            </View>
            <View style={homeStyles.workDescBottom}>
              <Text style={[homeStyles.workDescText, { color: COLORS.dark_secondary }]}>
                {categoryCount > 1 ? t('work_details.categories') : t('work_details.category')}
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
            {userInfo.id ? (
              userInfo.is_subscribed == false ?
                <>
                  <Text style={{ marginBottom: 10, textAlign: 'center', color: COLORS.black }}>{t('work_details.subscription_info')}</Text>
                  <TouchableOpacity style={[homeStyles.workCmd, { backgroundColor: COLORS.primary, marginBottom: 10 }]} onPress={() => { navigation.navigate('Subscription', { message: t('error_message.pending_after_payment') }) }}>
                    <FontAwesome6 style={[homeStyles.workCmdIcon, { color: COLORS.white }]} name='money-check-dollar' />
                    <Text style={{ color: COLORS.white }}>{t('subscription.link')}</Text>
                  </TouchableOpacity>
                </> :
                ''
            ) :
              <>
                <Text style={{ marginBottom: 10, textAlign: 'center', color: COLORS.black }}>{t('work_details.subscription_info')}</Text>
                <TouchableOpacity style={[homeStyles.workCmd, { backgroundColor: COLORS.primary, marginBottom: 10 }]} onPress={() => { navigation.navigate('Subscription', { message: t('error_message.pending_after_payment') }) }}>
                  <FontAwesome6 style={[homeStyles.workCmdIcon, { color: COLORS.white }]} name='money-check-dollar' />
                  <Text style={{ color: COLORS.white }}>{t('subscription.link')}</Text>
                </TouchableOpacity>
              </>
            }
            {userInfo.id ? (
              userInfo.is_partner == false ?
                <>
                  <TouchableOpacity style={[homeStyles.workCmd, { backgroundColor: COLORS.warning }]} onPress={sendWhatsAppMessage}>
                    <FontAwesome6 style={[homeStyles.workCmdIcon, { color: COLORS.black }]} name='handshake-angle' />
                    <Text style={{ color: COLORS.black }}>{t('auth.my_works.start_button')}</Text>
                  </TouchableOpacity>
                </>
                :
                <>
                  <TouchableOpacity style={[homeStyles.workCmd, { backgroundColor: COLORS.success }]} onPress={() => { navigation.navigate('Account', { screen: 'MyWork' }) }}>
                    <FontAwesome6 style={[homeStyles.workCmdIcon, { color: COLORS.white }]} name='book' />
                    <Text style={{ color: COLORS.white }}>{t('navigation.work')}</Text>
                  </TouchableOpacity>
                </>
            )
              :
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
  );
};

export default WorkDataScreen;