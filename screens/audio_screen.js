/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useCallback, useState } from 'react';
import { Dimensions, Image, RefreshControl, ScrollView, Text, View } from 'react-native';
import { PADDING } from '../tools/constants';
import HeaderComponent from './header';
import useColors from '../hooks/useColors';
import homeStyles from './style';
import SoundPlayer from '../components/sound_player';

const AudioScreen = ({ route }) => {
    // =============== Colors ===============
    const COLORS = useColors();
    // =============== Get parameters ===============
    const { audioTitle, audioUrl, mediaCover } = route.params;
    // =============== Get data ===============
    const mWidth = Dimensions.get('window').width / 1.7;

    return (
        <>
            {/* Header */}
            <View style={{ paddingVertical: PADDING.p01, backgroundColor: COLORS.white }}>
                <HeaderComponent />
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50, backgroundColor: COLORS.white }}>
                {/* Media cover */}
                <View style={[homeStyles.workTop, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                    <View style={homeStyles.workDescTop}>
                        <Text style={[homeStyles.workTitle, { width: Dimensions.get('window').width - 10, color: COLORS.black, textAlign: 'center' }]}>{audioTitle}</Text>
                    </View>
                    <View style={{ paddingHorizontal: PADDING.p01 }}>
                        <Image source={{ uri: mediaCover }} style={[homeStyles.workImage, { width: Dimensions.get('window').width - 20, height: mWidth * 1.6 }]} />
                    </View>
                </View>

                {/* Audio player */}
                <View style={{ paddingHorizontal: PADDING.p05 }}>
                    <SoundPlayer audioUrl={audioUrl} color={COLORS.black} />
                </View>
            </ScrollView>
        </>
    );
};

export default AudioScreen;
