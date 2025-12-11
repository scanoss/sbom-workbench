/**
 * CLI command: configure-api
 * Configures custom API settings for SBOM Workbench
 */

import { app } from 'electron';
import { userSettingService } from '../../services/UserSettingService';
import { normalizeUrl, isValidUrl } from '../utils';

export interface ConfigureApiOptions {
  url: string;
  apiKey?: string;
  addAlongside?: boolean;
}

/**
 * Handles the configure-api CLI command
 */
export async function configureApi(options: ConfigureApiOptions): Promise<void> {
  const { url, apiKey = '', addAlongside = false } = options;

  if (!url) {
    console.error('[SCANOSS ERROR] --url is required');
    console.error('Usage: sbom-workbench configure-api --url "https://api.example.com" [--api-key "key"] [--add-alongside]');
    app.exit(1);
    return;
  }

  try {
    const normalizedUrl = normalizeUrl(url);

    if (!isValidUrl(normalizedUrl)) {
      console.error(`[SCANOSS ERROR] Invalid URL format: ${url}`);
      app.exit(1);
      return;
    }

    // Load/create settings
    await userSettingService.read();
    const settings = userSettingService.get();

    // Check if URL already exists
    const existingIndex = settings.APIS.findIndex((api: { URL: string }) => api.URL === normalizedUrl);

    if (existingIndex >= 0) {
      // URL exists - update API key if different
      if (settings.APIS[existingIndex].API_KEY === apiKey) {
        console.log(`[SCANOSS] API already configured with same key: ${normalizedUrl}`);
      } else {
        settings.APIS[existingIndex].API_KEY = apiKey;
        settings.DEFAULT_API_INDEX = existingIndex;
        userSettingService.set(settings);
        await userSettingService.save();
        console.log(`[SCANOSS] Updated API key for: ${normalizedUrl}`);
      }
    } else if (addAlongside) {
      // Add alongside existing APIs
      settings.APIS.push({ URL: normalizedUrl, API_KEY: apiKey });
      settings.DEFAULT_API_INDEX = settings.APIS.length - 1;
      userSettingService.set(settings);
      await userSettingService.save();
      console.log(`[SCANOSS] Added API as default: ${normalizedUrl}`);
    } else {
      // Replace with new API only
      settings.APIS = [{ URL: normalizedUrl, API_KEY: apiKey }];
      settings.DEFAULT_API_INDEX = 0;
      userSettingService.set(settings);
      await userSettingService.save();
      console.log(`[SCANOSS] Configured API: ${normalizedUrl}`);
    }

    app.quit();
  } catch (error: any) {
    console.error(`[SCANOSS ERROR] ${error.message}`);
    app.exit(1);
  }
}
