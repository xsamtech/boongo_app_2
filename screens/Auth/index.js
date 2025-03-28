/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StatusBar, useWindowDimensions, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Svg, { G, Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { IMAGE_SIZE, PADDING, TEXT_SIZE } from '../../tools/constants';
import ThemeContext from '../../contexts/ThemeContext';
import TextBrand from '../../assets/img/brand.svg';
import useColors from '../../hooks/useColors';
import homeStyles from '../style';

// Importation de pinar pour le carousel
import Carousel from 'pinar';

const OnboardScreen = () => {
  const COLORS = useColors();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowDimensions(); // Ajouter height ici
  const slides = [{ id: 1, entity: 'product' }, { id: 2, entity: 'service' }, { id: 3, entity: 'food' }, { id: 4, entity: 'networking' }];
  const imageMap = {
    product: { dark: require('../../assets/img/product-stroke-dark.png'), light: require('../../assets/img/product-stroke-light.png') },
    service: { dark: require('../../assets/img/service-stroke-dark.png'), light: require('../../assets/img/service-stroke-light.png') },
    food: { dark: require('../../assets/img/food-stroke-dark.png'), light: require('../../assets/img/food-stroke-light.png') },
    networking: { dark: require('../../assets/img/networking-stroke-dark.png'), light: require('../../assets/img/networking-stroke-light.png') },
  };

  // CAROUSEL ITEM
  const getImageSlide = (entity) => {
    const { theme } = useContext(ThemeContext);
    return <Image source={imageMap[entity]?.[theme] || imageMap.product.dark} style={[homeStyles.onboardSlideImage, { width, resizeMode: 'contain' }]} />;
  };

  // PAGINATOR
  const Paginator = ({ data, currentIndex }) => {
    const { width } = useWindowDimensions();
    return (
      <View style={[homeStyles.onboardPaginator, { flex: 0.2 }]}>
        {data.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = inputRange[currentIndex] ? 20 : 10;
          return <View style={[homeStyles.onboardDot, { width: dotWidth, backgroundColor: COLORS.dark_secondary }]} key={i.toString()} />;
        })}
      </View>
    );
  };

  // "Next" BUTTON
  const NextButton = ({ scrollTo, percentage }) => {
    const size = 120;
    const strokeWidth = 2;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const progressAnimation = useRef(new Animated.Value(0)).current;
    const progressRef = useRef(null);

    useEffect(() => {
      Animated.timing(progressAnimation, {
        toValue: percentage,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, [percentage]);

    useEffect(() => {
      progressAnimation.addListener((value) => {
        const strokeDashoffset = circumference - (circumference * value.value) / 100;
        if (progressRef?.current) {
          progressRef.current.setNativeProps({ strokeDashoffset });
        }
      });
    }, [percentage]);

    return (
      <View style={homeStyles.onboardContainer}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={center}>
            <Circle stroke={COLORS.light} cx={center} cy={center} r={radius} fillOpacity={0} strokeWidth={strokeWidth} />
            <Circle stroke={COLORS.success} cx={center} cy={center} r={radius} fillOpacity={0} strokeWidth={strokeWidth} strokeDasharray={circumference} />
          </G>
        </Svg>
        <TouchableOpacity style={[homeStyles.onboardButton, { backgroundColor: COLORS.primary }]} activeOpacity={0.6} onPress={scrollTo}>
          <Icon name="arrow-right" color="white" size={IMAGE_SIZE.s07} />
        </TouchableOpacity>
      </View>
    );
  };

  const scrollTo = (index) => {
    if (index < slides.length - 1) {
      setCurrentIndex(index + 1);
    } else {
      console.log('Last item');
    }
  };

  return (
    <>
      {/* Status bar */}
      <StatusBar barStyle={COLORS.bar_style} backgroundColor={COLORS.white} />
      {/* Content */}
      <View style={[homeStyles.onboardContainer, { backgroundColor: COLORS.white, padding: PADDING.p07 }]}>
        {/* Brand */}
        <View style={{ marginBottom: PADDING.p14 }}>
          <TextBrand width={250} height={52} style={{ alignSelf: 'center', marginBottom: PADDING.p01 }} />
          <Text style={[homeStyles.slogan, { fontSize: TEXT_SIZE.paragraph, color: COLORS.black }]}>{t('welcome_title')}</Text>
        </View>

        {/* Carousel */}
        <View style={{ flex: 3 }}>
          <Carousel
            style={homeStyles.onboardSlide}
            autoplay={true}
            loop={true}
            showsControls={false}
            showsDots={true}
            autoplayInterval={10000}
          >
            {slides.map(item => (
              <View key={item.id} style={homeStyles.onboardSlideItem}>
                {getImageSlide(item.entity)} {/* Affiche l'image du slide */}
                <Text style={[homeStyles.onboardSlideText, { color: COLORS.black }]}>
                  {t('welcome_description.' + item.entity)}
                </Text>
              </View>
            ))}
          </Carousel>
        </View>

        {/* Paginator */}
        <Paginator data={slides} currentIndex={currentIndex} />

        {/* "Next" button */}
        <NextButton scrollTo={() => scrollTo(currentIndex)} percentage={(currentIndex + 1) * (100 / slides.length)} />
      </View>
    </>
  );
};

export default OnboardScreen;