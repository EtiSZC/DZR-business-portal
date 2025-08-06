
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playlistId } = await req.json();
    
    if (!playlistId) {
      return new Response(
        JSON.stringify({ error: 'Playlist ID is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching Deezer playlist: ${playlistId}`);

    // Try to fetch without app_id first (public playlists)
    let url = `https://api.deezer.com/playlist/${playlistId}`;
    
    console.log(`Making request to: ${url}`);

    // Make request to Deezer API
    let deezerResponse = await fetch(url);
    let playlistData = await deezerResponse.json();
    
    // If we get an OAuth error, the playlist might be private or require authentication
    if (playlistData.error && playlistData.error.type === 'OAuthException') {
      console.log('Got OAuth error, trying with app_id...');
      
      const appId = Deno.env.get('DEEZER_APP_ID');
      if (appId) {
        url = `${url}?app_id=${appId}`;
        console.log(`Retrying with app_id: ${url}`);
        
        deezerResponse = await fetch(url);
        playlistData = await deezerResponse.json();
      }
    }
    
    // If still getting error after trying with app_id
    if (playlistData.error) {
      console.error(`Deezer API error:`, playlistData.error);
      
      // Handle specific error types
      if (playlistData.error.type === 'OAuthException') {
        return new Response(
          JSON.stringify({ 
            error: 'This playlist is private or requires authentication. Please try with a public playlist.' 
          }), 
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Deezer API error: ${playlistData.error.message || JSON.stringify(playlistData.error)}` 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!deezerResponse.ok) {
      console.error(`Deezer API HTTP error: ${deezerResponse.status}`);
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch playlist: HTTP ${deezerResponse.status}` 
        }), 
        { 
          status: deezerResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Raw playlist data structure:`, JSON.stringify({
      id: playlistData.id,
      title: playlistData.title,
      tracksCount: playlistData.tracks?.data?.length || 0,
      sampleTrack: playlistData.tracks?.data?.[0] || null
    }));
    
    // Check if we have tracks data
    if (!playlistData.tracks || !Array.isArray(playlistData.tracks.data)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid playlist structure - no tracks found' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Filter tracks with previews if we have some, otherwise return all
    const totalTracks = playlistData.tracks.data.length;
    const tracksWithPreviews = playlistData.tracks.data.filter(
      (track: any) => track.preview && track.preview !== ""
    );
    
    console.log(`Total tracks: ${totalTracks}, Tracks with previews: ${tracksWithPreviews.length}`);
    
    // Only filter if we have some tracks with previews, otherwise return all
    if (tracksWithPreviews.length > 0) {
      playlistData.tracks.data = tracksWithPreviews;
      console.log(`Filtered to ${tracksWithPreviews.length} playable tracks`);
    } else {
      console.log(`No tracks with previews found, returning all ${totalTracks} tracks`);
    }

    console.log(`Successfully processed playlist with ${playlistData.tracks?.data?.length || 0} tracks`);

    return new Response(
      JSON.stringify(playlistData), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in deezer-proxy function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
