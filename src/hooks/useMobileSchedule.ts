import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as yaml from 'js-yaml';

interface ScheduleItem {
  playlist: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Schedule {
  name: string;
  items: ScheduleItem[];
}

interface NextPlaylist {
  name: string;
  startTime: string;
  timeUntil: string;
}

export function useMobileSchedule() {
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [nextPlaylist, setNextPlaylist] = useState<NextPlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentSchedule();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_schedules'
        },
        () => {
          loadCurrentSchedule();
        }
      )
      .subscribe();

    // Update active playlist every minute
    const interval = setInterval(updateActivePlaylist, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const loadCurrentSchedule = async () => {
    try {
      setIsLoading(true);
      
      // Get the most recent schedule
      const { data: schedules, error } = await supabase
        .from('saved_schedules')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (schedules && schedules.length > 0) {
        const schedule = schedules[0];
        const parsedSchedule = parseYamlSchedule(schedule.yaml_content, schedule.name);
        setCurrentSchedule(parsedSchedule);
        updateActivePlaylist(parsedSchedule);
        findNextPlaylist(parsedSchedule);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseYamlSchedule = (yamlContent: string, scheduleName: string): Schedule => {
    try {
      const parsed = yaml.load(yamlContent) as any;
      const items: ScheduleItem[] = [];
      
      // Get current day
      const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = parsed.schedule?.[currentDay] || {};
      
      Object.entries(daySchedule).forEach(([hour, playlistId]) => {
        const hourNum = parseInt(hour);
        const endHour = hourNum + 1;
        
        items.push({
          playlist: `Playlist ${playlistId}`,
          startTime: `${hourNum.toString().padStart(2, '0')}:00`,
          endTime: `${endHour.toString().padStart(2, '0')}:00`,
          isActive: false
        });
      });

      return {
        name: scheduleName,
        items: items.sort((a, b) => a.startTime.localeCompare(b.startTime))
      };
    } catch (error) {
      console.error('Error parsing YAML:', error);
      return { name: scheduleName, items: [] };
    }
  };

  const updateActivePlaylist = (schedule?: Schedule) => {
    const targetSchedule = schedule || currentSchedule;
    if (!targetSchedule) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + currentMinute / 60;

    const updatedItems = targetSchedule.items.map(item => {
      const [startHour] = item.startTime.split(':').map(Number);
      const [endHour] = item.endTime.split(':').map(Number);
      
      const isActive = currentTime >= startHour && currentTime < endHour;
      
      return { ...item, isActive };
    });

    setCurrentSchedule(prev => prev ? { ...prev, items: updatedItems } : null);
  };

  const findNextPlaylist = (schedule: Schedule) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + currentMinute / 60;

    const nextItem = schedule.items.find(item => {
      const [startHour] = item.startTime.split(':').map(Number);
      return startHour > currentTime;
    });

    if (nextItem) {
      const [startHour] = nextItem.startTime.split(':').map(Number);
      const hoursUntil = startHour - currentHour;
      const minutesUntil = 60 - currentMinute;
      
      let timeUntil = '';
      if (hoursUntil > 0) {
        timeUntil = `${hoursUntil}h ${minutesUntil}m`;
      } else {
        timeUntil = `${minutesUntil}m`;
      }

      setNextPlaylist({
        name: nextItem.playlist,
        startTime: nextItem.startTime,
        timeUntil
      });
    } else {
      setNextPlaylist(null);
    }
  };

  return {
    currentSchedule,
    nextPlaylist,
    isLoading
  };
}