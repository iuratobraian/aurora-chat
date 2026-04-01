import { ConvexHttpClient } from 'convex/browser';

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || 'https://diligent-wildcat-523.convex.cloud';

let convexClient: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    convexClient = new ConvexHttpClient(CONVEX_URL);
  }
  return convexClient;
}
