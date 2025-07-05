import React, { useEffect, useState } from 'react';
import {
    Modal, View, TouchableOpacity, StyleSheet,
    Image, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import ImageViewer from 'react-native-image-zoom-viewer';
import useColors from '../hooks/useColors';

const { width, height } = Dimensions.get('window');

const GalleryModal = ({ visible, index = 0, files = [], onClose }) => {
    const COLORS = useColors();

    const safeIndex = Number.isInteger(index) && index >= 0 && index < files.length ? index : 0;
    const [currentIndex, setCurrentIndex] = useState(safeIndex);
    const [shouldPlay, setShouldPlay] = useState(false);

    const currentFile = files[currentIndex] || {};
    const isVideo = currentFile?.type === 'video';
    const videoUri = encodeURI(currentFile?.uri || '');

    const mediaSources = files.map(file => ({ url: file.uri }));

    useEffect(() => {
        if (visible && isVideo) {
            setShouldPlay(true);
        } else {
            setShouldPlay(false);
        }
    }, [visible, isVideo]);

    useEffect(() => {
        if (!visible) {
            setCurrentIndex(safeIndex); // Reset index when modal is closed
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent>
            <View style={[styles.container, { backgroundColor: COLORS.black }]}>
                <TouchableOpacity
                    onPress={onClose}
                    style={[styles.closeBtn, { backgroundColor: COLORS.dark_secondary }]}
                >
                    <Icon name="close" size={28} color={COLORS.white} />
                </TouchableOpacity>

                <ImageViewer
                    imageUrls={mediaSources}
                    index={currentIndex}
                    enableSwipeDown
                    onSwipeDown={onClose}
                    renderIndicator={() => null}
                    backgroundColor="black"
                    onChange={newIndex => {
                        setCurrentIndex(newIndex);
                    }}
                    renderImage={props => (
                        <Image
                            source={{ uri: encodeURI(files[currentIndex]?.uri || '') }}
                            style={{ flex: 1, resizeMode: 'contain' }}
                        />
                    )}
                />

                {isVideo && (
                    <View style={StyleSheet.absoluteFill}>
                        <Video
                            key={videoUri}
                            source={{ uri: videoUri }}
                            style={{ flex: 1 }}
                            controls
                            resizeMode="contain"
                            paused={!shouldPlay}
                            onError={e => console.log('Video error:', e)}
                        />
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    closeBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 5,
        borderRadius: 19,
    },
});

export default GalleryModal;
