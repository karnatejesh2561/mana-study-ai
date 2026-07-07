import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

interface StatCardProps {
    value: string;
    label: string;
}

export function StatCard({ value, label }: StatCardProps) {
    const theme = useTheme();
    const isDark = theme.dark;
    const borderColor = isDark ? DARK_THEME.glassBorder : LIGHT_THEME.glassBorder;
    const bg = isDark ? DARK_THEME.surfaceAlt : LIGHT_THEME.surface;
    const valueColor = isDark ? DARK_THEME.blue : LIGHT_THEME.blue;
    const labelColor = isDark ? DARK_THEME.textSecondary : LIGHT_THEME.textSecondary;
    return (
        <View style={[styles.card, { borderColor, backgroundColor: bg }]}>
            <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
            <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    value: {
        fontSize: 24,
        fontWeight: '800',
    },
    label: {
        fontSize: 12,
    },
});
