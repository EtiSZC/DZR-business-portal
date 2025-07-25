import { useState, useCallback, useEffect } from 'react';
import { newDeezerService } from '@/services/newDeezerService';

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

  // Initialize Deezer service - DISABLED
  useEffect(() => {
    // Deezer initialization disabled
    console.log('🚫 Deezer initialization disabled');
    setIsInitialized(false);
  }, []);

  // Update current track info
  useEffect(() => {
    const updateCurrentTrack = async () => {
      try {
        const track = await newDeezerService.getCurrentTrack();
        if (track) {
          const position = await newDeezerService.getPosition();
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
      await newDeezerService.play(trackId);
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
      await newDeezerService.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  }, [isInitialized]);

  const skipForward = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      await newDeezerService.next();
    } catch (error) {
      console.error('Failed to skip forward:', error);
    }
  }, [isInitialized]);

  const skipBack = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      await newDeezerService.previous();
    } catch (error) {
      console.error('Failed to skip back:', error);
    }
  }, [isInitialized]);

  const handleSetVolume = useCallback(async (newVolume: number) => {
    setVolume(newVolume);
    
    if (isInitialized) {
      try {
        await newDeezerService.setVolume(newVolume);
      } catch (error) {
        console.error('Failed to set volume:', error);
      }
    }
  }, [isInitialized]);

  const loadAndPlayPlaylist = useCallback(async (playlistId: string) => {
    if (!isInitialized) return;
    
    setIsLoading(true);
    try {
      const playlist = await newDeezerService.loadPlaylist(playlistId);
      if (playlist && playlist.tracks.data.length > 0) {
        await newDeezerService.play(playlist.tracks.data[0].id);
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