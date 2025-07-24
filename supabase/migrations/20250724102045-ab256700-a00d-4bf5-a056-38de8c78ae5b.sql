-- Add unique constraint on name column for saved_schedules table
ALTER TABLE public.saved_schedules 
ADD CONSTRAINT saved_schedules_name_unique UNIQUE (name);