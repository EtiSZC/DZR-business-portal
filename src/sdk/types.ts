// Types adapted from the new Deezer SDK
export interface DeezerTrack {
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

export interface DeezerPlaylist {
  id: string;
  title: string;
  tracks: {
    data: DeezerTrack[];
  };
}

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface MediaRequest {
  trackId: string;
  position?: number;
}

export interface PlayerPosition {
  position: number;
  duration: number;
}

export enum DeezerPlayerStates {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ERROR = 'error'
}

export type DeezerPlayerState = DeezerPlayerStates;

export enum DeezerRepeatModes {
  NONE = 'none',
  ONE = 'one',
  ALL = 'all'
}

export type DeezerRepeatMode = DeezerRepeatModes;

export interface DeezerPlayerSettings {
  appId: string;
  channelUrl: string;
  volume?: number;
  autoplay?: boolean;
}

export interface PlayerEventCallbacks {
  onPlay?: () => void;
  onPause?: () => void;
  onTrackEnd?: () => void;
  onProgress?: (position: PlayerPosition) => void;
  onError?: (error: any) => void;
}