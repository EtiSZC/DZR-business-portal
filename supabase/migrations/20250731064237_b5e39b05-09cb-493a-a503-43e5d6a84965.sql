
-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- Create more permissive policies that allow anonymous access
CREATE POLICY "Allow anonymous read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'schedules');

CREATE POLICY "Allow anonymous insert access" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'schedules');

CREATE POLICY "Allow anonymous update access" ON storage.objects 
FOR UPDATE USING (bucket_id = 'schedules');

CREATE POLICY "Allow anonymous delete access" ON storage.objects 
FOR DELETE USING (bucket_id = 'schedules');
