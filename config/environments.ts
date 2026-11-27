/**
 * Environment configuration management.
 * Supports qa / staging / prod with env-var overrides.
 */
export type EnvironmentName = 'qa' | 'staging' | 'prod';

export interface EnvironmentConfig {
  name: EnvironmentName;
  baseUrl: string;
  apiUrl?: string;
  credentials: {
    email?: string;
    password?: string;
  };
  timeouts: {
    default: number;
    navigation: number;
  };
  features: {
    allowPurchase: boolean;
    useFakePayment: boolean;
  };
}

const environments: Record<EnvironmentName, EnvironmentConfig> = {
  qa: {
    name: 'qa',
    baseUrl: 'https://automationexercise.com',
    credentials: {},
    timeouts: {
      default: Number(process.env.DEFAULT_TIMEOUT) || 30_000,
      navigation: Number(process.env.NAVIGATION_TIMEOUT) || 45_000,
    },
    features: {
      allowPurchase: false,
      useFakePayment: true,
    },
  },
  staging: {
    name: 'staging',
    baseUrl: 'https://automationexercise.com',
    credentials: {},
    timeouts: {
      default: Number(process.env.DEFAULT_TIMEOUT) || 30_000,
      navigation: Number(process.env.NAVIGATION_TIMEOUT) || 45_000,
    },
    features: {
      allowPurchase: false,
      useFakePayment: true,
    },
  },
  prod: {
    name: 'prod',
    baseUrl: 'https://automationexercise.com',
    credentials: {},
    timeouts: {
      default: Number(process.env.DEFAULT_TIMEOUT) || 45_000,
      navigation: Number(process.env.NAVIGATION_TIMEOUT) || 60_000,
    },
    features: {
      allowPurchase: false,
      useFakePayment: true,
    },
  },
};

export function getEnvironment(): EnvironmentConfig {
  const envName = (process.env.TEST_ENV || 'qa').toLowerCase() as EnvironmentName;
  const config = environments[envName];
  if (!config) {
    throw new Error(`Unknown TEST_ENV "${envName}". Valid values: ${Object.keys(environments).join(', ')}`);
  }
  if (process.env.BASE_URL) {
    return { ...config, baseUrl: process.env.BASE_URL };
  }
  return config;
}

export function getBaseUrl(): string {
  return getEnvironment().baseUrl;
}
