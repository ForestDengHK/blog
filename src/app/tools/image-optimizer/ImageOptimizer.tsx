'use client';

import { useState, useRef, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

interface ImageInfo {
  name: string;
  size: number;
  dimensions: { width: number; height: number };
  type: string;
  url: string;
}

interface OptimizationResult {
  name: string;
  originalSize: number;
  optimizedSize: number;
  dimensions: { width: number; height: number };
  url: string;
  markdown: string;
}

export default function ImageOptimizer() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [optimizedImages, setOptimizedImages] = useState<OptimizationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.url));
    };
  }, [images]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + O to open file dialog
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
      
      // Ctrl/Cmd + Enter to optimize images
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (images.length > 0 && !loading) {
          handleOptimize();
        }
      }
      
      // Escape to reset
      if (e.key === 'Escape') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [images, loading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Cleanup previous object URLs
    images.forEach(image => URL.revokeObjectURL(image.url));
    setError('');
    setImages([]);
    setOptimizedImages([]);

    const newImages: ImageInfo[] = [];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files.');
        continue;
      }

      if (file.size > maxFileSize) {
        setError('One or more files exceed the maximum size of 10MB.');
        continue;
      }

      try {
        const dimensions = await getImageDimensions(file);
        newImages.push({
          name: file.name,
          size: file.size,
          dimensions,
          type: file.type,
          url: URL.createObjectURL(file)
        });
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Error processing one or more images.');
      }
    }

    setImages(newImages);
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const optimizeImage = async (image: ImageInfo): Promise<OptimizationResult> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height while maintaining aspect ratio)
        let { width, height } = image.dimensions;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Apply image smoothing for better quality
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }

        // Determine optimal format and quality
        let format = 'image/jpeg';
        let quality = 0.8;

        if (image.type === 'image/png' && !hasTransparency(ctx, width, height)) {
          format = 'image/jpeg'; // Convert PNG to JPEG if no transparency
        } else if (image.type === 'image/png') {
          format = 'image/png';
          quality = 0.9; // Higher quality for PNG to preserve transparency
        }

        const optimizedUrl = canvas.toDataURL(format, quality);
        const optimizedSize = Math.round(optimizedUrl.length * 0.75); // Approximate size in bytes

        resolve({
          name: image.name,
          originalSize: image.size,
          optimizedSize,
          dimensions: { width, height },
          url: optimizedUrl,
          markdown: `![${image.name}](${optimizedUrl})`
        });
      };

      img.src = image.url;
    });
  };

  const hasTransparency = (ctx: CanvasRenderingContext2D | null, width: number, height: number): boolean => {
    if (!ctx) return false;
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Check alpha channel (every 4th byte)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        return true;
      }
    }
    
    return false;
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError('');

    try {
      const results = await Promise.all(images.map(optimizeImage));
      setOptimizedImages(results);
    } catch (err) {
      console.error('Error optimizing images:', err);
      setError('Error optimizing images.');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const calculateSavings = (original: number, optimized: number): string => {
    const savings = ((original - optimized) / original) * 100;
    return `${Math.round(savings)}%`;
  };

  const handleCopyMarkdown = (markdown: string) => {
    navigator.clipboard.writeText(markdown);
    toast.success('Markdown copied to clipboard');
  };

  const handleReset = () => {
    setImages([]);
    setOptimizedImages([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Image Optimizer
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Optimize your images for better blog performance. Images will be resized to a maximum of 1200px and compressed for web use.
        </p>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>Keyboard shortcuts:</p>
          <ul className="mt-1 space-y-1">
            <li>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + O
              </kbd>
              {' '}to select images
            </li>
            <li>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter
              </kbd>
              {' '}to optimize images
            </li>
            <li>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                Esc
              </kbd>
              {' '}to reset
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Select Images
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700
              file:cursor-pointer"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {images.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {images.length} image{images.length !== 1 ? 's' : ''} selected
            </p>
            <div className="space-x-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Reset
              </button>
              <button
                onClick={handleOptimize}
                disabled={loading || images.length === 0}
                className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Optimizing...
                  </span>
                ) : (
                  'Optimize Images'
                )}
              </button>
            </div>
          </div>
        )}

        {optimizedImages.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Optimized Images
            </h2>
            <div className="grid gap-6">
              {optimizedImages.map((result, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <img
                        src={result.url}
                        alt={result.name}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          {result.name}
                        </h3>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          <dt className="text-gray-600 dark:text-gray-400">Original size:</dt>
                          <dd className="text-gray-900 dark:text-white">{formatSize(result.originalSize)}</dd>
                          <dt className="text-gray-600 dark:text-gray-400">Optimized size:</dt>
                          <dd className="text-gray-900 dark:text-white">{formatSize(result.optimizedSize)}</dd>
                          <dt className="text-gray-600 dark:text-gray-400">Size reduction:</dt>
                          <dd className="text-green-600 dark:text-green-400">
                            {calculateSavings(result.originalSize, result.optimizedSize)}
                          </dd>
                          <dt className="text-gray-600 dark:text-gray-400">Dimensions:</dt>
                          <dd className="text-gray-900 dark:text-white">
                            {result.dimensions.width}×{result.dimensions.height}
                          </dd>
                        </dl>
                      </div>
                      <div>
                        <button
                          onClick={() => handleCopyMarkdown(result.markdown)}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy Markdown
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 