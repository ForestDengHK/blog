'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const EXAMPLE_MARKDOWN = `# Markdown Guide

## Basic Syntax

### Headers
# H1 Header
## H2 Header
### H3 Header

### Emphasis
*Italic text* or _italic text_
**Bold text** or __bold text__
***Bold and italic*** or ___bold and italic___

### Lists
Unordered list:
* Item 1
* Item 2
  * Nested item
  * Another nested item

Ordered list:
1. First item
2. Second item
   1. Nested item
   2. Another nested item

### Links and Images
[Link text](https://example.com)
![Image alt text](https://example.com/image.jpg)

### Blockquotes
> This is a blockquote
> It can span multiple lines

### Code
Inline \`code\` uses backticks

\`\`\`javascript
// Code blocks use three backticks
function example() {
  return 'Hello, world!';
}
\`\`\`

### Tables
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;

export default function MarkdownExplainer() {
  const [markdown, setMarkdown] = useState(EXAMPLE_MARKDOWN);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Markdown Explainer
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Learn and experiment with Markdown syntax. Edit the text on the left to see the rendered output on the right.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Markdown Input
            </h2>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-[600px] p-4 font-mono text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Preview
            </h2>
          </div>
          <div className="prose dark:prose-invert max-w-none p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 min-h-[600px] overflow-auto">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Tips
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>Use # for headers (more # means smaller headers)</li>
          <li>Wrap text in *asterisks* for italic or **double asterisks** for bold</li>
          <li>Create lists with * or numbers (1., 2., etc.)</li>
          <li>Add links with [text](URL) format</li>
          <li>Insert images with ![alt text](image URL)</li>
          <li>Create tables using | to separate columns</li>
          <li>Use {'>'} for blockquotes</li>
          <li>Wrap code in backticks (`) for inline code or triple backticks for code blocks</li>
        </ul>
      </div>
    </div>
  );
} 