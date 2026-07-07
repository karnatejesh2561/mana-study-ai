import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ScreenBackground } from '../components/ScreenBackground';
import { TopBar } from '../components/TopBar';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';
import type { RootStackScreenProps } from '../types/navigation';

export function ContactUsScreen({ navigation }: RootStackScreenProps<'ContactUs'>) {
    const theme = useTheme();
    const TOKENS = theme.dark ? DARK_THEME : LIGHT_THEME;

    return (
        <ScreenBackground>
            <TopBar title="Contact Us" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.heading, { color: TOKENS.textPrimary }]}>Need support?</Text>
                <Text style={[styles.body, { color: TOKENS.textSecondary }]}>If you need help, please reach out and our support team will get back to you as soon as possible.</Text>

                <View style={[styles.card, { backgroundColor: TOKENS.surfaceAlt, borderColor: TOKENS.border }]}>
                    <Text style={[styles.cardTitle, { color: TOKENS.textPrimary }]}>Email</Text>
                    <Text style={[styles.cardText, { color: TOKENS.textSecondary }]}>support@manastudy.ai</Text>
                </View>

                <View style={[styles.card, { backgroundColor: TOKENS.surfaceAlt, borderColor: TOKENS.border }]}>
                    <Text style={[styles.cardTitle, { color: TOKENS.textPrimary }]}>Working hours</Text>
                    <Text style={[styles.cardText, { color: TOKENS.textSecondary }]}>Mon – Fri, 9:00 AM – 6:00 PM</Text>
                </View>

                <TouchableOpacity style={[styles.button, { backgroundColor: TOKENS.blue }]}>
                    <Text style={[styles.buttonText, { color: TOKENS.textInverted }]}>Send a message</Text>
                </TouchableOpacity>
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
    button: {
        marginTop: 10,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
