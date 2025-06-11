/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useColors from '../hooks/useColors';
import { IMAGE_SIZE, PADDING, TEXT_SIZE } from '../tools/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ChatItemComponent = ({ item }) => {
    // =============== Colors ===============
    const COLORS = useColors();
    // =============== Navigation ===============
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('NewChat', { chat_entity: item.entity, chat_entity_id: item.entity_id, chat_entity_name: item.entity_name, chat_entity_profile: item.entity_profile });
    };

    return (
        <TouchableOpacity onPress={handlePress} style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: PADDING.p03,
            backgroundColor: COLORS.white
        }}>
            <Image
                source={{ uri: item.entity_profile }}
                style={{
                    width: IMAGE_SIZE.s13,
                    height: IMAGE_SIZE.s13,
                    borderRadius: IMAGE_SIZE.s13 / 2,
                    marginRight: PADDING.p03,
                    borderWidth: 1,
                    borderColor: COLORS.light_secondary
                }}
            />
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text numberOfLines={1} style={{ color: COLORS.black, fontSize: TEXT_SIZE.paragraph, fontWeight: 'bold' }}>{`${item.entity_name}`}</Text>
                    <Text numberOfLines={1} style={{ color: COLORS.dark_secondary }}>{item.latest_at}</Text>
                </View>
                <Text numberOfLines={1} style={{ fontSize: TEXT_SIZE.label, color: COLORS.dark_secondary }}>{item.last_message}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default ChatItemComponent;