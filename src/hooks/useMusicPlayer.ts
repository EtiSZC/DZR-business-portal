import { useState, useCallback, useEffect } from 'react';
import { deezerService } from '@/services/deezerService';

interface Track {
  title: string;
  artist: string;
  playlist: string;
  currentTime: string;
  duration: string;
  id?: string;
  albumCover?: string;
}

export function useMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Deezer service
  useEffect(() => {
    const initializeDeezer = async () => {
      try {
        const initialized = await deezerService.initialize();
        setIsInitialized(initialized);
        
        if (initialized) {
          // Set up event listeners
          deezerService.on('play', () => setIsPlaying(true));
          deezerService.on('pause', () => setIsPlaying(false));
          deezerService.on('progress', (data: { position: number; duration: number }) => {
            if (data.duration > 0) {
              setProgress((data.position / data.duration) * 100);
            }
          });
          deezerService.on('track_end', () => {
            setIsPlaying(false);
            skipForward();
          });
        }
      } catch (error) {
        console.error('Failed to initialize Deezer:', error);
      }
    };

    initializeDeezer();
  }, []);

  // Update current track info
  useEffect(() => {
    const updateCurrentTrack = async () => {
      try {
        const track = await deezerService.getCurrentTrack();
        if (track) {
          const position = await deezerService.getPosition();
          setCurrentTrack({
            id: track.id,
            title: track.title,
            artist: track.artist.name,
            playlist: track.album.title,
            currentTime: formatTime(position.position),
            duration: formatTime(track.duration),
            albumCover: track.album.cover_medium
          });
        }
      } catch (error) {
        console.error('Failed to update current track:', error);
      }
    };

    if (isPlaying) {
      const interval = setInterval(updateCurrentTrack, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const play = useCallback(async (trackId?: string) => {
    if (!isInitialized) {
      console.error('Deezer not initialized');
      return;
    }

    setIsLoading(true);
    try {
      await deezerService.play(trackId);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const pause = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      await deezerService.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  }, [isInitialized]);

  const skipForward = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      await deezerService.next();
    } catch (error) {
      console.error('Failed to skip forward:', error);
    }
  }, [isInitialized]);

  const skipBack = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      await deezerService.previous();
    } catch (error) {
      console.error('Failed to skip back:', error);
    }
  }, [isInitialized]);

  const handleSetVolume = useCallback(async (newVolume: number) => {
    setVolume(newVolume);
    
    if (isInitialized) {
      try {
        await deezerService.setVolume(newVolume / 100);
      } catch (error) {
        console.error('Failed to set volume:', error);
      }
    }
  }, [isInitialized]);

  const loadAndPlayPlaylist = useCallback(async (playlistId: string) => {
    if (!isInitialized) return;
    
    setIsLoading(true);
    try {
      const playlist = await deezerService.loadPlaylist(playlistId);
      if (playlist && playlist.tracks.data.length > 0) {
        await deezerService.play(playlist.tracks.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load playlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const playTrack = useCallback(() => play(), [play]);
  const pauseTrack = useCallback(() => pause(), [pause]);

  return {
    isPlaying,
    currentTrack,
    progress,
    volume,
    isLoading,
    isInitialized,
    play: playTrack,
    pause: pauseTrack,
    skipForward,
    skipBack,
    setVolume: handleSetVolume,
    loadAndPlayPlaylist
  };
}