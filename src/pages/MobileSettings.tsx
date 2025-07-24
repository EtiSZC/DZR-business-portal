import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Volume2, 
  Download, 
  Wifi, 
  WifiOff, 
  Smartphone,
  Settings as SettingsIcon
} from 'lucide-react';
import { ScheduleService } from '@/services/scheduleService';

export default function MobileSettings() {
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [downloadQuality, setDownloadQuality] = useState('high');
  const [backgroundSync, setBackgroundSync] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [scheduleService] = useState(() => ScheduleService.getInstance());

  useEffect(() => {
    // Initialize schedule service for mobile
    scheduleService.initialize();

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [scheduleService]);

  const handleTestNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Deezer Business Portal', {
          body: 'Test notification from your music scheduler',
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Deezer Business Portal', {
              body: 'Notifications enabled successfully!',
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* App Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>App Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span>Connection Status</span>
            </div>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Schedule Service</span>
            <Badge variant="default">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Playback Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>Playback</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Auto-play scheduled playlists</p>
              <p className="text-sm text-muted-foreground">
                Automatically start playing when schedule changes
              </p>
            </div>
            <Switch 
              checked={autoPlay} 
              onCheckedChange={setAutoPlay}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Background sync</p>
              <p className="text-sm text-muted-foreground">
                Keep schedule updated in background
              </p>
            </div>
            <Switch 
              checked={backgroundSync} 
              onCheckedChange={setBackgroundSync}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Schedule notifications</p>
              <p className="text-sm text-muted-foreground">
                Get notified when playlists change
              </p>
            </div>
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications}
            />
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestNotification}
            className="w-full"
          >
            Test Notification
          </Button>
        </CardContent>
      </Card>

      {/* Download Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Downloads</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium mb-2">Download Quality</p>
            <div className="space-y-2">
              {['standard', 'high', 'lossless'].map((quality) => (
                <Button
                  key={quality}
                  variant={downloadQuality === quality ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDownloadQuality(quality)}
                  className="mr-2"
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>App Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Build</span>
            <span>Mobile Beta</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform</span>
            <span>Capacitor</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}