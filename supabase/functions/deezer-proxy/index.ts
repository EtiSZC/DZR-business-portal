
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

    const appId = Deno.env.get('DEEZER_APP_ID');
    const secret = Deno.env.get('DEEZER_SECRET');
    
    // Build URL with app_id if available
    const baseUrl = `https://api.deezer.com/playlist/${playlistId}`;
    const url = appId ? `${baseUrl}?app_id=${appId}` : baseUrl;
    
    console.log(`Making request to: ${url}`);

    // Make request to Deezer API
    const deezerResponse = await fetch(url);
    
    if (!deezerResponse.ok) {
      console.error(`Deezer API error: ${deezerResponse.status}`);
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch playlist: ${deezerResponse.status}` 
        }), 
        { 
          status: deezerResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const playlistData = await deezerResponse.json();
    
    console.log(`Raw playlist data structure:`, JSON.stringify({
      id: playlistData.id,
      title: playlistData.title,
      tracksCount: playlistData.tracks?.data?.length || 0,
      sampleTrack: playlistData.tracks?.data?.[0] || null
    }));
    
    // Don't filter tracks initially - let's see what we get
    if (playlistData.tracks && playlistData.tracks.data) {
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
