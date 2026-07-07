import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenBackground } from '../components/ScreenBackground';
import { TopBar } from '../components/TopBar';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';
import type { RootStackScreenProps } from '../types/navigation';
import { useAppStore } from '../store/useAppStore';
import { View as RNView, Dimensions, UIManager } from 'react-native';

export function UsageScreen({ navigation }: RootStackScreenProps<'Usage'>) {
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
        usageItem: {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: TOKENS.glassBorder,
            backgroundColor: TOKENS.glassBg,
            padding: 16,
            marginBottom: 8,
        },
        usageHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        usageIcon: {
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: TOKENS.avatarBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        usageInfo: {
            flex: 1,
        },
        usageLabel: {
            color: TOKENS.textPrimary,
            fontSize: 14,
            fontWeight: '700',
            marginBottom: 2,
        },
        usageValue: {
            color: TOKENS.textSecondary,
            fontSize: 12,
        },
        progressBar: {
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(119, 153, 247, 0.2)',
            overflow: 'hidden',
            marginBottom: 8,
        },
        progressFill: {
            height: '100%',
            borderRadius: 3,
            backgroundColor: TOKENS.blue,
        },
        progressLabel: {
            color: TOKENS.textSecondary,
            fontSize: 12,
            textAlign: 'right',
        },
        statsGrid: {
            flexDirection: 'row',
            gap: 8,
        },
        chartContainer: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            height: 64,
            paddingHorizontal: 4,
            gap: 6,
            marginTop: 12,
        },
        chartBar: {
            flex: 1,
            marginHorizontal: 3,
            borderRadius: 4,
            backgroundColor: 'rgba(119,153,247,0.15)'
        },
        statCard: {
            flex: 1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: TOKENS.glassBorder,
            backgroundColor: TOKENS.glassBg,
            padding: 12,
            alignItems: 'center',
        },
        statValue: {
            color: TOKENS.textPrimary,
            fontSize: 24,
            fontWeight: '800',
            marginBottom: 4,
        },
        statLabel: {
            color: TOKENS.textSecondary,
            fontSize: 11,
            textAlign: 'center',
        },
        resetInfo: {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: TOKENS.glassBorder,
            backgroundColor: TOKENS.glassBg,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
        },
        resetIcon: {
            marginRight: 10,
        },
        resetText: {
            flex: 1,
            color: TOKENS.textSecondary,
            fontSize: 12,
        },
    });

    const summaries = useAppStore((s) => s.summaries);
    const quizAttempts = useAppStore((s) => s.quizAttempts);
    const subscription = useAppStore((s) => s.subscription);
    const loadSummariesFromBackend = useAppStore((s) => s.loadSummariesFromBackend);
    const loadQuizAttemptsFromBackend = useAppStore((s) => s.loadQuizAttemptsFromBackend);

    const summariesGenerated = summaries.length;
    const quizzesCreated = quizAttempts.length;

    // crude storage estimate: 0.25GB per summary document
    const storageUsed = +(summaries.length * 0.25).toFixed(2);
    const storageLimit = subscription.plan === 'Pro' || subscription.plan === 'Premium' ? 50 : 5;

    const uploadUsage = summaries.length;
    const uploadLimit = subscription.plan === 'Pro' || subscription.plan === 'Premium' ? 1000 : 50;

    // Build a simple weekly uploads array from summaries createdAt
    const now = Date.now();
    const weekBuckets = Array.from({ length: 7 }, (_, i) => 0);
    for (const s of summaries) {
        const t = new Date(s.createdAt).getTime();
        const daysAgo = Math.floor((now - t) / (24 * 3600 * 1000));
        if (daysAgo >= 0 && daysAgo < 7) {
            weekBuckets[6 - daysAgo] += 1;
        }
    }

    // Determine whether native SVG view manager is available (react-native-svg linked)
    let LineChartComponent: any = null;
    let canUseLineChart = false;
    try {
        const hasSvgView = typeof UIManager.getViewManagerConfig === 'function' && !!UIManager.getViewManagerConfig('RNSVGRect');
        if (hasSvgView) {
            // require at runtime so Metro doesn't fail when package missing
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const chartKit = require('react-native-chart-kit');
            LineChartComponent = chartKit?.LineChart ?? null;
            canUseLineChart = !!LineChartComponent;
        }
    } catch (e) {
        canUseLineChart = false;
    }

    React.useEffect(() => {
        // refresh data from backend when screen mounts
        void loadSummariesFromBackend();
        void loadQuizAttemptsFromBackend();
    }, [loadSummariesFromBackend, loadQuizAttemptsFromBackend]);

    return (
        <ScreenBackground>
            <TopBar title="ManaStudy AI" showBackButton onBackPress={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.header}>
                    <Text style={styles.heading}>Usage</Text>
                    <Text style={styles.subheading}>Check your upload and usage statistics</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>This Month</Text>

                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{quizzesCreated}</Text>
                            <Text style={styles.statLabel}>Quizzes Created</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{summariesGenerated}</Text>
                            <Text style={styles.statLabel}>Summaries</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>24</Text>
                            <Text style={styles.statLabel}>Study Hours</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Weekly Uploads</Text>
                    <View style={styles.usageItem}>
                        {canUseLineChart && LineChartComponent ? (
                            <LineChartComponent
                                data={{
                                    labels: ['6d', '5d', '4d', '3d', '2d', '1d', 'Today'],
                                    datasets: [{ data: weekBuckets }],
                                }}
                                width={Dimensions.get('window').width - 48}
                                height={160}
                                yAxisSuffix=""
                                chartConfig={{
                                    backgroundGradientFrom: TOKENS.glassBg,
                                    backgroundGradientTo: TOKENS.glassBg,
                                    color: (opacity = 1) => `${TOKENS.blue}`,
                                    labelColor: (opacity = 1) => TOKENS.textSecondary,
                                    propsForDots: { r: '4', strokeWidth: '0' },
                                }}
                                bezier
                                style={{ borderRadius: 12 }}
                            />
                        ) : (
                            <RNView style={styles.chartContainer}>
                                {weekBuckets.map((v, i) => {
                                    const max = Math.max(...weekBuckets, 1);
                                    const heightPct = Math.round((v / max) * 100);
                                    return (
                                        <RNView
                                            key={i}
                                            style={[
                                                styles.chartBar,
                                                { height: `${20 + (heightPct / 100) * 100}%`, backgroundColor: TOKENS.blue },
                                            ]}
                                        />
                                    );
                                })}
                            </RNView>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Storage Usage</Text>

                    <View style={styles.usageItem}>
                        <View style={styles.usageHeader}>
                            <View style={styles.usageIcon}>
                                <Icon name="cloud-outline" size={20} color={TOKENS.blue} />
                            </View>
                            <View style={styles.usageInfo}>
                                <Text style={styles.usageLabel}>Cloud Storage</Text>
                                <Text style={styles.usageValue}>{storageUsed} GB of {storageLimit} GB</Text>
                            </View>
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${(storageUsed / storageLimit) * 100}%`,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressLabel}>{Math.round((storageUsed / storageLimit) * 100)}% used</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Document Uploads</Text>

                    <View style={styles.usageItem}>
                        <View style={styles.usageHeader}>
                            <View style={styles.usageIcon}>
                                <Icon name="document-outline" size={20} color={TOKENS.blue} />
                            </View>
                            <View style={styles.usageInfo}>
                                <Text style={styles.usageLabel}>Documents Uploaded</Text>
                                <Text style={styles.usageValue}>{uploadUsage} of {uploadLimit} uploads</Text>
                            </View>
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${(uploadUsage / uploadLimit) * 100}%`,
                                        backgroundColor:
                                            uploadUsage / uploadLimit > 0.8 ? '#FF6B6B' : TOKENS.blue,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressLabel}>{Math.round((uploadUsage / uploadLimit) * 100)}% used</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>API Usage</Text>

                    <View style={styles.usageItem}>
                        <View style={styles.usageHeader}>
                            <View style={styles.usageIcon}>
                                <Icon name="pulse-outline" size={20} color={TOKENS.blue} />
                            </View>
                            <View style={styles.usageInfo}>
                                <Text style={styles.usageLabel}>API Calls</Text>
                                <Text style={styles.usageValue}>523 calls this month</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.usageItem}>
                        <View style={styles.usageHeader}>
                            <View style={styles.usageIcon}>
                                <Icon name="flash-outline" size={20} color={TOKENS.blue} />
                            </View>
                            <View style={styles.usageInfo}>
                                <Text style={styles.usageLabel}>Remaining Credits</Text>
                                <Text style={styles.usageValue}>∞ Unlimited (Pro Plan)</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.resetInfo}>
                        <Icon name="information-circle-outline" size={18} color={TOKENS.textSecondary} style={styles.resetIcon} />
                        <Text style={styles.resetText}>Usage resets on the 1st of each month</Text>
                    </View>
                </View>
            </ScrollView>
        </ScreenBackground>
    );
}
