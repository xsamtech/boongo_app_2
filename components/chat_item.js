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
    const COLORS = useColors();
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('NewChatScreen', {
            chat_id: item.chat_id, // ou autre paramètre
        });
    };

    return (
        <TouchableOpacity onPress={handlePress} style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: PADDING.p03,
            borderBottomWidth: 1,
            borderColor: COLORS.light_secondary,
            backgroundColor: COLORS.white
        }}>
            <Image
                source={{ uri: item.avatar_url }}
                style={{
                    width: IMAGE_SIZE.s16,
                    height: IMAGE_SIZE.s16,
                    borderRadius: IMAGE_SIZE.s16 / 2,
                    marginRight: PADDING.p03,
                    borderWidth: 1,
                    borderColor: COLORS.light_secondary
                }}
            />
            <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ color: COLORS.black, fontSize: TEXT_SIZE.paragraph, fontWeight: 'bold' }}>{`${item.entity_name}`}</Text>
                <Text numberOfLines={1} style={{ color: COLORS.dark_secondary }}>{`@${item.username}`}</Text>
            </View>
            <Icon name="chevron-right" size={IMAGE_SIZE.s05} color={COLORS.grey} />
        </TouchableOpacity>
    );
};

export default ChatItemComponent;