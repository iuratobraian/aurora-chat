import { URLS } from './config/urls';

export const CONFIGS = {
  convex: {
    url: URLS.convex,
    siteUrl: URLS.convex,
  },
  app: {
    url: URLS.app,
    apiUrl: URLS.api,
  },
} as const;
