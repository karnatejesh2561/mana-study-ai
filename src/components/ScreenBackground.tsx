import React from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

interface Props {
    children?: React.ReactNode;
}

export function ScreenBackground({ children }: Props) {
    const theme = useTheme();
    const backgroundColor = theme.dark ? DARK_THEME.background : LIGHT_THEME.background;

    // NOTE: place your background image file at `src/assets/background-image.png` (or update the path below)
    const bgSource = require('../../assets/background-image.png');

    // Use the decorative image only in light mode for readability in dark mode.
    if (!theme.dark) {
        return (
            <ImageBackground source={bgSource} style={styles.container} imageStyle={styles.image} resizeMode="cover">
                <View style={styles.inner}>{children}</View>
            </ImageBackground>
        );
    }

    // Dark mode: plain themed background for better contrast.
    return <View style={[styles.inner, { backgroundColor }]}>{children}</View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    inner: {
        flex: 1,
    },
});
