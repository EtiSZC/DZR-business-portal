
-- Create the schedules storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('schedules', 'schedules', true);

-- Create a policy to allow public access to read files
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'schedules');

-- Create a policy to allow public access to insert files
CREATE POLICY "Public Insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'schedules');

-- Create a policy to allow public access to update files
CREATE POLICY "Public Update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'schedules');

-- Create a policy to allow public access to delete files
CREATE POLICY "Public Delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'schedules');
