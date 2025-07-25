import { supabase } from '@/integrations/supabase/client';

// Utility to extract playlist ID from Deezer URL
export function extractPlaylistId(deezerUrl: string): string | null {
  const match = deezerUrl.match(/playlist\/(\d+)/);
  return match ? match[1] : null;
}

// Deezer GraphQL API service
export class DeezerApiService {
  private static instance: DeezerApiService;
  private appId: string = '479982';
  private secretKey: string = 'c3f47f4f69a93fbeadf8845dae61874a';
  
  static getInstance(): DeezerApiService {
    if (!DeezerApiService.instance) {
      DeezerApiService.instance = new DeezerApiService();
    }
    return DeezerApiService.instance;
  }

  // Get access token for API calls
  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch('https://connect.deezer.com/oauth/access_token.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `app_id=${this.appId}&secret=${this.secretKey}&grant_type=client_credentials`
      });
      
      const data = await response.text();
      const accessToken = data.split('=')[1]?.split('&')[0];
      
      if (!accessToken) {
        throw new Error('Failed to get access token');
      }
      
      return accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  // Fetch playlist tracks using REST API (as GraphQL might require different auth)
  async getPlaylistTracks(playlistId: string): Promise<any[]> {
    try {
      const response = await fetch(`https://api.deezer.com/playlist/${playlistId}/tracks`);
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

  // Get playlist info
  async getPlaylistInfo(playlistId: string): Promise<any> {
    try {
      const response = await fetch(`https://api.deezer.com/playlist/${playlistId}`);
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

// Deezer Web SDK integration
export class DeezerPlayerService {
  private static instance: DeezerPlayerService;
  private isInitialized = false;
  private appId = '479982';
  private channelUrl = 'https://b7677ff2-3e8a-4cba-af69-5cc678f36e3c.lovableproject.com/deezer-channel.html';
  
  static getInstance(): DeezerPlayerService {
    if (!DeezerPlayerService.instance) {
      DeezerPlayerService.instance = new DeezerPlayerService();
    }
    return DeezerPlayerService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    return new Promise((resolve) => {
      // Load Deezer SDK if not already loaded
      if (!window.DZ) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/deezer-sdk@1.0.0/dist/dz.js';
        script.onload = () => {
          this.initializeDeezer(resolve);
        };
        document.head.appendChild(script);
      } else {
        this.initializeDeezer(resolve);
      }
    });
  }

  private initializeDeezer(resolve: (value: boolean) => void): void {
    window.DZ.init({
      appId: this.appId,
      channelUrl: this.channelUrl
    });

    window.DZ.ready(() => {
      console.log('Deezer SDK initialized successfully');
      this.isInitialized = true;
      resolve(true);
    });
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