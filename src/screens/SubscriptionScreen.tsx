import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenBackground } from '../components/ScreenBackground';
import { TopBar } from '../components/TopBar';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';
import type { RootStackScreenProps } from '../types/navigation';
import LinearGradient from 'react-native-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { Alert, Linking } from 'react-native';
import { apiClient } from '../services/apiClient';
import { useEffect, useState } from 'react';

export function SubscriptionScreen({ navigation }: RootStackScreenProps<'Subscription'>) {
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
            marginBottom: 12,
        },
        currentPlan: {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: TOKENS.blue,
            overflow: 'hidden',
            marginBottom: 20,
        },
        planContent: {
            padding: 16,
            alignItems: 'center',
        },
        planBadge: {
            backgroundColor: TOKENS.blue + '20',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
            marginBottom: 8,
        },
        planBadgeText: {
            color: TOKENS.blue,
            fontWeight: '700',
            fontSize: 12,
        },
        planTitle: {
            color: TOKENS.textPrimary,
            fontSize: 24,
            fontWeight: '800',
            marginBottom: 4,
        },
        planPrice: {
            color: TOKENS.textSecondary,
            fontSize: 14,
            marginBottom: 16,
        },
        planFeatures: {
            marginBottom: 16,
        },
        featureItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        featureIcon: {
            color: TOKENS.blue,
            marginRight: 8,
        },
        featureText: {
            color: TOKENS.textSecondary,
            fontSize: 13,
        },
        renewalInfo: {
            color: TOKENS.textSecondary,
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 16,
        },
        upgradeButton: {
            backgroundColor: TOKENS.blue,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 20,
            alignItems: 'center',
        },
        upgradeButtonText: {
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: 14,
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
        planCard: {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: TOKENS.glassBorder,
            backgroundColor: TOKENS.glassBg,
            padding: 16,
            marginBottom: 8,
        },
        planCardTitle: {
            color: TOKENS.textPrimary,
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 4,
        },
        planCardPrice: {
            color: TOKENS.blue,
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 8,
        },
        planCardDesc: {
            color: TOKENS.textSecondary,
            fontSize: 13,
            marginBottom: 12,
        },
        selectButton: {
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: TOKENS.blue,
            alignItems: 'center',
        },
        selectButtonText: {
            color: TOKENS.blue,
            fontWeight: '600',
            fontSize: 12,
        },
    });

    const subscription = useAppStore((s) => s.subscription);
    const setSubscription = useAppStore((s) => s.setSubscription);
    const [plans, setPlans] = useState<Array<{ id: string; name: string; price: number; currency: string }>>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const resp = await apiClient.get('/api/v1/subscriptions/plans');
                if (mounted && resp.data && resp.data.plans) setPlans(resp.data.plans);
            } catch {
                // fallback to local plans
                setPlans([
                    { id: 'basic', name: 'Basic', price: 0, currency: 'INR' },
                    { id: 'pro', name: 'Pro', price: 29900, currency: 'INR' },
                    { id: 'premium', name: 'Premium', price: 49900, currency: 'INR' },
                ]);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handlePurchase = async (planId: string) => {
        try {
            const resp = await apiClient.post('/api/v1/subscriptions/create-session', { planId });
            if (resp.data?.url) {
                const url: string = resp.data.url;
                Linking.openURL(url).catch(() => Alert.alert('Open URL', 'Could not open purchase URL'));
                return;
            }

            if (resp.data?.clientSecret) {
                // clientSecret flow not implemented here — in-app Stripe SDK required.
                Alert.alert('Payment', 'Client-side payment required; integrate Stripe SDK to complete flow.');
                return;
            }

            // free plan fallback
            if (resp.data && !resp.data.url && !resp.data.clientSecret) {
                const p = plans.find((x) => x.id === planId);
                setSubscription({ plan: p?.name ?? 'Basic', price: p?.price ? p.price / 100 : 0, renewal: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(), features: [] });
                Alert.alert('Subscribed', `Activated ${p?.name ?? 'Basic'} plan`);
            }
        } catch (e: any) {
            Alert.alert('Purchase failed', e?.message || 'Could not start purchase');
        }
    };

    return (
        <ScreenBackground>
            <TopBar title="ManaStudy AI" showBackButton onBackPress={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.header}>
                    <Text style={styles.heading}>Subscription</Text>
                    <Text style={styles.subheading}>Manage your subscription plan</Text>
                </View>

                <LinearGradient
                    colors={[TOKENS.blue, TOKENS.blue]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.currentPlan}
                >
                    <View style={styles.planContent}>
                        <View style={styles.planBadge}>
                            <Text style={styles.planBadgeText}>{subscription.plan.toUpperCase()} PLAN</Text>
                        </View>
                        <Text style={styles.planTitle}>{subscription.plan} Plan</Text>
                        <Text style={styles.planPrice}>{subscription.price > 0 ? `₹${subscription.price}/month` : 'Free'}</Text>

                        <View style={styles.planFeatures}>
                            <View style={styles.featureItem}>
                                <Icon name="checkmark-circle" size={16} color="#FFFFFF" style={styles.featureIcon} />
                                <Text style={[styles.featureText, { color: '#FFFFFF' }]}>Unlimited uploads</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Icon name="checkmark-circle" size={16} color="#FFFFFF" style={styles.featureIcon} />
                                <Text style={[styles.featureText, { color: '#FFFFFF' }]}>AI-powered summaries</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Icon name="checkmark-circle" size={16} color="#FFFFFF" style={styles.featureIcon} />
                                <Text style={[styles.featureText, { color: '#FFFFFF' }]}>Custom quizzes</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Icon name="checkmark-circle" size={16} color="#FFFFFF" style={styles.featureIcon} />
                                <Text style={[styles.featureText, { color: '#FFFFFF' }]}>Priority support</Text>
                            </View>
                        </View>

                        <Text style={styles.renewalInfo}>{subscription.renewal ? `Renews on ${new Date(subscription.renewal).toDateString()}` : 'No renewal date'}</Text>

                        <TouchableOpacity
                            style={[styles.upgradeButton, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
                            onPress={() => Alert.alert('Manage plan', 'Manage plan flow is not implemented in this demo')}
                        >
                            <Text style={[styles.upgradeButtonText, { color: '#FFFFFF' }]}>Manage Plan</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Other Plans</Text>

                    {plans.map((p) => (
                        <View style={styles.planCard} key={p.id}>
                            <Text style={styles.planCardTitle}>{p.name} Plan</Text>
                            <Text style={styles.planCardPrice}>{p.price > 0 ? `₹${p.price / 100}/month` : 'Free'}</Text>
                            <Text style={styles.planCardDesc}>Plan ID: {p.id}</Text>
                            <TouchableOpacity
                                style={[styles.selectButton, subscription.plan.toLowerCase() === p.name.toLowerCase() ? { backgroundColor: TOKENS.blue } : {}]}
                                onPress={() => handlePurchase(p.id)}
                            >
                                <Text style={[styles.selectButtonText, subscription.plan.toLowerCase() === p.name.toLowerCase() ? { color: '#FFF' } : {}]}>{subscription.plan.toLowerCase() === p.name.toLowerCase() ? 'Current Plan' : p.price > 0 ? 'Upgrade Now' : 'Choose'}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ScreenBackground>
    );
}
