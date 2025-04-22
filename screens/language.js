/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../tools/constants';
import i18next, { languageResources } from '../services/i18next';
import languagesList from '../services/languagesList.json'
import homeStyles from './style';

const LanguageScreen = () => {
    // =============== Navigation ===============
    const navigation = useNavigation();
    // =============== Language ===============
    const { t } = useTranslation();
    // =============== Function to select language ===============
    const selectLanguage = (lang) => {
        i18next.changeLanguage(lang);
        navigation.goBack();
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={homeStyles.langView}>
                <FlatList data={Object.keys(languageResources)} renderItem={({ item }) => (
                    <TouchableOpacity style={homeStyles.langButton} onPress={() => selectLanguage(item)}>
                        <Text style={{ fontSize: 21, color: COLORS.purple }}>{languagesList[item].nativeName}</Text>
                    </TouchableOpacity>
                )} />
            </View>
        </View>
    );
};

export default LanguageScreen;