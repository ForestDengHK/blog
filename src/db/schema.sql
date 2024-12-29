-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create posts table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  cover_image_url text,
  author_id uuid references public.profiles(id) on delete cascade not null,
  published boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create comments table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_name text not null,
  content text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')) not null,
  spam_score numeric default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tools table
create table if not exists public.tools (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  route text unique not null,
  icon_url text,
  enabled boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.tools enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Posts policies
create policy "Published posts are viewable by everyone"
  on public.posts for select
  using (published = true);

create policy "Users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- Comments policies
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Anyone can create comments"
  on public.comments for insert
  with check (true);

create policy "Only admins can update comments"
  on public.comments for update
  using (auth.uid() in (
    select id from public.profiles
    where username = 'admin'
  ));

-- Tools policies
create policy "Tools are viewable by everyone"
  on public.tools for select
  using (enabled = true);

create policy "Only admins can manage tools"
  on public.tools for all
  using (auth.uid() in (
    select id from public.profiles
    where username = 'admin'
  ));

-- Create functions and triggers
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.comments
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.tools
  for each row
  execute function public.handle_updated_at(); 