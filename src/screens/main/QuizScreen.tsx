import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useMutation } from '@tanstack/react-query';
import { ScreenBackground } from '../../components/ScreenBackground';
import { StatCard } from '../../components/StatCard';
import { TopBar } from '../../components/TopBar';
import { generateQuiz, submitQuizAttempt } from '../../services/quizService';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from 'react-native-paper';
import { LIGHT_THEME, DARK_THEME } from '../../theme/colors';

export function QuizScreen() {
    const theme = useTheme();
    const isDark = theme.dark;
    const headingColor = isDark ? DARK_THEME.text : LIGHT_THEME.text;
    const subheadingColor = isDark ? DARK_THEME.textSecondary : LIGHT_THEME.textSecondary;
    const selectBorder = isDark ? DARK_THEME.glassBorder : LIGHT_THEME.glassBorder;
    const selectBg = isDark ? DARK_THEME.surfaceAlt : LIGHT_THEME.surface;
    const selectLabel = isDark ? DARK_THEME.textMuted : LIGHT_THEME.textMuted;
    const selectValue = isDark ? DARK_THEME.text : LIGHT_THEME.text;
    const cardBorder = isDark ? DARK_THEME.glassBorder : LIGHT_THEME.glassBorder;
    const cardBg = isDark ? DARK_THEME.surfaceAlt : LIGHT_THEME.surface;
    const optionBorder = isDark ? 'rgba(119,153,247,0.12)' : 'rgba(119,153,247,0.3)';
    const optionActiveBorder = isDark ? DARK_THEME.blue : LIGHT_THEME.blue;
    const optionActiveBg = isDark ? 'rgba(10,102,255,0.08)' : 'rgba(42, 122, 254, 0.13)';
    const optionTextColor = isDark ? DARK_THEME.text : LIGHT_THEME.text;
    const footerMetaColor = isDark ? DARK_THEME.textSecondary : LIGHT_THEME.textSecondary;
    const questionTitleColor = isDark ? DARK_THEME.textPrimary : LIGHT_THEME.textPrimary;

    const summaries = useAppStore((state) => state.summaries);
    const currentQuiz = useAppStore((state) => state.currentQuiz);
    const setCurrentQuiz = useAppStore((state) => state.setCurrentQuiz);
    const addQuizAttempt = useAppStore((state) => state.addQuizAttempt);

    const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
    const [step, setStep] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedSummaryId && summaries.length > 0) {
            setSelectedSummaryId(summaries[0].id);
        }
    }, [summaries, selectedSummaryId]);

    const selectedSummary = summaries.find((summary) => summary.id === selectedSummaryId) ?? summaries[0] ?? null;

    useEffect(() => {
        if (selectedSummary && currentQuiz?.summaryId !== selectedSummary.id) {
            setCurrentQuiz(null);
            setStep(0);
            setSelectedAnswers([]);
            setIsFinished(false);
        }
    }, [currentQuiz, selectedSummary, setCurrentQuiz]);

    const quizMutation = useMutation({
        mutationFn: generateQuiz,
        onSuccess: (quiz) => {
            setCurrentQuiz(quiz);
            setStep(0);
            setSelectedAnswers([]);
            setIsFinished(false);
            setSubmitError(null);
        },
    });

    const quiz = currentQuiz;

    const attemptCount = selectedAnswers.filter((item) => item >= 0).length;
    const score = useMemo(() => {
        if (!quiz) {
            return 0;
        }
        return selectedAnswers.reduce((acc, option, index) => {
            return option === quiz.questions[index]?.answerIndex ? acc + 1 : acc;
        }, 0);
    }, [quiz, selectedAnswers]);

    const currentQuestion = quiz?.questions?.[step];
    const chosen = selectedAnswers[step] ?? -1;

    const pickOption = (optionIndex: number) => {
        if (!quiz) {
            return;
        }
        setSelectedAnswers((prev) => {
            const next = [...prev];
            next[step] = optionIndex;
            return next;
        });
    };

    const onNext = async () => {
        if (!quiz) {
            return;
        }
        if (step < quiz.questions.length - 1) {
            setStep((prev) => prev + 1);
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await submitQuizAttempt(quiz.quizId, quiz.summaryId, score, quiz.questions.length, selectedAnswers);
            addQuizAttempt({
                quizId: quiz.quizId,
                summaryId: quiz.summaryId,
                score,
                total: quiz.questions.length,
                selectedAnswers,
                createdAt: new Date().toISOString(),
            });
            setIsFinished(true);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save quiz results';
            setSubmitError(message);
            setIsFinished(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetQuiz = () => {
        setIsFinished(false);
        setStep(0);
        setSelectedAnswers([]);
        setCurrentQuiz(null);
        setSubmitError(null);
    };

    const renderSummaryOption = (summary: any) => {
        const isSelected = selectedSummary?.id === summary.id;
        return (
            <TouchableOpacity
                key={summary.id}
                style={[
                    styles.summaryOption,
                    { borderColor: selectBorder, backgroundColor: isSelected ? optionActiveBg : selectBg },
                ]}
                onPress={() => setSelectedSummaryId(summary.id)}
            >
                <Text style={[styles.summaryOptionTitle, { color: selectValue }]} numberOfLines={1}>
                    {summary.title}
                </Text>
                <Text style={[styles.summaryOptionSubtitle, { color: selectLabel }]} numberOfLines={1}>
                    {summary.subject || 'Summary'}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenBackground>
            <TopBar title="ManaStudy AI" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.heading, { color: headingColor }]}>Quiz</Text>
                <Text style={[styles.subheading, { color: subheadingColor }]}>Test your knowledge from your notes</Text>

                {!quiz ? (
                    <>
                        {summaries.length > 0 ? (
                            <>
                                <Text style={[styles.sectionLabel, { color: selectLabel }]}>Select Summary</Text>
                                <View style={styles.summaryList}>
                                    {summaries.map((summary) => renderSummaryOption(summary))}
                                </View>
                            </>
                        ) : (
                            <View style={[styles.placeholderCard, { borderColor: cardBorder, backgroundColor: cardBg }]}>
                                <Text style={[styles.placeholderText, { color: optionTextColor }]}>No summaries available yet. Create a summary first.</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.generateButton,
                                { backgroundColor: selectedSummary ? LIGHT_THEME.blue : '#9CA3AF' },
                            ]}
                            onPress={() => selectedSummary && quizMutation.mutate(selectedSummary)}
                            disabled={!selectedSummary || quizMutation.isPending}
                        >
                            <Text style={styles.generateButtonText}>
                                {quizMutation.isPending ? 'Generating Quiz...' : 'Generate Quiz'}
                            </Text>
                        </TouchableOpacity>

                        {quizMutation.isError && (
                            <View style={[styles.errorCard, { borderColor: cardBorder, backgroundColor: cardBg }]}>
                                <Text style={styles.errorText}>Unable to generate quiz. Please try again.</Text>
                            </View>
                        )}
                    </>
                ) : isFinished ? (
                    <>
                        <View style={styles.statsRow}>
                            <StatCard value={`${quiz.questions.length}`} label="Total Questions" />
                            <StatCard value={`${attemptCount}`} label="Attempted" />
                            <StatCard value={`${Math.round((score / Math.max(quiz.questions.length, 1)) * 100)}%`} label="Score" />
                        </View>

                        <View style={[styles.resultsCard, { borderColor: cardBorder, backgroundColor: cardBg }]}>
                            <Text style={[styles.resultsTitle, { color: questionTitleColor }]}>Quiz Complete!</Text>

                            <View style={styles.resultsSummary}>
                                <LinearGradient
                                    colors={[LIGHT_THEME.blue, '#FF6B00']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.scoreCircle}
                                >
                                    <Text style={styles.resultsScore}>
                                        {score}/{quiz.questions.length}
                                    </Text>
                                </LinearGradient>

                                <Text style={[styles.resultsPercentage, { color: LIGHT_THEME.blue }]}>
                                    {Math.round((score / Math.max(quiz.questions.length, 1)) * 100)}%
                                </Text>
                            </View>

                            <Text style={[styles.resultsMessage, { color: optionTextColor }]}>
                                {score === quiz.questions.length
                                    ? '🎉 Perfect score! Excellent work!'
                                    : score >= quiz.questions.length * 0.7
                                        ? '👍 Great job! Keep practicing!'
                                        : score >= quiz.questions.length * 0.5
                                            ? '📚 Good effort! Review the material.'
                                            : '💪 Review the concepts and try again.'}
                            </Text>

                            {submitError && (
                                <View style={[styles.errorAlert, { borderColor: '#FFD2D2' }]}>
                                    <Text style={styles.errorAlertText}>{submitError}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.retakeButton, { backgroundColor: LIGHT_THEME.blue }]}
                                onPress={resetQuiz}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.retakeButtonText}>
                                    {isSubmitting ? 'Saving...' : 'Retake Quiz'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.statsRow}>
                            <StatCard value={`${quiz.questions.length}`} label="Total Questions" />
                            <StatCard value={`${attemptCount}`} label="Attempted" />
                            <StatCard value={`${Math.round((score / Math.max(quiz.questions.length, 1)) * 100)}%`} label="Score" />
                        </View>

                        <View style={[styles.questionCard, { borderColor: cardBorder, backgroundColor: cardBg }]}>
                            <View style={styles.questionHeader}>
                                <Text style={[styles.questionMeta, { color: footerMetaColor }]}>
                                    Question {step + 1} of {quiz.questions.length}
                                </Text>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${((step + 1) / quiz.questions.length) * 100}%`,
                                                backgroundColor: LIGHT_THEME.blue,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>

                            <Text style={[styles.questionTitle, { color: questionTitleColor }]}>
                                {currentQuestion?.question ?? 'Loading question...'}
                            </Text>

                            <View style={styles.optionsContainer}>
                                {currentQuestion?.options?.map((option, optionIndex) => (
                                    <TouchableOpacity
                                        key={`${option}-${optionIndex}`}
                                        style={[
                                            styles.optionRow,
                                            { borderColor: optionBorder, backgroundColor: cardBg },
                                            chosen === optionIndex && {
                                                borderColor: optionActiveBorder,
                                                backgroundColor: optionActiveBg,
                                                borderWidth: 2,
                                            },
                                        ]}
                                        onPress={() => pickOption(optionIndex)}
                                    >
                                        <View
                                            style={[
                                                styles.radio,
                                                {
                                                    borderColor: chosen === optionIndex ? optionActiveBorder : optionBorder,
                                                    backgroundColor:
                                                        chosen === optionIndex ? optionActiveBorder : 'transparent',
                                                },
                                            ]}
                                        />
                                        <Text style={[styles.optionText, { color: optionTextColor }]}>
                                            {String.fromCharCode(65 + optionIndex)}. {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.footerRow}>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (step > 0) {
                                            setStep((prev) => prev - 1);
                                        }
                                    }}
                                    disabled={step === 0}
                                >
                                    <Text
                                        style={[
                                            styles.footerButton,
                                            { color: step === 0 ? '#9CA3AF' : LIGHT_THEME.blue },
                                        ]}
                                    >
                                        Previous
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={onNext} disabled={isSubmitting || chosen === -1}>
                                    <LinearGradient
                                        colors={[LIGHT_THEME.blue, LIGHT_THEME.blue, '#FF6B00']}
                                        locations={[0, 0.4, 1]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.nextButton, chosen === -1 && { opacity: 0.5 }]}
                                    >
                                        <Text style={styles.nextLabel}>
                                            {isSubmitting ? 'Saving...' : step === quiz.questions.length - 1 ? 'Finish' : 'Next'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 14,
        paddingBottom: 120,
    },
    heading: {
        color: '#F2F6FF',
        fontSize: 30,
        fontWeight: '800',
    },
    subheading: {
        color: '#A5B7DD',
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 8,
    },
    summaryList: {
        marginBottom: 14,
    },
    summaryOption: {
        padding: 14,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 10,
    },
    summaryOptionTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    summaryOptionSubtitle: {
        marginTop: 4,
        fontSize: 12,
    },
    generateButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16,
    },
    generateButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    statsRow: {
        marginTop: 12,
        marginBottom: 14,
        flexDirection: 'row',
        gap: 8,
    },
    questionCard: {
        marginTop: 12,
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
    },
    questionHeader: {
        marginBottom: 12,
    },
    questionMeta: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(119,153,247,0.2)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    questionTitle: {
        color: '#EBF2FF',
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 16,
        lineHeight: 22,
    },
    optionsContainer: {
        marginBottom: 16,
    },
    optionRow: {
        minHeight: 50,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    radio: {
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 2,
        marginRight: 12,
    },
    optionText: {
        color: '#DCE8FF',
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    footerRow: {
        marginTop: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerButton: {
        fontWeight: '700',
        fontSize: 15,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    footerMeta: {
        color: '#A6BAE3',
    },
    nextButton: {
        borderRadius: 9,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    nextLabel: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
    placeholderCard: {
        marginTop: 12,
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
    },
    placeholderText: {
        color: '#DCE8FF',
        fontSize: 14,
    },
    errorCard: {
        marginTop: 12,
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
    },
    errorText: {
        color: '#FFD2D2',
        fontSize: 14,
    },
    resultsCard: {
        marginTop: 12,
        borderWidth: 1,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    resultsTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 20,
    },
    resultsSummary: {
        alignItems: 'center',
        marginBottom: 20,
    },
    scoreCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    resultsScore: {
        fontSize: 40,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    resultsPercentage: {
        fontSize: 18,
        fontWeight: '600',
    },
    resultsMessage: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    errorAlert: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 14,
    },
    errorAlertText: {
        color: '#FFD2D2',
        fontSize: 13,
        textAlign: 'center',
    },
    retakeButton: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        width: '100%',
    },
    retakeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
