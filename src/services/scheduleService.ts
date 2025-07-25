import { supabase } from '@/integrations/supabase/client';
import * as yaml from 'js-yaml';

export interface PlaylistSchedule {
  day: string;
  hour: number;
  playlistId: string | number;
  duration: number;
}

export class ScheduleService {
  private static instance: ScheduleService;
  private currentSchedule: PlaylistSchedule[] = [];
  private isActive = false;
  private checkInterval: NodeJS.Timeout | null = null;

  public static getInstance(): ScheduleService {
    if (!ScheduleService.instance) {
      ScheduleService.instance = new ScheduleService();
    }
    return ScheduleService.instance;
  }

  public async initialize() {
    if (this.isActive) return;
    
    await this.loadSchedule();
    this.startScheduleChecker();
    this.setupRealtimeSubscription();
    this.isActive = true;
  }

  public stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isActive = false;
  }

  private async loadSchedule() {
    try {
      const { data: schedules, error } = await supabase
        .from('saved_schedules')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (schedules && schedules.length > 0) {
        this.currentSchedule = this.parseSchedule(schedules[0].yaml_content);
        console.log('Schedule loaded:', this.currentSchedule);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  }

  private parseSchedule(yamlContent: string): PlaylistSchedule[] {
    try {
      const parsed = yaml.load(yamlContent) as any;
      const scheduleItems: PlaylistSchedule[] = [];

      if (parsed.schedule?.week_schedule) {
        Object.entries(parsed.schedule.week_schedule).forEach(([day, daySchedule]) => {
          if (Array.isArray(daySchedule)) {
            daySchedule.forEach((item: any) => {
              const hour = parseInt(item.time.split(':')[0]);
              scheduleItems.push({
                day,
                hour,
                playlistId: item.playlist, // Use playlist name for now
                duration: item.duration_minutes || 60
              });
            });
          }
        });
      }

      console.log('Parsed schedule items:', scheduleItems);
      return scheduleItems;
    } catch (error) {
      console.error('Error parsing schedule:', error);
      return [];
    }
  }

  private startScheduleChecker() {
    // Check every minute for schedule changes
    this.checkInterval = setInterval(() => {
      this.checkAndExecuteSchedule();
    }, 60000);

    // Initial check
    this.checkAndExecuteSchedule();
  }

  private checkAndExecuteSchedule() {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentHour = now.getHours();

    const activeSchedule = this.currentSchedule.find(
      item => item.day === currentDay && item.hour === currentHour
    );

    if (activeSchedule) {
      this.triggerPlaylistChange(activeSchedule);
    }
  }

  private triggerPlaylistChange(schedule: PlaylistSchedule) {
    console.log(`Switching to playlist ${schedule.playlistId} at ${schedule.hour}:00`);
    
    // For now, we'll use default playlist IDs since we need to map playlist names to Deezer IDs
    const playlistMap: { [key: string]: string } = {
      'Morning Energy': '14082842421',
      'Focus Session': '14082842421', 
      'Workout Mix': '14082842421',
      'Chill Vibes': '14082842421',
      'Evening Wind Down': '14082842421'
    };
    
    const deezerPlaylistId = playlistMap[schedule.playlistId as string] || '14082842421';
    
    // Dispatch custom event for the music player to listen to
    window.dispatchEvent(new CustomEvent('scheduleChange', {
      detail: {
        playlistId: deezerPlaylistId,
        hour: schedule.hour,
        day: schedule.day
      }
    }));
  }

  private setupRealtimeSubscription() {
    supabase
      .channel('schedule-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_schedules'
        },
        () => {
          console.log('Schedule updated, reloading...');
          this.loadSchedule();
        }
      )
      .subscribe();
  }

  public getCurrentPlaylist(): PlaylistSchedule | null {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentHour = now.getHours();

    return this.currentSchedule.find(
      item => item.day === currentDay && item.hour === currentHour
    ) || null;
  }

  public getNextPlaylist(): PlaylistSchedule | null {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentHour = now.getHours();

    // Find next playlist today
    const nextToday = this.currentSchedule.find(
      item => item.day === currentDay && item.hour > currentHour
    );

    if (nextToday) return nextToday;

    // If no more today, find first playlist tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    return this.currentSchedule.find(item => item.day === tomorrowDay) || null;
  }
}