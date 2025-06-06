/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import Carousel from 'pinar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PADDING, TEXT_SIZE } from '../../tools/constants';
import useColors from '../../hooks/useColors';
import LogoText from '../../assets/img/brand.svg';
import homeStyles from '../style';
import FooterComponent from '../footer';

const OnboardScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();

  // =============== Refresh control ===============
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);
  // =============== Get data ===============
  const [isLoading, setIsLoading] = useState(false);
  const slides = [{ id: 1, entity: 'work' }, { id: 2, entity: 'school' }, { id: 3, entity: 'government' }];

  const getImageSlide = (work) => {
    switch (work) {
      case 'school':
        return (<Image style={{ width: 282, height: 210, alignSelf: 'center' }} source={require('../../assets/img/share-school.png')} />);
        break;
      case 'government':
        return (<Image style={{ width: 231, height: 210, alignSelf: 'center' }} source={require('../../assets/img/share-government.png')} />);
        break;
      default:
        return (<Image style={{ width: 280, height: 210, alignSelf: 'center' }} source={require('../../assets/img/share-work.png')} />);
        break;
    }
  };

  return (
    <>
      <StatusBar barStyle='light-content' backgroundColor={COLORS.danger} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}>
        {/* Onboard top */}
        <View style={[homeStyles.onboardTop, { backgroundColor: COLORS.white }]}>
          {/* Brand */}
          <View style={{ marginBottom: 30 }}>
            <LogoText width={250} height={60} style={{ alignSelf: 'center' }} />
            <Text style={[homeStyles.slogan, { color: COLORS.black }]}>{t('slogan')}</Text>
          </View>

          {/* Slides */}
          <Carousel style={homeStyles.onboardSlide} autoplay={true} loop={true} showsControls={false} showsDots={true} autoplayInterval={10000}>
            {slides.map(item =>
              <View key={item.id} style={homeStyles.onboardSlideItem}>
                {getImageSlide(item.entity)}
                <Text style={[homeStyles.onboardSlideText, { color: COLORS.black }]}>{t('welcome_description.' + item.entity)}</Text>
              </View>
            )}
          </Carousel>
        </View>

        {/* Onboard bottom */}
        <View style={[homeStyles.onboardBottom, { backgroundColor: COLORS.light }]}>
          <View style={{ width: '100%' }}>
            {/* Log in link */}
            <TouchableOpacity style={[homeStyles.onboardButton, { backgroundColor: COLORS.black, marginBottom: PADDING.p01 }]} onPress={() => navigation.navigate('Login')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name='lock-outline' color={COLORS.white} size={TEXT_SIZE.title} style={{ marginRight: PADDING.p01 }} />
                <Text style={[homeStyles.onboardButtonText, { color: COLORS.white }]}>{t('i_login')}</Text>
              </View>
              <Icon name='chevron-right' color={COLORS.white} size={TEXT_SIZE.header} />
            </TouchableOpacity>

            {/* Register link */}
            <TouchableOpacity style={[homeStyles.onboardButton, { backgroundColor: 'rgba(250, 250, 250, 0)', borderWidth: 1, borderColor: COLORS.black }]} onPress={() => navigation.navigate('Register')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name='account-plus-outline' color={COLORS.black} size={TEXT_SIZE.title} style={{ marginRight: PADDING.p01 }} />
                <Text style={[homeStyles.onboardButtonText, { color: COLORS.black }]}>{t('i_register')}</Text>
              </View>
              <Icon name='chevron-right' color={COLORS.black} size={TEXT_SIZE.header} />
            </TouchableOpacity>

            {/* Footer */}
            <Divider style={{ backgroundColor: 'rgba(250, 250, 250, 0)', marginVertical: PADDING.p01 }} />
            <FooterComponent color={COLORS.dark} />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default OnboardScreen;