// @ts-nocheck
import { action, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const publishScheduledPosts = action({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const windowStart = now - 60000;
    const windowEnd = now + 60000;

    const posts = await ctx.runQuery(
      api["instagram/posts"].getPostsToPublish,
      { windowStart, windowEnd }
    );

    const results: { postId: any; success: boolean; error?: string }[] = [];

    for (const post of posts || []) {
      try {
        const account = await ctx.runQuery(
          api["instagram/accounts"].getByInstagramId,
          { instagramId: post.accountId }
        );

        if (!account || !account.isConnected) {
          await ctx.runMutation(
            api["instagram/posts"].markPostFailed,
            { postId: post._id, errorMessage: "Account not connected" }
          );
          results.push({ postId: post._id, success: false, error: "Account not connected" });
          continue;
        }

        const accessToken = Buffer.from(account.accessToken, 'base64').toString('utf8');

        let publishResult: { id: string; permalink: string; timestamp: string };

        if (post.imageUrl) {
          const imageUrl = post.imageUrl;
          publishResult = await publishToInstagram(post, accessToken, imageUrl);
        } else if (post.videoUrl) {
          const videoUrl = post.videoUrl;
          publishResult = await publishToInstagram(post, accessToken, videoUrl);
        } else {
          publishResult = await publishTextOnlyPost(post, accessToken);
        }

        await ctx.runMutation(
          api["instagram/posts"].markPostPublished,
          { 
            postId: post._id, 
            instagramPostId: publishResult.id,
            publishedAt: new Date(publishResult.timestamp).getTime()
          }
        );

        if (post.repeatEnabled && post.repeatInterval) {
          const nextPublish = now + (post.repeatInterval * 24 * 60 * 60 * 1000);
          await ctx.runMutation(
            api["instagram/posts"].createScheduledPost,
            {
              userId: post.userId,
              accountId: post.accountId,
              caption: post.caption,
              hashtags: post.hashtags,
              imageUrl: post.imageUrl,
              videoUrl: post.videoUrl,
              scheduledFor: nextPublish,
              timezone: post.timezone,
              status: "scheduled",
              campaignId: post.campaignId,
              repeatEnabled: true,
              repeatInterval: post.repeatInterval,
            }
          );
        }

        results.push({ postId: post._id, success: true });
      } catch (error: any) {
        await ctx.runMutation(
          api["instagram/posts"].markPostFailed,
          { postId: post._id, errorMessage: error.message }
        );
        results.push({ postId: post._id, success: false, error: error.message });
      }
    }

    return {
      success: true,
      processed: results.length,
      results,
    };
  },
});

async function publishToInstagram(post: any, accessToken: string, mediaUrl: string): Promise<{ id: string; permalink: string; timestamp: string }> {
  const caption = post.hashtags?.length > 0
    ? `${post.caption}\n\n${post.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ')}`
    : post.caption;

  const containerUrl = new URL(`https://graph.facebook.com/v18.0/${post.accountId}/media`);
  containerUrl.searchParams.set('image_url', mediaUrl);
  containerUrl.searchParams.set('caption', caption);
  containerUrl.searchParams.set('access_token', accessToken);

  const containerResponse = await fetch(containerUrl.toString(), { method: 'POST' });
  const containerData = await containerResponse.json();

  if (containerData.error) {
    throw new Error(containerData.error.message);
  }

  const publishUrl = new URL(`https://graph.facebook.com/v18.0/${post.accountId}/media_publish`);
  publishUrl.searchParams.set('creation_id', containerData.id);
  publishUrl.searchParams.set('access_token', accessToken);

  const publishResponse = await fetch(publishUrl.toString(), { method: 'POST' });
  const publishData = await publishResponse.json();

  if (publishData.error) {
    throw new Error(publishData.error.message);
  }

  const detailsUrl = new URL(`https://graph.facebook.com/v18.0/${publishData.id}`);
  detailsUrl.searchParams.set('fields', 'permalink,timestamp');
  detailsUrl.searchParams.set('access_token', accessToken);

  const detailsResponse = await fetch(detailsUrl.toString());
  const details = await detailsResponse.json();

  return {
    id: publishData.id,
    permalink: details.permalink,
    timestamp: details.timestamp,
  };
}

