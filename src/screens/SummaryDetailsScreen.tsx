import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text, Share, Alert } from 'react-native';
import { ScreenBackground } from '../components/ScreenBackground';
import { SummaryPreview } from '../components/SummaryPreview';
import { TopBar } from '../components/TopBar';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';

export function SummaryDetailsScreen() {
    const summary = useAppStore((state) => state.currentSummary);
    const deleteSummary = useAppStore((s) => s.deleteSummary);
    const setCurrentSummary = useAppStore((s) => s.setCurrentSummary);
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const isDark = theme.dark;
    const iconBorder = isDark ? DARK_THEME.glassBorder : LIGHT_THEME.glassBorder;

    if (!summary) {
        return <ScreenBackground />;
    }

    const onShare = async () => {
        try {
            await Share.share({ title: summary.title, message: `${summary.title}\n\n${summary.overview}` });
        } catch (e) {
            // ignore
        }
    };

    const onDownloadPdf = async () => {
        try {
            const { getSummaryPdfUrl } = await import('../services/summaryService');
            const url = getSummaryPdfUrl(summary.id);
            // open in external browser to trigger download
            const { Linking } = await import('react-native');
            Linking.openURL(url).catch(() => { });
        } catch (e) {
            // ignore
        }
    };

    return (
        <ScreenBackground>
            <TopBar title="Summary" />
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, { borderColor: iconBorder }]} onPress={onShare}>
                        <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { borderColor: iconBorder }]} onPress={onDownloadPdf}>
                        <Text style={styles.actionText}>Download PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: iconBorder }]}
                        onPress={() => {
                            Alert.alert('Delete summary', 'Are you sure you want to delete this summary?', [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => {
                                        if (summary) deleteSummary(summary.id);
                                        setCurrentSummary(null);
                                        navigation.goBack();
                                    },
                                },
                            ]);
                        }}
                    >
                        <Text style={[styles.actionText, { color: '#FF4D5F' }]}>Delete</Text>
                    </TouchableOpacity>
                </View>

                <SummaryPreview summary={summary} />
            </ScrollView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 14,
        paddingBottom: 120,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    actionBtn: {
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    actionText: {
        fontWeight: '700',
    },
});
