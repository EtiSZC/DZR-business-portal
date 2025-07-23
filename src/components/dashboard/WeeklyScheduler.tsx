import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Plus, X } from "lucide-react";
import { toast } from "sonner";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const hours = Array.from({ length: 24 }, (_, i) => i);

const samplePlaylists = [
  { id: 1, name: "Morning Coffee", duration: "2h", color: "bg-blue-500" },
  { id: 2, name: "Lunch Rush", duration: "3h", color: "bg-green-500" },
  { id: 3, name: "Afternoon Chill", duration: "4h", color: "bg-purple-500" },
  { id: 4, name: "Dinner Jazz", duration: "3h", color: "bg-orange-500" },
  { id: 5, name: "Evening Vibes", duration: "2h", color: "bg-pink-500" },
  { id: 6, name: "Late Night", duration: "3h", color: "bg-indigo-500" },
];

interface ScheduledItem {
  id: string;
  playlistId: number;
  day: string;
  hour: number;
  duration: number;
}

export const WeeklyScheduler = () => {
  const [schedule, setSchedule] = useState<ScheduledItem[]>([
    {
      id: "1",
      playlistId: 1,
      day: "Monday",
      hour: 8,
      duration: 2,
    },
    {
      id: "2",
      playlistId: 2,
      day: "Monday",
      hour: 12,
      duration: 3,
    },
  ]);

  const [draggedPlaylist, setDraggedPlaylist] = useState<number | null>(null);

  const getPlaylistById = (id: number) => samplePlaylists.find(p => p.id === id);

  const handleDragStart = (playlistId: number) => {
    setDraggedPlaylist(playlistId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    
    if (!draggedPlaylist) return;

    const playlist = getPlaylistById(draggedPlaylist);
    if (!playlist) return;

    // Check for conflicts
    const duration = parseInt(playlist.duration);
    const hasConflict = schedule.some(item => 
      item.day === day && 
      ((item.hour <= hour && item.hour + item.duration > hour) ||
       (hour <= item.hour && hour + duration > item.hour))
    );

    if (hasConflict) {
      toast.error("Time slot conflict! Please choose a different time.");
      setDraggedPlaylist(null);
      return;
    }

    const newItem: ScheduledItem = {
      id: Date.now().toString(),
      playlistId: draggedPlaylist,
      day,
      hour,
      duration,
    };

    setSchedule([...schedule, newItem]);
    setDraggedPlaylist(null);
    toast.success("Playlist scheduled successfully!");
  };

  const removeScheduledItem = (id: string) => {
    setSchedule(schedule.filter(item => item.id !== id));
    toast.success("Playlist removed from schedule");
  };

  const getScheduledItem = (day: string, hour: number) => {
    return schedule.find(item => 
      item.day === day && 
      hour >= item.hour && 
      hour < item.hour + item.duration
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
            {samplePlaylists.map((playlist) => (
              <Card
                key={playlist.id}
                className="flex-shrink-0 w-48 cursor-move hover:shadow-lg transition-shadow"
                draggable
                onDragStart={() => handleDragStart(playlist.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${playlist.color}`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{playlist.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {playlist.duration}
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
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </Button>
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
                  const playlist = scheduledItem ? getPlaylistById(scheduledItem.playlistId) : null;

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="p-1 border-r last:border-r-0 min-h-[40px] relative hover:bg-muted/20 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, hour)}
                    >
                      {scheduledItem && isFirstHour && playlist && (
                        <div
                          className={`absolute inset-1 ${playlist.color} bg-opacity-20 border-l-4 border-opacity-100 rounded p-1 group`}
                          style={{ 
                            height: `${scheduledItem.duration * 40 - 4}px`,
                            borderLeftColor: playlist.color.replace('bg-', '').replace('-500', '')
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
                            {scheduledItem.duration}h
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