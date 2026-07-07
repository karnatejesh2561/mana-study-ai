import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, Button, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { ScreenBackground } from '../components/ScreenBackground';
import { TopBar } from '../components/TopBar';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';
import type { RootStackScreenProps } from '../types/navigation';

export function AccountScreen({ navigation }: RootStackScreenProps<'Account'>) {
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editFullName, setEditFullName] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);
    const [fullNameError, setFullNameError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const setProfile = useAppStore((s) => s.setProfile);
    const profile = useAppStore((state) => state.profile);
    const theme = useTheme();
    const isDark = theme.dark;
    const TOKENS = isDark ? DARK_THEME : LIGHT_THEME;

    const styles = StyleSheet.create({
        content: {
            padding: 14,
            paddingBottom: 120,
        },
        header: {
            marginBottom: 20,
        },
        heading: {
            color: TOKENS.textPrimary,
            fontSize: 30,
            fontWeight: '800',
            marginBottom: 4,
        },
        subheading: {
            color: TOKENS.textSecondary,
            fontSize: 14,
        },
        profileCard: {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: TOKENS.glassBorder,
            backgroundColor: TOKENS.glassBg,
            padding: 16,
            alignItems: 'center',
            marginBottom: 20,
        },
        avatar: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: TOKENS.avatarBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        avatarText: {
            color: TOKENS.blue,
            fontSize: 32,
            fontWeight: '800',
        },
        profileName: {
            color: TOKENS.textPrimary,
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 4,
        },
        profileEmail: {
            color: TOKENS.textSecondary,
            fontSize: 13,
        },
        section: {
            marginBottom: 20,
        },
        sectionTitle: {
            color: TOKENS.textSecondary,
            fontWeight: '700',
            fontSize: 12,
            marginBottom: 12,
            textTransform: 'uppercase',
        },
        infoItem: {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: TOKENS.glassBorder,
            backgroundColor: TOKENS.glassBg,
            padding: 12,
            marginBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        infoLeft: {
            flex: 1,
        },
        infoLabel: {
            color: TOKENS.textSecondary,
            fontSize: 12,
            marginBottom: 4,
        },
        infoValue: {
            color: TOKENS.textPrimary,
            fontSize: 14,
            fontWeight: '600',
        },
        infoIcon: {
            marginLeft: 8,
        },
    });

    // Modal input/button styles (match LoginScreen visuals)
    const modalStyles = StyleSheet.create({
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: TOKENS.textSecondary,
            marginBottom: 8,
        },
        inputWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.dark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: theme.dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            paddingHorizontal: 14,
            height: 52,
            gap: 8,
            marginBottom: 6,
        },
        input: {
            flex: 1,
            minHeight: 44,
            color: TOKENS.textPrimary,
            fontSize: 17,
            fontWeight: '400',
            paddingVertical: 0,
        },
        ctaBtn: {
            borderRadius: 14,
            overflow: 'hidden',
            height: 52,
            shadowColor: TOKENS.blue,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 4,
            flex: 1,
            marginLeft: 8,
        },
        ctaBtnGradient: {
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
        },
        ctaBtnText: {
            fontSize: 16,
            fontWeight: '700',
            color: TOKENS.textInverted,
            letterSpacing: 0.5,
        },
    });

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const initials = profile.name ? getInitials(profile.name) : 'U';
    const subscription = useAppStore((s) => s.subscription);

    const validate = (): boolean => {
        let ok = true;
        setNameError(null);
        setFullNameError(null);
        setGeneralError(null);

        if (!editName || editName.trim().length < 2) {
            setNameError('Please enter a display name (at least 2 characters).');
            ok = false;
        }

        if (editFullName && editFullName.trim().length < 2) {
            setFullNameError('Full name must be at least 2 characters if provided.');
            ok = false;
        }

        return ok;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);
        setGeneralError(null);
        try {
            // call backend to update user metadata
            const payload: any = { name: editName.trim() };
            if (editFullName) payload.full_name = editFullName.trim();
            const client = (await import('../services/apiClient')).apiClient;
            const resp = await client.patch('/api/v1/user/me', payload);
            const updatedUser = resp.data?.user || resp.data;
            setProfile({ name: updatedUser?.user_metadata?.name || updatedUser?.name || editName.trim(), full_name: updatedUser?.user_metadata?.full_name || updatedUser?.full_name || editFullName.trim() });
            setEditing(false);
        } catch (e: any) {
            const msg = e?.message || 'Failed to save. Try again.';
            setGeneralError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScreenBackground>
            <TopBar title="ManaStudy AI" showBackButton onBackPress={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.header}>
                    <Text style={styles.heading}>Account</Text>
                    <Text style={styles.subheading}>Your account information</Text>
                    <TouchableOpacity onPress={() => { setEditName(profile.name || ''); setEditFullName(profile.full_name || ''); setEditing(true); }} style={{ marginTop: 8 }}>
                        <Text style={{ color: TOKENS.blue, fontWeight: '700' }}>Edit profile</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.profileName}>{profile.full_name || profile.name || 'Student'}</Text>
                    <Text style={styles.profileEmail}>{profile.email || 'student@example.com'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <View style={styles.infoItem}>
                        <View style={styles.infoLeft}>
                            <Text style={styles.infoLabel}>Full Name</Text>
                            <Text style={styles.infoValue}>{profile.name || 'Not set'}</Text>
                        </View>
                        <Icon name="person" size={16} color={TOKENS.textSecondary} style={styles.infoIcon} />
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoLeft}>
                            <Text style={styles.infoLabel}>Email Address</Text>
                            <Text style={styles.infoValue}>{profile.email || 'student@example.com'}</Text>
                        </View>
                        <Icon name="mail" size={16} color={TOKENS.textSecondary} style={styles.infoIcon} />
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoLeft}>
                            <Text style={styles.infoLabel}>Language Preference</Text>
                            <Text style={styles.infoValue}>{profile.language || 'English'}</Text>
                        </View>
                        <Icon name="language" size={16} color={TOKENS.textSecondary} style={styles.infoIcon} />
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoLeft}>
                            <Text style={styles.infoLabel}>Account Status</Text>
                            <Text style={styles.infoValue}>{subscription.plan ? `${subscription.plan} Member` : 'Free'}</Text>
                        </View>
                        <Icon name={subscription.plan ? 'card-outline' : 'person-outline'} size={16} color={TOKENS.blue} style={styles.infoIcon} />
                    </View>
                </View>
            </ScrollView>

            <Modal visible={editing} animationType="slide" onRequestClose={() => setEditing(false)}>
                <View style={{ flex: 1, padding: 16, backgroundColor: TOKENS.background }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: TOKENS.textPrimary, marginBottom: 12 }}>Edit profile</Text>

                    <Text style={modalStyles.label}>Full name</Text>
                    <View style={[modalStyles.inputWrap, fullNameError ? { borderColor: TOKENS.errorBorder || '#FF6A72' } : undefined]}>
                        <Icon name="person-outline" size={18} color={TOKENS.textSecondary} />
                        <TextInput value={editFullName} onChangeText={(t) => { setEditFullName(t); setFullNameError(null); setGeneralError(null); }} placeholder="Full name" placeholderTextColor={TOKENS.textSecondary} style={modalStyles.input} />
                    </View>
                    {fullNameError ? <Text style={{ color: TOKENS.errorBorder || '#FF6A72', marginBottom: 8 }}>{fullNameError}</Text> : null}

                    <Text style={modalStyles.label}>Display name</Text>
                    <View style={[modalStyles.inputWrap, nameError ? { borderColor: TOKENS.errorBorder || '#FF6A72' } : undefined]}>
                        <Icon name="brush-outline" size={18} color={TOKENS.textSecondary} />
                        <TextInput value={editName} onChangeText={(t) => { setEditName(t); setNameError(null); setGeneralError(null); }} placeholder="Display name" placeholderTextColor={TOKENS.textSecondary} style={modalStyles.input} />
                    </View>
                    {nameError ? <Text style={{ color: TOKENS.errorBorder || '#FF6A72', marginBottom: 8 }}>{nameError}</Text> : null}
                    {generalError ? <Text style={{ color: TOKENS.errorBorder || '#FF6A72', marginBottom: 8 }}>{generalError}</Text> : null}

                    <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => setEditing(false)} style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 }}>
                            <Text style={{ color: TOKENS.textSecondary }}>Cancel</Text>
                        </TouchableOpacity>

                        <View style={{ flex: 1 }} />

                        {saving ? (
                            <ActivityIndicator />
                        ) : (
                            <TouchableOpacity onPress={handleSave} activeOpacity={0.9} style={modalStyles.ctaBtn}>
                                <LinearGradient
                                    colors={['#0A66FF', '#0A66FF', '#FF6B00']}
                                    locations={[0, 0.4, 1]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={modalStyles.ctaBtnGradient}
                                >
                                    <Text style={modalStyles.ctaBtnText}>Save</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </ScreenBackground>
    );
}
