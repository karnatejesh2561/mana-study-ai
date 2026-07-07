import React, { useCallback, useRef } from 'react';
import { Dimensions, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
    onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const videoRef = useRef<any>(null);

    const handleEnd = useCallback(() => {
        onComplete();
    }, [onComplete]);

    const videoSource = isDark
        ? require('../../assets/videos/video-dark.mp4')
        : require('../../assets/videos/video-light.mp4');

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />
            <Video
                ref={videoRef}
                source={videoSource}
                style={styles.video}
                resizeMode="cover"
                repeat={false}
                rate={2.0}
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch="obey"
                onEnd={handleEnd}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        width,
        height,
    },
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
});
