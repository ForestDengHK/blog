import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Tools & Utilities',
  description: 'A collection of helpful tools to enhance your blogging experience, including Markdown editor, image optimizer, and SEO helper.',
  keywords: 'blog tools, markdown editor, image optimizer, seo helper, blogging utilities',
  openGraph: {
    title: 'Blog Tools & Utilities',
    description: 'A collection of helpful tools to enhance your blogging experience.',
    type: 'website',
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {children}
    </main>
  );
} 