import { 
  DeezerPlayerStates, 
  DeezerPlayerState, 
  DeezerPlayerSettings,
  DeezerTrack,
  DeezerPlaylist,
  PlayerPosition,
  PlayerEventCallbacks,
  MediaRequest
} from './types';

declare global {
  interface Window {
    DZ: any;
  }
}

export class DeezerPlayer {
  private state: DeezerPlayerState = DeezerPlayerStates.IDLE;
  private settings: DeezerPlayerSettings;
  private isInitialized = false;
  private currentTrack: DeezerTrack | null = null;
  private currentPlaylist: DeezerPlaylist | null = null;
  private callbacks: PlayerEventCallbacks = {};
  private volume = 100;

  constructor(settings: DeezerPlayerSettings) {
    this.settings = settings;
  }

  async initialize(): Promise<boolean> {
    console.log('🔧 DeezerPlayer.initialize() called');
    
    return new Promise((resolve) => {
      if (this.isInitialized) {
        console.log('✅ Already initialized');
        resolve(true);
        return;
      }

      if (!window.DZ) {
        console.error('❌ Deezer SDK not loaded');
        resolve(false);
        return;
      }

      const initConfig = {
        appId: this.settings.appId,
        channelUrl: this.settings.channelUrl
      };
      
      console.log('🚀 Calling DZ.init with config:', initConfig);
      window.DZ.init(initConfig);

      console.log('⏳ Waiting for DZ.ready...');
      window.DZ.ready(() => {
        console.log('✅ DZ.ready callback triggered!');
        this.isInitialized = true;
        this.setupEventListeners();
        
        if (this.settings.volume !== undefined) {
          this.setVolume(this.settings.volume);
        }
        
        console.log('✅ Initialization complete');
        resolve(true);
      });
    });
  }

  private setupEventListeners(): void {
    window.DZ.Event.subscribe('track_end', () => {
      this.setState(DeezerPlayerStates.IDLE);
      this.callbacks.onTrackEnd?.();
    });

    window.DZ.Event.subscribe('player_position', (position: number[]) => {
      const positionData: PlayerPosition = {
        position: position[0],
        duration: position[1]
      };
      this.callbacks.onProgress?.(positionData);
    });

    window.DZ.Event.subscribe('player_play', () => {
      this.setState(DeezerPlayerStates.PLAYING);
      this.callbacks.onPlay?.();
    });

    window.DZ.Event.subscribe('player_paused', () => {
      this.setState(DeezerPlayerStates.PAUSED);
      this.callbacks.onPause?.();
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

  async play(request?: MediaRequest): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.setState(DeezerPlayerStates.LOADING);

    return new Promise((resolve) => {
      if (request?.trackId) {
        window.DZ.player.playTracks([request.trackId], () => {
          this.setState(DeezerPlayerStates.PLAYING);
          resolve(true);
        });
      } else {
        window.DZ.player.play(() => {
          this.setState(DeezerPlayerStates.PLAYING);
          resolve(true);
        });
      }
    });
  }

  async pause(): Promise<void> {
    return new Promise((resolve) => {
      window.DZ.player.pause(() => {
        this.setState(DeezerPlayerStates.PAUSED);
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
    this.volume = Math.max(0, Math.min(100, volume));
    return new Promise((resolve) => {
      window.DZ.player.setVolume(this.volume, () => {
        resolve();
      });
    });
  }

  getVolume(): number {
    return this.volume;
  }

  async getCurrentTrack(): Promise<DeezerTrack | null> {
    return new Promise((resolve) => {
      window.DZ.player.getCurrentTrack((track: DeezerTrack) => {
        this.currentTrack = track;
        resolve(track);
      });
    });
  }

  async getPosition(): Promise<PlayerPosition> {
    return new Promise((resolve) => {
      window.DZ.player.getPosition((position: number[], duration: number) => {
        resolve({
          position: position[0],
          duration: duration
        });
      });
    });
  }

  getState(): DeezerPlayerState {
    return this.state;
  }

  private setState(newState: DeezerPlayerState): void {
    this.state = newState;
  }

  on(event: keyof PlayerEventCallbacks, callback: any): void {
    this.callbacks[event] = callback;
  }

  off(event: keyof PlayerEventCallbacks): void {
    delete this.callbacks[event];
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async destroy(): Promise<void> {
    // Cleanup if needed
    this.callbacks = {};
    this.isInitialized = false;
    this.setState(DeezerPlayerStates.IDLE);
  }
}