async function publishTextOnlyPost(post: any, accessToken: string): Promise<{ id: string; permalink: string; timestamp: string }> {
  const caption = post.hashtags?.length > 0
    ? `${post.caption}\n\n${post.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ')}`
    : post.caption;

  const containerUrl = new URL(`https://graph.facebook.com/v18.0/${post.accountId}/media`);
  containerUrl.searchParams.set('caption', caption);
  containerUrl.searchParams.set('access_token', accessToken);

  const containerResponse = await fetch(containerUrl.toString(), { method: 'POST' });
  const containerData = await containerResponse.json();

  if (containerData.error) {
    throw new Error(containerData.error.message);
  }

  const publishUrl = new URL(`https://graph.facebook.com/v18.0/${post.accountId}/media_publish`);
  publishUrl.searchParams.set('creation_id', containerData.id);
  publishUrl.searchParams.set('access_token', accessToken);

  const publishResponse = await fetch(publishUrl.toString(), { method: 'POST' });
  const publishData = await publishResponse.json();

  if (publishData.error) {
    throw new Error(publishData.error.message);
  }

  return {
    id: publishData.id,
    permalink: `https://instagram.com/p/${publishData.id}`,
    timestamp: new Date().toISOString(),
  };
}

export const generateAISuggestions = action({
  args: {
    postId: v.id("instagram_scheduled_posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.runQuery(
      api["instagram/posts"].getPostById,
      { postId: args.postId }
    );

    if (!post) {
      throw new Error("Post not found");
    }

    const aiPrompt = `Genera sugerencias para mejorar el siguiente caption de Instagram sobre trading:

Caption actual: "${post.caption}"

Devuelve en formato JSON:
{
  "improvedCaption": "versión mejorada del caption",
  "additionalHashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "engagementScore": 0.85,
  "bestTimeToPost": "19:00 - 21:00",
  "reasoning": "explicación breve de por qué estas sugerencias mejoran el caption"
}`;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "AI not configured",
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert Instagram marketing assistant specialized in trading and finance content.' },
          { role: 'user', content: aiPrompt },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const suggestions = JSON.parse(content);

        await ctx.runMutation(
          api["instagram/posts"].updateAISuggestions,
          {
            postId: args.postId,
            suggestions: suggestions,
          }
        );

        return {
          success: true,
          suggestions,
        };
      } catch {
        return {
          success: false,
          error: "Failed to parse AI response",
        };
      }
    }

    return {
      success: false,
      error: "No response from AI",
    };
  },
});

export const syncAccountStats = action({
  args: {
    accountId: v.id("instagram_accounts"),
  },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(
      api["instagram/accounts"].getById,
      { accountId: args.accountId }
    );

    if (!account || !account.isConnected) {
      throw new Error("Account not connected");
    }

    const accessToken = Buffer.from(account.accessToken, 'base64').toString('utf8');

    const statsUrl = new URL(`https://graph.facebook.com/v18.0/${account.instagramId}`);
    statsUrl.searchParams.set('access_token', accessToken);
    statsUrl.searchParams.set('fields', 'followers_count,media_count,biography,website,profile_picture_url');

    const response = await fetch(statsUrl.toString());
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    await ctx.runMutation(
      api["instagram/accounts"].updateStats,
      {
        accountId: args.accountId,
        followers: data.followers_count,
        totalPosts: data.media_count,
        biography: data.biography,
        website: data.website,
        profilePicture: data.profile_picture_url,
      }
    );

    return {
      success: true,
      followers: data.followers_count,
      posts: data.media_count,
    };
  },
});
