const INSTAGRAM_API_VERSION = 'v18.0';
const BASE_URL = `https://graph.facebook.com/${INSTAGRAM_API_VERSION}`;

export interface InstagramAccount {
  id: string;
  username: string;
  name: string;
  profile_picture_url: string;
  biography: string;
  website: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  ig_id: number;
}

export interface InstagramMedia {
  id: string;
  caption: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  reach?: number;
  impressions?: number;
  saved?: number;
  engagement: number;
}

export interface InstagramInsights {
  impressions: number;
  reach: number;
  profile_views: number;
  website_clicks: number;
  email_contacts: number;
  follower_count: number;
}

export interface PublishResult {
  id: string;
  permalink: string;
  timestamp: string;
}

export class InstagramApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'InstagramApiError';
  }
}

async function fetchInstagram<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${accessToken}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new InstagramApiError(
      data.error?.message || 'Instagram API Error',
      response.status,
      data.error?.code
    );
  }

  return data;
}

export async function getInstagramAccount(
  igUserId: string,
  accessToken: string
): Promise<InstagramAccount> {
  return fetchInstagram<InstagramAccount>(
    `/${igUserId}?fields=id,username,name,profile_picture_url,biography,website,followers_count,follows_count,media_count,ig_id`,
    accessToken
  );
}

export async function getMedia(
  igUserId: string,
  accessToken: string,
  limit: number = 25
): Promise<{ data: InstagramMedia[] }> {
  return fetchInstagram<{ data: InstagramMedia[] }>(
    `/${igUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}`,
    accessToken
  );
}

export async function getMediaInsights(
  mediaId: string,
  accessToken: string
): Promise<InstagramMedia> {
  return fetchInstagram<InstagramMedia>(
    `/${mediaId}?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,reach,impressions,saved,engagement`,
    accessToken
  );
}

export async function getInsights(
  igUserId: string,
  accessToken: string,
  period: 'day' | 'week' | 'days_28' = 'days_28'
): Promise<InstagramInsights> {
  const response = await fetchInstagram<any>(
    `/${igUserId}/insights?metric=impressions,reach,profile_views,website_clicks,email_contacts,follower_count&period=${period}`,
    accessToken
  );

  const insights: any = {
    impressions: 0,
    reach: 0,
    profile_views: 0,
    website_clicks: 0,
    email_contacts: 0,
    follower_count: 0,
  };

  response.data?.forEach((metric: any) => {
    if (insights.hasOwnProperty(metric.name)) {
      insights[metric.name] = metric.values[0]?.value || 0;
    }
  });

  return insights;
}

export async function publishImage(
  igUserId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
): Promise<PublishResult> {
  const creationId = await createMediaContainer(igUserId, accessToken, {
    image_url: imageUrl,
    caption,
  });

  return publishMediaContainer(igUserId, accessToken, creationId);
}

export async function publishVideo(
  igUserId: string,
  accessToken: string,
  videoUrl: string,
  caption: string,
  coverUrl?: string
): Promise<PublishResult> {
  const creationId = await createMediaContainer(igUserId, accessToken, {
    video_url: videoUrl,
    caption,
    cover_url: coverUrl,
  });

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const status = await fetchInstagram<any>(
          `/${creationId}?fields=status_code,permalink`,
          accessToken
        );

        if (status.status_code === 'FINISHED') {
          resolve({
            id: creationId,
            permalink: status.permalink,
            timestamp: new Date().toISOString(),
          });
        } else if (status.status_code === 'ERROR') {
          reject(new Error('Video processing failed'));
        } else {
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        reject(error);
      }
    };

    setTimeout(checkStatus, 30000);
  });
}

async function createMediaContainer(
  igUserId: string,
  accessToken: string,
  params: Record<string, string>
): Promise<string> {
  const fields = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  const response = await fetch(
    `${BASE_URL}/${igUserId}/media?${fields}&access_token=${accessToken}`,
    { method: 'POST' }
  );

  const data = await response.json();

  if (data.error) {
    throw new InstagramApiError(data.error.message, response.status, data.error.code);
  }

  return data.id;
}

