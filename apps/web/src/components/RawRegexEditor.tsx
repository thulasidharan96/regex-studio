/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useRegexStudio } from './RegexStudioContext';
import { parseRegexToAST } from '@thulasidharan96/regex-parser';
import { AlertCircle, CheckCircle, RefreshCw, Sparkles, Terminal } from 'lucide-react';

export const RawRegexEditor: React.FC = () => {
  const { compiledRegex, compiledFlags, importRegExp } = useRegexStudio();
  const [editorVal, setEditorVal] = useState('');
  const [parseError, setParseError] = useState<{ position: number; expected: string; suggestion: string; message: string } | null>(null);

  // Initialize editor value from compiled regex
  useEffect(() => {
    const fullPattern = `/${compiledRegex}/${compiledFlags}`;
    setEditorVal(fullPattern);
  }, [compiledRegex, compiledFlags]);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setEditorVal(value);

    let pattern = value;
    let flagsStr = '';

    // Handle standard /pattern/flags format
    if (value.startsWith('/') && value.lastIndexOf('/') > 0) {
      const lastSlash = value.lastIndexOf('/');
      pattern = value.substring(1, lastSlash);
      flagsStr = value.substring(lastSlash + 1);
    }

    try {
      // Validate with our parser
      parseRegexToAST(pattern);
      
      // If parser didn't throw, sync it to the global context state
      importRegExp(pattern, flagsStr);
      setParseError(null);
    } catch (err: any) {
      // Catch syntax errors and parser diagnostics
      setParseError({
        position: err.position || 0,
        expected: err.expected || '',
        suggestion: err.suggestion || 'Check syntax or group nesting brackets',
        message: err.message || 'Invalid regular expression syntax',
      });
    }
  };

  return (
    <div className="flex-1 bg-bg flex flex-col min-w-0 relative h-full">
      {/* Top compiled bar overlay */}
      <div className="bg-sidebar border-b border-border-custom px-4 py-2 flex items-center justify-between gap-4 shrink-0 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-accent/10 border border-accent/20 rounded text-accent shrink-0">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">
              Monaco Source Editor Mode
            </div>
            <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
              Live Interactive Parser Diagnostics enabled
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-sans font-semibold text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Real-time AST sync ensures all manual edits update visual flow nodes instantly.</span>
        </div>
      </div>

      {/* Editor & Diagnostics Split */}
      <div className="flex-1 flex min-h-0 divide-x divide-border-custom">
        {/* Editor Container */}
        <div className="flex-1 relative bg-[#1e1e1e]">
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={editorVal}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              cursorBlinking: 'smooth',
            }}
          />
        </div>

        {/* Diagnostics Side Console */}
        <div className="w-80 bg-sidebar p-4 flex flex-col justify-between shrink-0">
          <div>
            <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-slate-400 block mb-3">
              AST Parser Diagnostics
            </span>

            {parseError ? (
              <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start gap-2 text-red-400">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs">Syntax Error Detected</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono leading-relaxed">
                      {parseError.message}
                    </p>
                  </div>
                </div>

                <div className="border-t border-red-950/60 pt-2.5">
                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">
                    Diagnostic Info
                  </span>
                  <div className="text-[11px] font-mono text-slate-300 mt-1 space-y-1">
                    <div>
                      &gt; Character Position: <span className="text-red-300 font-bold">{parseError.position}</span>
                    </div>
                    {parseError.expected && (
                      <div>
                        &gt; Expected token: <span className="text-red-300">"{parseError.expected}"</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-red-950/60 pt-2.5">
                  <span className="text-[9px] font-sans text-slate-500 font-bold uppercase tracking-wider block">
                    Suggested Quick Fix
                  </span>
                  <p className="text-[10px] text-amber-300/90 font-medium mt-1 leading-relaxed">
                    {parseError.suggestion}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/25 border border-emerald-900/40 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <h4 className="font-bold text-xs">Parser Status: Valid</h4>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                  The regular expression structure compiles successfully. All visual flow nodes are up to date.
                </p>
              </div>
            )}
          </div>

          <div className="p-3 bg-bg border border-border-custom rounded-xl text-[9px] font-mono text-slate-500 flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-accent shrink-0" />
            <span>Parser acts as bidirectional sync compiler.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
