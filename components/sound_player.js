/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { PADDING, TEXT_SIZE } from '../tools/constants';
import useColors from '../hooks/useColors';

const SoundPlayer = ({ audioUrl, color }) => {
    // =============== Colors ===============
    const COLORS = useColors();
    // =============== Language ===============
    const { t } = useTranslation();
    // =============== Get data ===============
    const [isPlaying, setIsPlaying] = useState(false); // Player state
    const [duration, setDuration] = useState(0); // Total duration
    const [currentTime, setCurrentTime] = useState(0); // Current playing time
    const [volume, setVolume] = useState(1); // Volume (from 0 to 1)
    const [sound, setSound] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // =============== Create audio object only once on audioUrl change ===============
    useEffect(() => {
        if (audioUrl) {
            const decodedAudioUrl = decodeURIComponent(audioUrl);
            console.log('Audio URL décodée:', decodedAudioUrl);

            // Set the category for playback (optional but recommended)
            Sound.setCategory('Playback');

            // Create a new audio instance
            const newSound = new Sound(decodedAudioUrl, null, (error) => {
                if (error) {
                    console.log('Erreur de lecture audio:', error);
                    return;
                }

                setIsLoaded(true);
                // Set audio instance in state
                setSound(newSound);

                // Successfully loaded, get duration
                newSound.getDuration((duration) => {
                    setDuration(duration);
                    console.log('Duration:', duration);
                });
            });

            // Cleanup function to release the audio when the component is unmounted
            return () => {
                if (sound) {
                    sound.release();
                }
            };
        } else {
            console.log('Aucune URL audio fournie.');
        }
    }, [audioUrl]);

    // =============== Play or Pause functionality ===============
    const togglePlayPause = () => {
        if (!sound) {
      return;
    }

    if (isPlaying) {
      sound.pause(() => {
        setIsPlaying(false);
      });
    } else {
      sound.play((success) => {
        if (success) {
          console.log('successfully finished playing');
          setIsPlaying(false); // Reset play state when finished
        } else {
          console.log('playback failed due to audio decoding errors');
          setIsPlaying(false);
        }
      });
      setIsPlaying(true);
    }
    };

    // =============== Update the progress bar every second while playing ===============
    useEffect(() => {
        if (isPlaying && audio) {
            const intervalId = setInterval(() => {
                audio.getCurrentTime((currentTime) => {
                    setCurrentTime(currentTime);
                });
            }, 1000);

            return () => clearInterval(intervalId);  // Cleanup the interval on unmount or when paused
        }
    }, [isPlaying, audio]);

    // =============== Handle progress change ===============
    const handleProgress = (time) => {
        if (!audio) return;
        setCurrentTime(time);
        audio.setCurrentTime(time);
    };

    // =============== Handle volume change ===============
    const handleVolumeChange = (newVolume) => {
        if (!audio) return;
        setVolume(newVolume);
        audio.setVolume(newVolume);
    };

    // =============== Format time in minutes:seconds ===============
    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    };

    return (
        <View style={{ backgroundColor: COLORS.light_secondary, padding: PADDING.p02, marginTop: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>
            {/* 1️⃣ Play/Pause button */}
            <Pressable onPress={togglePlayPause}>
                <Icon name={isPlaying ? 'play' : 'pause'} size={40} color={color} />
            </Pressable>

            {/* 2️⃣ Progress bar */}
            <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Slider
                    style={{ height: 40 }}
                    value={currentTime}  // Bind currentTime to Slider
                    minimumValue={0}
                    maximumValue={duration}
                    minimumTrackTintColor={COLORS.success}
                    maximumTrackTintColor={COLORS.link_color}
                    onValueChange={handleProgress}
                />
            </View>

            {/* 3️⃣ Elapsed time / Total time */}
            <Text style={{ color: COLORS.black, fontSize: TEXT_SIZE.normal }}>
                {`${formatTime(currentTime)} / ${formatTime(duration)}`}
            </Text>

            {/* 4️⃣ Volume control */}
            <Pressable onPress={() => handleVolumeChange(volume === 0 ? 1 : 0)}>
                <Icon name={volume === 0 ? 'volume-off' : 'volume-high'} size={25} color={COLORS.primary} />
            </Pressable>
        </View>
    );
};

export default SoundPlayer;
