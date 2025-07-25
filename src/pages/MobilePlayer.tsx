import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useMobileSchedule } from '@/hooks/useMobileSchedule';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

import { ScheduleService } from '@/services/scheduleService';

declare global {
  interface Window {
    DZ: any;
  }
}

export default function MobilePlayer() {
  const { currentSchedule, nextPlaylist, isLoading } = useMobileSchedule();
  const { 
    isPlaying, 
    currentTrack, 
    progress, 
    volume,
    play, 
    pause, 
    skipForward, 
    skipBack,
    setVolume,
    loadAndPlayPlaylist,
  } = useMusicPlayer();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const scheduleService = ScheduleService.getInstance();

  // Initialize schedule service and listen for schedule changes
  useEffect(() => {
    const initializeSchedule = async () => {
      await scheduleService.initialize();
    };

    const handleScheduleChange = (event: CustomEvent) => {
      const { playlistId } = event.detail;
      console.log('📅 Schedule changed, switching to playlist:', playlistId);
      loadAndPlayPlaylist(playlistId.toString());
    };

    initializeSchedule();
    window.addEventListener('scheduleChange', handleScheduleChange as EventListener);

    return () => {
      window.removeEventListener('scheduleChange', handleScheduleChange as EventListener);
      scheduleService.stop();
    };
  }, [loadAndPlayPlaylist]);

  // Music auto-start disabled

  const handleStartPlaying = async (playlistId?: string) => {
    console.log('🚫 Music playback disabled');
    alert('Music functionality has been disabled.');
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Current Playing Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="text-center">Now Playing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentTrack ? (
            <>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">{currentTrack.title}</h3>
                <p className="text-muted-foreground">{currentTrack.artist}</p>
                <Badge variant="secondary">{currentTrack.playlist}</Badge>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[progress]}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{currentTrack.currentTime}</span>
                  <span>{currentTrack.duration}</span>
                </div>
              </div>
              
              {/* Player Controls */}
              <div className="flex justify-center items-center space-x-4">
                <Button size="icon" variant="ghost" onClick={skipBack}>
                  <SkipBack className="h-6 w-6" />
                </Button>
                <Button 
                  size="icon" 
                  className="h-12 w-12"
                  onClick={isPlaying ? pause : play}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                <Button size="icon" variant="ghost" onClick={skipForward}>
                  <SkipForward className="h-6 w-6" />
                </Button>
              </div>
              
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <Slider
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0])}
                  className="flex-1"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No track currently playing</p>
              <Button 
                onClick={() => handleStartPlaying()} 
                className="mt-4"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? 'Connecting...' : 'Start Playing'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading schedule...</p>
          ) : currentSchedule ? (
            <div className="space-y-3">
              {currentSchedule.items.map((item, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    item.isActive 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.playlist}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.startTime} - {item.endTime}
                      </p>
                    </div>
                    {item.isActive && (
                      <Badge variant="default">Playing</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No schedule available</p>
          )}
        </CardContent>
      </Card>

      {/* Next Up */}
      {nextPlaylist && (
        <Card>
          <CardHeader>
            <CardTitle>Next Up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{nextPlaylist.name}</p>
                <p className="text-sm text-muted-foreground">
                  Starts at {nextPlaylist.startTime}
                </p>
              </div>
              <Badge variant="outline">
                In {nextPlaylist.timeUntil}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}