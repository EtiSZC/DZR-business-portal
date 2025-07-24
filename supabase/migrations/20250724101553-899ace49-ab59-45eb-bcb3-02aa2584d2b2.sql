-- Create table to store saved schedules as YAML files
CREATE TABLE public.saved_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'My Schedule',
  yaml_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_schedules ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since no authentication is implemented yet)
CREATE POLICY "Allow all operations on saved_schedules" 
ON public.saved_schedules 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saved_schedules_updated_at
BEFORE UPDATE ON public.saved_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();