/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { IMAGE_SIZE, PADDING } from '../tools/constants';
import useColors from '../hooks/useColors';
import homeStyles from '../screens/style';

const WorkItemComponent = ({ item }) => {
    // =============== Colors ===============
    const COLORS = useColors();
    // =============== Navigation ===============
    const navigation = useNavigation();
    // =============== Language ===============
    const { t } = useTranslation();

    if (item.id === 'ad') {
        // If it is the "advertisement" object, we display the advertisement component
        return (
            <SafeAreaView style={[homeStyles.workTop, { backgroundColor: COLORS.white, marginBottom: PADDING.p01, paddingHorizontal: PADDING.p03 }]}>
                <View>
                    <Image source={{ uri: item.image_url }} style={[homeStyles.newsImage, { width: Dimensions.get('window').width / 2.5, height: 'auto', borderColor: COLORS.light_secondary }]} />
                </View>
                <View style={homeStyles.workDescTop}>
                    <Text style={[homeStyles.newsContent, { color: COLORS.black }]} numberOfLines={4}>{item.message}</Text>
                    {item.website_url &&
                        <TouchableOpacity style={homeStyles.linkIcon} onPress={() => navigation.navigate('Subscription', { itemId: item.realId })}>
                            <Text style={[homeStyles.link, { color: COLORS.link_color }]}>{t('see_details')} </Text>
                            <Icon name='chevron-right' size={IMAGE_SIZE.s05} color={COLORS.link_color} />
                        </TouchableOpacity>
                    }
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={[homeStyles.workTop, { backgroundColor: COLORS.white, marginBottom: PADDING.p01, padding: PADDING.p03 }]}>
            <View>
                <Image source={{ uri: item.photo_url }} style={[homeStyles.workImage, { borderColor: COLORS.light_secondary }]} />
            </View>
            <View style={homeStyles.workDescTop}>
                <Text style={[homeStyles.workTitle, { color: COLORS.black }]} numberOfLines={3}>{item.work_title}</Text>
                <Text style={[homeStyles.workContent, { color: COLORS.black }]} numberOfLines={3}>{item.work_content}</Text>
                <TouchableOpacity style={homeStyles.linkIcon} onPress={() => navigation.navigate('WorkData', { itemId: item.id })}>
                    <Text style={[homeStyles.link, { color: COLORS.link_color }]}>{t('see_details')} </Text>
                    <Icon name='chevron-right' size={IMAGE_SIZE.s05} color={COLORS.link_color} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default WorkItemComponent;