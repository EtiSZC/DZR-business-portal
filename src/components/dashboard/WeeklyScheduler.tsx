import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const hours = Array.from({ length: 24 }, (_, i) => i);

interface Playlist {
  id: number;
  name: string;
  duration: number;
  color: string;
}

interface ScheduledItem {
  id: string;
  playlist_id: number;
  day: string;
  hour: number;
  duration: number;
}

export const WeeklyScheduler = () => {
  const [schedule, setSchedule] = useState<ScheduledItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [draggedPlaylist, setDraggedPlaylist] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  useEffect(() => {
    loadPlaylists();
    loadSchedule();
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

  const loadSchedule = async () => {
    const { data, error } = await supabase
      .from('scheduled_items')
      .select('*');
    
    if (error) {
      toast.error("Failed to load schedule");
      console.error(error);
      return;
    }
    
    setSchedule(data || []);
  };

  const getPlaylistById = (id: number) => playlists.find(p => p.id === id);

  const handleDragStart = (e: React.DragEvent, playlistId: number) => {
    console.log("🎯 Drag started for playlist:", playlistId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", playlistId.toString());
    setDraggedPlaylist(playlistId);
  };

  const handleDragOver = (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const slotKey = `${day}-${hour}`;
    setDragOverSlot(slotKey);
    console.log("🎯 Drag over slot:", slotKey);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlot(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    console.log("🎯 Drop event triggered!", { day, hour, draggedPlaylist });
    
    if (!draggedPlaylist) {
      console.log("❌ No dragged playlist found");
      toast.error("No playlist selected for dropping");
      return;
    }

    const playlist = getPlaylistById(draggedPlaylist);
    if (!playlist) {
      console.log("❌ Playlist not found for ID:", draggedPlaylist);
      toast.error("Playlist not found");
      return;
    }

    console.log("✅ Found playlist:", playlist);

    // Check for conflicts
    const durationInHours = Math.ceil(playlist.duration / 60);
    const hasConflict = schedule.some(item => 
      item.day === day && 
      ((item.hour <= hour && item.hour + Math.ceil(item.duration / 60) > hour) ||
       (hour <= item.hour && hour + durationInHours > item.hour))
    );

    if (hasConflict) {
      console.log("❌ Time slot conflict detected");
      toast.error("Time slot conflict! Please choose a different time.");
      setDraggedPlaylist(null);
      return;
    }

    const insertData = {
      playlist_id: draggedPlaylist,
      day,
      hour,
      duration: playlist.duration,
    };

    console.log("🚀 Attempting to insert into database:", insertData);

    try {
      const { data, error } = await supabase
        .from('scheduled_items')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("❌ Database error:", error);
        toast.error(`Failed to schedule playlist: ${error.message}`);
        return;
      }

      console.log("✅ Successfully inserted:", data);
      setSchedule([...schedule, data]);
      setDraggedPlaylist(null);
      toast.success(`${playlist.name} scheduled for ${day} at ${hour}:00!`);
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      toast.error("Unexpected error occurred");
    }
  };

  const removeScheduledItem = async (id: string) => {
    const { error } = await supabase
      .from('scheduled_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to remove playlist");
      console.error(error);
      return;
    }

    setSchedule(schedule.filter(item => item.id !== id));
    toast.success("Playlist removed from schedule");
  };

  const getScheduledItem = (day: string, hour: number) => {
    return schedule.find(item => 
      item.day === day && 
      hour >= item.hour && 
      hour < item.hour + Math.ceil(item.duration / 60)
    );
  };

  const isFirstHourOfItem = (day: string, hour: number) => {
    const item = getScheduledItem(day, hour);
    return item && item.hour === hour;
  };

  return (
    <div className="space-y-6">
      {/* Playlist Library */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Playlists</h3>
        <ScrollArea className="w-full">
          <div className="flex space-x-4 pb-4">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                className="flex-shrink-0 w-48 cursor-move hover:shadow-lg transition-shadow"
                draggable
                onDragStart={(e) => handleDragStart(e, playlist.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${playlist.color}`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{playlist.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.floor(playlist.duration / 60)}h {playlist.duration % 60}m
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Weekly Calendar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Weekly Schedule</h3>
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => toast.success("Schedule saved successfully! All changes are automatically saved.")}
            >
              Save My Schedule
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-8 bg-muted/50">
            <div className="p-2 text-sm font-medium text-center border-r">Time</div>
            {days.map((day) => (
              <div key={day} className="p-2 text-sm font-medium text-center border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <ScrollArea className="h-[400px]">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
                <div className="p-2 text-sm text-center border-r bg-muted/20 font-medium">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {days.map((day) => {
                  const scheduledItem = getScheduledItem(day, hour);
                  const isFirstHour = isFirstHourOfItem(day, hour);
                  const playlist = scheduledItem ? getPlaylistById(scheduledItem.playlist_id) : null;

                  const slotKey = `${day}-${hour}`;
                  const isDragOver = dragOverSlot === slotKey;

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`p-1 border-r last:border-r-0 min-h-[40px] relative transition-colors ${
                        isDragOver ? 'bg-primary/20 border-2 border-primary border-dashed' : 'hover:bg-muted/20'
                      }`}
                      onDragOver={(e) => handleDragOver(e, day, hour)}
                      onDragLeave={handleDragLeave}
                      onDragEnter={handleDragEnter}
                      onDrop={(e) => handleDrop(e, day, hour)}
                    >
                      {scheduledItem && isFirstHour && playlist && (
                        <div
                          className={`absolute inset-1 ${playlist.color} bg-opacity-20 border-l-4 border-opacity-100 rounded p-1 group`}
                          style={{ 
                            height: `${Math.ceil(scheduledItem.duration / 60) * 40 - 4}px`,
                          }}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground truncate">
                              {playlist.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeScheduledItem(scheduledItem.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {Math.floor(scheduledItem.duration / 60)}h {scheduledItem.duration % 60}m
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};