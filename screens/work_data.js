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
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import UserAgent from 'react-native-user-agent';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { API, PADDING, PHONE, TEXT_SIZE, WEB } from '../tools/constants';
import homeStyles from './style';
import useColors from '../hooks/useColors';
import HeaderComponent from './header';
import FileThumbnail from '../components/file_thumbnail';
import GalleryModal from '../components/gallery_modal';

const sendWhatsAppMessage = async () => {
  const phoneNumber = PHONE.admin;
  const message = "Bonjour Boongo.\n\nJe voudrais devenir partenaire pour faire la promotion de vos services.\n\nQue dois-je faire ?";
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
  const mWidth = Dimensions.get('window').width / 1.7;
  const [imageModal, setImageModal] = useState({ visible: false, index: 0 });
  const [price, setPrice] = useState('');
  // Check if user has valid consultation if the work is not public
  const isPaid = work.is_public === 0 ? (userInfo.valid_consultations && userInfo.valid_consultations.some(consultation => consultation.id === work.id)) : false;

  // =============== Check if file is video ===============
  const isVideoFile = (url) => {
    if (!url) return false;

    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];

    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  // =============== Image mapping ===============
  const galleryFiles = work.images?.filter(image => { return image.type.alias === 'image_file'; });
  // const galleryFiles = work.images?.filter(f => f.type.name === 'Image (Photo/Vidéo)') || [];

  const gallerySources = galleryFiles?.map(file => ({
    uri: file.file_url,
    type: isVideoFile(file.file_url) ? 'video' : 'image',
  }));

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

  const getPrice = () => {
    if (!work.consultation_price) return;

    setIsLoading(true);

    if (work.currency.currency_acronym === userInfo.currency.currency_acronym) {
      setPrice(work.consultation_price + ' ' + userInfo.currency.currency_acronym);
      setIsLoading(false);

    } else {
      const url = `${API.boongo_url}/currencies_rate/find_currency_rate/${work.currency.currency_acronym}/${userInfo.currency.currency_acronym}`;
      const mHeaders = {
        'X-localization': 'fr',
        'Authorization': `Bearer ${userInfo.api_token}`
      };

      axios.get(url, { headers: mHeaders })
        .then(response => {
          // Vérifie si la réponse contient les données nécessaires
          if (response && response.data && response.data.success && response.data.data) {
            const responseData = response.data.data;
            const userPrice = work.consultation_price * responseData.rate;
            setPrice(userPrice + ' ' + userInfo.currency.currency_acronym);
          } else {
            console.error('Erreur : Données manquantes ou format incorrect', response.data.message);
          }
        })
        .catch(error => {
          // Gère les erreurs liées à la requête
          if (error.response?.status === 429) {
            console.warn("Trop de requêtes envoyées. Attendez avant de réessayer.");
          } else {
            console.error('Erreur lors de la récupération du taux de change', error);
          }
        })
        .finally(() => {
          // Enfin, on met à jour l'état de chargement
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    getPrice();
  }, []);

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
                <Image source={{ uri: work.photo_url }} style={[homeStyles.workImage, { width: Dimensions.get('window').width - 50, height: mWidth * 1.6 }]} />
              </View>
              <View style={homeStyles.workDescTop}>
                <Text style={[homeStyles.workTitle, { color: COLORS.black }]}>{work.work_title}</Text>
                <Text style={[homeStyles.workContent, { color: COLORS.black, textAlign: 'justify' }]}>{work.work_content}</Text>
              </View>
            </View>
            {/* Metadata */}
            <View style={homeStyles.workBottom}>
              {/* Auhtor */}
              {work.author ? (
                <>
                  <View style={homeStyles.workDescBottom}>
                    <Text style={[homeStyles.workDescText, { color: COLORS.dark_secondary }]}>{t('work.author')} : </Text>
                    <Text style={[homeStyles.workDescText, { fontWeight: '600', color: COLORS.black }]}>{work.author ? work.author : null}</Text>
                  </View>
                </>
              ) : ''}

              {/* Editor */}
              {work.editor ? (
                <>
                  <View style={homeStyles.workDescBottom}>
                    <Text style={[homeStyles.workDescText, { color: COLORS.dark_secondary }]}>{t('work.editor')} : </Text>
                    <Text style={[homeStyles.workDescText, { fontWeight: '600', color: COLORS.black }]}>{work.editor ? work.editor : null}</Text>
                  </View>
                </>
              ) : ''}

              {/* Type */}
              <View style={homeStyles.workDescBottom}>
                <Text style={[homeStyles.workDescText, { color: COLORS.dark_secondary }]}>{t('work.type')}</Text>
                <Text style={[homeStyles.workDescText, { fontWeight: '600', color: COLORS.black }]}>{work.type ? work.type.type_name : null}</Text>
              </View>

              {/* Categor(ies)y */}
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

              {/* Consultation price */}
              {work.is_public === 0 ? (
                <>
                  <View style={homeStyles.workDescBottom}>
                    <Text style={[homeStyles.workDescText, { color: COLORS.dark_secondary }]}>{t('work.is_public.consult_price')} : </Text>
                    <Text style={[homeStyles.workDescText, { fontWeight: '600', color: COLORS.black }]}>{work.consultation_price ? price : null}</Text>
                  </View>
                </>
              ) : ''}

              {/* Work files */}
              {userInfo.has_valid_subscription && (
                <View style={[homeStyles.workDescBottom, { flexDirection: 'column' }]}>
                  <Divider style={{ marginTop: PADDING.p01 }} />
                  {/* Documents */}
                  {Array.isArray(work.documents) && work.documents.length > 0 && (
                    <View style={{ padding: PADDING.p00 }}>
                      <Text style={{ color: COLORS.black }}>{t('file.documents')}</Text>

                      {work.documents?.map((doc, idx) => (
                        <FileThumbnail
                          key={`doc-${idx}`}
                          uri={null}
                          type="document"
                          title={`${t('file.document')} ${idx + 1}`}
                          onPress={() => navigation.navigate('PDFViewer', {
                            docTitle: work.work_title,
                            docUri: doc.file_url,
                            curPage: 1,
                          })}
                        />
                      ))}
                    </View>
                  )}

                  {/* Audios */}
                  {Array.isArray(work.audios) && work.audios.length > 0 && (
                    <View style={{ padding: PADDING.p00 }}>
                      <Text style={{ color: COLORS.black }}>{t('file.audios')}</Text>

                      {work.audios?.map((audio, idx) => (
                        <FileThumbnail
                          key={`audio-${idx}`}
                          uri={null}
                          type="audio"
                          title={`${t('file.audio')} ${idx + 1}`}
                          onPress={() => navigation.navigate('Audio', {
                            audioTitle: work.work_title,
                            audioUrl: audio.file_url,
                            mediaCover: work.photo_url,
                            mediaAuthor: work.author,
                          })}
                        />
                      ))}
                    </View>
                  )}

                  {/* Gallery (Local photos/videos) */}
                  {Array.isArray(work.images) && work.images.length > 0 && (
                    <View style={{ padding: PADDING.p00 }}>
                      <Text style={{ color: COLORS.black }}>{t('file.photos')} / {t('file.videos')}</Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {gallerySources.map((file, index) => (
                          <FileThumbnail
                            key={`media-${index}`}
                            uri={file.uri}
                            type={file.type}
                            title={`${t('file.image')} ${index + 1}`}
                            onPress={() => setImageModal({ visible: true, index })}
                          />
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Remote video (YouTube or other) */}
                  {work.work_url && (
                    <View style={{ padding: PADDING.p00 }}>
                      <Text style={{ color: COLORS.black }}>{t('file.videos')}</Text>

                      <FileThumbnail
                        uri={work.work_url}
                        type="video"
                        title={t('file.video')}
                        onPress={() => navigation.navigate('VideoPlayer', {
                          videoTitle: work.work_title,
                          videoUri: work.work_url,
                        })}
                      />
                    </View>
                  )}

                  {/* Modal */}
                  <GalleryModal
                    visible={imageModal.visible}
                    index={imageModal.index}
                    files={gallerySources}
                    onClose={() => setImageModal({ visible: false, index: 0 })}
                  />
                </View>
              )}
            </View>
          </View>
          <View style={homeStyles.workCard}>
            <View style={homeStyles.workCmds}>
              {!userInfo.has_valid_subscription &&
                <>
                  <Text style={{ marginBottom: 10, textAlign: 'center', color: COLORS.black }}>{t('subscription.info')}</Text>
                  <TouchableOpacity style={[homeStyles.workCmd, { backgroundColor: COLORS.primary, marginBottom: 10 }]} onPress={() => { navigation.navigate('Subscription', { object: 'subscription', message: t('error_message.pending_after_payment') }) }}>
                    <FontAwesome6 style={[homeStyles.workCmdIcon, { color: 'white' }]} name='money-check-dollar' />
                    <Text style={{ fontSize: TEXT_SIZE.paragraph, color: 'white' }}>{t('subscription.link')}</Text>
                  </TouchableOpacity>
                </>
              }
              {userInfo.has_valid_subscription && work.is_public === 0 && isPaid &&
                <>
                  <Text style={{ marginBottom: 10, textAlign: 'center', color: COLORS.black }}>{t('consultation.info')}</Text>
                  <TouchableOpacity style={[homeStyles.workCmd, { backgroundColor: COLORS.success, marginBottom: 10 }]} onPress={() => { navigation.navigate('MobileSubscribe', { object: 'consultation' }) }}>
                    <FontAwesome6 style={[homeStyles.workCmdIcon, { color: 'white' }]} name='eye' />
                    <Text style={{ fontSize: TEXT_SIZE.paragraph, color: 'white' }}>{t('consultation.link')}</Text>
                  </TouchableOpacity>
                </>
              }
              {!userInfo.is_partner &&
                <>
                  <TouchableOpacity style={[homeStyles.workCmd, { backgroundColor: COLORS.warning }]} onPress={sendWhatsAppMessage}>
                    <FontAwesome6 style={[homeStyles.workCmdIcon, { color: 'black' }]} name='handshake-angle' />
                    <Text style={{ fontSize: TEXT_SIZE.paragraph, color: 'black' }}>{t('auth.my_works.start_button')}</Text>
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