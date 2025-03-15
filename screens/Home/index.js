/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useRef, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TouchableHighlight, TextInput } from 'react-native'
import { Button, Divider } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, IMAGE_SIZE, PADDING, TEXT_SIZE } from '../../tools/constants';
import FooterComponent from '../footer';
import TextBrand from '../../assets/img/logo-text.svg';
import homeStyles from '../style';
import axios from 'axios';

const HomeScreen = () => {
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Search data ===============
  const [datas, setDatas] = useState([]);
  const [inputValue, setInputValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // =============== Google Maps data ===============
  // Set a reference for the map
  const mapRef = useRef(null);
  // Initialize map region and deltas (default values)
  const [region, setRegion] = useState({
    latitude: -4.3214221,
    longitude: 15.2754746,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  });

  // =============== "Zoom in" function ===============
  const zoomIn = () => {
    const newLatitudeDelta = region.latitudeDelta * 0.4;  // Reduce by half
    const newLongitudeDelta = region.longitudeDelta * 0.4;  // Reduce by half

    // Update the region with the new values
    const newRegion = {
      ...region,
      latitudeDelta: newLatitudeDelta,
      longitudeDelta: newLongitudeDelta,
    };

    // Apply the new region to the map
    setRegion(newRegion);
    mapRef.current.animateToRegion(newRegion, 200);  // Map animation
  };

  // =============== "Zoom out" function ===============
  const zoomOut = () => {
    const newLatitudeDelta = region.latitudeDelta * 2;  // Augmenter de moitié
    const newLongitudeDelta = region.longitudeDelta * 2;  // Augmenter de moitié

    // Update the region with the new values
    const newRegion = {
      ...region,
      latitudeDelta: newLatitudeDelta,
      longitudeDelta: newLongitudeDelta,
    };

    // Apply the new region to the map
    setRegion(newRegion);
    mapRef.current.animateToRegion(newRegion, 200);  // Map animation
  };

  // =============== Search work function ===============
  const searchData = (data) => {
    setIsLoading(true);
    setInputValue(data);

    // const config = { method: 'GET', url: `${API.url}/search/${data}`, headers: { 'X-localization': 'fr' } };

    // axios(config)
    //   .then(res => {
    //     datas.splice(0, datas.length);

    //     const resultsData = res.data.data;

    //     setDatas(resultsData);
    //     setIsLoading(false);
    //   })
    //   .catch(error => {
    //     setDatas([]);
    //     setIsLoading(false);
    //   });
  };

  // =============== Refresh control ===============
  const handleButtonPress = (text) => {
    setIsLoading(true);
    searchData(text);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ padding: PADDING.p05 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        {/* Open drawer */}
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Icon name='menu' color={COLORS.black} style={{ fontSize: 28, marginVertical: 7 }} />
        </TouchableOpacity>

        {/* Brand / Title */}
        <View style={homeStyles.authlogo}>
          <TextBrand width={230} height={74} />
        </View>
        <Text style={homeStyles.noteTitle}>{t('welcome_description')}</Text>

        {/* Current position */}
        <Divider style={{ backgroundColor: COLORS.dark_secondary, marginVertical: PADDING.p03 }} />
        <Text style={[homeStyles.noteText, { fontWeight: '700', color: COLORS.purple, textAlign: 'center', marginBottom: PADDING.p00 }]}>{t('my_current_position')}</Text>
        <TouchableHighlight style={homeStyles.categoryBadgeSelected}>
          <View>
            <Text style={{ fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Silikin Village</Text>
            <Text style={[homeStyles.categoryBadgeTextSelected, { textAlign: 'center' }]}>Concession COTEX N° 63, Kinshasa</Text>
          </View>
        </TouchableHighlight>

        {/* Map view */}
        <View style={homeStyles.mapContainer}>
          <MapView ref={mapRef} provider={PROVIDER_GOOGLE} initialRegion={region} style={homeStyles.map}>
            <Marker coordinate={{ latitude: -4.3214221, longitude: 15.2754746 }} title="Silikin Village" description="Concession COTEX N° 63, Kinshasa" />
          </MapView>
          <View style={homeStyles.mapButtonsContainer}>
            <TouchableOpacity onPress={zoomIn} style={homeStyles.mapButton}>
              <Icon name='plus' color={COLORS.black} style={[homeStyles.mapButtonText, { fontSize: 19 }]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={zoomOut} style={homeStyles.mapButton}>
              <Icon name='minus' color={COLORS.black} style={[homeStyles.mapButtonText, { fontSize: 19 }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Type my position */}
        <View style={homeStyles.searchContainer}>
          <View style={homeStyles.searchInput}>
            <TextInput placeholder={t('type_position')} placeholderTextColor={COLORS.dark_secondary} onChangeText={text => searchData(text)} style={[homeStyles.searchInputText, { borderColor: COLORS.yellow }]} />
            <TouchableOpacity style={[homeStyles.searchInputSubmit, { backgroundColor: COLORS.yellow, borderColor: COLORS.yellow }]} onPress={() => handleButtonPress(inputValue)}>
              <Icon name='magnify' color={COLORS.black} size={IMAGE_SIZE.s05} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Give destination */}
        <Button style={[homeStyles.authButton, { backgroundColor: COLORS.purple }]} onPress={() => navigation.navigate('AvailableVehicles')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[homeStyles.authButtonText, { color: COLORS.white }]}>{t('give_destination')}</Text>
            <Icon name='arrow-right' color={COLORS.white} style={{ fontSize: TEXT_SIZE.normal, marginLeft: PADDING.p01 }} />
          </View>
        </Button>

        {/* Footer content */}
        <Divider style={{ backgroundColor: COLORS.dark_secondary, marginTop: PADDING.p12, marginBottom: PADDING.p05 }} />
        <FooterComponent />
      </ScrollView>
    </View>
  )
}

export default HomeScreen