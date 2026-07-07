import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { TopBar } from '../../components/TopBar';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../../theme/colors';
import type { RootStackScreenProps } from '../../types/navigation';
import { setDevBackendHostOverride } from '../../services/apiClient';

export function BackendConfigScreen({ navigation }: RootStackScreenProps<'BackendConfig'>) {
    const theme = useTheme();
    const isDark = theme.dark;
    const TOKENS = isDark ? DARK_THEME : LIGHT_THEME;
    const styles = createStyles(TOKENS);

    const backendHost = useAppStore((state) => state.backendHost);
    const backendPort = useAppStore((state) => state.backendPort);
    const setBackendConfig = useAppStore((state) => state.setBackendConfig);

    const [host, setHost] = useState(backendHost ?? '192.168.1.7');
    const [port, setPort] = useState(String(backendPort || 4000));
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setHost(backendHost ?? '192.168.1.7');
        setPort(String(backendPort || 4000));
    }, [backendHost, backendPort]);

    const onSave = () => {
        const parsedPort = Number(port) || 4000;
        const normalizedHost = host.trim() || null;

        setBackendConfig(normalizedHost, parsedPort);
        setDevBackendHostOverride(normalizedHost, parsedPort);
        setSaved(true);

        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <ScreenBackground>
            <ScrollView contentContainerStyle={styles.content}>
                <TopBar title="Backend Config" />
                <Text style={styles.heading}>Backend Connection</Text>
                <Text style={styles.subheading}>Configure the backend host and port for your device.</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Backend Host</Text>
                    <TextInput
                        style={[styles.input, { borderColor: TOKENS.glassBorder, color: TOKENS.textPrimary }]}
                        value={host}
                        onChangeText={setHost}
                        placeholder="192.168.1.7"
                        placeholderTextColor={TOKENS.textSecondary}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Backend Port</Text>
                    <TextInput
                        style={[styles.input, { borderColor: TOKENS.glassBorder, color: TOKENS.textPrimary }]}
                        value={port}
                        onChangeText={setPort}
                        placeholder="4000"
                        placeholderTextColor={TOKENS.textSecondary}
                        keyboardType="numeric"
                    />
                </View>

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: TOKENS.blue }]} onPress={onSave}>
                    <Text style={styles.saveButtonText}>Save Settings</Text>
                </TouchableOpacity>

                {saved && <Text style={styles.savedText}>Backend configuration saved.</Text>}
            </ScrollView>
        </ScreenBackground>
    );
}

const createStyles = (TOKENS: typeof LIGHT_THEME | typeof DARK_THEME) =>
    StyleSheet.create({
        content: {
            padding: 14,
            paddingBottom: 120,
        },
        heading: {
            color: TOKENS.textPrimary,
            fontSize: 30,
            fontWeight: '800',
        },
        subheading: {
            color: TOKENS.textSecondary,
            marginBottom: 20,
        },
        inputGroup: {
            marginBottom: 16,
        },
        label: {
            color: TOKENS.textSecondary,
            marginBottom: 8,
            fontSize: 14,
        },
        input: {
            borderWidth: 1,
            borderRadius: 12,
            padding: 14,
            fontSize: 16,
            backgroundColor: TOKENS.glassBg,
        },
        saveButton: {
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            marginTop: 8,
        },
        saveButtonText: {
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: 16,
        },
        savedText: {
            marginTop: 12,
            color: TOKENS.success,
            fontWeight: '600',
        },
    });
