const VITE_APP_URL = import.meta.env.VITE_APP_URL || "https://tradeportal-2025-platinum.vercel.app";
const VITE_API_URL = import.meta.env.VITE_API_URL;
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "https://diligent-wildcat-523.convex.cloud";
const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL || "https://diligent-wildcat-523.convex.site";

// Sync Check: 2026-03-20 - Triad Infrastructure Synchronization

if (!CONVEX_URL) {
  console.warn('[CONFIG] VITE_CONVEX_URL missing, using fallback.');
}

export const URLS = {
  app: VITE_APP_URL,
  api: VITE_API_URL || `${VITE_APP_URL}/api`,
  convex: CONVEX_URL,
  supportEmail: 'soporte@tradeshare.io',
  noreplyEmail: 'noreply@tradeshare.io',
  supportUrl: 'mailto:soporte@tradeshare.io',
  portalUrl: 'https://portalib.vercel.app',
} as const;

export const SOCIAL_LINKS = {
  website: 'https://tradeshare.io',
  instagram: 'https://instagram.com/tradeshare',
  twitter: 'https://twitter.com/tradeshare',
  telegram: 'https://t.me/tradeshare',
  discord: 'https://discord.gg/tradeshare',
  youtube: 'https://youtube.com/@tradeshare',
} as const;

export const getAffiliateLink = (firmSlug: string) => {
  return `${URLS.portalUrl}/${firmSlug}`;
};

export const getSupportMailto = (subject?: string) => {
  const base = `mailto:${URLS.supportEmail}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
};
