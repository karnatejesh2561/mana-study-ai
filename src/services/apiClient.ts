import axios, { type AxiosRequestConfig } from 'axios';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_STORAGE_KEY = 'MANA_AUTH_TOKEN';
let authToken: string | null = null;

const loadAuthToken = async (): Promise<void> => {
  if (authToken === null) {
    authToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  }
};

export const setAuthToken = async (token: string | null) => {
  authToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

const getMetroHost = (): string | null => {
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  const hostMatch = scriptURL?.match(/https?:\/\/([^/:]+)/);
  if (hostMatch?.[1]) {
    return hostMatch[1];
  }

  const serverHost = (NativeModules as any)?.DevSettings?.serverHost as string | undefined;
  const serverHostMatch = serverHost?.match(/([^:]+)(?::\d+)?$/);
  return serverHostMatch?.[1] ?? null;
};

const isAndroidEmulator = (): boolean => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const platformConstants = (NativeModules as any).PlatformConstants || {};
    const fingerprint = (platformConstants.Fingerprint || platformConstants.fingerprint || '') as string;
    const model = (platformConstants.Model || platformConstants.model || '') as string;
    return /generic|sdk|emulator|simulator/i.test(`${fingerprint}${model}`);
  } catch (e) {
    return false;
  }
};

const DEFAULT_ANDROID_BACKEND_HOST = '192.168.1.7';
let DEV_BACKEND_HOST_OVERRIDE: string | null = __DEV__ && Platform.OS === 'android' ? DEFAULT_ANDROID_BACKEND_HOST : null;
let DEV_BACKEND_PORT_OVERRIDE = 4000;

// For USB-connected Android devices, the app will use the PC host below automatically.
// If you need a different host, update the override here or call setDevBackendHostOverride.
export const setDevBackendHostOverride = (host: string | null, port = 4000): void => {
  DEV_BACKEND_HOST_OVERRIDE = host;
  DEV_BACKEND_PORT_OVERRIDE = port;
  apiClient.defaults.baseURL = host ? getBaseUrl() : undefined;
};

const getBackendHost = (): string => {
  if (DEV_BACKEND_HOST_OVERRIDE) {
    return DEV_BACKEND_HOST_OVERRIDE;
  }

  const metroHost = getMetroHost();
  const emulator = isAndroidEmulator();

  if (metroHost && !['localhost', '127.0.0.1', '10.0.2.2'].includes(metroHost)) {
    return metroHost;
  }

  if (Platform.OS === 'android') {
    return emulator ? '10.0.2.2' : metroHost || '10.0.2.2';
  }

  return 'localhost';
};

const getBaseUrlForPort = (port: number): string => {
  const host = getBackendHost();
  return `http://${host}:${port}`;
};

const getProbePorts = (): number[] => [DEV_BACKEND_PORT_OVERRIDE];

const getProbeCandidates = (): string[] => {
  const candidates = new Set<string>();
  const backendHost = getBackendHost();
  const metroHost = getMetroHost();
  const hosts = new Set<string>();

  if (backendHost) {
    hosts.add(backendHost);
  }

  if (Platform.OS === 'android') {
    hosts.add('10.0.2.2');
  }

  if (metroHost) {
    hosts.add(metroHost);
  }

  hosts.add('localhost');
  hosts.add('127.0.0.1');

  for (const host of hosts) {
    for (const port of getProbePorts()) {
      candidates.add(`http://${host}:${port}`);
    }
  }

  return Array.from(candidates);
};

const getBaseUrl = (): string => getBaseUrlForPort(DEV_BACKEND_PORT_OVERRIDE);

// Create axios client without a hard-coded baseURL so we can probe hosts
// and set the correct baseURL asynchronously on startup. This avoids
// using a wrong `localhost` address on Android devices/emulators.
export const apiClient = axios.create({
  timeout: 30000,
  baseURL: DEV_BACKEND_HOST_OVERRIDE ? getBaseUrl() : undefined,
});

if (DEV_BACKEND_HOST_OVERRIDE) {
  apiClient.defaults.baseURL = getBaseUrl();
}

