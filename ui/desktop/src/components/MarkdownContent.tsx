import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from './icons';
import { visit } from 'unist-util-visit';

function rehypeinlineCodeProperty() {
  return function (tree) {
    if (!tree) return;
    visit(tree, 'element', function (node) {
      if (node.tagName == 'code' && node.parent && node.parent.tagName === 'pre') {
        node.properties.inlinecode = 'false';
      } else {
        node.properties.inlinecode = 'true';
      }
    });
  };
}

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const CodeBlock = ({ language, children }: { language: string; children: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group w-full">
      <button
        onClick={handleCopy}
        className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-gray-700/50 text-gray-300
                 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                 hover:bg-gray-600/50 hover:text-gray-100 z-10"
        title="Copy code"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <div className="w-full overflow-x-auto">
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            width: '100%',
            maxWidth: '100%',
          }}
          codeTagProps={{
            style: {
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              overflowWrap: 'break-word',
            },
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className="w-full overflow-x-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeinlineCodeProperty, rehypeRaw]}
        className={`prose prose-sm text-textStandard dark:prose-invert w-full max-w-full word-break
          prose-pre:p-0 prose-pre:m-0 !p-0
          prose-code:break-all prose-code:whitespace-pre-wrap
          prose-table:table prose-table:w-full
          prose-blockquote:text-inherit
          prose-td:border prose-td:border-borderSubtle prose-td:p-2
          prose-th:border prose-th:border-borderSubtle prose-th:p-2
          prose-thead:bg-bgSubtle
          prose-h1:text-2xl prose-h1:font-medium prose-h1:mb-5 prose-h1:mt-5
          prose-h2:text-xl prose-h2:font-medium prose-h2:mb-4 prose-h2:mt-4
          prose-h3:text-lg prose-h3:font-medium prose-h3:mb-3 prose-h3:mt-3
          prose-p:mt-0 prose-p:mb-2
          prose-ol:my-2
          prose-ul:mt-0 prose-ul:mb-3
          prose-li:m-0

          ${className}`}
        components={{
          a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          code({ className, children, inlinecode, ...props }) {
            const match = /language-(\w+)/.exec(className || 'language-text');
            return inlinecode == 'false' && match ? (
              <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
            ) : (
              <code
                {...props}
                className={`break-all bg-inline-code dark:bg-inline-code-dark whitespace-pre-wrap`}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
