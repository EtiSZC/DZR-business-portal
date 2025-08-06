
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

    // Make request to Deezer API
    const deezerResponse = await fetch(`https://api.deezer.com/playlist/${playlistId}`);
    
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
    
    // Filter tracks that have preview URLs
    if (playlistData.tracks && playlistData.tracks.data) {
      playlistData.tracks.data = playlistData.tracks.data.filter(
        (track: any) => track.preview
      );
    }

    console.log(`Successfully fetched playlist with ${playlistData.tracks?.data?.length || 0} playable tracks`);

    return new Response(
      JSON.stringify(playlistData), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in deezer-proxy function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
