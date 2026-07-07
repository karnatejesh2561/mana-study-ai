import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

interface TopBarProps {
    title: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
}

export function TopBar({ title, showBackButton = false, onBackPress }: TopBarProps) {
    const theme = useTheme();
    const bg = theme.dark ? DARK_THEME.backgroundAlt : LIGHT_THEME.backgroundAlt;
    const titleColor = theme.dark ? DARK_THEME.blue : LIGHT_THEME.blue;
    const iconColor = theme.dark ? DARK_THEME.icon : LIGHT_THEME.icon;

    return (
        <View
            style={[
                styles.root,
                { backgroundColor: bg, borderColor: theme.dark ? DARK_THEME.glassBorder : LIGHT_THEME.glassBorder },
            ]}
        >
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={showBackButton ? onBackPress : undefined}>
                <Icon name={showBackButton ? 'chevron-back' : 'menu'} size={20} color={iconColor} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
            <View style={styles.iconButton}>
                <Icon name="sparkles" size={18} color={theme.dark ? (LIGHT_THEME.goldenOrange ?? '#FFB547') : LIGHT_THEME.blue} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        height: 56,
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderColor: 'rgba(104, 143, 255, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        paddingHorizontal: 14,
    },
    iconButton: {
        height: 32,
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#3B86FF',
        fontSize: 19,
        fontWeight: '700',
    },
});
