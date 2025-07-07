/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import { View, Alert, Button, TouchableOpacity, Dimensions, ScrollView, Image, Linking } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import YoutubePlayer from 'react-native-youtube-iframe';
import getVideoId from 'get-video-id';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import axios from 'axios';
import Carousel from 'pinar';
import { API, WEB } from '../tools/constants';
import LogoText from '../assets/img/brand.svg';
import useColors from '../hooks/useColors';
import homeStyles from './style';

const YouTubePlayerScreen = ({ route, navigation }) => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();

  // =============== Get parameters ===============
  const { videoTitle, videoUri } = route.params;
  const video_title = JSON.stringify(videoTitle);
  const video_uri = JSON.stringify(videoUri);

  // =============== Get data ===============
  const [sponsors, setSponsors] = useState([]);
  const [playing, setPlaying] = useState(false);
  const { id } = getVideoId(video_uri);

  // SPONSORS
  useEffect(() => {
    getSponsors();
  }, []);

  // =============== Some functions ===============
  // SPONSORS
  const getSponsors = () => {
    const config = { method: 'GET', url: `${API.boongo_url}/partner/find_by_active/1`, headers: { 'X-localization': 'fr' } };

    axios(config)
      .then(res => {
        const sponsorsData = res.data.data;

        setSponsors(sponsorsData);
        setIsLoading(false);

        return sponsorsData;
      })
      .catch(error => {
        console.log(error);
      });
  };

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
      Alert.alert(t('video_ended'));
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
    console.log(id);
  }, []);

  return (
    <ScrollView>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: 'rgba(219, 51, 55, 0.5)', margin: 10, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 40 / 2 }} onPress={() => navigation.goBack()}>
          <FontAwesome6 style={{ fontSize: 25, color: COLORS.black }} name='angle-left' />
        </TouchableOpacity>
      </View>
      <View style={{ position: 'absolute', top: 0, left: 0, width: Dimensions.get('window').width, paddingVertical: 7 }}>
        <LogoText width={188} height={45} style={{ alignSelf: 'center' }} />
      </View>

      {/* Content */}
      <YoutubePlayer
        height={((Dimensions.get('window').width / 16) * 9) + 1}
        play={playing}
        videoId={id}
        onChangeState={onStateChange} />
      <Button title={playing ? 'pause' : 'play'} onPress={togglePlaying} />

      {/* ADS */}
      {sponsors.length > 0 ? 
        <View style={[homeStyles.cardEmpty, { flexShrink: 0, width: Dimensions.get('window').width - 20, height: (Dimensions.get('window').width - 20) / 1.7, marginVertical: 50, padding: 10 }]}>
          <Carousel style={{ width: Dimensions.get('window').width - 50 }} autoplay={true} autoplayInterval={5000} loop={true} showsControls={false} showsDots={false}>
            {sponsors.map(item =>
              <Image key={item.id} source={{ uri: item.image_url ? item.image_url : `${WEB.boongo_url}/assets/img/ad.png` }} style={{ width: '100%', height: '100%' }} onPress={() => Linking.openURL(item.website_url)}/>
            )}
          </Carousel>
        </View>
      : ''}
    </ScrollView>
  );
};

export default YouTubePlayerScreen;