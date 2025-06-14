/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useContext, useState } from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import FileViewer from 'react-native-file-viewer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Video from 'react-native-video';
import { API, IMAGE_SIZE, PADDING, TEXT_SIZE } from '../tools/constants';
import useColors from '../hooks/useColors';
import AudioPlayer from '../screens/audio_player';

const MessageItem = ({ item, isOwnMessage }) => {
    // =============== Colors ===============
    const COLORS = useColors();
    // =============== Navigation ===============
    const navigation = useNavigation();
    // =============== Language ===============
    const { t } = useTranslation();
    // =============== Get contexts ===============
    const { userInfo } = useContext(AuthContext);
    // =============== Get data ===============
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [likes, setLikes] = useState(item.likes || []);
    const [hasLiked, setHasLiked] = useState(false);

    // Redirect to the work on a specific page
    const handlePress = () => {
        if (item.doc_uri) {
            navigation.navigate('PDFViewer', {
                docUri: item.doc_uri,
                curPage: item.doc_page || 1, // First page if page number is NULL
            });
        }
    };

    const isDocMessage = item.doc_uri !== null && item.doc_uri !== ''; // Checking if this is a work document
    const hasExternalDocuments = item.documents && item.documents.length > 0;
    const hasImagesOrVideos = (item.images && item.images.length > 0) || (item.videos && item.videos.length > 0);
    const hasAudio = item.audios && item.audios.length > 0;

    // Rendering images and videos
    const renderImagesAndVideos = () => {
        const mediaFiles = [...(item.images || []), ...(item.videos || [])];
        const totalMedia = mediaFiles.length;

        if (totalMedia === 1) {
            return (
                <Pressable onPress={() => setSelectedMedia(mediaFiles[0])}>
                    <Image source={{ uri: mediaFiles[0].file_url }} style={{ width: '100%', height: 200, borderRadius: 10 }} />
                </Pressable>
            );
        }

        if (totalMedia === 2) {
            return (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {mediaFiles.map((media, index) => (
                        <Pressable key={index} onPress={() => setSelectedMedia(media)}>
                            <Image source={{ uri: media.file_url }} style={{ width: '48%', height: 100, borderRadius: 10 }} />
                        </Pressable>
                    ))}
                </View>
            );
        }

        if (totalMedia === 3) {
            return (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {mediaFiles.map((media, index) => (
                        <Pressable key={index} onPress={() => setSelectedMedia(media)}>
                            <Image source={{ uri: media.file_url }} style={{ width: '32%', height: 100, borderRadius: 10 }} />
                        </Pressable>
                    ))}
                </View>
            );
        }

        if (totalMedia >= 4) {
            return (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {mediaFiles.slice(0, 4).map((media, index) => (
                        <Pressable key={index} onPress={() => setSelectedMedia(media)} style={{ width: '48%', marginBottom: 10 }}>
                            <Image source={{ uri: media.file_url }} style={{ width: '100%', height: 100, borderRadius: 10 }} />
                        </Pressable>
                    ))}
                    {totalMedia > 4 && (
                        <View style={{
                            width: '48%', height: 100, backgroundColor: COLORS.dark_secondary, justifyContent: 'center', alignItems: 'center',
                            borderRadius: 10, position: 'relative'
                        }}>
                            <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold' }}>
                                +{totalMedia - 4}
                            </Text>
                        </View>
                    )}
                </View>
            );
        }
    };

    // Rendering of external documents
    const renderExternalDocuments = () => {
        if (hasExternalDocuments) {
            return item.documents.map((file, index) => (
                <Pressable key={index} onPress={() => FileViewer.open(file.file_url)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.light_secondary, borderRadius: 10, padding: PADDING.p02, marginTop: 10 }}>
                    <Text style={{ color: isOwnMessage ? COLORS.white : COLORS.black, fontSize: TEXT_SIZE.normal, fontWeight: '500' }}>
                        {file.file_name || t('document')}
                    </Text>
                    <Text
                        style={{
                            color: COLORS.primary,
                            fontSize: TEXT_SIZE.normal,
                            fontWeight: 'bold',
                            marginLeft: PADDING.p02,
                        }}
                    >
                        {t('open')}
                    </Text>
                </Pressable>
            ));
        }
        return null;
    };

    // Audio player rendering
    const renderAudioPlayer = () => {
        if (hasAudio) {
            return item.audios.map((audio, index) => (
                <AudioPlayer key={index} audioUrl={audio.file_url} color={COLORS.primary} />
            ));
        }
        return null;
    };

    // Check if the user has already liked the message
    useEffect(() => {
        setHasLiked(likes.some(like => like.user.id === userInfo.id));
    }, [likes, userInfo.id]);

    // Handle like/unlike
    const handleLike = async () => {
        const message_id = item.id;
        const user_id = userInfo.id;

        try {
            // Call the API to switch like status
            const response = await fetch(`${API.url}/message/switch_like/${message_id}/${user_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userInfo.api_token}`,
                    'Content-Type': 'application/json',
                },
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Une erreur est survenue');
            }

            // Update local state based on the response
            setLikes(responseData.data.likes); // Assuming likes come back in the response
            setHasLiked(responseData.data.likes.some(like => like.user.id === userInfo.id)); // Update liked status

        } catch (error) {
            Alert.alert(t('error'), t('error_message.cannot_switch_like'));
        }
    };

    // Likes rendering
    const renderLike = () => {
        return (
            <View style={{ position: 'absolute', bottom: (0 - PADDING.p01), zIndex: 999, right: PADDING.p01, flexDirection: 'row', alignItems: 'center' }}>
                <Pressable onPress={handleLike}>
                    <Icon name={hasLiked ? 'cards-heart' : 'cards-heart-outline'} size={IMAGE_SIZE.s05} color={hasLiked ? COLORS.danger : COLORS.light_secondary} />
                </Pressable>
                {likes.length > 0 && (
                    <Text style={{ marginLeft: PADDING.p00 }}>
                        {likes.length <= 99 ? likes.length : '99+'}
                    </Text>
                )}
            </View>
        );
    };

    // Rendering of the Modal
    const renderModal = () => {
        if (selectedMedia) {
            return (
                <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                        {selectedMedia.type === 'video' ? (
                            <Video source={{ uri: selectedMedia.file_url }} style={{ width: '90%', height: 300 }} controls={true} resizeMode='contain' />
                        ) : (
                            <Image source={{ uri: selectedMedia.file_url }} style={{ width: '90%', height: 300, borderRadius: 10 }} />
                        )}
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ position: 'absolute', top: PADDING.p07, right: PADDING.p07, padding: PADDING.p01, backgroundColor: COLORS.primary, borderRadius: PADDING.p07 }}>
                            <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>X</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            );
        }
        return null;
    };

    return (
        <View style={{ flexDirection: 'row', alignSelf: (isOwnMessage ? 'flex-end' : 'flex-start'), marginVertical: 4 }}>
            {!isOwnMessage && item.user.avatar_url && (
                <Image source={{ uri: item.user.avatar_url }} style={{ width: PADDING.p15, height: PADDING.p15, borderRadius: PADDING.p15 / 2, marginRight: PADDING.p01, }} />
            )}
            <View style={{ backgroundColor: (isOwnMessage ? COLORS.primary : COLORS.light_secondary), borderRadius: PADDING.p01, padding: PADDING.p01, marginVertical: 4, maxWidth: '80%', opacity: (isDocMessage ? 1 : 0.8), }}>
                {/* 1) Displaying images/videos, external documents or audio player */}
                {hasImagesOrVideos && renderImagesAndVideos()}
                {renderExternalDocuments()}
                {renderAudioPlayer()}

                {/* 2) Displaying the message text */}
                {item.message_content && (
                    <Text style={{ color: isOwnMessage ? COLORS.white : COLORS.black, fontSize: TEXT_SIZE.normal }}>
                        {item.message_content}
                    </Text>
                )}

                {/* 3) Display for a note about a work */}
                {isDocMessage && (
                    <Pressable
                        onPress={handlePress}
                        style={{ flexDirection: 'column', borderWidth: 1, borderColor: COLORS.light_secondary, borderRadius: PADDING.p01 }}>
                        <Text style={{ fontSize: TEXT_SIZE.normal, fontWeight: '500' }}>{item.doc_title}</Text>
                        <Text style={{ fontSize: TEXT_SIZE.label }}>{`${t('page')}: ${item.doc_page}`}</Text>
                    </Pressable>
                )}

                {/* 4) Displaying likes */}
                {renderLike()}

                {/* Modal to enlarge an image */}
                {renderModal()}
            </View>
        </View>
    );
};

export default MessageItem;