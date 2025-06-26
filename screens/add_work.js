/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, FlatList } from 'react-native';
import { Button, Checkbox, RadioButton } from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import LogoText from '../assets/img/brand.svg';
import useColors from '../hooks/useColors';
import { useTranslation } from 'react-i18next';
import { API, PADDING } from '../tools/constants';
import homeStyles from './style';

const AddWorkScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();

  // =============== Language ===============
  const { t } = useTranslation();

  // =============== State variables ===============
  const [workTitle, setWorkTitle] = useState(null);
  const [workContent, setWorkContent] = useState(null);
  const [workUrl, setWorkUrl] = useState(null);
  const [videoSource, setVideoSource] = useState('YouTube');
  const [mediaLength, setMediaLength] = useState(null);
  const [author, setAuthor] = useState(null);
  const [editor, setEditor] = useState(null);
  const [consultationPrice, setConsultationPrice] = useState(null);
  const [numberOfHours, setNumberOfHours] = useState(null);
  const [isPublic, setIsPublic] = useState(0);
  const [files, setFiles] = useState([]);

  const [currency, setCurrency] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [types, setTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // =============== Fetch Data ===============
  useEffect(() => {
    // Fetch Types (Radio Buttons)
    axios.get(`${API.boongo_url}/type/find_by_group/Type d'œuvre`)
      .then((response) => {
        const typeList = response.data.data.map(item => ({
          value: item.id,
          label: item.type_name,
        }));
        setTypes(typeList);
      })
      .catch((error) => {
        console.log(error);
      });

    // Fetch Currencies (Dropdown)
    axios.get(`${API.boongo_url}/currency`)
      .then((response) => {
        const currencyList = response.data.data.map(item => ({
          value: item.id,
          label: item.currency_name,
        }));
        setCurrencies(currencyList);
      })
      .catch((error) => {
        console.log(error);
      });

    // Fetch Categories (Checkboxes)
    axios.get(`${API.boongo_url}/category/find_by_group/Catégorie pour œuvre`)
      .then((response) => {
        const categoryList = response.data.data.map(item => ({
          value: item.id,
          label: item.category_name,
        }));
        setCategories(categoryList);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // =============== Handle File Selection ===============
  const pickFiles = async () => {
    try {
      const selectedFiles = await DocumentPicker.pick({
        allowMultiSelection: true, // Permet la sélection multiple
        type: [DocumentPicker.types.allFiles], // Tous types de fichiers
      });
      setFiles([...files, ...selectedFiles]); // Ajouter les nouveaux fichiers à la liste
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.log(err);
      }
    }
  };

  // =============== Handle Form Submit ===============
  const handleSubmit = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('work_title', workTitle);
    formData.append('work_content', workContent);
    formData.append('work_url', workUrl);
    formData.append('video_source', videoSource);
    formData.append('media_length', mediaLength);
    formData.append('author', author);
    formData.append('editor', editor);
    formData.append('is_public', isPublic);
    formData.append('consultation_price', consultationPrice);
    formData.append('number_of_hours', numberOfHours);
    formData.append('currency_id', currency);
    formData.append('type_id', selectedType);

    // Ajouter les catégories sélectionnées
    formData.append('categories_ids', selectedCategories);

    // Envoi des fichiers
    files.forEach(file => {
      formData.append('files_urls[]', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
    });

    try {
      const response = await fetch(`${API.boongo_url}/work/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      console.log(result);
      // Traitez la réponse ici

    } catch (error) {
      console.error('Error:', error);
    }

    setIsLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: PADDING.p10, paddingHorizontal: PADDING.p10 }}>
        {/* Brand / Title */}
        <View style={homeStyles.authlogo}>
          <LogoText width={200} height={48} />
        </View>
        <Text style={[homeStyles.authTitle, { color: COLORS.black, textAlign: 'center', marginBottom: PADDING.p12 }]}>{t('work.publish_new')}</Text>

        {/* Work Title */}
        <TextInput
          style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
          value={workTitle}
          placeholder="Title"
          onChangeText={setWorkTitle} />

        {/* Work Content */}
        <TextInput
          style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
          value={workContent}
          placeholder="Content"
          onChangeText={setWorkContent} />

        {/* Work URL */}
        <TextInput
          style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
          value={workUrl}
          placeholder="Work URL"
          onChangeText={setWorkUrl} />

        {/* Media Length */}
        <TextInput
          style={[homeStyles.authInput, { color: COLORS.black, borderColor: COLORS.light_secondary }]}
          value={mediaLength}
          placeholder="Media Length"
          onChangeText={setMediaLength} />

        {/* Currency Dropdown */}
        <Text style={{ color: COLORS.dark_secondary }}>Currency</Text>
        <Dropdown
          style={[homeStyles.authInput, { color: COLORS.black, height: 50, borderColor: COLORS.light_secondary }]}
          data={currencies}
          labelField="label"
          valueField="value"
          placeholder="Select currency"
          value={currency}
          onChange={(item) => setCurrency(item.value)} />

        {/* Type Radio Buttons */}
        <Text style={{ color: COLORS.dark_secondary }}>Type</Text>
        <RadioButton.Group onValueChange={setSelectedType} value={selectedType}>
          {types.map((type) => (
            <View key={type.value} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RadioButton value={type.value} />
              <Text>{type.label}</Text>
            </View>
          ))}
        </RadioButton.Group>

        {/* Categories Checkboxes */}
        <Text style={{ color: COLORS.dark_secondary }}>Categories</Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.value.toString()}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox
                status={selectedCategories.includes(item.value) ? 'checked' : 'unchecked'}
                onPress={() => {
                  if (selectedCategories.includes(item.value)) {
                    setSelectedCategories(selectedCategories.filter(id => id !== item.value));
                  } else {
                    setSelectedCategories([...selectedCategories, item.value]);
                  }
                }} />
              <Text>{item.label}</Text>
            </View>
          )}
        />

        {/* Submit Button */}
        <Button mode="contained" onPress={handleSubmit}>
          Submit
        </Button>
      </ScrollView>
    </View>
  );
};

export default AddWorkScreen;