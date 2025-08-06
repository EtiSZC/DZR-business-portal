
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

      console.log('Edge function response:', data);

      if (!data) {
        throw new Error('No data received from edge function');
      }

      if (data.error) {
        console.error('Deezer API error:', data.error);
        throw new Error(`${data.error}`);
      }

      if (!data.tracks || !Array.isArray(data.tracks.data)) {
        console.error('Invalid playlist structure:', data);
        throw new Error('Invalid playlist data structure received');
      }

      const tracks = data.tracks.data;
      console.log(`Successfully loaded playlist with ${tracks.length} tracks`);
      
      if (tracks.length === 0) {
        throw new Error('No tracks found in this playlist');
      }
      
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
