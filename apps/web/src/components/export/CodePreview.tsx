/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Download, Check, FileCode } from 'lucide-react';

interface CodePreviewProps {
  language: string;
  code: string;
  extension: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  language,
  code,
  extension,
}) => {
  const [copied, setCopied] = useState(false);

  const monacoLang = useMemo(() => {
    const lang = language.toLowerCase();
    if (lang.includes('javascript')) return 'javascript';
    if (lang.includes('typescript') || lang.includes('zod') || lang.includes('yup') || lang.includes('ajv')) return 'typescript';
    if (lang.includes('python')) return 'python';
    if (lang.includes('go')) return 'go';
    if (lang.includes('rust')) return 'rust';
    if (lang.includes('java')) return 'java';
    if (lang.includes('php')) return 'php';
    if (lang.includes('html')) return 'html';
    if (lang.includes('ruby')) return 'ruby';
    if (lang.includes('c#')) return 'csharp';
    return 'javascript';
  }, [language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `regex_snippet.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b13] overflow-hidden">
      {/* Top action bar */}
      <div className="px-3 py-1.5 bg-sidebar/40 border-b border-border-custom flex items-center justify-between shrink-0 select-none">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <FileCode className="h-3.5 w-3.5 text-accent" />
          <span>Snippet language: <span className="text-accent font-bold">{language}</span></span>
        </span>

        <div className="flex items-center gap-1.5">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-2 py-0.75 bg-sidebar hover:bg-bg text-[10px] font-bold rounded border border-border-custom transition flex items-center gap-1 text-slate-300 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-success" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="px-2 py-0.75 bg-accent/15 hover:bg-accent text-accent hover:text-white text-[10px] font-bold rounded border border-accent/25 transition flex items-center gap-1 cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={monacoLang}
          theme="vs-dark"
          value={code}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 11.5,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};
