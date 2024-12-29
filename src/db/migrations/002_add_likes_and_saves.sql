-- Add likes table for post likes
create table if not exists public.post_likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- Add saved posts table
create table if not exists public.saved_posts (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- Add read_time column to posts
alter table public.posts add column if not exists read_time_minutes integer default 3;

-- Set up RLS policies for likes and saves
alter table public.post_likes enable row level security;
alter table public.saved_posts enable row level security;

-- Policies for post likes
create policy "Users can view all post likes"
  on public.post_likes for select
  using (true);

create policy "Users can like posts"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike posts"
  on public.post_likes for delete
  using (auth.uid() = user_id);

-- Policies for saved posts
create policy "Users can view their own saved posts"
  on public.saved_posts for select
  using (auth.uid() = user_id);

create policy "Users can save posts"
  on public.saved_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave posts"
  on public.saved_posts for delete
  using (auth.uid() = user_id);

-- Add triggers for updated_at
create trigger handle_updated_at
  before update on public.post_likes
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.saved_posts
  for each row
  execute function public.handle_updated_at(); 