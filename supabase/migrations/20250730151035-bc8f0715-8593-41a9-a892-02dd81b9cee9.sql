
-- Create a storage bucket for schedule files
INSERT INTO storage.buckets (id, name, public)
VALUES ('schedules', 'schedules', true);

-- Create policy to allow public read access to schedule files
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'schedules');

-- Create policy to allow authenticated users to upload schedule files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'schedules' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update their schedule files
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'schedules' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete their schedule files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'schedules' AND auth.role() = 'authenticated');
