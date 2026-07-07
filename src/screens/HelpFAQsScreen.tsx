import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenBackground } from '../components/ScreenBackground';
import { TopBar } from '../components/TopBar';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';
import type { RootStackScreenProps } from '../types/navigation';

export function HelpFAQsScreen({ navigation }: RootStackScreenProps<'HelpFAQs'>) {
    const theme = useTheme();
    const TOKENS = theme.dark ? DARK_THEME : LIGHT_THEME;

    return (
        <ScreenBackground>
            <TopBar title="Help & FAQs" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.heading, { color: TOKENS.textPrimary }]}>Help & FAQs</Text>
                <Text style={[styles.body, { color: TOKENS.textSecondary }]}>Find answers to common questions about ManaStudy AI, uploading files, generating summaries, and managing your account.</Text>

                <View style={[styles.card, { backgroundColor: TOKENS.surfaceAlt, borderColor: TOKENS.border }]}>
                    <Text style={[styles.cardTitle, { color: TOKENS.textPrimary }]}>How do I upload my study material?</Text>
                    <Text style={[styles.cardText, { color: TOKENS.textSecondary }]}>Use the upload section on the home screen to choose a PDF, DOCX, PPTX, or image file, then tap Generate Summary.</Text>
                </View>

                <View style={[styles.card, { backgroundColor: TOKENS.surfaceAlt, borderColor: TOKENS.border }]}>
                    <Text style={[styles.cardTitle, { color: TOKENS.textPrimary }]}>How do I switch themes?</Text>
                    <Text style={[styles.cardText, { color: TOKENS.textSecondary }]}>Open Settings and toggle the Theme switch to switch between Light and Dark modes.</Text>
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
