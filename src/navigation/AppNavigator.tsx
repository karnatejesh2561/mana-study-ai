import React from 'react';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator, type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../screens/main/HomeScreen';
import { MySummariesScreen } from '../screens/main/MySummariesScreen';
import { QuizScreen } from '../screens/main/QuizScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { SummaryDetailsScreen } from '../screens/SummaryDetailsScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { UsageScreen } from '../screens/UsageScreen';
import { BackendConfigScreen } from '../screens/main/BackendConfigScreen';
import { HelpFAQsScreen } from '../screens/HelpFAQsScreen';
import { ContactUsScreen } from '../screens/ContactUsScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { TermsConditionsScreen } from '../screens/TermsConditionsScreen';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';
import { useAppStore } from '../store/useAppStore';
import { LIGHT_THEME, DARK_THEME } from '../theme/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const darkNavTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: DARK_THEME.background,
        card: DARK_THEME.backgroundAlt,
        border: DARK_THEME.border,
        text: DARK_THEME.textPrimary,
        primary: DARK_THEME.blue,
    },
};

const lightNavTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: LIGHT_THEME.background,
        card: LIGHT_THEME.backgroundAlt,
        border: LIGHT_THEME.border,
        text: LIGHT_THEME.textPrimary,
        primary: LIGHT_THEME.blue,
    },
};

const tabIconMap: Record<keyof MainTabParamList, string> = {
    Home: 'cloud-upload-outline',
    MySummaries: 'documents-outline',
    Quiz: 'help-circle-outline',
    Settings: 'settings-outline',
};

function renderTabIcon(routeName: keyof MainTabParamList, color: string, size: number) {
    return <Icon name={tabIconMap[routeName]} size={size} color={color} />;
}

function MainTabs() {
    const darkMode = useAppStore((state) => state.profile.darkMode);
    const tabBackground = darkMode ? DARK_THEME.backgroundAlt : LIGHT_THEME.backgroundAlt;
    const tabBorder = darkMode ? DARK_THEME.border : LIGHT_THEME.border;
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    height: 64,
                    paddingBottom: 6,
                    paddingTop: 6,
                    backgroundColor: tabBackground,
                    borderTopColor: tabBorder,
                    borderTopWidth: 1,
                    elevation: 0,
                    shadowOpacity: 0,
                    radius: 0,
                },
                tabBarActiveBackgroundColor: tabBackground,
                tabBarInactiveBackgroundColor: tabBackground,
                tabBarActiveTintColor: darkMode ? DARK_THEME.blue : LIGHT_THEME.blue,
                tabBarInactiveTintColor: darkMode ? DARK_THEME.tabInactive : LIGHT_THEME.tabInactive,
                tabBarIcon: ({ color, size }) => renderTabIcon(route.name, color, size),
                tabBarButton: (props: BottomTabBarButtonProps) => {
                    const { onLongPress, delayLongPress, disabled, onBlur, onFocus, onLayout, onAccessibilityTap, ...buttonProps } = props;
                    return (
                        <TouchableOpacity
                            {...(buttonProps as TouchableOpacityProps)}
                            onLongPress={undefined}
                            delayLongPress={delayLongPress ?? undefined}
                            disabled={Boolean(disabled)}
                            activeOpacity={0.8}
                        />
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="MySummaries" component={MySummariesScreen} options={{ title: 'Summaries' }} />
            <Tab.Screen name="Quiz" component={QuizScreen} />
            <Tab.Screen name="Settings" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export function AppNavigator() {
    const darkMode = useAppStore((state) => state.profile.darkMode);
    const navTheme = darkMode ? darkNavTheme : lightNavTheme;

    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false, }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="SummaryDetails" component={SummaryDetailsScreen} />
                <Stack.Screen name="Account" component={AccountScreen} />
                <Stack.Screen name="Subscription" component={SubscriptionScreen} />
                <Stack.Screen name="Usage" component={UsageScreen} />
                <Stack.Screen name="BackendConfig" component={BackendConfigScreen} />
                <Stack.Screen name="HelpFAQs" component={HelpFAQsScreen} />
                <Stack.Screen name="ContactUs" component={ContactUsScreen} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
