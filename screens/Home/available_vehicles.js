/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useRef, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TouchableHighlight, TextInput, RefreshControl, SafeAreaView, Dimensions, FlatList } from 'react-native'
import { Button, Divider } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, IMAGE_SIZE, PADDING, TEXT_SIZE } from '../../tools/constants';
import FooterComponent from '../footer';
import TextBrand from '../../assets/img/logo-text.svg';
import IconCar from '../../assets/img/icon-car.svg';
import IconBicycle from '../../assets/img/icon-moto.svg';
import IconTricycle from '../../assets/img/icon-tricycle.svg';
import homeStyles from '../style';

const AvailableVehiclesScreen = () => {
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Float button ===============
  const [showBackToTop, setShowBackToTop] = useState(false);
  const flatListRef = useRef(null);
  // =============== Get data ===============
  const [isLoading, setIsLoading] = useState(true);
  const vehicles = [
    { 'id': 1, 'mark': 'Mercedes Benz', 'model': 'ML500', 'number': 'KN156540C', 'driver': 'Daniel craig', 'type': 'Car' },
    { 'id': 2, 'mark': 'Yamaha', 'model': 'R1M', 'number': 'KN027725C', 'driver': 'Natasha Romanov', 'type': 'Bicycle' },
    { 'id': 3, 'mark': 'Toyota Land-Cruiser', 'model': 'Rav4', 'number': 'KN999039C', 'driver': 'Clark Kent', 'type': 'Car' },
    { 'id': 4, 'mark': 'Peugeot', 'model': 'E-208', 'number': 'KN852400C', 'driver': 'Lois Lane', 'type': 'Car' },
    { 'id': 5, 'mark': 'Kawasaki', 'model': 'Z650', 'number': 'KN540111C', 'driver': 'John Travolta', 'type': 'Bicycle' },
    { 'id': 6, 'mark': 'Heibei', 'model': 'Tao 5554', 'number': 'KN100009C', 'driver': 'Kara Danvers', 'type': 'Tricycle' },
    { 'id': 7, 'mark': 'Enduro', 'model': 'WR250F', 'number': 'KN245788C', 'driver': 'Frank Castel', 'type': 'Moto' },
    { 'id': 8, 'mark': 'TukTuk', 'model': '3380X', 'number': 'KN888801C', 'driver': 'Steeve Rogers', 'type': 'Tricycle' },
    { 'id': 9, 'mark': 'Honda Concerto', 'model': '1.8 TD PACK 5P', 'number': 'KN323200C', 'driver': 'Hall Berry', 'type': 'Car' },
    { 'id': 10, 'mark': 'Fiat Moretti', 'model': '500L', 'number': 'KN003487C', 'driver': 'Xavier Lacklan', 'type': 'Car' },
  ];
  // const vehicles = [];

  // =============== Refresh control ===============
  const onRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); }, 2000);
  }, []);

  // =============== Handle "scroll top" button ===============
  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const isAtTop = contentOffset.y === 0;

    setShowBackToTop(!isAtTop);
  };

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  // =============== Book Item ===============
  const VehicleItem = ({ item }) => {
    // =============== Language ===============
    const { t } = useTranslation();

    return (
      <>
        <TouchableOpacity style={[homeStyles.workTop, { marginBottom: PADDING.p00 }]}>
          <View style={{ marginRight: PADDING.p01 }}>
            {item.type === 'Car' ?
              <IconCar width={100} height={57.38} /> : (
                item.type === 'Bicycle' ?
                  <IconBicycle width={87} height={61} /> :
                  <IconTricycle width={100} height={57.38} />
              )
            }
          </View>
          <View style={homeStyles.workDescTop}>
            <Text style={homeStyles.workTitle} numberOfLines={2}>{item.mark + ' ' + item.model}</Text>
            <Text style={homeStyles.workContent}><Text style={{ fontWeight: '700' }}>{t('number')}</Text>: {item.number}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: PADDING.p00 }}>
              <Icon name='account' size={IMAGE_SIZE.s03} style={{ marginRight: PADDING.p00 }} />
              <Text style={homeStyles.workContent}>{item.driver}</Text>
            </View>
          </View>
          <Icon name='chevron-right' size={IMAGE_SIZE.s10} />
        </TouchableOpacity>
        <Divider style={{ backgroundColor: COLORS.dark_secondary }} />
      </>
    )
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: PADDING.p05 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        {/* Open drawer */}
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Icon name='menu' color={COLORS.black} style={{ fontSize: 28, marginVertical: 7 }} />
        </TouchableOpacity>

        {/* Brand / Title */}
        <View style={homeStyles.authlogo}>
          <TextBrand width={230} height={74} />
        </View>
        <Text style={homeStyles.noteTitle}>{t('find_vehicles')}</Text>

        {/* Change position */}
        <Button style={[homeStyles.authButton, { backgroundColor: COLORS.yellow }]} onPress={() => navigation.navigate('Home', { screen: 'HomeStack' })}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name='arrow-left' color={COLORS.black} style={{ fontSize: TEXT_SIZE.normal, marginRight: PADDING.p01 }} />
            <Text style={[homeStyles.authButtonText, { color: COLORS.black }]}>{t('change_position')}</Text>
          </View>
        </Button>

        {/* Type my destination */}
        <View style={homeStyles.searchContainer}>
          <View style={[homeStyles.searchInput, { borderColor: COLORS.purple }]}>
            <TextInput placeholder={t('give_destination')} placeholderTextColor={COLORS.dark_secondary} onChangeText={text => searchData(text)} style={homeStyles.searchInputText} />
            <TouchableOpacity style={[homeStyles.searchInputSubmit, { backgroundColor: COLORS.purple, borderColor: COLORS.purple }]} onPress={() => handleButtonPress(inputValue)}>
              <Icon name='magnify' color={COLORS.white} size={IMAGE_SIZE.s05} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating button */}
        {showBackToTop && (
          <TouchableOpacity style={[homeStyles.floatingButton, { backgroundColor: COLORS.purple_transparent }]} onPress={scrollToTop}>
            <Icon name='chevron-double-up' size={IMAGE_SIZE.s09} style={{ color: COLORS.purple }} />
          </TouchableOpacity>
        )}

        {/* Vehicles list */}
        <View style={[homeStyles.cardEmpty, { height: 350, padding: 0 }]}>
          <FlatList
            ref={flatListRef}
            data={vehicles}
            extraData={vehicles}
            keyExtractor={item => item.id}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            windowSize={10}
            ListEmptyComponent={() => {
              return (
                <View style={[homeStyles.cardEmpty, { display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }]}>
                  <Text style={homeStyles.cardEmptyTitle}>{t('empty_list.title')}</Text>
                  <Text style={[homeStyles.cardEmptyText, { marginBottom: 25, textAlign: 'center' }]}>{t('empty_list.description')}</Text>
                </View>
              )
            }}
            renderItem={({ item }) => {
              return (<VehicleItem item={item} />);
            }}
            refreshControl={<RefreshControl refreshing={!isLoading} onRefresh={onRefresh} />} />
        </View>

        {/* Footer content */}
        <Divider style={{ backgroundColor: COLORS.dark_secondary, marginBottom: PADDING.p05 }} />
        <FooterComponent />
      </View>
    </View>
  )
}

export default AvailableVehiclesScreen