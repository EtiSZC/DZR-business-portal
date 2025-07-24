import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    DZ: any;
  }
}

interface DeezerTrack {
  id: string;
  title: string;
  artist: {
    name: string;
  };
  album: {
    title: string;
    cover_medium: string;
  };
  duration: number;
}

interface DeezerPlaylist {
  id: string;
  title: string;
  tracks: {
    data: DeezerTrack[];
  };
}

export class DeezerService {
  private static instance: DeezerService;
  private isInitialized = false;
  private currentTrack: DeezerTrack | null = null;
  private currentPlaylist: DeezerPlaylist | null = null;
  private listeners: { [key: string]: Function[] } = {};

  private constructor() {}

  static getInstance(): DeezerService {
    if (!DeezerService.instance) {
      DeezerService.instance = new DeezerService();
    }
    return DeezerService.instance;
  }

  async initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve(true);
        return;
      }

      if (!window.DZ) {
        console.error('Deezer SDK not loaded');
        resolve(false);
        return;
      }

      // Get app credentials from Supabase secrets
      this.getAppCredentials().then((appId) => {
        if (!appId) {
          console.error('Deezer App ID not configured');
          resolve(false);
          return;
        }

        window.DZ.init({
          appId: appId,
          channelUrl: window.location.origin + '/deezer-channel.html'
        });

        window.DZ.ready(() => {
          this.isInitialized = true;
          this.setupEventListeners();
          resolve(true);
        });
      });
    });
  }

  private async getAppCredentials(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get-deezer-credentials');
      if (error) throw error;
      return data?.appId || null;
    } catch (error) {
      console.error('Failed to get Deezer credentials:', error);
      return null;
    }
  }

  private setupEventListeners() {
    window.DZ.Event.subscribe('track_end', () => {
      this.emit('track_end');
    });

    window.DZ.Event.subscribe('player_position', (position: number[]) => {
      this.emit('progress', {
        position: position[0],
        duration: position[1]
      });
    });

    window.DZ.Event.subscribe('player_play', () => {
      this.emit('play');
    });

    window.DZ.Event.subscribe('player_paused', () => {
      this.emit('pause');
    });
  }

  async login(): Promise<boolean> {
    return new Promise((resolve) => {
      window.DZ.login((response: any) => {
        if (response.authResponse) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, { perms: 'basic_access,email,manage_library,listening_history' });
    });
  }

  async loadPlaylist(playlistId: string): Promise<DeezerPlaylist | null> {
    return new Promise((resolve) => {
      window.DZ.api(`/playlist/${playlistId}`, (response: any) => {
        if (response && !response.error) {
          this.currentPlaylist = response;
          resolve(response);
        } else {
          console.error('Failed to load playlist:', response?.error);
          resolve(null);
        }
      });
    });
  }

  async play(trackId?: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      if (trackId) {
        window.DZ.player.playTracks([trackId], () => {
          resolve(true);
        });
      } else {
        window.DZ.player.play(() => {
          resolve(true);
        });
      }
    });
  }

  async pause(): Promise<void> {
    return new Promise((resolve) => {
      window.DZ.player.pause(() => {
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

  async getCurrentTrack(): Promise<DeezerTrack | null> {
    return new Promise((resolve) => {
      window.DZ.player.getCurrentTrack((track: DeezerTrack) => {
        this.currentTrack = track;
        resolve(track);
      });
    });
  }

  async getPosition(): Promise<{ position: number; duration: number }> {
    return new Promise((resolve) => {
      window.DZ.player.getPosition((position: number[], duration: number) => {
        resolve({
          position: position[0],
          duration: duration
        });
      });
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export const deezerService = DeezerService.getInstance();