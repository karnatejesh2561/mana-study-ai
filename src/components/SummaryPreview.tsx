import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';
import type { SummaryOutput } from '../types/models';

interface Props {
    summary: SummaryOutput;
}

export function SummaryPreview({ summary }: Props) {
    const theme = useTheme();
    const isDark = theme.dark;
    const borderColor = isDark ? DARK_THEME.glassBorder : LIGHT_THEME.glassBorder;
    const bg = isDark ? DARK_THEME.surfaceAlt : LIGHT_THEME.surface;
    const headingColor = isDark ? DARK_THEME.textPrimary : LIGHT_THEME.textPrimary;
    const titleColor = isDark ? DARK_THEME.text : LIGHT_THEME.text;
    const metaColor = isDark ? DARK_THEME.textMuted : LIGHT_THEME.textMuted;
    const sectionTitleColor = isDark ? DARK_THEME.blue : LIGHT_THEME.blue;
    const sectionBodyColor = isDark ? DARK_THEME.text : LIGHT_THEME.text;
    const quickBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(217, 226, 255, 0.12)';
    const quickTitleColor = isDark ? DARK_THEME.blue : LIGHT_THEME.blue;
    const quickItemColor = isDark ? DARK_THEME.text : LIGHT_THEME.text;
    return (
        <View style={[styles.root, { borderColor, backgroundColor: bg }]}>
            <Text style={[styles.heading, { color: headingColor }]}>Summary (Output)</Text>
            <Text style={[styles.title, { color: titleColor }]}>{summary.title}</Text>
            <Text style={[styles.meta, { color: metaColor }]}>{summary.pages ?? 0} pages</Text>
            {summary.sections.map((section) => (
                <View key={section.title} style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{section.title}</Text>
                    <Text style={[styles.sectionBody, { color: sectionBodyColor }]}>{section.content}</Text>
                </View>
            ))}
            <View style={[styles.quickBox, { backgroundColor: quickBg }]}>
                <Text style={[styles.quickTitle, { color: quickTitleColor }]}>Quick Summary</Text>
                {(summary.quickRevision || []).map((item, idx) => (
                    <Text key={`${idx}-${String(item).slice(0, 20)}`} style={[styles.quickItem, { color: quickItemColor }]}>- {item}</Text>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        margin: 14,
    },
    heading: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 2,
    },
    meta: {
        marginBottom: 10,
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontWeight: '700',
        marginBottom: 3,
    },
    sectionBody: {
        lineHeight: 20,
    },
    quickBox: {
        marginTop: 8,
        borderRadius: 10,
        padding: 10,
    },
    quickTitle: {
        fontWeight: '700',
        marginBottom: 6,
    },
    quickItem: {
        marginBottom: 2,
    },
});
