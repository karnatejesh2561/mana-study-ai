import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenBackground } from '../../components/ScreenBackground';
import { TopBar } from '../../components/TopBar';
import { useAppStore } from '../../store/useAppStore';
import { useApp } from '../../AppContext';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../../theme/colors';
import { apiClient } from '../../services/apiClient';
import type { MainTabScreenProps } from '../../types/navigation';

interface SettingsItemProps {
    icon: string;
    title: string;
    subtitle: string;
    rightLabel?: string;
    danger?: boolean;
    onPress?: () => void;
}

function SettingsItem({ icon, title, subtitle, rightLabel, danger, onPress }: SettingsItemProps) {
    const theme = useTheme();
    const styles = createStyles(theme);
    const isDark = theme.dark;
    const TOKENS = isDark ? DARK_THEME : LIGHT_THEME;
    const iconColor = TOKENS.blue;
    const titleColor = TOKENS.textPrimary;
    const subtitleColor = TOKENS.textSecondary;
    const chevronColor = TOKENS.textSecondary;

    return (
        <TouchableOpacity style={[styles.item, danger && styles.itemDanger]} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.left}>
                <View style={styles.iconWrap}>
                    <Icon name={icon} size={16} color={iconColor} />
                </View>
                <View>
                    <Text style={[styles.itemTitle, danger && styles.logoutText]}>{title}</Text>
                    {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
                </View>
            </View>
            {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : <Icon name="chevron-forward" size={16} color={chevronColor} />}
        </TouchableOpacity>
    );
}

export function ProfileScreen({ navigation }: MainTabScreenProps<'Settings'>) {
    const profile = useAppStore((state) => state.profile);
    const setProfile = useAppStore((state) => state.setProfile);
    const { logout } = useApp();
    const theme = useTheme();
    const styles = createStyles(theme);
    const TOKENS = theme.dark ? DARK_THEME : LIGHT_THEME;

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const resp = await apiClient.get('/api/v1/user/me');
                const user = resp.data?.user;
                if (mounted && user) {
                    // Pull full name from common locations (Supabase stores custom data in user_metadata)
                    const meta = user.user_metadata || {};
                    const fullNameFromMeta = meta.full_name || meta.fullName || meta.name || user.full_name || user.fullName;
                    // normalize fields expected by store
                    setProfile({
                        id: user.id,
                        name: user.name || user.username || fullNameFromMeta || profile.name,
                        full_name: fullNameFromMeta || profile.full_name,
                        email: user.email || profile.email,
                        language: user.language || profile.language || 'English',
                        darkMode: typeof user.darkMode === 'boolean' ? user.darkMode : profile.darkMode,
                    });
                }
            } catch (e) {
                // ignore - keep local/profile defaults
            } finally {
                setLoading(false);
            }
        };
        void load();
        return () => { mounted = false; };
    }, [setProfile]);

    const handleLogout = () => {
        logout();
    };

    return (
        <ScreenBackground>
            <TopBar title="ManaStudy AI" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.heading}>Settings</Text>
                <Text style={styles.subheading}>Manage your account and preferences</Text>

                <Text style={styles.group}>Account</Text>
                <SettingsItem icon="person-outline" title="Profile" subtitle={`${profile?.name ?? ''} • ${profile?.email ?? ''}`} onPress={() => navigation.navigate('Account')} />
                <SettingsItem icon="shield-checkmark-outline" title="Subscription" subtitle="Manage your plan" rightLabel="PRO" onPress={() => navigation.navigate('Subscription')} />
                <SettingsItem icon="stats-chart-outline" title="Usage" subtitle="Check your upload and usage" onPress={() => navigation.navigate('Usage')} />

                <Text style={styles.group}>Preferences</Text>
                <SettingsItem icon="language-outline" title="Language" subtitle="Choose your language" rightLabel={profile?.language ?? 'English'} />
                <SettingsItem icon="cable-outline" title="Backend Config" subtitle="Configure backend host" onPress={() => navigation.navigate('BackendConfig')} />

                <View style={styles.themeItem}>
                    <View style={styles.left}>
                        <View style={styles.iconWrap}>
                            <Icon name="sunny-outline" size={16} color={TOKENS.goldenOrange ?? '#FFB547'} />
                        </View>
                        <View>
                            <Text style={styles.itemTitle}>Theme</Text>
                            <Text style={styles.itemSubtitle}>Choose your theme</Text>
                        </View>
                    </View>
                    <Switch value={!!profile?.darkMode} onValueChange={(value) => setProfile({ darkMode: value })} />
                </View>

                <Text style={styles.group}>Support</Text>
                <SettingsItem icon="help-circle-outline" title="Help & FAQs" subtitle="Get help and support" onPress={() => navigation.navigate('HelpFAQs')} />
                <SettingsItem icon="mail-outline" title="Contact Us" subtitle="Choose here to help you" onPress={() => navigation.navigate('ContactUs')} />
                <SettingsItem icon="lock-closed-outline" title="Privacy Policy" subtitle="Read our privacy policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
                <SettingsItem icon="document-text-outline" title="Terms & Conditions" subtitle="Read our terms" onPress={() => navigation.navigate('TermsConditions')} />

                <SettingsItem icon="log-out-outline" title="Logout" subtitle="Sign out of your account" danger onPress={handleLogout} />
            </ScrollView>
        </ScreenBackground>
    );
}

const createStyles = (theme: any) => {
    const isDark = theme?.dark;
    const TOKENS = isDark ? DARK_THEME : LIGHT_THEME;

    return StyleSheet.create({
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
            marginBottom: 12,
        },
        group: {
            color: TOKENS.textSecondary,
            fontWeight: '700',
            marginBottom: 8,
            marginTop: 6,
        },
        item: {
            minHeight: 64,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: TOKENS.glassBorder,
            backgroundColor: TOKENS.glassBg,
            paddingHorizontal: 12,
            marginBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        itemDanger: {
            borderColor: TOKENS.errorBorder,
        },
        left: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        iconWrap: {
            width: 34,
            height: 34,
            borderRadius: 9,
            backgroundColor: TOKENS.avatarBg,
            alignItems: 'center',
            justifyContent: 'center',
        },
        itemTitle: {
            color: TOKENS.textPrimary,
            fontWeight: '700',
        },
        itemSubtitle: {
            color: TOKENS.textSecondary,
            fontSize: 12,
        },
        rightLabel: {
            color: TOKENS.textSecondary,
            fontWeight: '700',
            fontSize: 12,
        },
        themeItem: {
            minHeight: 64,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: TOKENS.glassBorder,
            backgroundColor: TOKENS.glassBg,
            paddingHorizontal: 12,
            marginBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        logoutText: {
            color: TOKENS.coralRed || TOKENS.error || '#FF6A72',
        },
    });
};
