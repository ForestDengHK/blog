-- Create documentation types table
CREATE TABLE IF NOT EXISTS public.doc_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create post_tags junction table
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);

-- Add doc_type_id to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS doc_type_id UUID REFERENCES public.doc_types(id);

-- Enable RLS
ALTER TABLE public.doc_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Policies for doc_types
CREATE POLICY "Doc types are viewable by everyone"
  ON public.doc_types FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage doc types"
  ON public.doc_types FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for tags
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage tags"
  ON public.tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for post_tags
CREATE POLICY "Post tags are viewable by everyone"
  ON public.post_tags FOR SELECT
  USING (true);

CREATE POLICY "Authors can manage their post tags"
  ON public.post_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_id AND posts.author_id = auth.uid()
    )
  );

-- Insert default documentation types
INSERT INTO public.doc_types (name, description) VALUES
  ('Tutorial', 'Step-by-step guide teaching a specific concept or skill'),
  ('How-to Guide', 'Practical guide focusing on achieving a specific goal'),
  ('Reference', 'Technical reference documentation or API documentation'),
  ('Explanation', 'Theoretical or conceptual explanations of topics'),
  ('Case Study', 'Real-world examples and implementations'),
  ('Best Practices', 'Recommended approaches and guidelines'),
  ('Troubleshooting', 'Solutions to common problems and issues')
ON CONFLICT (name) DO NOTHING;

-- Insert common tags
INSERT INTO public.tags (name, description) VALUES
  ('JavaScript', 'JavaScript programming language'),
  ('TypeScript', 'TypeScript programming language'),
  ('React', 'React.js framework'),
  ('Next.js', 'Next.js framework'),
  ('Database', 'Database-related topics'),
  ('Security', 'Security-related topics'),
  ('Performance', 'Performance optimization'),
  ('Testing', 'Testing methodologies and tools'),
  ('DevOps', 'DevOps practices and tools'),
  ('Frontend', 'Frontend development'),
  ('Backend', 'Backend development'),
  ('API', 'API development and integration')
ON CONFLICT (name) DO NOTHING;

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.doc_types
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 