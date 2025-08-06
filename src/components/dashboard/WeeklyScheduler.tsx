import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Plus, X, Copy, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as yaml from 'js-yaml';
import { DeezerService } from "@/services/deezerService";

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
  deezer_url?: string;
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
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPlaylists();
    loadSchedule();
    checkStorageBucketAndLoadUrl();
  }, []);

  // Autoscroll to 07:00 when component loads
  useEffect(() => {
    if (scrollAreaRef.current) {
      // Each hour row is 40px + 1px border = 41px
      // To scroll to 07:00, we need to scroll 7 * 41px = 287px
      const scrollTo = 7 * 41;
      
      // Use setTimeout to ensure the scroll happens after render
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (viewport) {
            viewport.scrollTop = scrollTo;
          }
        }
      }, 100);
    }
  }, [playlists, schedule]); // Re-run when data loads

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

  const checkStorageBucketAndLoadUrl = async () => {
    try {
      // Check if the schedules bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error checking buckets:', bucketsError);
        return;
      }

      const schedulesBucket = buckets?.find(bucket => bucket.name === 'schedules');
      
      if (!schedulesBucket) {
        console.log('Schedules bucket does not exist');
        return;
      }

      // Check if the file exists
      const { data: files, error: filesError } = await supabase.storage
        .from('schedules')
        .list('', { limit: 100 });

      if (filesError) {
        console.error('Error listing files:', filesError);
        return;
      }

      const scheduleFile = files?.find(file => file.name === 'my-schedule.yml');
      
      if (scheduleFile) {
        const { data } = await supabase.storage
          .from('schedules')
          .getPublicUrl('my-schedule.yml');
        
        if (data?.publicUrl) {
          setDownloadUrl(data.publicUrl);
        }
      }
    } catch (error) {
      console.error('Error checking storage:', error);
    }
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
    const itemId = item.id;
    const startY = e.clientY;
    const startDuration = item.duration;
    
    setResizingItem(itemId);
    setResizeStartY(startY);
    setResizeStartDuration(startDuration);
    
    console.log("🎯 Resize start:", { startY, startDuration, itemId });
    
    let currentDuration = startDuration;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      
      // More reasonable sensitivity: 20px = 15 minutes (quarter hour)
      const minutesDelta = Math.round(deltaY / 20) * 15;
      
      // Minimum duration is 15 minutes, maximum is 24 hours
      const newDuration = Math.max(15, Math.min(1440, startDuration + minutesDelta));
      currentDuration = newDuration;
      
      console.log("🔄 Resize move:", { deltaY, minutesDelta, newDuration });
      
      // Update the schedule state temporarily for visual feedback
      setSchedule(prev => prev.map(schedItem => 
        schedItem.id === itemId 
          ? { ...schedItem, duration: newDuration }
          : schedItem
      ));
    };
    
    const handleMouseUp = async () => {
      console.log("🔥 Mouse up triggered:", { itemId, currentDuration, startDuration });
      
      setResizingItem(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Check if duration actually changed
      if (currentDuration === startDuration) {
        console.log("⚡ No duration change, skipping database update");
        return;
      }
      
      const newDurationInHours = Math.ceil(currentDuration / 60);
      
      // Check for conflicts with other scheduled items
      const currentSchedule = schedule.filter(schedItem => schedItem.id !== itemId);
      const hasConflict = currentSchedule.some(otherItem => 
        otherItem.day === item.day && 
        ((otherItem.hour < item.hour + newDurationInHours && otherItem.hour + Math.ceil(otherItem.duration / 60) > item.hour))
      );
      
      if (hasConflict) {
        console.log("❌ Conflict detected, reverting");
        toast.error("Cannot resize: would conflict with another playlist");
        // Revert to original duration
        setSchedule(prev => prev.map(schedItem => 
          schedItem.id === itemId 
            ? { ...schedItem, duration: startDuration }
            : schedItem
        ));
        return;
      }
      
      // Update database
      console.log("🚀 Updating database:", { itemId, currentDuration });
      
      try {
        const { data, error } = await supabase
          .from('scheduled_items')
          .update({ duration: currentDuration })
          .eq('id', itemId)
          .select()
          .single();
          
        if (error) {
          console.error("❌ Database update failed:", error);
          toast.error(`Failed to update playlist duration: ${error.message}`);
          // Revert to original duration
          setSchedule(prev => prev.map(schedItem => 
            schedItem.id === itemId 
              ? { ...schedItem, duration: startDuration }
              : schedItem
          ));
        } else {
          console.log("✅ Database updated successfully:", data);
          toast.success("Playlist duration updated");
          
          // Force a reload of the schedule to ensure consistency
          console.log("🔄 Reloading schedule from database");
          await loadSchedule();
        }
      } catch (error) {
        console.error("❌ Unexpected error updating duration:", error);
        toast.error("Failed to update playlist duration");
        // Revert to original duration
        setSchedule(prev => prev.map(schedItem => 
          schedItem.id === itemId 
            ? { ...schedItem, duration: startDuration }
            : schedItem
        ));
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const sanitizeForYaml = (text: string): string => {
    // Sanitize text for YAML to prevent injection attacks
    if (!text || typeof text !== 'string') return 'Unknown';
    return text.replace(/[^\w\s-]/g, '').trim() || 'Unknown';
  };

  const validateScheduleData = (): boolean => {
    // Validate schedule data before generating YAML
    if (!Array.isArray(schedule) || schedule.length === 0) {
      toast.error("No schedule items to save");
      return false;
    }

    const invalidItems = schedule.filter(item => 
      !item.day || 
      typeof item.hour !== 'number' || 
      item.hour < 0 || 
      item.hour > 23 ||
      typeof item.duration !== 'number' ||
      item.duration <= 0 ||
      item.duration > 1440 // Max 24 hours
    );

    if (invalidItems.length > 0) {
      toast.error("Invalid schedule items detected");
      console.error('Invalid items:', invalidItems);
      return false;
    }

    return true;
  };

  const generateScheduleYAML = () => {
    if (!validateScheduleData()) {
      return null;
    }

    console.log('Generating YAML for schedule items:', schedule);

    const scheduleData = {
      schedule: {
        created_at: new Date().toISOString(),
        venue: sanitizeForYaml("My Venue"),
        version: "1.0",
        week_schedule: days.reduce((acc, day) => {
          const daySchedule = schedule
            .filter(item => item.day === day)
            .sort((a, b) => a.hour - b.hour)
            .map(item => {
              const playlist = getPlaylistById(item.playlist_id);
              const playlistName = sanitizeForYaml(playlist?.name || 'Unknown Playlist');
              
              // Extract Deezer playlist ID from the playlist URL
              let deezerPlaylistId = null;
              if (playlist?.deezer_url) {
                deezerPlaylistId = DeezerService.extractPlaylistId(playlist.deezer_url);
              }
              
              // Validate duration is reasonable
              const safeDuration = Math.max(1, Math.min(1440, item.duration));
              
              console.log('Processing schedule item:', {
                playlist_id: item.playlist_id,
                playlist_name: playlistName,
                deezer_url: playlist?.deezer_url,
                deezer_playlist_id: deezerPlaylistId,
                time: item.hour,
                duration: safeDuration
              });
              
              return {
                time: `${item.hour.toString().padStart(2, '0')}:00`,
                playlist: playlistName,
                playlist_id: deezerPlaylistId || item.playlist_id, // Use Deezer ID if available, fallback to database ID
                deezer_playlist_id: deezerPlaylistId, // Explicitly include Deezer playlist ID
                duration_minutes: safeDuration,
                duration_hours: Math.floor(safeDuration / 60),
                duration_remaining_minutes: safeDuration % 60
              };
            });
          
          acc[day.toLowerCase()] = daySchedule;
          return acc;
        }, {} as Record<string, any>)
      }
    };
    
    console.log('Final schedule data before YAML conversion:', JSON.stringify(scheduleData, null, 2));
    
    try {
      const yamlResult = yaml.dump(scheduleData, { 
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        quotingType: '"',
        forceQuotes: false
      });
      
      console.log('Generated YAML:', yamlResult);
      return yamlResult;
    } catch (error) {
      console.error('Error generating YAML:', error);
      toast.error("Failed to generate YAML content");
      return null;
    }
  };

  const saveScheduleAsYAML = async () => {
    try {
      const yamlContent = generateScheduleYAML();
      if (!yamlContent) {
        return;
      }

      const fileName = `my-schedule.yml`;
      
      // Create a Blob with proper content type
      const yamlBlob = new Blob([yamlContent], { 
        type: 'application/x-yaml'
      });
      
      console.log('Uploading to storage...', { fileName, size: yamlBlob.size });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('schedules')
        .upload(fileName, yamlBlob, {
          upsert: true,
          contentType: 'application/x-yaml',
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        toast.error(`Failed to save schedule file: ${uploadError.message}`);
        return;
      }

      console.log('Upload successful:', uploadData);

      // Also save to database for backward compatibility and backup
      try {
        const { data: dbData, error: dbError } = await supabase
          .from('saved_schedules')
          .upsert({
            name: 'My Schedule',
            yaml_content: yamlContent
          }, {
            onConflict: 'name'
          })
          .select()
          .single();

        if (dbError) {
          console.warn("Database backup save failed:", dbError);
          // Don't fail the whole operation for this
        }
      } catch (dbErr) {
        console.warn("Database backup error:", dbErr);
      }

      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('schedules')
        .getPublicUrl(fileName);
      
      if (urlData?.publicUrl) {
        setDownloadUrl(urlData.publicUrl);
        console.log('Download URL set:', urlData.publicUrl);
      }

      toast.success("Schedule saved successfully!");
    } catch (err) {
      console.error("Unexpected error saving schedule:", err);
      toast.error("Failed to save schedule due to unexpected error");
    }
  };

  const downloadSchedule = async () => {
    try {
      if (downloadUrl) {
        // Test if the URL is accessible before downloading
        const response = await fetch(downloadUrl, { method: 'HEAD' });
        if (response.ok) {
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `music-schedule-${new Date().toISOString().split('T')[0]}.yml`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success("Schedule downloaded successfully!");
          return;
        }
      }

      // Fallback: generate and download directly
      const yamlContent = generateScheduleYAML();
      if (yamlContent) {
        downloadYAMLFile(yamlContent);
      } else {
        toast.error("Failed to generate schedule content");
      }
    } catch (err) {
      console.error("Error downloading schedule:", err);
      // Fallback to direct generation
      const yamlContent = generateScheduleYAML();
      if (yamlContent) {
        downloadYAMLFile(yamlContent);
      } else {
        toast.error("Failed to download schedule");
      }
    }
  };

  const downloadYAMLFile = (yamlContent: string) => {
    try {
      const blob = new Blob([yamlContent], { type: 'application/x-yaml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `music-schedule-${new Date().toISOString().split('T')[0]}.yml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Schedule downloaded successfully!");
    } catch (error) {
      console.error("Error creating download:", error);
      toast.error("Failed to create download file");
    }
  };

  const copyDownloadUrl = async () => {
    if (downloadUrl) {
      try {
        await navigator.clipboard.writeText(downloadUrl);
        toast.success("Download URL copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        toast.error("Failed to copy URL to clipboard");
      }
    } else {
      toast.error("No download URL available. Please save your schedule first.");
    }
  };

  const openDownloadUrl = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error("No download URL available. Please save your schedule first.");
    }
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
      setDownloadUrl(null);
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

      {/* Download URL Display */}
      {downloadUrl && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-green-800 mb-1">Direct Download URL</h4>
                <p className="text-xs text-green-600 break-all font-mono bg-white p-2 rounded border">
                  {downloadUrl}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyDownloadUrl}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                  title="Copy URL to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openDownloadUrl}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                  title="Open URL in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSchedule}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                  title="Download file directly"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

          <ScrollArea className="h-[580px]" ref={scrollAreaRef}>
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
