'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export function MarkdownEditor({ initialContent = '', onChange }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [content, setContent] = useState(initialContent);

  const handleChange = (value: string) => {
    setContent(value);
    onChange(value);
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              !isPreview
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Write
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              isPreview
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {isPreview ? (
        <div className="prose dark:prose-invert max-w-none min-h-[500px] p-4 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full min-h-[500px] p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Write your post content in Markdown..."
        />
      )}
    </div>
  );
} 