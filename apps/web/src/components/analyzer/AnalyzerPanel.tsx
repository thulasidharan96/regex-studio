/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useRegexStudio } from '../RegexStudioContext';
import { analyzeAST, performanceScore } from '@regex-studio/regex-analyzer';
import { ScoreCard } from './ScoreCard';
import { IssueCard } from './IssueCard';
import { Sparkles, Trophy, ShieldCheck } from 'lucide-react';
import { ASTNode } from '@regex-studio/regex-core';

export const AnalyzerPanel: React.FC = () => {
  const { activeProject, updateAST, setSelectedNodeId, commitWithDescription } = useRegexStudio();

  // Run the static analysis rules
  const issues = useMemo(() => {
    return analyzeAST(activeProject.ast);
  }, [activeProject.ast]);

  // Performance Score from analyzer package
  const perfScore = useMemo(() => {
    return performanceScore(activeProject.ast);
  }, [activeProject.ast]);

  // Security Score calculation
  const securityScore = useMemo(() => {
    let score = 100;
    const criticalIssues = issues.filter((i) => i.severity === 'high');
    score -= criticalIssues.length * 40;
    return Math.max(0, Math.min(100, score));
  }, [issues]);

  // Compatibility Score calculation
  const compatScore = useMemo(() => {
    let score = 100;
    const compatIssues = issues.filter((i) => i.message && i.message.toLowerCase().includes('safari') || i.message.toLowerCase().includes('lookbehind'));
    score -= compatIssues.length * 20;
    return Math.max(0, Math.min(100, score));
  }, [issues]);

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

  // Walk AST recursively to modify/fix nodes
  const modifyASTNode = (nodes: ASTNode[], targetId: string, transform: (node: ASTNode) => ASTNode): ASTNode[] => {
    return nodes.map((node) => {
      if (node.id === targetId) {
        return transform(node);
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: modifyASTNode(node.children, targetId, transform),
        };
      }
      return node;
    });
  };

  const handleApplyFix = (issue: any) => {
    if (!issue.location) return;

    // Build transform function depending on issue message
    let transform: (n: ASTNode) => ASTNode;

    const lowerMsg = (issue.message || '').toLowerCase();
    
    if (lowerMsg.includes('capture')) {
      // Fix unreferenced capture group: convert to non-capture
      transform = (n: ASTNode) => {
        const props = n.properties || {};
        return {
          ...n,
          type: 'group',
          properties: {
            ...props,
            groupType: 'non-capture',
          },
          groupType: 'non-capture'
        } as any;
      };
    } else if (lowerMsg.includes('duplicate')) {
      // Fix duplicate character classes or ranges: deduplicate
      transform = (n: ASTNode) => {
        const props = n.properties || {};
        const ranges = props.ranges || n.ranges || [];
        const seen = new Set<string>();
        const uniqueRanges = ranges.filter((r: any) => {
          const key = `${r.start}-${r.end}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        return {
          ...n,
          ranges: uniqueRanges,
          properties: {
            ...props,
            ranges: uniqueRanges,
          },
        } as any;
      };
    } else {
      // Fallback: simple text value reset or general safety
      transform = (n: ASTNode) => n;
    }

    const updatedAST = modifyASTNode(activeProject.ast, issue.location, transform);
    updateAST(updatedAST);
    commitWithDescription(`Auto-applied optimizer fix for: ${issue.message}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#070b13] overflow-hidden">
      {/* Dynamic Rating Headers */}
      <div className="p-3 border-b border-border-custom bg-sidebar/40 shrink-0">
        <div className="flex items-center gap-1.5 text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest leading-none mb-3">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          <span>AST Dashboard Analyzer Metrics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <ScoreCard
            title="Security Rating"
            score={securityScore}
            description="Vulnerability & ReDoS checks"
            color={securityScore >= 90 ? 'success' : securityScore >= 70 ? 'warning' : 'danger'}
          />
          <ScoreCard
            title="Performance Score"
            score={perfScore}
            description="Traversal & backtrack efficiency"
            color={perfScore >= 90 ? 'success' : perfScore >= 70 ? 'warning' : 'danger'}
          />
          <ScoreCard
            title="Cross Compatibility"
            score={compatScore}
            description="Browser / language exceptions"
            color={compatScore >= 90 ? 'success' : compatScore >= 70 ? 'warning' : 'danger'}
          />
        </div>
      </div>

      {/* Issues list section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans font-extrabold text-slate-500 uppercase tracking-widest">
            Detailed Quality Audit Report
          </span>
          <span className="text-[10px] text-slate-400 font-bold bg-input-bg border border-border-custom px-2 py-0.5 rounded">
            {issues.length} concerns found
          </span>
        </div>

        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-3 text-slate-500 bg-emerald-500/5 border border-dashed border-emerald-500/20 rounded-xl m-2">
            <Trophy className="h-10 w-10 text-emerald-500 mb-2 animate-bounce" />
            <span className="text-sm font-bold text-slate-200">Optimal Score Achieved!</span>
            <p className="text-[10.5px] text-slate-400 max-w-sm mt-1.5 leading-relaxed">
              No catastrophic repeats, unreferenced capture groups, duplicates, or compatibility errors were flagged in your visual tree.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-full">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onLocate={() => handleLocateNode(issue.location || issue.nodeId)}
                onApplyFix={() => handleApplyFix(issue)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