async function publishMediaContainer(
  igUserId: string,
  accessToken: string,
  containerId: string
): Promise<PublishResult> {
  const response = await fetch(
    `${BASE_URL}/${igUserId}/media_publish?creation_id=${containerId}&access_token=${accessToken}`,
    { method: 'POST' }
  );

  const data = await response.json();

  if (data.error) {
    throw new InstagramApiError(data.error.message, response.status, data.error.code);
  }

  const mediaDetails = await fetchInstagram<any>(
    `/${data.id}?fields=permalink,timestamp`,
    accessToken
  );

  return {
    id: data.id,
    permalink: mediaDetails.permalink,
    timestamp: mediaDetails.timestamp,
  };
}

export async function sendDirectMessage(
  igUserId: string,
  accessToken: string,
  recipientId: string,
  message: string
): Promise<{ message_id: string }> {
  const threadId = await getOrCreateThread(igUserId, accessToken, recipientId);
  
  return fetchInstagram<{ message_id: string }>(
    `/${igUserId}/messages`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        messaging_type: 'MESSAGE',
        recipient: { thread_key: threadId },
        message: { text: message },
      }),
    }
  );
}

async function getOrCreateThread(
  igUserId: string,
  accessToken: string,
  recipientId: string
): Promise<string> {
  try {
    const response = await fetchInstagram<any>(
      `/${igUserId}/threads/${recipientId}`,
      accessToken
    );
    return response.thread_key;
  } catch {
    const response = await fetchInstagram<any>(
      `/${igUserId}/threads`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          recipient: { id: recipientId },
        }),
      }
    );
    return response.thread_id;
  }
}

export async function getThreads(
  igUserId: string,
  accessToken: string
): Promise<any> {
  return fetchInstagram<any>(
    `/${igUserId}/threads?fields=thread_key,updated_at,snippet,unread_count`,
    accessToken
  );
}

export async function getThreadMessages(
  igUserId: string,
  accessToken: string,
  threadId: string
): Promise<any> {
  return fetchInstagram<any>(
    `/${igUserId}/messages?recipient={thread_key:${threadId}}`,
    accessToken
  );
}

export async function refreshAccessToken(
  appId: string,
  appSecret: string,
  refreshToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch(
    `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${refreshToken}`
  );

  const data = await response.json();

  if (data.error) {
    throw new InstagramApiError(data.error.message, response.status, data.error.code);
  }

  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
}

export const RATE_LIMITS = {
  posts: {
    create: { limit: 25, windowMs: 3600000 },
    delete: { limit: 25, windowMs: 3600000 },
  },
  media: {
    upload: { limit: 10, windowMs: 3600000 },
  },
  messages: {
    send: { limit: 60, windowMs: 3600000 },
  },
  insights: {
    read: { limit: 100, windowMs: 86400000 },
  },
};

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(action: string): boolean {
    const config = this.getConfig(action);
    if (!config) return true;

    const now = Date.now();
    const requests = this.requests.get(action) || [];
    const validRequests = requests.filter(t => now - t < config.windowMs);

    return validRequests.length < config.limit;
  }

  recordRequest(action: string): void {
    const config = this.getConfig(action);
    if (!config) return;

    const now = Date.now();
    const requests = this.requests.get(action) || [];
    const validRequests = requests.filter(t => now - t < config.windowMs);
    validRequests.push(now);
    this.requests.set(action, validRequests);
  }

  private getConfig(action: string): { limit: number; windowMs: number } | null {
    const parts = action.split(':');
    let config: any = RATE_LIMITS;
    
    for (const part of parts) {
      config = config?.[part];
      if (!config) return null;
    }
    
    return config;
  }
}

export const instagramApi = {
  getAccount: getInstagramAccount,
  getMedia,
  getMediaInsights,
  getInsights,
  publishImage,
  publishVideo,
  sendDirectMessage,
  getThreads,
  getThreadMessages,
  refreshAccessToken,
  RateLimiter,
};

export default instagramApi;
