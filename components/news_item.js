/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome6';
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

    // Limit number of characters of string
    const limitCharacter = (text, count) => {
        return text.slice(0, count) + (text.length > count ? '...' : '');
    };

    // Adjust icon name
    const cleanIconName = (icon) => {
        // Separates the string by space and takes the last part, without the prefix
        const iconParts = icon.split(' ');  // Separates the prefix and the icon name
        return iconParts[iconParts.length - 1].replace(/^fa-/, '');  // Remove "fa-" if necessary
    };

    return (
        <Pressable style={[homeStyles.workTop, { backgroundColor: COLORS.white, marginBottom: PADDING.p01, paddingHorizontal: PADDING.p03 }]}>
            <View style={homeStyles.workDescTop}>
                <Text style={[homeStyles.newsContent, { color: COLORS.black }]} numberOfLines={3}>{item.work_content}</Text>
                <View style={[homeStyles.workTop, { paddingVertical: 0 }]}>
                    <View style={[homeStyles.workTop, { paddingVertical: 0 }]}>
                        <Icon name={cleanIconName(item.organization.type.icon)} size={IMAGE_SIZE.s01} color={COLORS.danger} style={{ marginRight: PADDING.p00 }} />
                        <Text style={[homeStyles.newsDate, { color: COLORS.dark_secondary }]}>
                            {item.organization ? item.organization.org_acronym : limitCharacter(item.organization.org_name, 10)}
                        </Text>
                    </View>
                    <Text style={[homeStyles.newsDate, { color: COLORS.dark_secondary }]}>{item.updated_at_ago}</Text>
                </View>
            </View>
            <View>
                <Image source={{ uri: item.photo_url }} style={[homeStyles.newsImage, { borderColor: COLORS.light_secondary }]} />
            </View>
        </Pressable>
    );
};

export default NewsItemComponent;