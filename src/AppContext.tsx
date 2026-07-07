import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, setAuthToken } from './services/apiClient';

export interface AppTheme {
    blue: string;
    background: string;
    surface: string;
    border: string;
    textGray: string;
    textDark: string;
    error: string;
    warning: string;
    success: string;
}

interface LoginResult {
    success: boolean;
    error?: string;
}

interface RegisterResult {
    success: boolean;
    error?: string;
    requiresEmailConfirmation?: boolean;
}

interface ResetPasswordResult {
    success: boolean;
    error?: string;
}

interface AppContextValue {
    colorScheme: 'light' | 'dark';
    theme: AppTheme;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<LoginResult>;
    register: (
        name: string,
        email: string,
        password: string,
        confirmPassword: string,
    ) => Promise<RegisterResult>;
    resetPassword: (email: string) => Promise<ResetPasswordResult>;
    logout: () => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

const dictionary: Record<string, string> = {
    loginWelcomeBack: 'Welcome Back',
    loginSubtitle: 'Continue learning with ManaStudy AI',
    email: 'Email',
    enterEmail: 'Enter your email',
    password: 'Password',
    enterPassword: 'Enter your password',
    forgotPassword: 'Forgot Password?',
    loggingIn: 'Logging In...',
    logIn: 'Login',
    dontHaveAccount: "Don't have an account?",
    createAccount: 'Create Account',
    joinManaTask: 'Join ManaStudy and start your smart learning journey',
    fullName: 'Full Name',
    enterName: 'Enter your full name',
    confirmPassword: 'Confirm Password',
    alreadyHaveAccount: 'Already have an account?',
    creating: 'Creating...',
    termsRequired: 'Please accept Terms & Conditions',
    termsPrefix: 'I agree to the ',
    termsAndConditions: 'Terms & Conditions',
    verifyEmailToContinue: 'Account created. Verify email to continue.',
    weak: 'Weak',
    fair: 'Fair',
    strong: 'Strong',
    forgotPasswordTitle: 'Forgot Password',
    recoverySubtitle: 'Enter your email to recover your account',
    recoverySent: 'Recovery email sent to {email}',
    sendingLink: 'Sending Link...',
    sendRecoveryLink: 'Send Recovery Link',
    emailAddress: 'Email Address',
    enterRegisteredEmail: 'Enter registered email',
    checkYourEmail: 'Check Your Email',
    resendEmail: 'Resend Email',
    tipsTitle: 'Tips',
    tipSpam: 'Check spam folder',
    tipExpires: 'Link expires in 24 hours',
    tipSupport: 'Contact support if you need help',
    genericError: 'Login failed',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const systemColorScheme = useColorScheme();
    const colorScheme: 'light' | 'dark' = systemColorScheme === 'dark' ? 'dark' : 'light';
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const hydrateAuth = async () => {
            const storedToken = await AsyncStorage.getItem('MANA_AUTH_TOKEN');
            if (storedToken) {
                await setAuthToken(storedToken);
                setIsAuthenticated(true);
            }
            setIsHydrated(true);
        };

        void hydrateAuth();
    }, []);

    const login = async (email: string, password: string): Promise<LoginResult> => {
        const normalizedEmail = email.trim();

        if (!normalizedEmail || !password) {
            return { success: false, error: 'Please enter email and password' };
        }

        if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
            return { success: false, error: 'Please enter a valid email address' };
        }

        if (password.length < 8) {
            return { success: false, error: 'Password must be at least 8 characters' };
        }

        try {
            const response = await apiClient.post('/api/v1/auth/login', {
                email: normalizedEmail,
                password,
            });

            const token = response.data?.session?.access_token;
            if (!token) {
                return { success: false, error: 'Login succeeded but no access token was returned. Please try again.' };
            }

            await setAuthToken(token);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            let message = 'Login failed';
            if (error instanceof Error) {
                if (error.message.includes('Cannot reach backend')) {
                    message = 'Cannot connect to the backend. Please ensure the server is running.';
                } else if (error.message.includes('Email and password do not match') || error.message.includes('Invalid login credentials')) {
                    message = 'Email or password is incorrect. Please check your credentials.';
                } else {
                    message = error.message;
                }
            }

            return {
                success: false,
                error: message,
            };
        }
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        confirmPassword: string,
    ): Promise<RegisterResult> => {
        const normalizedName = name.trim();
        const normalizedEmail = email.trim();

        if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
            return { success: false, error: 'Please fill all fields' };
        }

        if (normalizedName.length < 2) {
            return { success: false, error: 'Please enter a valid full name' };
        }

        if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
            return { success: false, error: 'Please enter a valid email address' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        if (password !== confirmPassword) {
            return { success: false, error: 'Passwords do not match' };
        }

        try {
            await apiClient.post('/api/v1/auth/register', {
                email: normalizedEmail,
                password,
                confirm_password: confirmPassword,
                full_name: normalizedName,
            });

            return { success: true, requiresEmailConfirmation: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Registration failed',
            };
        }
    };

    const resetPassword = async (email: string): Promise<ResetPasswordResult> => {
        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            return { success: false, error: 'Please enter your email' };
        }

        if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
            return { success: false, error: 'Please enter a valid email address' };
        }

        try {
            await apiClient.post('/api/v1/auth/forgot-password', {
                email: normalizedEmail,
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send reset email',
            };
        }
    };

    const logout = () => {
        void setAuthToken(null);
        setIsAuthenticated(false);
    };

    const value = useMemo<AppContextValue>(
        () => ({
            colorScheme,
            theme: {
                blue: '#0A66FF',
                background: colorScheme === 'dark' ? '#081220' : '#F7FAFF',
                surface: colorScheme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                border: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                textGray: colorScheme === 'dark' ? '#94A3B8' : '#64748B',
                textDark: colorScheme === 'dark' ? '#F8FAFC' : '#1E293B',
                error: '#EF4444',
                warning: '#F59E0B',
                success: '#22C55E',
            },
            isAuthenticated,
            login,
            register,
            resetPassword,
            logout,
            t: (key: string, params?: Record<string, string | number>) => {
                const template = dictionary[key] || key;
                if (!params) {
                    return template;
                }

                return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
                    return acc.replace(`{${paramKey}}`, String(paramValue));
                }, template);
            },
        }),
        [colorScheme, isAuthenticated],
    );

    if (!isHydrated) {
        return null;
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used inside AppProvider');
    }
    return context;
};
