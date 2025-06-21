/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useEffect, useState } from 'react'
import { Text, TouchableOpacity, SafeAreaView, View, TextInput, ScrollView, Platform, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { useTranslation } from 'react-i18next';
import DropDownPicker from 'react-native-dropdown-picker';
import Spinner from 'react-native-loading-spinner-overlay';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../../contexts/AuthContext';
import { API, PADDING } from '../../tools/constants';
import useColors from '../../hooks/useColors';
import homeStyles from '../style';

const SettingsScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Navigation ===============
  const navigation = useNavigation();
  // =============== Get contexts ===============
  const { userInfo, isLoading, updateAvatar, update } = useContext(AuthContext);
  // =============== Get data ===============
  const [firstname, setFirstname] = useState(userInfo.firstname);
  const [lastname, setLastname] = useState(userInfo.lastname);
  const [surname, setSurname] = useState(userInfo.surname);
  const [city, setCity] = useState(userInfo.city);
  const [address_1, setAddress1] = useState(userInfo.address_1);
  const [address_2, setAddress2] = useState(userInfo.address_2);
  const [p_o_box, setPOBox] = useState(userInfo.p_o_box);
  const [email, setEmail] = useState(userInfo.email);
  const [phone, setPhone] = useState(userInfo.phone);
  const [username, setUsername] = useState(userInfo.username);
  const [password, setPassword] = useState(null);
  const [confirm_password, setConfirmPassword] = useState(null);

  // =============== Image crop picker ===============
  const imagePick = () => {
    ImagePicker.openPicker({
      width: 700,
      height: 700,
      cropping: true,
      includeBase64: true
    }).then(image => {
      updateAvatar(userInfo.id, `data:${image.mime};base64,${image.data}`);
    }).catch(error => {
      console.log(`${error}`);
    });
  };

  // COUNTRY dropdown
  const [countryIsFocus, setCountryIsFocus] = useState(false);
  const [country, setCountry] = useState(userInfo.country ? userInfo.country.id : null);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const config = {
      method: 'GET',
      url: `${API.boongo_url}/country`,
      headers: {
        'X-localization': 'fr',
        Authorization: `Bearer ${userInfo.api_token}`,
      }
    };

    axios(config)
      .then(function (response) {
        const count = Object.keys(response.data.data).length;
        let countryArray = [];

        for (let i = 0; i < count; i++) {
          countryArray.push({
            value: response.data.data[i].id,
            label: response.data.data[i].country_name
          })
        }

        setCountries(countryArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  // GENDER dropdown
  const [genderOpen, setGenderOpen] = useState(false);
  const [gender, setGender] = useState(userInfo.gender);
  const [genderItems, setGenderItems] = useState([
    { label: t('auth.gender.male'), value: 'M' },
    { label: t('auth.gender.female'), value: 'F' }
  ]);

  // BIRTH DATE date-picker
  const [birthdate, setBirthdate] = useState(userInfo.birthdate);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Show/Hide Datepicker
  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  // On change, update date value
  const mOnChange = ({ type }, selectedDate) => {
    if (type === 'set') {
      const currentDate = selectedDate;

      setDate(currentDate);

      if (Platform.OS === 'android') {
        toggleDatePicker();
        setBirthdate(formatDate(currentDate));
      }

    } else {
      toggleDatePicker();
    }
  };

  // If Platform is iOS, customize cofirmation button
  const confirmIOSDate = () => {
    setBirthdate(formatDate(date));
    toggleDatePicker();
  };

  // Format Date according to MySQL
  const formatDate = (rawDate) => {
    let date = new Date(rawDate);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    return `${year}-${month}-${day}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      {/* Custom header */}
      <View style={{ flexDirection: 'row', paddingVertical: PADDING.p01 }}>
        <TouchableOpacity style={{ position: 'absolute', left: 7, top: 5, zIndex: 10 }} onPress={() => navigation.goBack()}>
          <Icon name='chevron-left' size={37} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={{ width: '100%', fontSize: 20, fontWeight: '400', textAlign: 'center', color: COLORS.warning }}>{`${userInfo.firstname} ${userInfo.lastname}`}</Text>
      </View>

      <ScrollView style={{ flexGrow: 1, paddingHorizontal: 30 }}>
        <Spinner visible={isLoading} />

        {/* Profil photo */}
        <View style={{ alignItems: 'center', marginVertical: PADDING.p01 }}>
          <Image style={{ width: 160, height: 160, borderRadius: 160 / 2 }} source={{ uri: userInfo.avatar_url }} />
          <TouchableOpacity style={{ backgroundColor: COLORS.primary, marginTop: -30, marginLeft: 100, borderRadius: 40 / 2, padding: PADDING.p01 }} onPress={imagePick}>
            <Icon name='lead-pencil' size={20} color='white' />
          </TouchableOpacity>
        </View>

        {/* Personal infos */}
        <View style={[homeStyles.cardEmpty, { marginBottom: PADDING.vertical, marginLeft: 0 }]}>
          {/* First name */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.firstname')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={firstname}
            placeholder={t('auth.firstname')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setFirstname(text)} />

          {/* Last name */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.lastname')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={lastname}
            placeholder={t('auth.lastname')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setLastname(text)} />

          {/* Surname */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.surname')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={surname}
            placeholder={t('auth.surname')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setSurname(text)} />

          {/* Username */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.username.label')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={username}
            placeholder={t('auth.username.label')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setUsername(text)} />

          {/* Gender  */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.gender.label')}</Text>
          <DropDownPicker
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            textStyle={{ color: COLORS.black }}
            placeholderStyle={{ color: COLORS.black }}
            arrowIconStyle={{ tintColor: COLORS.dark_secondary }}
            open={genderOpen}
            value={gender}
            placeholder={t('auth.gender.label')}
            placeholderTextColor={COLORS.dark_secondary}
            items={genderItems}
            setOpen={setGenderOpen}
            setValue={setGender}
            setItems={setGenderItems}
            listMode="SCROLLVIEW" />

          {/* Birth date */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.birthdate')}</Text>
          {showPicker && (
            <DateTimePicker
              mode='date'
              style={{ color: COLORS.black }}
              display='spinner'
              value={date}
              onChange={mOnChange}
              maximumDate={new Date('2018-1-1')} />
          )}
          {showPicker && Platform.OS === 'ios' && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity style={homeStyles.authCancel} onPress={toggleDatePicker}>
                <Text style={{ fontSize: 14, color: COLORS.black, textAlign: 'center' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={homeStyles.authButton} onPress={confirmIOSDate}>
                <Text style={homeStyles.authButtonText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          )}
          {!showPicker && (
            <TextInput
              style={homeStyles.authInput}
              value={birthdate}
              placeholder={t('auth.birthdate')}
              onChangeText={setBirthdate}
              onPressIn={toggleDatePicker} />
          )}

          {/* Country  */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.country.label')}</Text>
          <Dropdown
            style={[homeStyles.authInput, { height: 50 }]}
            textStyle={{ color: COLORS.black }}
            placeholderStyle={{ color: COLORS.black }}
            arrowIconStyle={{ tintColor: COLORS.black }}
            data={countries}
            search
            labelField='label'
            valueField='value'
            placeholder={!countryIsFocus ? t('auth.country.label') : '...'}
            searchPlaceholder={t('search')}
            maxHeight={300}
            value={country}
            onFocus={() => setCountryIsFocus(true)}
            onBlur={() => setCountryIsFocus(false)}
            onChange={item => {
              setCountry(item.value);
              setCountryIsFocus(false);
            }} />

          {/* City  */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.city')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={city}
            placeholder={t('auth.city')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setCity(text)} />

          {/* Address 1  */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.address_1')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={address_1}
            placeholder={t('auth.address_1')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setAddress1(text)} />

          {/* Address 2  */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.address_2')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={address_2}
            placeholder={t('auth.address_2')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setAddress2(text)} />

          {/* P.O. box */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.p_o_box')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={p_o_box}
            placeholder={t('auth.p_o_box')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setPOBox(text)} />

          {/* E-mail */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.email')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={email}
            placeholder={t('auth.email')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setEmail(text)} />

          {/* Phone number */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.phone')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={phone}
            placeholder={t('auth.phone')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setPhone(text)} />

          {/* Password */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.password.label')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={password}
            placeholder={t('auth.password.label')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setPassword(text)} secureTextEntry />

          {/* Confirm password */}
          <Text style={{ color: COLORS.dark_secondary, paddingVertical: 5, paddingHorizontal: PADDING.horizontal }}>{t('auth.confirm_password.label')}</Text>
          <TextInput
            style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
            value={confirm_password}
            placeholder={t('auth.confirm_password.label')}
            placeholderTextColor={COLORS.dark_secondary}
            onChangeText={text => setConfirmPassword(text)} secureTextEntry />

          {/* Submit */}
          <Button style={[homeStyles.authButton, { backgroundColor: COLORS.primary, marginTop: 16 }]} onPress={() => {
            update(userInfo.id, firstname, lastname, surname, gender, birthdate, city, address_1, address_2, p_o_box, email, phone, username, password, confirm_password, (country ? country.id : null), null, null);
            navigation.navigate('Account'); }}>
            <Text style={[homeStyles.authButtonText, { color: 'white' }]}>{t('update')}</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SettingsScreen