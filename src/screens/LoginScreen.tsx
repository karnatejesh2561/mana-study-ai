import React, { useRef, useState } from 'react';
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, useApp } from '../AppContext';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

interface LoginScreenProps {
    onNavigateToRegister: () => void;
    onNavigateToForgot: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
    onNavigateToRegister,
    onNavigateToForgot,
}) => {
    const { login, theme, colorScheme, t } = useApp();
    const styles = React.useMemo(() => createStyles(theme, colorScheme), [theme, colorScheme]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleLogin = () => {
        setErrorMsg(null);
        setIsLoading(true);

        setTimeout(() => {
            login(email.trim(), password)
                .then((result) => {
                    setIsLoading(false);
                    if (!result.success) {
                        setErrorMsg(result.error || t('genericError') || 'Login failed');
                        shake();
                    }
                })
                .catch(() => {
                    setIsLoading(false);
                    setErrorMsg(t('genericError') || 'Login failed');
                    shake();
                });
        }, 600);
    };

    const isDark = colorScheme === 'dark';

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            <Image
                source={
                    isDark
                        ? require('../../assets/login-bg-dark.png')
                        : require('../../assets/logi-bg-light.png')
                }
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.logoSection}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="cover"
                    />
                </View>

                <Text style={styles.screenTitle}>{t('loginWelcomeBack')}</Text>
                <Text style={styles.screenSubtitle}>{t('loginSubtitle')}</Text>

                {errorMsg ? (
                    <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
                        <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </Animated.View>
                ) : null}

                <View style={styles.cardContainer}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('email') || 'Email'}</Text>
                        <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={emailFocused ? '#0A66FF' : '#0A66FF'}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterEmail') || 'Enter your email'}
                                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                            />
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('password') || 'Password'}</Text>
                        <View style={[styles.inputWrap, passwordFocused && styles.inputWrapFocused]}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={passwordFocused ? '#0A66FF' : '#0A66FF'}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterPassword') || 'Enter your password'}
                                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={18}
                                    color={isDark ? '#94A3B8' : '#64748B'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity onPress={onNavigateToForgot} style={styles.forgotRow}>
                        <Text style={styles.forgotText}>{t('forgotPassword') || 'Forgot Password?'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.ctaBtn}
                        onPress={handleLogin}
                        activeOpacity={0.9}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#0A66FF', '#0A66FF', '#FF6B00']}
                            locations={[0, 0.4, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaBtnGradient}
                        >
                            <Text style={styles.ctaBtnText}>
                                {isLoading ? (t('loggingIn') || 'Logging In...') : (t('logIn') || 'Login')}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomRow}>
                    <Text style={styles.bottomText}>{t('dontHaveAccount')}</Text>
                    <TouchableOpacity onPress={onNavigateToRegister}>
                        <Text style={styles.bottomLink}>{t('createAccount')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const createStyles = (theme: AppTheme, colorScheme: 'light' | 'dark') => {
    const isDark = colorScheme === 'dark';
    const TOKENS = isDark ? DARK_THEME : LIGHT_THEME;

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: TOKENS.background,
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: Platform.OS === 'ios' ? 70 : 80,
        },
        logoSection: {
            alignItems: 'center',
        },
        logo: {
            width: 250,
            height: 80,
        },
        screenTitle: {
            fontSize: 30,
            fontWeight: '700',
            color: TOKENS.text,
            textAlign: 'center',
            marginBottom: 6,
            letterSpacing: -0.5,
        },
        backgroundImage: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
        },
        screenSubtitle: {
            fontSize: 14,
            fontWeight: '500',
            color: TOKENS.textSecondary,
            textAlign: 'center',
            marginBottom: 24,
        },
        errorBox: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: TOKENS.errorBg,
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: TOKENS.errorBorder,
            gap: 12,
            marginHorizontal: 16,
        },
        errorText: {
            fontSize: 13,
            color: theme.error,
            fontWeight: '500',
            flex: 1,
        },
        cardContainer: {
            backgroundColor: TOKENS.glassBg,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: TOKENS.glassBorder,
            padding: 24,
            marginBottom: 24,
            marginHorizontal: 4,
        },
        fieldGroup: {
            marginBottom: 16,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: TOKENS.text,
            marginBottom: 8,
        },
        inputWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            paddingHorizontal: 14,
            height: 52,
            gap: 8,
        },
        inputWrapFocused: {
            borderColor: TOKENS.inputFocusBorder,
            backgroundColor: isDark ? DARK_THEME.inputBg : LIGHT_THEME.inputBg,
        },
        input: {
            flex: 1,
            minHeight: 44,
            color: TOKENS.text,
            fontSize: 17,
            fontWeight: '400',
            paddingVertical: 0,
        },
        eyeBtn: {
            padding: 4,
            justifyContent: 'center',
            alignItems: 'center',
        },
        forgotRow: {
            alignSelf: 'flex-end',
            marginTop: 4,
            marginBottom: 20,
        },
        forgotText: {
            fontSize: 13,
            color: TOKENS.blue,
            fontWeight: '600',
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
        bottomRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            marginTop: 10,
        },
        bottomText: {
            fontSize: 13,
            color: TOKENS.textSecondary,
            fontWeight: '400',
        },
        bottomLink: {
            fontSize: 13,
            color: TOKENS.blue,
            fontWeight: '700',
        },
    });
};
