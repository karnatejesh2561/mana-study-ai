import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenBackground } from '../components/ScreenBackground';
import { TopBar } from '../components/TopBar';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';
import type { RootStackScreenProps } from '../types/navigation';

export function PrivacyPolicyScreen({ navigation }: RootStackScreenProps<'PrivacyPolicy'>) {
    const theme = useTheme();
    const TOKENS = theme.dark ? DARK_THEME : LIGHT_THEME;

    return (
        <ScreenBackground>
            <TopBar title="Privacy Policy" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.heading, { color: TOKENS.textPrimary }]}>Privacy Policy</Text>
                <Text style={[styles.body, { color: TOKENS.textSecondary }]}>Your privacy matters. ManaStudy AI does not sell your personal data and stores only what is necessary to support your account and summaries.</Text>

                <View style={[styles.card, { backgroundColor: TOKENS.surfaceAlt, borderColor: TOKENS.border }]}>
                    <Text style={[styles.cardTitle, { color: TOKENS.textPrimary }]}>Information we collect</Text>
                    <Text style={[styles.cardText, { color: TOKENS.textSecondary }]}>Email address, saved preferences, uploaded documents metadata, and generated summaries are stored securely.</Text>
                </View>

                <View style={[styles.card, { backgroundColor: TOKENS.surfaceAlt, borderColor: TOKENS.border }]}>
                    <Text style={[styles.cardTitle, { color: TOKENS.textPrimary }]}>How we use it</Text>
                    <Text style={[styles.cardText, { color: TOKENS.textSecondary }]}>We use your information to authenticate you, save summaries, and improve the app experience.</Text>
                </View>
            </ScrollView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
        paddingBottom: 120,
    },
    heading: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 10,
    },
    body: {
        fontSize: 14,
        marginBottom: 18,
        lineHeight: 22,
    },
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
