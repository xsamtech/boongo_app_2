/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native'
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Sound from 'react-native-sound';
import axios from 'axios';
import { SearchContext } from '../contexts/SearchContext';
import useColors from '../hooks/useColors';
import homeStyles from './style';
import { PADDING } from '../tools/constants';

const DictionaryScreen = () => {
  // =============== Colors ===============
  const COLORS = useColors();
  // =============== Language ===============
  const { t } = useTranslation();
  // =============== Get data ===============
  const { searchQuery } = useContext(SearchContext);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!searchQuery) return;

    setIsLoading(true);
    setError('');
    setData(null);

    axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchQuery}`)
      .then(res => {
        setData(res.data[0]);
      })
      .catch(() => {
        setError(t('error_message.word_not_found'));
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [searchQuery]);

  const playSound = (url) => {
    if (!url) return;

    const sound = new Sound(url, null, (error) => {
      if (error) {
        console.log('Error loading sound:', error);
        return;
      }
      sound.play((success) => {
        if (!success) {
          console.log('Sound did not play');
        }
        sound.release(); // Frees the memory
      });
    });
  };

  if (!searchQuery) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
        <View style={{ flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingHorizontal: PADDING.p07 }}>
          <Icon name="alpha-i-circle-outline" size={50} color={COLORS.black} />
          <Text style={[homeStyles.dicoMessage, { color: COLORS.black }]}>{t('search_dictionary')}</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
        <View style={{ flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size={50} color={COLORS.info} style={{ marginTop: 20 }} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
        <View style={{ flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingHorizontal: PADDING.p07 }}>
          <Icon name="alert-outline" size={50} color={COLORS.black} />
          <Text style={[homeStyles.dicoMessage, { color: COLORS.black }]}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!data) return null;

  const firstAudio = data.phonetics?.find(p => p.audio)?.audio;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.light_secondary }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[homeStyles.dicoContainer, { flexGrow: 1 }]}>
        <View style={homeStyles.dicoHeader}>
          <Text style={[homeStyles.dicoWord, { color: COLORS.black }]}>{data.word}</Text>
          {firstAudio && (
            <TouchableOpacity onPress={() => playSound(firstAudio)}>
              <Icon name="volume-high" size={28} color={COLORS.info} style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          )}
        </View>

        {data.phonetic && <Text style={[homeStyles.dicoPhonetic, { color: COLORS.black }]}>{data.phonetic}</Text>}

        {data.meanings?.map((meaning, idx) => (
          <View key={idx} style={homeStyles.dicoMeaningSection}>
            <Text style={[homeStyles.dicoPartOfSpeech, { color: COLORS.black }]}>{meaning.partOfSpeech}</Text>
            {meaning.definitions.map((def, i) => (
              <View key={i} style={homeStyles.dicoDefinitionBlock}>
                <Text style={[homeStyles.dicoDefinition, { color: COLORS.black }]}>• {def.definition}</Text>
                {def.example && <Text style={[homeStyles.dicoExample, { color: COLORS.black }]}>"{def.example}"</Text>}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default DictionaryScreen