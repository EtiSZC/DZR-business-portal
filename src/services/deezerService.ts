import { supabase } from '@/integrations/supabase/client';

// Configuration constants
const DEEZER_CONFIG = {
  APP_ID: '479982',
  SECRET_KEY: 'c3f47f4f69a93fbeadf8845dae61874a',
  CHANNEL_URL: 'https://b7677ff2-3e8a-4cba-af69-5cc678f36e3c.lovableproject.com/deezer-channel.html',
  API_BASE_URL: 'https://api.deezer.com',
  CONNECT_BASE_URL: 'https://connect.deezer.com'
};

// Utility to extract playlist ID from Deezer URL
export function extractPlaylistId(deezerUrl: string): string | null {
  const match = deezerUrl.match(/playlist\/(\d+)/);
  return match ? match[1] : null;
}

// Deezer API service for content retrieval
export class DeezerApiService {
  private static instance: DeezerApiService;
  private appId: string = DEEZER_CONFIG.APP_ID;
  private secretKey: string = DEEZER_CONFIG.SECRET_KEY;
  private accessToken: string | null = null;
  
  static getInstance(): DeezerApiService {
    if (!DeezerApiService.instance) {
      DeezerApiService.instance = new DeezerApiService();
    }
    return DeezerApiService.instance;
  }

  // Initialize service and get access token if needed
  async initialize(): Promise<boolean> {
    try {
      // For public API calls, we don't need authentication
      // But we can implement OAuth flow here if needed
      return true;
    } catch (error) {
      console.error('Failed to initialize Deezer API service:', error);
      return false;
    }
  }

  // Get access token for authenticated API calls (if needed)
  private async getAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;
    
    try {
      // For now, we'll use public API endpoints
      // OAuth implementation can be added here later
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Fetch playlist tracks using Deezer REST API
  async getPlaylistTracks(playlistId: string): Promise<any[]> {
    try {
      await this.initialize();
      
      const response = await fetch(`${DEEZER_CONFIG.API_BASE_URL}/playlist/${playlistId}/tracks`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Deezer API Error: ${data.error.message}`);
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      throw error;
    }
  }

  // Get playlist information
  async getPlaylistInfo(playlistId: string): Promise<any> {
    try {
      await this.initialize();
      
      const response = await fetch(`${DEEZER_CONFIG.API_BASE_URL}/playlist/${playlistId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Deezer API Error: ${data.error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching playlist info:', error);
      throw error;
    }
  }
}

// Deezer Web SDK integration service
export class DeezerPlayerService {
  private static instance: DeezerPlayerService;
  private isInitialized = false;
  private appId = DEEZER_CONFIG.APP_ID;
  private channelUrl = DEEZER_CONFIG.CHANNEL_URL;
  private isSDKLoaded = false;
  
  static getInstance(): DeezerPlayerService {
    if (!DeezerPlayerService.instance) {
      DeezerPlayerService.instance = new DeezerPlayerService();
    }
    return DeezerPlayerService.instance;
  }

  // Load Deezer SDK dynamically
  private async loadSDK(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.isSDKLoaded && window.DZ) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = '/deezer-sdk/dz.js'; // Will use local SDK when provided
      script.onload = () => {
        console.log('Deezer SDK loaded successfully');
        this.isSDKLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Deezer SDK');
        // Fallback to CDN version
        script.src = 'https://cdn.jsdelivr.net/npm/deezer-sdk@1.0.0/dist/dz.js';
        script.onload = () => {
          console.log('Deezer SDK loaded from CDN');
          this.isSDKLoaded = true;
          resolve(true);
        };
        script.onerror = () => reject(new Error('Failed to load Deezer SDK'));
      };
      document.head.appendChild(script);
    });
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Load SDK first
      await this.loadSDK();
      
      return new Promise((resolve) => {
        if (!window.DZ) {
          console.error('Deezer SDK not available');
          resolve(false);
          return;
        }

        this.initializeDeezer(resolve);
      });
    } catch (error) {
      console.error('Error initializing Deezer player:', error);
      return false;
    }
  }

  private initializeDeezer(resolve: (value: boolean) => void): void {
    try {
      window.DZ.init({
        appId: this.appId,
        channelUrl: this.channelUrl
      });

      window.DZ.ready(() => {
        console.log('Deezer SDK initialized successfully');
        this.isInitialized = true;
        resolve(true);
      });
    } catch (error) {
      console.error('Error during Deezer initialization:', error);
      resolve(false);
    }
  }

  async login(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      window.DZ.login((response: any) => {
        if (response.authResponse) {
          console.log('Deezer login successful');
          resolve(true);
        } else {
          console.log('Deezer login failed');
          resolve(false);
        }
      }, { perms: 'basic_access,email,manage_library,listening_history' });
    });
  }

  async playTrack(trackId: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      window.DZ.player.playTracks([trackId], () => {
        console.log(`Playing track: ${trackId}`);
        resolve(true);
      });
    });
  }

  async playPlaylist(playlistId: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      window.DZ.player.playPlaylist(playlistId, () => {
        console.log(`Playing playlist: ${playlistId}`);
        resolve(true);
      });
    });
  }

  async pause(): Promise<void> {
    return new Promise((resolve) => {
      window.DZ.player.pause(() => {
        resolve();
      });
    });
  }

  async play(): Promise<void> {
    return new Promise((resolve) => {
      window.DZ.player.play(() => {
        resolve();
      });
    });
  }

  async next(): Promise<void> {
    return new Promise((resolve) => {
      window.DZ.player.next(() => {
        resolve();
      });
    });
  }

  async previous(): Promise<void> {
    return new Promise((resolve) => {
      window.DZ.player.prev(() => {
        resolve();
      });
    });
  }

  async setVolume(volume: number): Promise<void> {
    return new Promise((resolve) => {
      window.DZ.player.setVolume(volume, () => {
        resolve();
      });
    });
  }

  async getCurrentTrack(): Promise<any> {
    return new Promise((resolve) => {
      window.DZ.player.getCurrentTrack((track: any) => {
        resolve(track);
      });
    });
  }

  // Event listeners
  onTrackEnd(callback: () => void): void {
    window.DZ.Event.subscribe('track_end', callback);
  }

  onPlayerPlay(callback: () => void): void {
    window.DZ.Event.subscribe('player_play', callback);
  }

  onPlayerPause(callback: () => void): void {
    window.DZ.Event.subscribe('player_paused', callback);
  }

  onPlayerPosition(callback: (position: number[]) => void): void {
    window.DZ.Event.subscribe('player_position', callback);
  }
}

// Global Deezer type declaration
declare global {
  interface Window {
    DZ: any;
  }
}