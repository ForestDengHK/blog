import { Metadata } from 'next';

// Metadata must be in the server component (this file)
export const metadata: Metadata = {
  title: 'Image Optimizer - Blog Tools',
  description: 'Optimize and resize your blog images for better performance. Supports multiple image formats and provides Markdown code for easy integration.',
  keywords: 'image optimizer, image compression, blog images, image resizer, markdown images',
};

// Import the client component that contains the actual functionality
import ImageOptimizer from './ImageOptimizer';

// Server component
export default function ImageOptimizerPage() {
  return <ImageOptimizer />;
} 