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

interface RegisterScreenProps {
    onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
    const { register, theme, colorScheme, t } = useApp();
    const styles = React.useMemo(() => createStyles(theme, colorScheme), [theme, colorScheme]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [nameFocused, setNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);

    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleRegister = () => {
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!agreedToTerms) {
            setErrorMsg(t('termsRequired'));
            shake();
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            register(name, email.trim(), password, confirmPassword)
                .then((result) => {
                    setIsLoading(false);
                    if (!result.success) {
                        setErrorMsg(result.error || t('genericError'));
                        shake();
                        return;
                    }

                    if (result.requiresEmailConfirmation) {
                        setSuccessMsg(t('verifyEmailToContinue'));
                        setTimeout(onNavigateToLogin, 1200);
                    }
                })
                .catch(() => {
                    setIsLoading(false);
                    setErrorMsg(t('genericError'));
                    shake();
                });
        }, 600);
    };

    const getStrength = () => {
        if (password.length === 0) return null;
        if (password.length < 4) return { bars: 1, label: t('weak'), color: theme.error };
        if (password.length < 8) return { bars: 2, label: t('fair'), color: theme.warning };
        return { bars: 3, label: t('strong'), color: theme.success };
    };

    const strength = getStrength();
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
    const isDark = colorScheme === 'dark';

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

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
                <TouchableOpacity onPress={onNavigateToLogin} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.blue} />
                </TouchableOpacity>

                <View style={styles.logoSection}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="cover"
                    />
                </View>

                <Text style={styles.screenTitle}>{t('createAccount')}</Text>
                <Text style={styles.screenSubtitle}>{t('joinManaTask')}</Text>

                {errorMsg ? (
                    <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
                        <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </Animated.View>
                ) : null}

                {successMsg ? (
                    <View style={[styles.errorBox, styles.successBox]}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
                        <Text style={[styles.errorText, styles.successText]}>{successMsg}</Text>
                    </View>
                ) : null}

                <View style={styles.cardContainer}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('fullName') || 'Full Name'}</Text>
                        <View style={[styles.inputWrap, nameFocused && styles.inputWrapFocused]}>
                            <Ionicons
                                name="person-outline"
                                size={20}
                                color={nameFocused ? theme.blue : theme.blue}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterName') || 'Enter your full name'}
                                placeholderTextColor={theme.textGray}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                onFocus={() => setNameFocused(true)}
                                onBlur={() => setNameFocused(false)}
                            />
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('email')}</Text>
                        <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={emailFocused ? theme.blue : theme.blue}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterEmail') || 'Enter your email'}
                                placeholderTextColor={theme.textGray}
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
                        <Text style={styles.label}>{t('password')}</Text>
                        <View style={[styles.inputWrap, passwordFocused && styles.inputWrapFocused]}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={passwordFocused ? theme.blue : theme.blue}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterPassword') || 'Enter your password'}
                                placeholderTextColor={theme.textGray}
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
                                    color={theme.textGray}
                                />
                            </TouchableOpacity>
                        </View>

                        {strength ? (
                            <View style={styles.strengthRow}>
                                {[1, 2, 3].map((i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.strengthBar,
                                            { backgroundColor: strength.bars >= i ? strength.color : theme.border },
                                        ]}
                                    />
                                ))}
                                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                                    {strength.label}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('confirmPassword')}</Text>
                        <View
                            style={[
                                styles.inputWrap,
                                confirmFocused && styles.inputWrapFocused,
                                confirmPassword.length > 0 && (passwordsMatch ? styles.confirmMatch : styles.confirmMismatch),
                            ]}
                        >
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={20}
                                color={confirmFocused ? theme.blue : theme.blue}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t('confirmPassword') || 'Repeat password'}
                                placeholderTextColor={theme.textGray}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                onFocus={() => setConfirmFocused(true)}
                                onBlur={() => setConfirmFocused(false)}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeBtn}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={18}
                                    color={theme.textGray}
                                />
                            </TouchableOpacity>
                            {confirmPassword.length > 0 ? (
                                <Ionicons
                                    name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                                    size={18}
                                    color={passwordsMatch ? theme.success : theme.error}
                                />
                            ) : null}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.termsRow}
                        onPress={() => setAgreedToTerms(!agreedToTerms)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                            {agreedToTerms ? (
                                <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                            ) : null}
                        </View>
                        <Text style={styles.termsText}>
                            {t('termsPrefix') || 'I agree to the '}
                            <Text style={styles.termsLink}>{t('termsAndConditions') || 'Terms & Conditions'}</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.ctaBtn}
                        onPress={handleRegister}
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
                                {isLoading ? t('Creating...') : t('createAccount')}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomRow}>
                    <Text style={styles.bottomText}>{t('alreadyHaveAccount')}</Text>
                    <TouchableOpacity onPress={onNavigateToLogin}>
                        <Text style={styles.bottomLink}>{t('logIn')}</Text>
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
        backgroundImage: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 48,
            paddingBottom: 40,
        },
        backBtn: {
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: TOKENS.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: TOKENS.border,
            marginBottom: 16,
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
        screenSubtitle: {
            fontSize: 14,
            fontWeight: '400',
            color: TOKENS.textGray,
            textAlign: 'center',
            marginBottom: 24,
        },
        errorBox: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: TOKENS.errorBg,
            borderRadius: 12,
            padding: 12,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: TOKENS.errorBorder,
            gap: 12,
        },
        errorText: {
            fontSize: 13,
            color: theme.error,
            fontWeight: '500',
            flex: 1,
        },
        successBox: {
            borderColor: TOKENS.success,
            backgroundColor: TOKENS.success ? TOKENS.success + '18' : 'rgba(34,197,94,0.08)',
        },
        successText: {
            color: TOKENS.success,
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
            marginBottom: 14,
        },
        label: {
            fontSize: 13,
            fontWeight: '600',
            color: TOKENS.textDark,
            marginBottom: 8,
            textTransform: 'capitalize',
        },
        inputWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.surface,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: theme.border,
            paddingHorizontal: 14,
            height: 52,
            gap: 8,
        },
        inputWrapFocused: {
            borderColor: TOKENS.inputFocusBorder,
            backgroundColor: TOKENS.inputBg,
            borderWidth: 2,
        },
        confirmMatch: {
            borderColor: TOKENS.success,
        },
        confirmMismatch: {
            borderColor: TOKENS.errorBg,
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: TOKENS.textDark,
            fontWeight: '400',
            padding: 0,
        },
        eyeBtn: {
            padding: 4,
            justifyContent: 'center',
            alignItems: 'center',
        },
        strengthRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            gap: 5,
        },
        strengthBar: {
            flex: 1,
            height: 4,
            borderRadius: 2,
        },
        strengthLabel: {
            fontSize: 11,
            fontWeight: '700',
            marginLeft: 6,
            width: 40,
        },
        termsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            gap: 10,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: TOKENS.blue,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
        },
        checkboxChecked: {
            backgroundColor: TOKENS.blue,
            borderColor: TOKENS.blue,
        },
        termsText: {
            fontSize: 13,
            color: TOKENS.textGray,
            flex: 1,
        },
        termsLink: {
            color: TOKENS.blue,
            fontWeight: '600',
        },
        ctaBtn: {
            borderRadius: 14,
            overflow: 'hidden',
            height: 56,
            shadowColor: TOKENS.blue,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
        },
        ctaBtnGradient: {
            height: 56,
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
        },
        bottomText: {
            fontSize: 13,
            color: TOKENS.textGray,
            fontWeight: '400',
        },
        bottomLink: {
            fontSize: 13,
            color: TOKENS.blue,
            fontWeight: '700',
        },
    });
};
