-- Add deezer_url column to playlists table
ALTER TABLE public.playlists 
ADD COLUMN deezer_url TEXT;

-- Update existing playlists with their Deezer URLs
UPDATE public.playlists 
SET deezer_url = 'https://www.deezer.com/fr/playlist/14082842421'
WHERE name = 'Morning Energy';

UPDATE public.playlists 
SET deezer_url = 'https://www.deezer.com/fr/playlist/14087268861'
WHERE name = 'Focus Session';

UPDATE public.playlists 
SET deezer_url = 'https://www.deezer.com/fr/playlist/14087271301'
WHERE name = 'Chill Vibes';

UPDATE public.playlists 
SET deezer_url = 'https://www.deezer.com/fr/playlist/14087273161'
WHERE name = 'Workout Mix';

UPDATE public.playlists 
SET deezer_url = 'https://www.deezer.com/fr/playlist/14087275161'
WHERE name = 'Evening Wind Down';