import { DeezerPlayer, DeezerPlayerStates, type DeezerTrack, type DeezerPlaylist, type MediaRequest } from '@/sdk';
import { supabase } from '@/integrations/supabase/client';

export class NewDeezerService {
  private static instance: NewDeezerService;
  private player: DeezerPlayer | null = null;
  private listeners: { [key: string]: Function[] } = {};

  private constructor() {}

  static getInstance(): NewDeezerService {
    if (!NewDeezerService.instance) {
      NewDeezerService.instance = new NewDeezerService();
    }
    return NewDeezerService.instance;
  }

  async initialize(): Promise<boolean> {
    console.log('🔧 NewDeezerService.initialize() called');
    
    try {
      // Get app credentials from Supabase
      const appId = await this.getAppCredentials();
      if (!appId) {
        console.error('❌ Deezer App ID not configured');
        return false;
      }

      // Create player instance
      this.player = new DeezerPlayer({
        appId: appId,
        channelUrl: window.location.origin + '/deezer-channel.html',
        volume: 100,
        autoplay: false
      });

      // Set up event listeners
      this.setupEventListeners();

      // Initialize the player
      const success = await this.player.initialize();
      console.log('✅ Player initialization result:', success);
      
      return success;
    } catch (error) {
      console.error('❌ Error initializing NewDeezerService:', error);
      return false;
    }
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

  private setupEventListeners(): void {
    if (!this.player) return;

    this.player.on('onPlay', () => {
      this.emit('play');
    });

    this.player.on('onPause', () => {
      this.emit('pause');
    });

    this.player.on('onTrackEnd', () => {
      this.emit('track_end');
    });

    this.player.on('onProgress', (position) => {
      this.emit('progress', position);
    });

    this.player.on('onError', (error) => {
      this.emit('error', error);
    });
  }

  async login(): Promise<boolean> {
    if (!this.player) {
      await this.initialize();
    }
    return this.player?.login() || false;
  }

  async loadPlaylist(playlistId: string): Promise<DeezerPlaylist | null> {
    if (!this.player) {
      await this.initialize();
    }
    return this.player?.loadPlaylist(playlistId) || null;
  }

  async play(trackId?: string): Promise<boolean> {
    if (!this.player) {
      await this.initialize();
    }

    const request: MediaRequest | undefined = trackId ? { trackId } : undefined;
    return this.player?.play(request) || false;
  }

  async pause(): Promise<void> {
    if (!this.player) return;
    await this.player.pause();
  }

  async next(): Promise<void> {
    if (!this.player) return;
    await this.player.next();
  }

  async previous(): Promise<void> {
    if (!this.player) return;
    await this.player.previous();
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.player) return;
    await this.player.setVolume(volume);
  }

  getVolume(): number {
    return this.player?.getVolume() || 100;
  }

  async getCurrentTrack(): Promise<DeezerTrack | null> {
    if (!this.player) return null;
    return await this.player.getCurrentTrack();
  }

  async getPosition(): Promise<{ position: number; duration: number }> {
    if (!this.player) return { position: 0, duration: 0 };
    return await this.player.getPosition();
  }

  getState(): string {
    return this.player?.getState() || DeezerPlayerStates.IDLE;
  }

  isReady(): boolean {
    return this.player?.isReady() || false;
  }

  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  async destroy(): Promise<void> {
    if (this.player) {
      await this.player.destroy();
      this.player = null;
    }
    this.listeners = {};
  }
}

export const newDeezerService = NewDeezerService.getInstance();