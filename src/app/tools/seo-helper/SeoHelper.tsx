'use client';

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

interface SEOAnalysis {
  titleLength: number;
  titleScore: number;
  titleFeedback: string[];
  descriptionLength: number;
  descriptionScore: number;
  descriptionFeedback: string[];
  contentStats: {
    wordCount: number;
    keywordDensity: { [key: string]: number };
    headings: number;
    links: number;
  };
  contentScore: number;
  contentFeedback: string[];
}

function analyzeSEO(title: string, description: string, content: string): SEOAnalysis {
  // Title analysis
  const titleFeedback: string[] = [];
  let titleScore = 100;

  if (title.length < 30) {
    titleFeedback.push('Title is too short (recommended: 30-60 characters)');
    titleScore -= 20;
  } else if (title.length > 60) {
    titleFeedback.push('Title is too long (recommended: 30-60 characters)');
    titleScore -= 20;
  }
  if (!/^[A-Z]/.test(title)) {
    titleFeedback.push('Title should start with a capital letter');
    titleScore -= 10;
  }

  // Description analysis
  const descriptionFeedback: string[] = [];
  let descriptionScore = 100;

  if (description.length < 120) {
    descriptionFeedback.push('Description is too short (recommended: 120-160 characters)');
    descriptionScore -= 20;
  } else if (description.length > 160) {
    descriptionFeedback.push('Description is too long (recommended: 120-160 characters)');
    descriptionScore -= 20;
  }
  if (!description.trim().endsWith('.')) {
    descriptionFeedback.push('Description should end with a period');
    descriptionScore -= 10;
  }

  // Content analysis
  const contentFeedback: string[] = [];
  let contentScore = 100;

  const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Calculate keyword density
  const keywordDensity: { [key: string]: number } = {};
  words.forEach(word => {
    if (word.length > 3) {  // Only count words longer than 3 characters
      keywordDensity[word] = (keywordDensity[word] || 0) + 1;
    }
  });

  // Convert to percentages and filter low-frequency words
  Object.keys(keywordDensity).forEach(word => {
    keywordDensity[word] = (keywordDensity[word] / wordCount) * 100;
    if (keywordDensity[word] < 1) {
      delete keywordDensity[word];
    }
  });

  // Count headings and links
  const headings = (content.match(/#/g) || []).length;
  const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length;

  // Content feedback
  if (wordCount < 300) {
    contentFeedback.push('Content is too short (recommended: at least 300 words)');
    contentScore -= 20;
  }
  if (headings < 2) {
    contentFeedback.push('Add more headings to structure your content');
    contentScore -= 15;
  }
  if (links < 1) {
    contentFeedback.push('Add some internal or external links');
    contentScore -= 15;
  }

  const topKeywords = Object.entries(keywordDensity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  if (topKeywords.some(([, density]) => density > 5)) {
    contentFeedback.push('Some keywords appear too frequently (keyword stuffing)');
    contentScore -= 20;
  }

  return {
    titleLength: title.length,
    titleScore: Math.max(0, titleScore),
    titleFeedback,
    descriptionLength: description.length,
    descriptionScore: Math.max(0, descriptionScore),
    descriptionFeedback,
    contentStats: {
      wordCount,
      keywordDensity: Object.fromEntries(topKeywords),
      headings,
      links
    },
    contentScore: Math.max(0, contentScore),
    contentFeedback
  };
}

export default function SeoHelper() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);

  useEffect(() => {
    if (title || description || content) {
      const result = analyzeSEO(title, description, content);
      setAnalysis(result);
    }
  }, [title, description, content]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to analyze
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAnalyze();
      }
      
      // Ctrl/Cmd + L to focus title
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        document.getElementById('title')?.focus();
      }
      
      // Escape to clear all fields
      if (e.key === 'Escape') {
        e.preventDefault();
        setTitle('');
        setDescription('');
        setContent('');
        setAnalysis(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleAnalyze = () => {
    if (!title && !description && !content) {
      toast.error('Please enter some content to analyze');
      return;
    }
    const result = analyzeSEO(title, description, content);
    setAnalysis(result);
    toast.success('Analysis complete!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          SEO Helper
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Analyze your blog post's SEO elements and get recommendations for improvement.
        </p>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>Keyboard shortcuts:</p>
          <ul className="mt-1 space-y-1">
            <li>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter
              </kbd>
              {' '}to analyze content
            </li>
            <li>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + L
              </kbd>
              {' '}to focus title
            </li>
            <li>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                Esc
              </kbd>
              {' '}to clear all fields
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Title
            {analysis && (
              <span className="ml-2 text-gray-500 dark:text-gray-400" aria-live="polite">
                ({analysis.titleLength}/60 characters)
              </span>
            )}
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your blog post title"
            aria-describedby="title-feedback"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Meta Description
            {analysis && (
              <span className="ml-2 text-gray-500 dark:text-gray-400" aria-live="polite">
                ({analysis.descriptionLength}/160 characters)
              </span>
            )}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your meta description"
            aria-describedby="description-feedback"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Content (Markdown)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your blog post content in Markdown format"
            aria-describedby="content-feedback"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Analyze SEO"
          >
            Analyze SEO
          </button>
        </div>

        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="region" aria-label="SEO Analysis Results">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Title Analysis
                </h2>
                <span className={`text-xl font-bold ${getScoreColor(analysis.titleScore)}`} aria-label={`Title score: ${analysis.titleScore}%`}>
                  {analysis.titleScore}%
                </span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300" id="title-feedback" role="list">
                {analysis.titleFeedback.map((feedback, index) => (
                  <li key={index} className="flex items-start" role="listitem">
                    <span className="text-red-500 mr-2" aria-hidden="true">•</span>
                    {feedback}
                  </li>
                ))}
                {analysis.titleFeedback.length === 0 && (
                  <li className="text-green-600 dark:text-green-400" role="listitem">
                    Title looks good!
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Description Analysis
                </h2>
                <span className={`text-xl font-bold ${getScoreColor(analysis.descriptionScore)}`} aria-label={`Description score: ${analysis.descriptionScore}%`}>
                  {analysis.descriptionScore}%
                </span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300" id="description-feedback" role="list">
                {analysis.descriptionFeedback.map((feedback, index) => (
                  <li key={index} className="flex items-start" role="listitem">
                    <span className="text-red-500 mr-2" aria-hidden="true">•</span>
                    {feedback}
                  </li>
                ))}
                {analysis.descriptionFeedback.length === 0 && (
                  <li className="text-green-600 dark:text-green-400" role="listitem">
                    Description looks good!
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Content Analysis
                </h2>
                <span className={`text-xl font-bold ${getScoreColor(analysis.contentScore)}`} aria-label={`Content score: ${analysis.contentScore}%`}>
                  {analysis.contentScore}%
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Statistics
                  </h3>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-gray-600 dark:text-gray-400">Words:</dt>
                    <dd className="text-gray-900 dark:text-white">{analysis.contentStats.wordCount}</dd>
                    <dt className="text-gray-600 dark:text-gray-400">Headings:</dt>
                    <dd className="text-gray-900 dark:text-white">{analysis.contentStats.headings}</dd>
                    <dt className="text-gray-600 dark:text-gray-400">Links:</dt>
                    <dd className="text-gray-900 dark:text-white">{analysis.contentStats.links}</dd>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Top Keywords
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(analysis.contentStats.keywordDensity).map(([keyword, density]) => (
                      <li key={keyword} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{keyword}</span>
                        <span className="text-gray-900 dark:text-white">{density.toFixed(1)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Feedback
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300" id="content-feedback" role="list">
                    {analysis.contentFeedback.map((feedback, index) => (
                      <li key={index} className="flex items-start" role="listitem">
                        <span className="text-red-500 mr-2" aria-hidden="true">•</span>
                        {feedback}
                      </li>
                    ))}
                    {analysis.contentFeedback.length === 0 && (
                      <li className="text-green-600 dark:text-green-400" role="listitem">
                        Content looks good!
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 