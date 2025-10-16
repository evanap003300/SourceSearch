import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './CodeViewer.css';

interface CodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  content: string;
  isLoading: boolean;
  error: string | null;
}

const CodeViewer: React.FC<CodeViewerProps> = ({
  isOpen,
  onClose,
  filename,
  content,
  isLoading,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      py: 'python',
      js: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      jsx: 'javascript',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      php: 'php',
      json: 'json',
      xml: 'xml',
      html: 'html',
      css: 'css',
      sql: 'sql',
      sh: 'bash',
      yaml: 'yaml',
      yml: 'yaml',
    };
    return languageMap[ext] || 'text';
  };

  // Parse filename to extract repo and actual filename
  // Format: owner_repo_original_filename.ext
  const parseFilename = (fn: string): { displayName: string; repo: string } => {
    const parts = fn.split('_');
    if (parts.length >= 3) {
      // Try to extract repo: typically first two parts are owner and repo
      const repo = `${parts[0]}/${parts[1]}`;
      // Rest is the filename
      const displayName = parts.slice(2).join('_');
      return { displayName, repo };
    }
    return { displayName: fn, repo: '' };
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    const { displayName } = parseFilename(filename);
    element.download = displayName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const { displayName, repo } = parseFilename(filename);

  return (
    <div className="code-viewer-overlay" onClick={onClose}>
      <div className="code-viewer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="code-viewer-header">
          <div className="code-viewer-info">
            <h2 className="code-viewer-title">{displayName}</h2>
            <p className="code-viewer-path">{repo || 'Local file'} • {filename}</p>
          </div>
          <button className="code-viewer-close" onClick={onClose}>✕</button>
        </div>

        {/* Toolbar */}
        <div className="code-viewer-toolbar">
          <button
            className="code-viewer-btn"
            onClick={handleCopyCode}
            title="Copy to clipboard"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          <button
            className="code-viewer-btn"
            onClick={handleDownload}
            title="Download file"
          >
            ⬇ Download
          </button>
          {repo && (
            <a
              href={`https://github.com/${repo}/search?q=${encodeURIComponent(displayName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="code-viewer-btn"
              title="Search on GitHub"
            >
              🔗 GitHub
            </a>
          )}
        </div>

        {/* Content */}
        <div className="code-viewer-content">
          {isLoading && (
            <div className="code-viewer-loading">
              <div className="spinner"></div>
              <p>Loading code...</p>
            </div>
          )}

          {error && (
            <div className="code-viewer-error">
              <p>⚠ Error: {error}</p>
            </div>
          )}

          {!isLoading && !error && content && (
            <SyntaxHighlighter
              language={getLanguage(filename)}
              style={vscDarkPlus}
              showLineNumbers={true}
              wrapLongLines={true}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: '14px',
                lineHeight: '1.5',
              }}
            >
              {content}
            </SyntaxHighlighter>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
