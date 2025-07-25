import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as yaml from 'js-yaml';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const hours = Array.from({ length: 24 }, (_, i) => i);

// Predefined color palette for playlists
const playlistColors = [
  'bg-blue-500',
  'bg-green-500', 
  'bg-purple-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-violet-500'
];

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
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [resizingItem, setResizingItem] = useState<string | null>(null);
  const [resizeStartY, setResizeStartY] = useState<number>(0);
  const [resizeStartDuration, setResizeStartDuration] = useState<number>(0);
  const [draggingScheduledItem, setDraggingScheduledItem] = useState<ScheduledItem | null>(null);

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
    
    // Assign unique colors to playlists
    const playlistsWithColors = (data || []).map((playlist, index) => ({
      ...playlist,
      color: playlistColors[index % playlistColors.length]
    }));
    
    setPlaylists(playlistsWithColors);
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

  const handlePlaylistSelect = (playlistId: number) => {
    console.log("🎯 Playlist selected:", playlistId);
    setSelectedPlaylist(selectedPlaylist === playlistId ? null : playlistId);
  };

  const handleDragStart = (e: React.DragEvent, playlistId: number) => {
    console.log("🎯 Drag started for playlist:", playlistId);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", playlistId.toString());
    e.dataTransfer.setData("application/json", JSON.stringify({ playlistId, type: "playlist" }));
    setSelectedPlaylist(playlistId);
  };

  const handleScheduledItemDragStart = (e: React.DragEvent, scheduledItem: ScheduledItem) => {
    console.log("🎯 Drag started for scheduled item:", scheduledItem);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ scheduledItem, type: "scheduled" }));
    setDraggingScheduledItem(scheduledItem);
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = draggingScheduledItem ? "move" : "copy";
    }
    const slotKey = `${day}-${hour}`;
    setDragOverSlot(slotKey);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're actually leaving the element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSlot(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const placePlaylist = async (day: string, hour: number) => {
    console.log("🎯 Place playlist triggered!", { day, hour, selectedPlaylist });
    
    if (!selectedPlaylist) {
      console.log("❌ No playlist selected");
      toast.error("Please select a playlist first");
      return;
    }

    const playlist = getPlaylistById(selectedPlaylist);
    if (!playlist) {
      console.log("❌ Playlist not found for ID:", selectedPlaylist);
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
      return;
    }

    const insertData = {
      playlist_id: selectedPlaylist,
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
      setSelectedPlaylist(null);
      toast.success(`${playlist.name} scheduled for ${day} at ${hour}:00!`);
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      toast.error("Unexpected error occurred");
    }
  };

  const handleDrop = async (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    console.log("🔥 DROP EVENT FIRED!");
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData("application/json"));
      
      if (dragData.type === "scheduled") {
        // Moving an existing scheduled item
        await moveScheduledItem(dragData.scheduledItem, day, hour);
      } else {
        // Placing a new playlist
        await placePlaylist(day, hour);
      }
    } catch (error) {
      // Fallback to old behavior if JSON parsing fails
      await placePlaylist(day, hour);
    }
    
    setDraggingScheduledItem(null);
    setDragOverSlot(null);
  };

  const moveScheduledItem = async (item: ScheduledItem, newDay: string, newHour: number) => {
    // Check if moving to the same position
    if (item.day === newDay && item.hour === newHour) {
      return;
    }

    const durationInHours = Math.ceil(item.duration / 60);
    
    // Check for conflicts (excluding the item being moved)
    const hasConflict = schedule.some(otherItem => 
      otherItem.id !== item.id &&
      otherItem.day === newDay && 
      ((otherItem.hour <= newHour && otherItem.hour + Math.ceil(otherItem.duration / 60) > newHour) ||
       (newHour <= otherItem.hour && newHour + durationInHours > otherItem.hour))
    );

    if (hasConflict) {
      toast.error("Cannot move playlist: time slot conflict!");
      return;
    }

    // Update in database
    const { error } = await supabase
      .from('scheduled_items')
      .update({ day: newDay, hour: newHour })
      .eq('id', item.id);

    if (error) {
      toast.error("Failed to move playlist");
      console.error(error);
      return;
    }

    // Update local state
    setSchedule(schedule.map(schedItem => 
      schedItem.id === item.id 
        ? { ...schedItem, day: newDay, hour: newHour }
        : schedItem
    ));

    const playlist = getPlaylistById(item.playlist_id);
    toast.success(`${playlist?.name} moved to ${newDay} at ${newHour}:00!`);
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

  const isLastHourOfItem = (day: string, hour: number) => {
    const item = getScheduledItem(day, hour);
    return item && hour === item.hour + Math.ceil(item.duration / 60) - 1;
  };

  const handleResizeStart = (e: React.MouseEvent, item: ScheduledItem) => {
    e.preventDefault();
    e.stopPropagation();
    const itemId = item.id; // Store the ID locally to avoid state timing issues
    setResizingItem(itemId);
    setResizeStartY(e.clientY);
    setResizeStartDuration(item.duration);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Use the local itemId instead of state resizingItem to avoid timing issues
      const deltaY = e.clientY - resizeStartY;
      
      // Reasonable calculation: every 30px = 30 minutes (half hour slot)
      const pixelsPer30Min = 30;
      const halfHoursDelta = Math.round(deltaY / pixelsPer30Min);
      const minutesDelta = halfHoursDelta * 30;
      
      // Minimum duration is 15 minutes, maximum is 24 hours
      const newDuration = Math.max(15, Math.min(1440, resizeStartDuration + minutesDelta));
      
      // Update the schedule state temporarily for visual feedback
      setSchedule(prev => prev.map(schedItem => 
        schedItem.id === itemId 
          ? { ...schedItem, duration: newDuration }
          : schedItem
      ));
    };
    
    const handleMouseUp = async () => {
      // Get the current item from schedule to get the updated duration
      setSchedule(currentSchedule => {
        const updatedItem = currentSchedule.find(schedItem => schedItem.id === itemId);
        if (!updatedItem) return currentSchedule;
        
        const newDuration = updatedItem.duration;
        const newDurationInHours = Math.ceil(newDuration / 60);
        
        // Check for conflicts with other scheduled items
        const hasConflict = currentSchedule.some(otherItem => 
          otherItem.id !== itemId && 
          otherItem.day === item.day && 
          ((otherItem.hour < item.hour + newDurationInHours && otherItem.hour + Math.ceil(otherItem.duration / 60) > item.hour))
        );
        
        if (hasConflict) {
          toast.error("Cannot resize: would conflict with another playlist");
          // Revert to original duration
          return currentSchedule.map(schedItem => 
            schedItem.id === itemId 
              ? { ...schedItem, duration: resizeStartDuration }
              : schedItem
          );
        } else {
          // Update in database
          supabase
            .from('scheduled_items')
            .update({ duration: newDuration })
            .eq('id', itemId)
            .then(({ error }) => {
              if (error) {
                toast.error("Failed to update playlist duration");
                // Revert to original duration
                setSchedule(prev => prev.map(schedItem => 
                  schedItem.id === itemId 
                    ? { ...schedItem, duration: resizeStartDuration }
                    : schedItem
                ));
              } else {
                toast.success("Playlist duration updated");
              }
            });
          
          return currentSchedule; // Keep the current changes
        }
      });
      
      setResizingItem(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const generateScheduleYAML = () => {
    const scheduleData = {
      schedule: {
        created_at: new Date().toISOString(),
        venue: "My Venue",
        week_schedule: days.reduce((acc, day) => {
          const daySchedule = schedule
            .filter(item => item.day === day)
            .sort((a, b) => a.hour - b.hour)
            .map(item => {
              const playlist = getPlaylistById(item.playlist_id);
              return {
                time: `${item.hour.toString().padStart(2, '0')}:00`,
                playlist: playlist?.name || 'Unknown Playlist',
                duration_minutes: item.duration,
                duration_hours: Math.floor(item.duration / 60),
                duration_remaining_minutes: item.duration % 60
              };
            });
          
          acc[day.toLowerCase()] = daySchedule;
          return acc;
        }, {} as Record<string, any>)
      }
    };
    
    return yaml.dump(scheduleData, { 
      indent: 2,
      lineWidth: 120,
      noRefs: true 
    });
  };

  const saveScheduleAsYAML = async () => {
    try {
      const yamlContent = generateScheduleYAML();
      
      const { data, error } = await supabase
        .from('saved_schedules')
        .upsert({
          name: 'My Schedule',
          yaml_content: yamlContent
        }, {
          onConflict: 'name'
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to save schedule");
        console.error(error);
        return;
      }

      toast.success("Schedule saved successfully!");
    } catch (err) {
      console.error("Error saving schedule:", err);
      toast.error("Failed to save schedule");
    }
  };

  const downloadSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_schedules')
        .select('yaml_content')
        .eq('name', 'My Schedule')
        .single();

      if (error || !data) {
        // If no saved schedule exists, generate from current schedule
        const yamlContent = generateScheduleYAML();
        downloadYAMLFile(yamlContent);
        return;
      }

      downloadYAMLFile(data.yaml_content);
    } catch (err) {
      console.error("Error downloading schedule:", err);
      toast.error("Failed to download schedule");
    }
  };

  const downloadYAMLFile = (yamlContent: string) => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `music-schedule-${new Date().toISOString().split('T')[0]}.yml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Schedule downloaded successfully!");
  };

  const eraseSchedule = async () => {
    try {
      // Delete all scheduled items from database
      const { error } = await supabase
        .from('scheduled_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        toast.error("Failed to erase schedule");
        console.error(error);
        return;
      }

      // Clear local schedule state
      setSchedule([]);
      toast.success("Schedule erased successfully!");
    } catch (err) {
      console.error("Error erasing schedule:", err);
      toast.error("Failed to erase schedule");
    }
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
                className={`flex-shrink-0 w-48 cursor-pointer hover:shadow-lg transition-all ${
                  selectedPlaylist === playlist.id ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, playlist.id)}
                onClick={() => handlePlaylistSelect(playlist.id)}
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
                    {selectedPlaylist === playlist.id && (
                      <div className="text-primary text-xs font-medium">Selected</div>
                    )}
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
              onClick={saveScheduleAsYAML}
            >
              Save My Schedule
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadSchedule}
            >
              Download my Schedule
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled
              className="opacity-80 cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={eraseSchedule}
            >
              Erase my Schedule
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
                      className={`p-1 border-r last:border-r-0 min-h-[40px] relative transition-colors cursor-pointer ${
                        isDragOver ? 'bg-primary/20 border-2 border-primary border-dashed' : 'hover:bg-muted/20'
                      } ${selectedPlaylist ? 'border border-dashed border-muted-foreground/30' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("🔥 DRAGOVER EVENT FIRED for", day, hour);
                        handleDragOver(e, day, hour);
                      }}
                      onDragLeave={(e) => {
                        console.log("🔥 DRAGLEAVE EVENT FIRED");
                        handleDragLeave(e);
                      }}
                      onDragEnter={(e) => {
                        console.log("🔥 DRAGENTER EVENT FIRED");
                        handleDragEnter(e);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("🔥 DROP EVENT FIRED for", day, hour);
                        handleDrop(e, day, hour);
                      }}
                      onClick={() => {
                        if (selectedPlaylist) {
                          console.log("🎯 Click to place triggered");
                          placePlaylist(day, hour);
                        }
                      }}
                      title={selectedPlaylist ? `Click to place ${getPlaylistById(selectedPlaylist)?.name} here` : `${day} ${hour}:00`}
                    >
                      {scheduledItem && isFirstHour && playlist && (
                        <div
                          className={`absolute rounded p-1 group border-l-4 text-xs ${playlist.color} bg-opacity-20 border-opacity-80`}
                          style={{ 
                            left: '4px',
                            right: '4px',
                            top: '4px',
                            height: `${Math.ceil(scheduledItem.duration / 60) * 40 - 4}px`,
                            zIndex: 1,
                            pointerEvents: 'none'
                          }}
                        >
                          <div
                            className="w-full h-full cursor-move"
                            style={{ pointerEvents: 'auto' }}
                            draggable
                            onDragStart={(e) => {
                              console.log("🎯 Drag started for scheduled item:", scheduledItem);
                              handleScheduledItemDragStart(e, scheduledItem);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground truncate text-xs">
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
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.floor(scheduledItem.duration / 60)}h {scheduledItem.duration % 60}m
                            </div>
                            {/* Resize handle positioned at the actual bottom of the visual block */}
                            <div 
                              className="absolute left-0 right-0 h-3 cursor-ns-resize hover:bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              style={{ 
                                bottom: '-1px',
                                backgroundColor: 'rgba(0,0,0,0.1)'
                              }}
                              onMouseDown={(e) => handleResizeStart(e, scheduledItem)}
                              title="Drag to resize playlist duration"
                            >
                              <div className="w-12 h-1 bg-foreground/70 rounded-full"></div>
                            </div>
                          </div>
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