import { useState, useCallback, useRef, useEffect } from 'react';
import { DeezerService } from '@/services/deezerService';

interface Track {
  title: string;
  artist: string;
  playlist: string;
  currentTime: string;
  duration: string;
  id?: string;
  albumCover?: string;
  deezer_id?: string;
  preview?: string;
}

interface DeezerTrack {
  id: number;
  title: string;
  artist: {
    name: string;
  };
  album: {
    cover_medium: string;
  };
  duration: number;
  preview: string;
}

export function useMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<DeezerTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
        if (currentTrack) {
          setCurrentTrack(prev => prev ? {
            ...prev,
            currentTime: formatTime(currentTime)
          } : null);
        }
      }
    }
  }, [currentTrack]);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(updateProgress, 1000);
  }, [updateProgress]);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const setupAudioElement = useCallback((track: DeezerTrack, playlistName: string) => {
    // Define event handlers first
    const handleTrackEnd = () => {
      setIsPlaying(false);
      stopProgressTracking();
      // Auto advance to next track
      if (currentTrackIndex < currentPlaylist.length - 1) {
        skipForward();
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setCurrentTrack({
          title: track.title,
          artist: track.artist.name,
          playlist: playlistName,
          currentTime: '0:00',
          duration: formatTime(30), // Previews are 30 seconds
          id: track.id.toString(),
          albumCover: track.album.cover_medium,
          deezer_id: track.id.toString(),
          preview: track.preview
        });
      }
    };

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleTrackEnd);
      audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }

    audioRef.current = new Audio(track.preview);
    audioRef.current.volume = volume / 100;

    audioRef.current.addEventListener('ended', handleTrackEnd);
    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
  }, [volume, currentTrackIndex, currentPlaylist.length, stopProgressTracking]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 500);
    return true;
  }, []);

  const play = useCallback(async (trackId?: string) => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        startProgressTracking();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  }, [startProgressTracking]);

  const pause = useCallback(async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopProgressTracking();
    }
  }, [stopProgressTracking]);

  const stop = useCallback(async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      stopProgressTracking();
      setCurrentTrack(null);
      setCurrentPlaylist([]);
      setCurrentTrackIndex(0);
    }
  }, [stopProgressTracking]);

  const skipForward = useCallback(async () => {
    if (currentPlaylist.length > 0 && currentTrackIndex < currentPlaylist.length - 1) {
      const nextIndex = currentTrackIndex + 1;
      setCurrentTrackIndex(nextIndex);
      const nextTrack = currentPlaylist[nextIndex];
      setupAudioElement(nextTrack, currentTrack?.playlist || 'Unknown Playlist');
      if (isPlaying) {
        setTimeout(() => play(), 100);
      }
    }
  }, [currentPlaylist, currentTrackIndex, setupAudioElement, currentTrack, isPlaying, play]);

  const skipBack = useCallback(async () => {
    if (currentPlaylist.length > 0 && currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
      const prevTrack = currentPlaylist[prevIndex];
      setupAudioElement(prevTrack, currentTrack?.playlist || 'Unknown Playlist');
      if (isPlaying) {
        setTimeout(() => play(), 100);
      }
    }
  }, [currentPlaylist, currentTrackIndex, setupAudioElement, currentTrack, isPlaying, play]);

  const handleSetVolume = useCallback(async (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  }, []);

  const loadAndPlayPlaylist = useCallback(async (playlistUrl: string, playlistName?: string) => {
    setIsLoading(true);
    
    try {
      const playlistId = DeezerService.extractPlaylistId(playlistUrl);
      if (!playlistId) {
        throw new Error('Invalid Deezer playlist URL');
      }

      const tracks = await DeezerService.fetchPlaylistTracks(playlistId);
      if (tracks.length === 0) {
        throw new Error('No playable tracks found in playlist');
      }

      setCurrentPlaylist(tracks);
      setCurrentTrackIndex(0);
      
      const firstTrack = tracks[0];
      setupAudioElement(firstTrack, playlistName || 'Unknown Playlist');
      
      // Auto-play the first track
      setTimeout(async () => {
        await play();
      }, 500);
      
    } catch (error) {
      console.error('Error loading playlist:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setupAudioElement, play]);

  const playTrack = useCallback(() => play(), [play]);
  const pauseTrack = useCallback(() => pause(), [pause]);
  const stopTrack = useCallback(() => stop(), [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [stopProgressTracking]);

  return {
    isPlaying,
    currentTrack,
    progress,
    volume,
    isLoading,
    isAuthenticated,
    currentPlaylist,
    currentTrackIndex,
    play: playTrack,
    pause: pauseTrack,
    stop: stopTrack,
    skipForward,
    skipBack,
    setVolume: handleSetVolume,
    loadAndPlayPlaylist,
    authenticate
  };
}
