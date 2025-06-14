/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Slider } from 'react-native';
import Audio from 'react-native-sound';
import { Icon } from 'react-native-vector-icons/MaterialCommunityIcons';
import { PADDING, TEXT_SIZE } from '../tools/constants';
import useColors from '../hooks/useColors';

const AudioPlayer = ({ audioUrl, color, isOwnMessage }) => {
    // =============== Colors ===============
    const COLORS = useColors();
    // =============== Get data ===============
    const [isPlaying, setIsPlaying] = useState(false); // Player state
    const [duration, setDuration] = useState(0); // Totale duration
    const [currentTime, setCurrentTime] = useState(0); // Current playing time
    const [volume, setVolume] = useState(1); // Volume (from 0 to 1)
    const [audio, setAudio] = useState(null);

    useEffect(() => {
        const sound = new Audio(audioUrl, (error) => {
            if (error) {
                console.log('Erreur de lecture audio', error);
            }
        });

        // Initialize the total duration
        sound.getDuration((duration) => setDuration(duration));

        setAudio(sound);

        return () => {
            sound.release();
        };
    }, [audioUrl]);

    // Play or pause audio
    const togglePlayPause = () => {
        if (isPlaying) {
            audio.pause();

        } else {
            audio.play((success) => {
                if (success) {
                    setIsPlaying(true);
                } else {
                    console.log('Erreur de lecture audio');
                }
            });
        }
    };

    // Handle progress
    const handleProgress = (time) => {
        setCurrentTime(time);
        audio.setCurrentTime(time);
    };

    // Audio update
    const updateProgress = () => {
        audio.getCurrentTime((currentTime) => {
            setCurrentTime(currentTime);
        });
    };

    // Interval to update the progress bar
    useEffect(() => {
        if (isPlaying) {
            const intervalId = setInterval(updateProgress, 1000);
            return () => clearInterval(intervalId);
        }
    }, [isPlaying]);

    // Volume handling
    const handleVolumeChange = (newVolume) => {
        setVolume(newVolume);
        audio.setVolume(newVolume);
    };

    return (
        <View
            style={{
                backgroundColor: COLORS.light_secondary,
                padding: PADDING.p02,
                marginTop: 10,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            {/* 1️⃣ Play/Pause button */}
            <Pressable onPress={togglePlayPause}>
                <Icon
                    name={isPlaying ? 'pause' : 'play'}
                    size={40}
                    color={color}
                />
            </Pressable>

            {/* 2️⃣ Progress bar */}
            <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Slider
                    style={{ height: 40 }}
                    value={currentTime}
                    minimumValue={0}
                    maximumValue={duration}
                    onValueChange={handleProgress}
                />
            </View>

            {/* 3️⃣ Elapsed time / Total time */}
            <Text style={{ color: COLORS.black, fontSize: TEXT_SIZE.normal }}>
                {`${formatTime(currentTime)} / ${formatTime(duration)}`}
            </Text>

            {/* 4️⃣ Volume icon */}
            <Pressable onPress={() => handleVolumeChange(volume === 0 ? 1 : 0)}>
                <Icon name={volume === 0 ? 'volume-off' : 'volume-high'} size={25} color={COLORS.primary} />
            </Pressable>
        </View>
    );
};

// Format time in minute:second
const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

export default AudioPlayer;
