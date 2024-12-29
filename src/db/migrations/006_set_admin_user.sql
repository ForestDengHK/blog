-- Set the first user as admin (you can modify the WHERE clause if needed)
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM public.profiles 
  ORDER BY created_at ASC 
  LIMIT 1
); 