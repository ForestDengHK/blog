'use client';

import { useState, useEffect } from 'react';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
  speakingTime: string;
}

function analyzeText(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
  
  // Average reading speed: 200-250 words per minute
  // Average speaking speed: 120-150 words per minute
  const readingMinutes = words / 225;
  const speakingMinutes = words / 135;

  const formatTime = (minutes: number): string => {
    if (minutes < 1) {
      return 'Less than a minute';
    }
    const roundedMinutes = Math.round(minutes);
    return `${roundedMinutes} minute${roundedMinutes !== 1 ? 's' : ''}`;
  };

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    readingTime: formatTime(readingMinutes),
    speakingTime: formatTime(speakingMinutes)
  };
}

export default function TextAnalyzer() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 'Less than a minute',
    speakingTime: 'Less than a minute'
  });

  useEffect(() => {
    const newStats = analyzeText(text);
    setStats(newStats);
  }, [text]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Text Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Analyze your text to get word count, character count, and estimated reading time.
        </p>
      </div>

      <div className="mb-8">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter or paste your text here..."
          className="w-full h-64 p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Stats
          </h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Words:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{stats.words}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Characters:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{stats.characters}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Characters (no spaces):</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{stats.charactersNoSpaces}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Structure
          </h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Sentences:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{stats.sentences}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Paragraphs:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{stats.paragraphs}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estimated Times
          </h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Reading Time:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{stats.readingTime}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Speaking Time:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{stats.speakingTime}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
} 