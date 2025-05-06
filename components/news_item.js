/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { IMAGE_SIZE, PADDING } from '../tools/constants';
import useColors from '../hooks/useColors';
import homeStyles from '../screens/style';

const NewsItemComponent = ({ item }) => {
    // =============== Colors ===============
    const COLORS = useColors();
    // =============== Navigation ===============
    const navigation = useNavigation();
    // =============== Language ===============
    const { t } = useTranslation();

    return (
        <View style={[homeStyles.workTop, { backgroundColor: COLORS.white, marginBottom: PADDING.p01, paddingHorizontal: PADDING.p03 }]}>
            <View style={homeStyles.workDescTop}>
                <Text style={[homeStyles.workTitle, { color: COLORS.dark_secondary }]} numberOfLines={2}>{item.work_title}</Text>
                <Text style={[homeStyles.workContent, { color: COLORS.black }]} numberOfLines={4}>{item.work_content}</Text>
                <TouchableOpacity style={homeStyles.linkIcon} onPress={() => navigation.navigate('NewsData', { itemId: item.id })}>
                    <Text style={[homeStyles.link, { color: COLORS.link_color }]}>{t('see_details')} </Text>
                    <Icon name='chevron-right' size={IMAGE_SIZE.s05} color={COLORS.link_color} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default NewsItemComponent;