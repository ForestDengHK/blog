export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  read_time_minutes: number;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  spam_score: number;
  created_at: string;
  updated_at: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string | null;
  route: string;
  icon_url: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface SavedPost {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
} 