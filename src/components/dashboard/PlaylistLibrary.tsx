import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Music, Play, Search, Filter, Heart, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Playlist {
  id: number;
  name: string;
  duration: number;
  color: string;
  created_at?: string;
  updated_at?: string;
}

const categories = ["All", "Coffee Shop", "Restaurant", "Cafe", "Fine Dining", "Bar", "Retail"];
const moods = ["All", "Relaxed", "Upbeat", "Mellow", "Sophisticated", "Ambient", "Energetic"];

export const PlaylistLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMood, setSelectedMood] = useState("All");
  const [likedPlaylists, setLikedPlaylists] = useState<number[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    const { data, error } = await supabase
      .from('playlists')
      .select('*');
    
    if (error) {
      toast.error("Failed to load playlists");
      console.error(error);
      return;
    }
    
    setPlaylists(data || []);
  };

  const handlePlayPlaylist = async (playlist: Playlist) => {
    console.log('Music playback disabled - playlist:', playlist.name);
  };

  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = playlist.name.toLowerCase().includes(searchTerm.toLowerCase());
    // For now, just filter by search term since database playlists don't have category/mood
    return matchesSearch;
  });

  const toggleLike = (playlistId: number) => {
    setLikedPlaylists(prev => 
      prev.includes(playlistId) 
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      "Relaxed": "bg-blue-100 text-blue-800",
      "Upbeat": "bg-orange-100 text-orange-800",
      "Mellow": "bg-green-100 text-green-800",
      "Sophisticated": "bg-purple-100 text-purple-800",
      "Ambient": "bg-indigo-100 text-indigo-800",
      "Energetic": "bg-red-100 text-red-800",
    };
    return colors[mood as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search playlists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Mood" />
          </SelectTrigger>
          <SelectContent>
            {moods.map(mood => (
              <SelectItem key={mood} value={mood}>{mood}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredPlaylists.length} playlist{filteredPlaylists.length !== 1 ? 's' : ''} found
      </div>

      {/* Playlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaylists.map((playlist) => (
          <Card key={playlist.id} className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${playlist.color}`}></div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{playlist.name}</CardTitle>
                    <CardDescription className="text-sm">Music Playlist</CardDescription>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Preview</DropdownMenuItem>
                    <DropdownMenuItem>Add to Schedule</DropdownMenuItem>
                    <DropdownMenuItem>Download</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Music playlist for your venue</p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{Math.floor(playlist.duration / 60)}h {playlist.duration % 60}m</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Music className="h-4 w-4" />
                  <span>Mixed tracks</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleLike(playlist.id)}
                  className="h-8 w-8"
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      likedPlaylists.includes(playlist.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </Button>
                
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border-0"
                  onClick={() => handlePlayPlaylist(playlist)}
                >
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Play
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredPlaylists.length === 0 && (
        <div className="text-center py-12">
          <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No playlists found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};