import React from 'react';
import { Modal, View, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import ImageViewer from 'react-native-image-zoom-viewer';
import useColors from '../hooks/useColors';

const { width, height } = Dimensions.get('window');

const GalleryModal = ({ visible, index = 0, files = [], onClose }) => {
    const COLORS = useColors();

    const safeIndex = Number.isInteger(index) && index >= 0 && index < files.length ? index : 0;
    const currentFile = files[safeIndex] || {};
    const isVideo = currentFile?.type === 'video';

    const mediaSources = files.map(file => ({ url: file.uri }));

    return (
        <Modal visible={visible} transparent>
            <View style={[styles.container, { backgroundColor: COLORS.black }]}>
                <TouchableOpacity onPress={onClose} style={[styles.closeBtn, {backgroundColor: COLORS.dark_secondary}]}>
                    <Icon name="close" size={28} color={COLORS.white} />
                </TouchableOpacity>

                {isVideo ? (
                    <Video
                        source={{ uri: files[index].uri }}
                        style={{ width, height }}
                        controls={true}
                        resizeMode="contain"
                        paused={false}
                    />
                ) : (
                    <ImageViewer
                        imageUrls={mediaSources}
                        index={index}
                        enableSwipeDown
                        onSwipeDown={onClose}
                        renderIndicator={() => null}
                        backgroundColor="black"
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 2, padding: 5, borderRadius: 19 },
});

export default GalleryModal;
