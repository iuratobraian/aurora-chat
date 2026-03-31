import { StorageService } from './storage';
import logger from '../utils/logger';

/**
 * Exness Service (Simulated/Ready for Non-trading API)
 * For detailed integration, refer to Exness Developer Documentation.
 */
export const ExnessService = {
  /**
   * Fetches the web terminal URL for a specific account/server using an API Key.
   * In a real implementation, this would call GET https://api.exness.com/api/servers/
   */
  getWebTerminalUrl: async (apiKey: string, accountId: string): Promise<string> => {
    // Simulated behavior based on research
    // We would use the apiKey to authenticate and find the right server for accountId
    try {
      // Mocking the Non-trading API response
      // Research suggests it returns a wts_api_host and web_terminal URL
      return `https://trade.exness.com/terminal/`; // base URL, usually requires token or session via iframe
    } catch (error) {
      logger.error("Exness API Error:", error);
      throw error;
    }
  },

  saveConnection: async (apiKey: string, accountId: string, server: string) => {
    const config = {
      apiKey,
      accountId,
      server,
      linkedAt: new Date().toISOString()
    };
    await StorageService.saveItem('exness_config', config);
    return true;
  },

  getConnection: async () => {
    return await StorageService.getItem('exness_config');
  },

  disconnect: async () => {
    await StorageService.removeItem('exness_config');
  }
};
