import { Metadata } from 'next';

// Metadata must be in the server component (this file)
export const metadata: Metadata = {
  title: 'SEO Helper - Blog Tools',
  description: "Analyze and improve your blog post's SEO elements. Get instant feedback on title, meta description, and content optimization.",
  keywords: 'seo helper, blog seo, content optimization, meta description, seo analysis',
};

// Import the client component that contains the actual functionality
import SeoHelper from './SeoHelper';

// Server component
export default function SeoHelperPage() {
  return <SeoHelper />;
} 