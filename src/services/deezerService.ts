
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
  private static readonly BASE_URL = 'https://api.deezer.com';

  static extractPlaylistId(deezerUrl: string): string | null {
    const match = deezerUrl.match(/playlist\/(\d+)/);
    return match ? match[1] : null;
  }

  static async fetchPlaylistTracks(playlistId: string): Promise<DeezerTrack[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/playlist/${playlistId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch playlist: ${response.status}`);
      }
      
      const playlist: DeezerPlaylist = await response.json();
      return playlist.tracks.data.filter(track => track.preview); // Only return tracks with preview URLs
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
