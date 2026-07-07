import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useMutation } from '@tanstack/react-query';
import { ScreenBackground } from '../../components/ScreenBackground';
import { SummaryPreview } from '../../components/SummaryPreview';
import { TopBar } from '../../components/TopBar';
import { generateSummary, pickStudyFile, uploadToSupabaseAndProcess } from '../../services/summaryService';
import { useAppStore } from '../../store/useAppStore';
import { formatSizeMb } from '../../utils/format';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../../theme/colors';

export function HomeScreen() {
    const theme = useTheme();
    const isDark = theme.dark;
    const cardBorder = isDark ? DARK_THEME.glassBorder : LIGHT_THEME.glassBorder;
    const cardBg = isDark ? DARK_THEME.surfaceAlt : LIGHT_THEME.surface;
    const headingColor = isDark ? DARK_THEME.text : LIGHT_THEME.text;
    const subheadingColor = isDark ? DARK_THEME.textSecondary : LIGHT_THEME.textSecondary;
    const dropBorder = isDark ? DARK_THEME.border : LIGHT_THEME.border;
    const dropTextColor = isDark ? DARK_THEME.text : LIGHT_THEME.text;
    const supportTextColor = isDark ? DARK_THEME.textMuted : LIGHT_THEME.textMuted;
    const fileBadgeBg = LIGHT_THEME.coralRed ?? '#FF3B4F';
    const fileBadgeTextColor = LIGHT_THEME.textInverted;
    const selectedDocument = useAppStore((state) => state.selectedDocument);
    const currentSummary = useAppStore((state) => state.currentSummary);
    const setSelectedDocument = useAppStore((state) => state.setSelectedDocument);
    const addSummary = useAppStore((state) => state.addSummary);

    const [localError, setLocalError] = React.useState<string | null>(null);

    const summaryMutation = useMutation({
        mutationFn: async (doc: any) => generateSummary(doc),
        onMutate: () => {
            setLocalError(null);
        },
        onSuccess: (summary) => {
            addSummary(summary);
            setSelectedDocument(null);
            setLocalError(null);
        },
        onError: (error: any) => {
            setLocalError(String(error?.message ?? error ?? 'Failed to generate summary'));
        },
    });
    const isGenerating = summaryMutation.status === 'pending';

    const pickFile = async () => {
        const file = await pickStudyFile();
        if (file) {
            setSelectedDocument(file);
        }
    };

    const onGenerate = async () => {
        if (!selectedDocument) return;

        setLocalError(null);

        try {
            await summaryMutation.mutateAsync(selectedDocument);
            return;
        } catch (e) {
            console.warn('Direct backend Gemini summary flow failed, falling back to Supabase worker path', e);
        }

        try {
            const fallbackSummary = await uploadToSupabaseAndProcess(selectedDocument);
            addSummary(fallbackSummary as any);
            setSelectedDocument(null);
            setLocalError(null);
        } catch (fallbackError) {
            const message = String((fallbackError as any)?.message ?? fallbackError ?? 'Failed to generate summary');
            console.error('Fallback upload flow also failed', fallbackError);
            setLocalError(message);
        }
    };

    return (
        <ScreenBackground>
            <TopBar title="ManaStudy AI" />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { borderColor: cardBorder, backgroundColor: cardBg }]}>
                    <Text style={[styles.heading, { color: headingColor }]}>Upload Study Material</Text>
                    <Text style={[styles.subheading, { color: subheadingColor }]}>Upload any file and get smart notes instantly</Text>

                    <TouchableOpacity style={[styles.dropZone, { borderColor: dropBorder, backgroundColor: isDark ? DARK_THEME.bgBlack : 'rgba(255, 255, 255, 0.03)' }]} activeOpacity={0.85} onPress={pickFile}>
                        <Icon name="cloud-upload-outline" size={32} color={isDark ? DARK_THEME.blue : LIGHT_THEME.blue} />
                        <Text style={[styles.dropMain, { color: dropTextColor }]}>Drag and drop your files here</Text>
                        <LinearGradient
                            colors={[LIGHT_THEME.gradientStart, LIGHT_THEME.gradientMid, LIGHT_THEME.gradientEnd]}
                            locations={[0, 0.4, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.chooseButton}
                        >
                            <Text style={styles.chooseLabel}>Choose File</Text>
                        </LinearGradient>
                        <Text style={[styles.supportText, { color: supportTextColor }]}>PDF, DOCX, PPT, Images (Max 50MB)</Text>
                    </TouchableOpacity>

                    {selectedDocument ? (
                        <View style={styles.fileRow}>
                            <View style={[styles.fileBadge, { backgroundColor: fileBadgeBg }]}>
                                <Text style={[styles.fileBadgeText, { color: fileBadgeTextColor }]}>{selectedDocument.type.toUpperCase()}</Text>
                            </View>
                            <View style={styles.fileTextWrap}>
                                <Text style={[styles.fileName, { color: headingColor }]}>{selectedDocument.name}</Text>
                                <Text style={[styles.fileSize, { color: supportTextColor }]}>{formatSizeMb(selectedDocument.size)}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedDocument(null)}>
                                <Icon name="close" size={20} color={isDark ? DARK_THEME.textSecondary : LIGHT_THEME.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    <TouchableOpacity onPress={onGenerate} disabled={!selectedDocument || isGenerating}>
                        <LinearGradient
                            colors={[LIGHT_THEME.gradientStart, LIGHT_THEME.gradientMid, LIGHT_THEME.gradientEnd]}
                            locations={[0, 0.4, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.generateButton, (!selectedDocument || isGenerating) && styles.disabledButton]}
                        >
                            {isGenerating ? (
                                <ActivityIndicator size="small" color={LIGHT_THEME.textInverted} style={{ marginRight: 8 }} />
                            ) : (
                                <Icon name="sparkles" size={16} color={LIGHT_THEME.textInverted} />
                            )}
                            <Text style={[styles.generateLabel, { color: isDark ? DARK_THEME.textInverted : LIGHT_THEME.textInverted }]}>{isGenerating ? 'Generating...' : 'Generate Summary'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {(localError || summaryMutation.isError) ? (
                        <View style={styles.errorRow}>
                            <Text style={styles.errorText}>{localError || String(summaryMutation.error?.message ?? 'Failed to generate summary')}</Text>
                            <TouchableOpacity onPress={() => {
                                setLocalError(null);
                                if (selectedDocument) summaryMutation.mutate(selectedDocument);
                            }} style={styles.retryButton}>
                                <Text style={styles.retryLabel}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>

                {currentSummary ? <SummaryPreview summary={currentSummary} /> : null}
            </ScrollView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 120,
    },
    card: {
        padding: 14,
        margin: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(122, 159, 255, 0.22)',
        backgroundColor: 'rgba(9, 26, 54, 0.86)',
    },
    heading: {
        color: '#F0F4FF',
        fontSize: 21,
        fontWeight: '800',
        marginBottom: 2,
    },
    subheading: {
        color: '#A5B7DD',
        marginBottom: 12,
    },
    dropZone: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#8AA7E8',
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    dropMain: {
        marginTop: 10,
        color: '#E8F0FF',
        fontWeight: '600',
        marginBottom: 10,
    },
    chooseButton: {
        borderRadius: 8,
        minWidth: 130,
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 8,
    },
    chooseLabel: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    supportText: {
        color: '#98ABD5',
        fontSize: 12,
    },
    fileRow: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(115, 152, 255, 0.28)',
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    fileBadge: {
        height: 34,
        width: 34,
        borderRadius: 8,
        backgroundColor: '#FF3B4F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    fileTextWrap: {
        flex: 1,
    },
    fileName: {
        color: '#ECF2FF',
        fontWeight: '600',
    },
    fileSize: {
        color: '#9BB0DD',
        fontSize: 12,
    },
    generateButton: {
        marginTop: 14,
        borderRadius: 10,
        height: 46,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    disabledButton: {
        opacity: 0.6,
    },
    generateLabel: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    errorRow: {
        marginTop: 12,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#4F050D',
        borderWidth: 1,
        borderColor: '#FF6B7C',
    },
    errorText: {
        color: '#FFFFFF',
        fontSize: 13,
        lineHeight: 18,
    },
    retryButton: {
        marginTop: 8,
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#FF3B4F',
    },
    retryLabel: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
    },
});
