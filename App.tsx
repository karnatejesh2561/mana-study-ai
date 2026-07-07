import React from 'react';
import { useState } from 'react';
import { StatusBar } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useThemeMode } from './src/hooks/useThemeMode';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AppProvider, useApp } from './src/AppContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { setDevBackendHostOverride } from './src/services/apiClient';

const DEV_BACKEND_HOST = '192.168.1.7';
const DEV_BACKEND_PORT = 4000;

if (__DEV__) {
  setDevBackendHostOverride(DEV_BACKEND_HOST, DEV_BACKEND_PORT);
  // eslint-disable-next-line no-console
  console.log('Using manual backend override:', DEV_BACKEND_HOST, DEV_BACKEND_PORT);
}

const queryClient = new QueryClient();

// Ensure icon font is loaded before icon components render.
Ionicons.loadFont();

function AppInner() {
  const theme = useThemeMode();
  const { isAuthenticated } = useApp();
  const [showWelcome, setShowWelcome] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'forgot'>('login');

  if (showWelcome) {
    return <WelcomeScreen onComplete={() => setShowWelcome(false)} />;
  }

  if (!isAuthenticated) {
    if (authScreen === 'register') {
      return <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />;
    }

    if (authScreen === 'forgot') {
      return <ForgotPasswordScreen onNavigateToLogin={() => setAuthScreen('login')} />;
    }

    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthScreen('register')}
        onNavigateToForgot={() => setAuthScreen('forgot')}
      />
    );
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors?.background ?? '#FFFFFF'}
      />
      <AppNavigator />
    </PaperProvider>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <AppInner />
        </AppProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
