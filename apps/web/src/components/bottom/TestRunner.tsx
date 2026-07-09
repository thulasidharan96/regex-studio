/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useRegexStudio } from '../RegexStudioContext';
import { useProjectStore } from '@regex-studio/stores';
import { Play, Plus, Trash2, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface TestCase {
  id: string;
  input: string;
  expected: boolean; // true = should match, false = should not match
}

export const TestRunner: React.FC = () => {
  const { activeProject, compiledRegex, compiledFlags, commitWithDescription } = useRegexStudio();
  const updateProjectProperties = useProjectStore((s) => s.updateProjectProperties);
  const [newCaseInput, setNewCaseInput] = useState('');
  const [newCaseExpected, setNewCaseExpected] = useState(true);

  // Load test cases with standard fallbacks
  const testCases = useMemo((): TestCase[] => {
    const raw = (activeProject as any).testCases;
    if (raw && Array.isArray(raw)) return raw;

    // Default sample cases based on project type if none exist
    return [
      { id: 't-1', input: 'john.doe@example.com', expected: true },
      { id: 't-2', input: 'invalid-email-no-at.com', expected: false },
      { id: 't-3', input: 'marketing@sub.office.net', expected: true },
    ];
  }, [activeProject]);

  // Compute live evaluations for each test case
  const evaluatedCases = useMemo(() => {
    if (!compiledRegex) {
      return testCases.map((tc) => ({
        ...tc,
        passed: false,
        actual: false,
        matches: [],
        execTimeMs: 0,
      }));
    }

    try {
      let safeFlags = 'g';
      if (compiledFlags.includes('i')) safeFlags += 'i';
      if (compiledFlags.includes('m')) safeFlags += 'm';
      if (compiledFlags.includes('s')) safeFlags += 's';

      const rx = new RegExp(compiledRegex, safeFlags);

      return testCases.map((tc) => {
        const startTime = performance.now();
        const rxCopy = new RegExp(rx);
        const text = tc.input;
        const matches: string[] = [];

        let m;
        let safety = 0;
        while ((m = rxCopy.exec(text)) !== null && safety < 100) {
          safety++;
          matches.push(m[0]);
          if (m.index === rxCopy.lastIndex) {
            rxCopy.lastIndex++;
          }
        }

        const endTime = performance.now();
        const actual = matches.length > 0;
        const passed = actual === tc.expected;

        return {
          ...tc,
          passed,
          actual,
          matches,
          execTimeMs: parseFloat((endTime - startTime).toFixed(3)),
        };
      });
    } catch (err) {
      return testCases.map((tc) => ({
        ...tc,
        passed: false,
        actual: false,
        matches: [],
        execTimeMs: 0,
      }));
    }
  }, [testCases, compiledRegex, compiledFlags]);

  const passCount = useMemo(() => evaluatedCases.filter((c) => c.passed).length, [evaluatedCases]);
  const failCount = useMemo(() => evaluatedCases.length - passCount, [evaluatedCases]);

  const handleAddTestCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseInput.trim()) return;

    const newTC: TestCase = {
      id: 'tc-' + Math.random().toString(36).substring(2, 9),
      input: newCaseInput.trim(),
      expected: newCaseExpected,
    };

    const updated = [...testCases, newTC];
    updateProjectProperties({ testCases: updated } as any);
    commitWithDescription(`Added test case: "${newCaseInput}"`);
    setNewCaseInput('');
  };

  const handleDeleteTestCase = (id: string) => {
    const updated = testCases.filter((tc) => tc.id !== id);
    updateProjectProperties({ testCases: updated } as any);
    commitWithDescription('Deleted test case');
  };

  const handleToggleExpected = (id: string) => {
    const updated = testCases.map((tc) => {
      if (tc.id === id) {
        return { ...tc, expected: !tc.expected };
      }
      return tc;
    });
    updateProjectProperties({ testCases: updated } as any);
  };

  return (
    <div className="h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border-custom bg-[#070b13] overflow-hidden font-sans select-none">
      {/* Left controls and add box */}
      <div className="w-full md:w-[240px] p-3 flex flex-col gap-3 shrink-0 bg-sidebar/10 justify-between overflow-y-auto">
        <div className="space-y-3">
          <span className="text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest leading-none block">
            Test runner dashboard
          </span>

          {/* Quick Stats Panel */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/15 text-emerald-400">
              <span className="text-sm font-extrabold font-mono block leading-none">{passCount}</span>
              <span className="text-[8px] font-sans font-bold text-slate-500 uppercase">Passed</span>
            </div>
            <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/15 text-rose-400">
              <span className="text-sm font-extrabold font-mono block leading-none">{failCount}</span>
              <span className="text-[8px] font-sans font-bold text-slate-500 uppercase">Failed</span>
            </div>
          </div>

          {/* Add test case form */}
          <form onSubmit={handleAddTestCase} className="space-y-2.5">
            <div className="space-y-1">
              <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wide">
                New Input String
              </span>
              <input
                id="test-input-field"
                type="text"
                placeholder="Target test value..."
                value={newCaseInput}
                onChange={(e) => setNewCaseInput(e.target.value)}
                className="w-full bg-input-bg border border-border-custom text-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-accent font-mono"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wide">
                Expected Behavior
              </span>
              <div className="flex gap-1 bg-input-bg border border-border-custom p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => setNewCaseExpected(true)}
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer transition ${
                    newCaseExpected ? 'bg-success text-white' : 'text-slate-400'
                  }`}
                >
                  Match
                </button>
                <button
                  type="button"
                  onClick={() => setNewCaseExpected(false)}
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded cursor-pointer transition ${
                    !newCaseExpected ? 'bg-rose-500 text-white' : 'text-slate-400'
                  }`}
                >
                  No Match
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-accent hover:bg-accent/85 text-white text-xs font-bold rounded-md flex items-center justify-center gap-1 cursor-pointer transition shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Test Case</span>
            </button>
          </form>
        </div>

        <div className="p-1.5 border border-border-custom bg-sidebar rounded text-[8.5px] text-slate-500 text-center font-sans">
          These test cases are stored in IndexedDB and reload on startup.
        </div>
      </div>

      {/* Right List columns */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        <span className="text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest leading-none block mb-1">
          Evaluation Matrix list
        </span>

        {evaluatedCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 text-slate-500">
            <HelpCircle className="h-7 w-7 text-slate-600 mb-1" />
            <span className="text-xs font-bold text-slate-400">No active test suite</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {evaluatedCases.map((tc) => {
              let statusBorder = tc.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5';
              return (
                <div key={tc.id} className={`p-2 rounded-lg border flex items-center justify-between gap-3 text-xs leading-none transition ${statusBorder}`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Status Badge */}
                    {tc.passed ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-[9px] font-mono shrink-0">
                        PASS
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-extrabold text-[9px] font-mono shrink-0">
                        FAIL
                      </span>
                    )}

                    <div className="space-y-0.5 min-w-0">
                      <p className="font-mono text-slate-200 font-bold select-all truncate">
                        "{tc.input}"
                      </p>
                      <p className="text-[9px] text-slate-500 font-sans font-semibold">
                        Expected: <span className={tc.expected ? 'text-emerald-400' : 'text-rose-400'}>{tc.expected ? 'Match' : 'No Match'}</span>
                        {' · '} Actual: <span className={tc.actual ? 'text-emerald-400' : 'text-rose-400'}>{tc.actual ? 'Match' : 'No Match'}</span>
                        {' · '} Speed: <span className="text-slate-400 font-mono">{tc.execTimeMs}ms</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Toggle Expectation Switch */}
                    <button
                      onClick={() => handleToggleExpected(tc.id)}
                      className="text-[9px] text-slate-500 hover:text-slate-300 underline cursor-pointer"
                    >
                      Flip target
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteTestCase(tc.id)}
                      className="p-1 text-slate-600 hover:text-red-400 transition cursor-pointer"
                      title="Delete case"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
