import { useState, useCallback, useEffect, useRef } from 'react';
import { DeezerPlayerService, DeezerApiService, extractPlaylistId } from '@/services/deezerService';

interface Track {
  title: string;
  artist: string;
  playlist: string;
  currentTime: string;
  duration: string;
  id?: string;
  albumCover?: string;
  deezer_id?: string;
}

export function useMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const deezerPlayer = useRef(DeezerPlayerService.getInstance());
  const deezerApi = useRef(DeezerApiService.getInstance());

  // Initialize Deezer player and set up event listeners
  useEffect(() => {
    const initPlayer = async () => {
      try {
        await deezerPlayer.current.initialize();
        
        // Set up event listeners
        deezerPlayer.current.onPlayerPlay(() => {
          setIsPlaying(true);
        });
        
        deezerPlayer.current.onPlayerPause(() => {
          setIsPlaying(false);
        });
        
        deezerPlayer.current.onPlayerPosition((position: number[]) => {
          const [currentPos, totalDuration] = position;
          if (totalDuration > 0) {
            setProgress((currentPos / totalDuration) * 100);
          }
          
          // Update current track timing
          if (currentTrack) {
            setCurrentTrack(prev => prev ? {
              ...prev,
              currentTime: formatTime(currentPos),
              duration: formatTime(totalDuration)
            } : null);
          }
        });
        
        deezerPlayer.current.onTrackEnd(() => {
          setIsPlaying(false);
          setProgress(0);
        });
        
      } catch (error) {
        console.error('Failed to initialize Deezer player:', error);
      }
    };
    
    initPlayer();
  }, [currentTrack]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const authenticate = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await deezerPlayer.current.login();
      setIsAuthenticated(success);
      return success;
    } catch (error) {
      console.error('Failed to authenticate with Deezer:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const play = useCallback(async (trackId?: string) => {
    setIsLoading(true);
    try {
      if (!isAuthenticated) {
        const authSuccess = await authenticate();
        if (!authSuccess) {
          throw new Error('Authentication required');
        }
      }

      if (trackId) {
        await deezerPlayer.current.playTrack(trackId);
      } else {
        await deezerPlayer.current.play();
      }
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authenticate]);

  const pause = useCallback(async () => {
    try {
      await deezerPlayer.current.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  }, []);

  const skipForward = useCallback(async () => {
    try {
      await deezerPlayer.current.next();
    } catch (error) {
      console.error('Failed to skip forward:', error);
    }
  }, []);

  const skipBack = useCallback(async () => {
    try {
      await deezerPlayer.current.previous();
    } catch (error) {
      console.error('Failed to skip back:', error);
    }
  }, []);

  const handleSetVolume = useCallback(async (newVolume: number) => {
    setVolume(newVolume);
    try {
      await deezerPlayer.current.setVolume(newVolume);
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }, []);

  const loadAndPlayPlaylist = useCallback(async (playlistUrl: string) => {
    setIsLoading(true);
    try {
      if (!isAuthenticated) {
        const authSuccess = await authenticate();
        if (!authSuccess) {
          throw new Error('Authentication required');
        }
      }

      const playlistId = extractPlaylistId(playlistUrl);
      if (!playlistId) {
        throw new Error('Invalid playlist URL');
      }

      // Get playlist info and tracks
      const [playlistInfo, tracks] = await Promise.all([
        deezerApi.current.getPlaylistInfo(playlistId),
        deezerApi.current.getPlaylistTracks(playlistId)
      ]);

      // Start playing the playlist
      await deezerPlayer.current.playPlaylist(playlistId);
      
      // Set current track info from first track
      if (tracks.length > 0) {
        const firstTrack = tracks[0];
        setCurrentTrack({
          title: firstTrack.title,
          artist: firstTrack.artist.name,
          playlist: playlistInfo.title,
          currentTime: '0:00',
          duration: formatTime(firstTrack.duration),
          id: firstTrack.id,
          albumCover: firstTrack.album?.cover_medium,
          deezer_id: firstTrack.id
        });
      }
      
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to load playlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authenticate]);

  const playTrack = useCallback(() => play(), [play]);
  const pauseTrack = useCallback(() => pause(), [pause]);

  return {
    isPlaying,
    currentTrack,
    progress,
    volume,
    isLoading,
    isAuthenticated,
    play: playTrack,
    pause: pauseTrack,
    skipForward,
    skipBack,
    setVolume: handleSetVolume,
    loadAndPlayPlaylist,
    authenticate
  };
}