// Log the resolved base URL to help debugging device connectivity during development.
try {
  // eslint-disable-next-line no-console
  console.log('apiClient starting. baseURL will be resolved shortly...', apiClient.defaults.baseURL ? `baseURL=${apiClient.defaults.baseURL}` : 'no baseURL yet');
} catch (e) {
  // ignore in environments without console
}

// Promise that resolves once we've probed and set the backend URL.
let _backendReadyResolve: () => void;
const backendReady = new Promise<void>((res) => {
  _backendReadyResolve = res;
});

let resolverStarted = false;

export const initBackendResolver = (): void => {
  if (resolverStarted) {
    return;
  }
  resolverStarted = true;
  void resolveBackendHealth();
};

// Ensure all requests wait until the backend probe completes so
// we don't attempt requests against an incorrect host on Android devices.
apiClient.interceptors.request.use(async (config) => {
  initBackendResolver();

  try {
    await backendReady;
  } catch (e) {
    // ignore and continue
  }

  try {
    await loadAuthToken();
    if (authToken) {
      // Assign headers defensively to satisfy Axios header typing
      (config.headers as any) = {
        ...(config.headers || {}),
        Authorization: `Bearer ${authToken}`,
      };
    }
  } catch (e) {
    // ignore token loading errors
  }

  return config;
});

const tryRequestWithFallback = async (config: AxiosRequestConfig): Promise<any> => {
  const currentBaseUrl = apiClient.defaults.baseURL || getBaseUrl();
  const candidateUrls = getProbeCandidates().filter((candidate) => candidate !== currentBaseUrl);

  for (const fallbackBaseUrl of candidateUrls) {
    (config as any).__retryPortFallback = true;
    apiClient.defaults.baseURL = fallbackBaseUrl;
    config.baseURL = fallbackBaseUrl;
    try {
      return await apiClient.request(config);
    } catch (e) {
      // ignore and try next fallback
    }
  }

  throw new Error('No backend available on known development hosts.');
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config as AxiosRequestConfig | undefined;

    if (!error?.response && config && !(config as any).__retryPortFallback) {
      try {
        return await tryRequestWithFallback(config);
      } catch (fallbackError) {
        // ignore and continue to error handling below
      }
    }

    if (!error?.response) {
      const baseUrl = apiClient.defaults.baseURL || getBaseUrl();
      return Promise.reject(
        new Error(`Cannot reach backend at ${baseUrl}. Ensure the backend is running and your device can access this host.`),
      );
    }

    const responseData = error.response.data as any;
    const serverMessage = responseData?.error || responseData?.detail || responseData?.message;
    let message = serverMessage || error?.message || 'Something went wrong';

    if (error.response.status === 401) {
      message = serverMessage || 'Email and password do not match or user not found.';
    }

    return Promise.reject(new Error(message));
  },
);

// Try to resolve a healthy backend automatically on startup by probing
// common development ports. This helps devices/emulators that can't reach
// the default `localhost:8000` host (or when 8000 is busy).
export async function waitForBackendReady(): Promise<void> {
  await backendReady;
}

async function resolveBackendHealth() {
  try {
    const candidates = getProbeCandidates();
    // eslint-disable-next-line no-console
    console.log('apiClient probing backend candidates:', candidates);
    for (const candidate of candidates) {
      try {
        const res = await fetch(`${candidate}/health`);
        if (res && res.ok) {
          apiClient.defaults.baseURL = candidate;
          // eslint-disable-next-line no-console
          console.log('apiClient baseURL resolved to', candidate);
          _backendReadyResolve();
          return;
        }
      } catch (e) {
        // ignore and try next candidate
      }
    }
    // If nothing found, fall back to a single explicit backend port.
    const fallback = `http://${getBackendHost()}:4000`;
    apiClient.defaults.baseURL = apiClient.defaults.baseURL || fallback;
    // eslint-disable-next-line no-console
    console.warn('Could not find healthy backend on known ports; falling back to', apiClient.defaults.baseURL);
    _backendReadyResolve();
  } catch (e) {
    // nothing to do
  }
}

// `apiClient` exported above via `export const apiClient` — no additional export needed.
