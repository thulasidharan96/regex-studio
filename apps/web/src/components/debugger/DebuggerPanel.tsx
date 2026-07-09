/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRegexStudio } from '../RegexStudioContext';
import { generateDebugSteps } from '@thulasidharan96/regex-debugger';
import { Timeline } from './Timeline';
import { ExecutionStep } from './ExecutionStep';
import { CaptureViewer } from './CaptureViewer';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sliders } from 'lucide-react';

export const DebuggerPanel: React.FC = () => {
  const { activeProject, setSelectedNodeId } = useRegexStudio();
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms

  // Dynamic step generation from package
  const debugSteps = useMemo(() => {
    return generateDebugSteps(activeProject.ast, activeProject.sampleText);
  }, [activeProject.ast, activeProject.sampleText]);

  // Handle active step focus
  const activeStep = useMemo(() => {
    if (debugSteps.length === 0) return null;
    return debugSteps.find((s) => s.stepIndex === selectedStepIdx) || debugSteps[0];
  }, [debugSteps, selectedStepIdx]);

  // Focus current node on canvas
  const handleLocateNode = (nodeId?: string) => {
    if (nodeId) {
      setSelectedNodeId(nodeId);
      const el = document.getElementById(`node-${nodeId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-accent/50');
        setTimeout(() => el.classList.remove('ring-4', 'ring-accent/50'), 2000);
      }
    }
  };

  // Autoplay effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedStepIdx((prev) => {
          if (prev >= debugSteps.length) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          const nextStep = debugSteps.find((s) => s.stepIndex === next);
          if (nextStep && nextStep.nodeId) {
            handleLocateNode(nextStep.nodeId);
          }
          return next;
        });
      }, playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, debugSteps, playbackSpeed]);

  const handlePrevStep = () => {
    if (selectedStepIdx <= 1) return;
    const prev = selectedStepIdx - 1;
    setSelectedStepIdx(prev);
    const step = debugSteps.find((s) => s.stepIndex === prev);
    if (step && step.nodeId) {
      handleLocateNode(step.nodeId);
    }
  };

  const handleNextStep = () => {
    if (selectedStepIdx >= debugSteps.length) return;
    const next = selectedStepIdx + 1;
    setSelectedStepIdx(next);
    const step = debugSteps.find((s) => s.stepIndex === next);
    if (step && step.nodeId) {
      handleLocateNode(step.nodeId);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSelectedStepIdx(1);
    if (debugSteps[0] && debugSteps[0].nodeId) {
      handleLocateNode(debugSteps[0].nodeId);
    }
  };

  return (
    <div className="flex h-full bg-[#070b13] divide-x divide-border-custom overflow-hidden font-sans select-none">
      {/* Left panel: Timeline lists */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col min-w-0">
        <Timeline
          steps={debugSteps}
          selectedStepIdx={selectedStepIdx}
          onSelectStep={(idx) => {
            setSelectedStepIdx(idx);
            const step = debugSteps.find((s) => s.stepIndex === idx);
            if (step && step.nodeId) {
              handleLocateNode(step.nodeId);
            }
          }}
        />
      </div>

      {/* Right panel: Active state & playback options */}
      <div className="w-[310px] p-3 flex flex-col shrink-0 bg-sidebar/10 gap-3 overflow-y-auto">
        <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-slate-500">
          State Playback Options
        </span>

        {/* Action button row */}
        <div className="bg-input-bg border border-border-custom p-2.5 rounded-lg flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase">VM Controls</span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevStep}
                disabled={selectedStepIdx <= 1}
                className="p-1 rounded bg-sidebar hover:bg-slate-800 border border-border-custom text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Previous step"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-1.5 rounded transition cursor-pointer text-white ${
                  isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-accent hover:bg-accent/80'
                }`}
                title={isPlaying ? 'Pause' : 'Play animation'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              </button>

              <button
                onClick={handleReset}
                className="p-1 rounded bg-sidebar hover:bg-slate-800 border border-border-custom text-slate-300 transition cursor-pointer"
                title="Reset simulation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={handleNextStep}
                disabled={selectedStepIdx >= debugSteps.length}
                className="p-1 rounded bg-sidebar hover:bg-slate-800 border border-border-custom text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Next step"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Speed slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[9px] font-mono text-slate-500 font-bold uppercase">
              <span>Simulation Delay</span>
              <span className="text-accent">{playbackSpeed}ms</span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="100"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="w-full accent-accent h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Execution step details component */}
        <ExecutionStep
          step={activeStep}
          totalSteps={debugSteps.length}
          sampleText={activeProject.sampleText}
          onLocateNode={handleLocateNode}
        />

        {/* Capture viewer component */}
        <CaptureViewer step={activeStep} />
      </div>
    </div>
  );
};
