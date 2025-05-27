/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React from 'react';
import { View, Text } from 'react-native';
import useColors from '../hooks/useColors';
import { PADDING } from '../tools/constants';

const MessageItem = ({ item, isOwnMessage }) => {
    const COLORS = useColors();

    return (
        <View style={{
            alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
            backgroundColor: isOwnMessage ? COLORS.primary : COLORS.light_secondary,
            borderRadius: 10,
            padding: PADDING.p03,
            marginVertical: 4,
            maxWidth: '80%',
        }}>
            <Text style={{ color: isOwnMessage ? COLORS.white : COLORS.black }}>
                {item.message_content}
            </Text>
        </View>
    );
};

export default MessageItem;