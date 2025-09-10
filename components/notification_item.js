/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { IMAGE_SIZE, PADDING, TEXT_SIZE } from '../tools/constants';
import { getTranslationKeyFromAlias } from '../utils/notificationMapper';
import useColors from '../hooks/useColors';

const NotificationItemComponent = ({ item, onPress }) => {
    // =============== Colors ===============
    const COLORS = useColors();
    // =============== Navigation ===============
    const navigation = useNavigation();
    // =============== Language ===============
    const { t } = useTranslation();

    // =============== Message ===============
    let message = '';

    if (item.text_content) {
        // ✅ Notification already read: use text_content
        message = t(item.text_content, {
            username: `${item.from_user?.firstname} ${item.from_user?.lastname}`,
            event_title: item.event?.event_title,
            organisation_name: item.organization?.org_name,
            circle_name: item.circle?.circle_name,
            count: item.group_count || 1,
        });
    } else {
        // 🔁 Unread notification: dynamically rebuild
        let entity = null;

        if (['subscription_notif', 'work_consultation_notif', 'liked_work_notif', 'liked_message_notif'].includes(item.type.alias)) {
            entity = item.group_entity || 'one';

        } else if (item.circle_id) {
            entity = 'cercle';

        } else if (item.event_id) {
            entity = 'event';
        }

        const translationKey = getTranslationKeyFromAlias(item.type.alias, entity);

        message = t(translationKey, {
            username: `${item.from_user?.firstname} ${item.from_user?.lastname}`,
            event_title: item.event?.event_title,
            organisation_name: item.organization?.org_name,
            circle_name: item.circle?.circle_name,
            count: item.group_count || 1,
        });
    }

    // Adjust icon name
    const cleanIconName = (icon) => {
        // Separates the string by space and takes the last part, without the prefix
        const iconParts = icon.split(' ');  // Separates the prefix and the icon name
        return iconParts[iconParts.length - 1].replace(/^fa-/, '');  // Remove "fa-" if necessary
    };

    return (
        <TouchableOpacity style={{ flex: 1, paddingVertical: PADDING.p00, paddingHorizontal: PADDING.p01 }} onPress={() => onPress(item)}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Icon name={cleanIconName(item.type.icon)} size={IMAGE_SIZE.s09} color={COLORS.black} style={{ marginRight: PADDING.p01 }} />
                <Text style={{ color: COLORS.black }}>{message}</Text>
            </View>
            <Text style={{ fontSize: TEXT_SIZE.label, color: COLORS.dark_secondary, alignSelf: 'flex-end' }}>{item.created_at_explicit}</Text>
        </TouchableOpacity>
    );
};

export default NotificationItemComponent;