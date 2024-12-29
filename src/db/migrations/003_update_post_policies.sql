-- Drop existing policies for posts
drop policy if exists "Published posts are viewable by everyone" on public.posts;
drop policy if exists "Users can create posts" on public.posts;
drop policy if exists "Users can update their own posts" on public.posts;
drop policy if exists "Users can delete their own posts" on public.posts;

-- Create updated policies
create policy "Published posts are viewable by everyone"
  on public.posts for select
  using (published = true);

create policy "Users can view their own posts"
  on public.posts for select
  using (auth.uid() = author_id);

create policy "Users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id); 