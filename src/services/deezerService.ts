
import { supabase } from '@/integrations/supabase/client';

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

interface DeezerPlaylist {
  id: number;
  title: string;
  tracks: {
    data: DeezerTrack[];
  };
}

export class DeezerService {
  static extractPlaylistId(deezerUrl: string): string | null {
    const match = deezerUrl.match(/playlist\/(\d+)/);
    return match ? match[1] : null;
  }

  static async fetchPlaylistTracks(playlistId: string): Promise<DeezerTrack[]> {
    try {
      console.log(`Fetching playlist tracks for ID: ${playlistId}`);
      
      // Use our edge function to proxy the Deezer API call
      const { data, error } = await supabase.functions.invoke('deezer-proxy', {
        body: { playlistId }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to fetch playlist: ${error.message}`);
      }

      if (!data || !data.tracks || !data.tracks.data) {
        throw new Error('Invalid playlist data received');
      }

      const tracks = data.tracks.data;
      console.log(`Successfully loaded ${tracks.length} tracks with previews`);
      
      return tracks;
    } catch (error) {
      console.error('Error fetching playlist from Deezer:', error);
      throw error;
    }
  }

  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
