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
      console.log('Current day:', currentDay);
      
      // Parse the new format with week_schedule
      const weekSchedule = parsed.schedule?.week_schedule;
      if (weekSchedule && weekSchedule[currentDay]) {
        const daySchedule = weekSchedule[currentDay];
        
        if (Array.isArray(daySchedule)) {
          daySchedule.forEach((item: any) => {
            const startHour = parseInt(item.time.split(':')[0]);
            const startMinute = parseInt(item.time.split(':')[1]);
            const durationMinutes = item.duration_minutes || 60;
            
            // Calculate end time
            const endTimeMs = new Date();
            endTimeMs.setHours(startHour, startMinute + durationMinutes, 0, 0);
            const endHour = endTimeMs.getHours();
            const endMinute = endTimeMs.getMinutes();
            
            items.push({
              playlist: item.playlist,
              startTime: item.time,
              endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
              isActive: false
            });
          });
        }
      }

      console.log('Parsed schedule items for display:', items);
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
      const [startHour, startMinute] = item.startTime.split(':').map(Number);
      const [endHour, endMinute] = item.endTime.split(':').map(Number);
      
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      
      const isActive = currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes;
      
      return { ...item, isActive };
    });

    setCurrentSchedule(prev => prev ? { ...prev, items: updatedItems } : null);
  };

  const findNextPlaylist = (schedule: Schedule) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const nextItem = schedule.items.find(item => {
      const [startHour, startMinute] = item.startTime.split(':').map(Number);
      const startTimeMinutes = startHour * 60 + startMinute;
      return startTimeMinutes > currentTimeMinutes;
    });

    if (nextItem) {
      const [startHour, startMinute] = nextItem.startTime.split(':').map(Number);
      const startTimeMinutes = startHour * 60 + startMinute;
      const minutesUntil = startTimeMinutes - currentTimeMinutes;
      
      const hoursUntil = Math.floor(minutesUntil / 60);
      const remainingMinutes = minutesUntil % 60;
      
      let timeUntil = '';
      if (hoursUntil > 0) {
        timeUntil = `${hoursUntil}h ${remainingMinutes}m`;
      } else {
        timeUntil = `${remainingMinutes}m`;
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