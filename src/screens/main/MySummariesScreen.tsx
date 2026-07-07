import React, { useMemo, useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Share, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { ScreenBackground } from '../../components/ScreenBackground';
import { TopBar } from '../../components/TopBar';
import { useAppStore } from '../../store/useAppStore';
import { formatSizeMb, prettyDate } from '../../utils/format';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../../theme/colors';

export function MySummariesScreen() {
    const theme = useTheme();
    const isDark = theme.dark;
    const headingColor = isDark ? DARK_THEME.text : LIGHT_THEME.text;
    const subheadingColor = isDark ? DARK_THEME.textSecondary : LIGHT_THEME.textSecondary;
    const placeholderColor = isDark ? DARK_THEME.textMuted : LIGHT_THEME.textMuted;
    const iconColor = isDark ? DARK_THEME.blue : LIGHT_THEME.blue;
    const inputBg = isDark ? DARK_THEME.surfaceAlt : LIGHT_THEME.surface;
    const itemBorder = isDark ? DARK_THEME.glassBorder : LIGHT_THEME.glassBorder;
    const itemBg = isDark ? DARK_THEME.surfaceAlt : LIGHT_THEME.surface;
    const pillBg = LIGHT_THEME.blue ?? '#2A7AFE';
    const titleColor = isDark ? DARK_THEME.text : LIGHT_THEME.text;
    const metaColor = isDark ? DARK_THEME.textMuted : LIGHT_THEME.textMuted;
    const snippetColor = isDark ? DARK_THEME.textSecondary : LIGHT_THEME.textSecondary;
    const viewBg = LIGHT_THEME.blue ?? '#1F63FF';
    const viewLabelColor = LIGHT_THEME.textInverted;
    const iconBorder = isDark ? DARK_THEME.glassBorder : LIGHT_THEME.glassBorder;
    const emptyColor = isDark ? DARK_THEME.textMuted : LIGHT_THEME.textMuted;
    const summaries = useAppStore((state) => state.summaries);
    const deleteSummary = useAppStore((state) => state.deleteSummary);
    const setCurrentSummary = useAppStore((state) => state.setCurrentSummary);
    const [query, setQuery] = useState('');
    const navigation = useNavigation<any>();
    const loadFromBackend = useAppStore((s) => s.loadSummariesFromBackend);
    const [refreshing, setRefreshing] = useState(false);
    const syncLocalToBackend = useAppStore((s) => s.syncLocalToBackend);

    useEffect(() => {
        // try to load remote summaries on mount
        (async () => {
            setRefreshing(true);
            await loadFromBackend().catch(() => { });
            setRefreshing(false);
        })();
    }, []);

    const onSync = async () => {
        setRefreshing(true);
        await syncLocalToBackend().catch(() => { });
        setRefreshing(false);
    };

    const filtered = useMemo(() => {
        if (!query.trim()) return summaries;
        const q = query.toLowerCase();
        return summaries.filter((item) => item.title.toLowerCase().includes(q));
    }, [query, summaries]);

    return (
        <ScreenBackground>
            <TopBar title="ManaStudy AI" />
            <View style={styles.container}>
                <Text style={[styles.heading, { color: headingColor }]}>My Summaries</Text>
                <Text style={[styles.subheading, { color: subheadingColor }]}>All your uploaded files and generated notes</Text>

                <View style={styles.searchRow}>
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search summaries..."
                        placeholderTextColor={placeholderColor}
                        style={[styles.searchInput, { borderColor: itemBorder, backgroundColor: inputBg, color: titleColor }]}
                    />
                    <TouchableOpacity style={[styles.filterButton, { borderColor: itemBorder, backgroundColor: inputBg }]}>
                        <Icon name="funnel-outline" size={18} color={iconColor} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterButton, { borderColor: itemBorder, backgroundColor: inputBg, marginLeft: 8 }]} onPress={onSync}>
                        <Icon name="sync-outline" size={18} color={iconColor} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={refreshing}
                    onRefresh={async () => {
                        setRefreshing(true);
                        await loadFromBackend().catch(() => { });
                        setRefreshing(false);
                    }}
                    renderItem={({ item }) => (
                        <View style={[styles.itemCard, { borderColor: itemBorder, backgroundColor: itemBg }]}>
                            <View style={[styles.filePill, { backgroundColor: pillBg }]}>
                                <Text style={styles.filePillText}>{item.title.slice(0, 3).toUpperCase()}</Text>
                            </View>
                            <View style={styles.mainArea}>
                                <Text style={[styles.title, { color: titleColor }]}>{item.title}</Text>
                                <Text style={[styles.meta, { color: metaColor }]}>{formatSizeMb((item.pages ?? 2) * 700000)} • {prettyDate(item.createdAt)}</Text>
                                <Text numberOfLines={2} style={[styles.snippet, { color: snippetColor }]}>{item.overview}</Text>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={[styles.viewButton, { backgroundColor: viewBg }]} onPress={() => { setCurrentSummary(item); navigation.navigate('SummaryDetails'); }}>
                                        <Text style={[styles.viewLabel, { color: viewLabelColor }]}>View</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.iconAction, { borderColor: iconBorder }]}
                                        onPress={async () => {
                                            try {
                                                await Share.share({ title: item.title, message: `${item.title}\n\n${item.overview}` });
                                            } catch (e) {
                                                // ignore
                                            }
                                        }}
                                    >
                                        <Icon name="download-outline" size={16} color={titleColor} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.iconAction, { borderColor: iconBorder }]}
                                        onPress={() => {
                                            Alert.alert('Delete summary', 'Are you sure you want to delete this summary?', [
                                                { text: 'Cancel', style: 'cancel' },
                                                { text: 'Delete', style: 'destructive', onPress: () => deleteSummary(item.id) },
                                            ]);
                                        }}
                                    >
                                        <Icon name="trash-outline" size={16} color={isDark ? DARK_THEME.error : LIGHT_THEME.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                />
            </View>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 14,
    },
    heading: {
        color: '#F2F6FF',
        fontSize: 30,
        fontWeight: '800',
    },
    subheading: {
        color: '#A5B7DD',
        marginBottom: 10,
    },
    searchRow: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(122, 159, 255, 0.3)',
        backgroundColor: 'rgba(11, 30, 59, 0.95)',
        color: '#ECF2FF',
        paddingHorizontal: 12,
    },
    filterButton: {
        width: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(122, 159, 255, 0.3)',
        backgroundColor: 'rgba(11, 30, 59, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        paddingBottom: 120,
    },
    itemCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(122, 159, 255, 0.25)',
        backgroundColor: 'rgba(9, 26, 54, 0.86)',
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        gap: 10,
    },
    filePill: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#2A7AFE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filePillText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
    },
    mainArea: {
        flex: 1,
    },
    title: {
        color: '#EDF3FF',
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 2,
    },
    meta: {
        color: '#8FA4D3',
        fontSize: 12,
        marginBottom: 6,
    },
    snippet: {
        color: '#C8D8FC',
        marginBottom: 10,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    viewButton: {
        backgroundColor: '#1F63FF',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    viewLabel: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    iconAction: {
        width: 34,
        height: 34,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(125, 160, 255, 0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    empty: {
        color: '#9FB4DF',
        textAlign: 'center',
        marginTop: 32,
    },
});
