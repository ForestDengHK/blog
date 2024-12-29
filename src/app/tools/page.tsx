'use client';

import Link from 'next/link';
import { DocumentTextIcon, PhotoIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const tools = [
  {
    name: 'Markdown Explainer',
    description: 'Learn and experiment with Markdown syntax for your blog posts.',
    icon: DocumentTextIcon,
    route: '/tools/markdown-explainer'
  },
  {
    name: 'Image Optimizer',
    description: 'Optimize and resize images for better blog performance.',
    icon: PhotoIcon,
    route: '/tools/image-optimizer'
  },
  {
    name: 'SEO Helper',
    description: "Analyze and improve your blog post's SEO elements.",
    icon: MagnifyingGlassIcon,
    route: '/tools/seo-helper'
  }
];

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Tools & Utilities
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          A collection of helpful tools to enhance your blogging experience.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.route}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <tool.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {tool.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {tool.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 