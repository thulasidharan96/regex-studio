/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  Node,
  Edge,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useRegexStudio } from './RegexStudioContext';
import { ASTNode } from '@regex-studio/regex-core';
import { compileASTNode } from '@regex-studio/regex-compiler';
import {
  Trash2,
  Copy,
  Plus,
  Maximize2,
  RefreshCw,
  SearchCode,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';

// Custom Node component wrapper to make React Flow feel cohesive with our theme
interface CustomNodeData {
  node: ASTNode;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSelect: (id: string) => void;
  onAddChild?: (id: string) => void;
  isSelected: boolean;
}

const LiteralNodeComponent = ({ data }: { data: CustomNodeData }) => {
  const { node, onDelete, onDuplicate, onSelect, isSelected } = data;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      className={`px-3 py-2 rounded-xl border flex flex-col justify-between select-none shadow-md transition text-slate-200 cursor-pointer ${
        isSelected
          ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
          : 'bg-emerald-950/15 border-emerald-950/50 hover:border-emerald-600/50'
      }`}
      style={{ minWidth: 140, minHeight: 60 }}
    >
      <div className="flex items-center justify-between gap-2 leading-none">
        <span className="text-[8px] font-sans font-extrabold text-emerald-400 uppercase tracking-widest">
          Literal Text
        </span>
        <span className="text-[9px] font-mono font-bold text-slate-500">
          {compileASTNode(node)}
        </span>
      </div>
      <div className="text-[12px] font-mono font-bold text-slate-100 truncate mt-1">
        "{node.value || ''}"
      </div>
      <div className="flex justify-end gap-1.5 opacity-0 hover:opacity-100 transition-opacity mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(node.id);
          }}
          className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
        >
          <Copy className="h-2.5 w-2.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="p-0.5 hover:bg-red-950/40 rounded text-slate-400 hover:text-red-400"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
};

const RangeNodeComponent = ({ data }: { data: CustomNodeData }) => {
  const { node, onDelete, onDuplicate, onSelect, isSelected } = data;
  const rangeRepr = (node.ranges || [])
    .map((r) => (r.start === r.end ? r.start : `${r.start}-${r.end}`))
    .join('');
  const symbol = `[${node.negated ? '^' : ''}${rangeRepr || ' '}]`;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      className={`px-3 py-2 rounded-xl border flex flex-col justify-between select-none shadow-md transition text-slate-200 cursor-pointer ${
        isSelected
          ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
          : 'bg-amber-950/15 border-amber-950/50 hover:border-amber-600/50'
      }`}
      style={{ minWidth: 140, minHeight: 60 }}
    >
      <div className="flex items-center justify-between gap-2 leading-none">
        <span className="text-[8px] font-sans font-extrabold text-amber-400 uppercase tracking-widest">
          Character Class
        </span>
        <span className="text-[9px] font-mono font-bold text-slate-500">
          {compileASTNode(node)}
        </span>
      </div>
      <div className="text-[12px] font-mono font-bold text-slate-100 truncate mt-1">
        {symbol}
      </div>
      <div className="flex justify-end gap-1.5 opacity-0 hover:opacity-100 transition-opacity mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(node.id);
          }}
          className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
        >
          <Copy className="h-2.5 w-2.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="p-0.5 hover:bg-red-950/40 rounded text-slate-400 hover:text-red-400"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
};

const CharacterNodeComponent = ({ data }: { data: CustomNodeData }) => {
  const { node, onDelete, onDuplicate, onSelect, isSelected } = data;
  const desc =
    node.charType === 'any'
      ? 'Any character (.)'
      : `\\${
          node.charType === 'digit'
            ? 'd'
            : node.charType === 'word'
            ? 'w'
            : node.charType === 'space'
            ? 's'
            : 'char'
        }`;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      className={`px-3 py-2 rounded-xl border flex flex-col justify-between select-none shadow-md transition text-slate-200 cursor-pointer ${
        isSelected
          ? 'bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20'
          : 'bg-teal-950/15 border-teal-950/50 hover:border-teal-600/50'
      }`}
      style={{ minWidth: 140, minHeight: 60 }}
    >
      <div className="flex items-center justify-between gap-2 leading-none">
        <span className="text-[8px] font-sans font-extrabold text-teal-400 uppercase tracking-widest">
          Preset Token
        </span>
        <span className="text-[9px] font-mono font-bold text-slate-500">
          {compileASTNode(node)}
        </span>
      </div>
      <div className="text-[12px] font-mono font-bold text-slate-100 truncate mt-1">
        {desc}
      </div>
      <div className="flex justify-end gap-1.5 opacity-0 hover:opacity-100 transition-opacity mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(node.id);
          }}
          className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
        >
          <Copy className="h-2.5 w-2.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="p-0.5 hover:bg-red-950/40 rounded text-slate-400 hover:text-red-400"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
};

const BoundaryNodeComponent = ({ data }: { data: CustomNodeData }) => {
  const { node, onDelete, onDuplicate, onSelect, isSelected } = data;
  const desc =
    node.boundaryType === 'start'
      ? 'Line Start (^)'
      : node.boundaryType === 'end'
      ? 'Line End ($)'
      : `Boundary (\\${node.boundaryType === 'word' ? 'b' : 'B'})`;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      className={`px-3 py-2 rounded-xl border flex flex-col justify-between select-none shadow-md transition text-slate-200 cursor-pointer ${
        isSelected
          ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
          : 'bg-indigo-950/15 border-indigo-950/50 hover:border-indigo-600/50'
      }`}
      style={{ minWidth: 140, minHeight: 60 }}
    >
      <div className="flex items-center justify-between gap-2 leading-none">
        <span className="text-[8px] font-sans font-extrabold text-indigo-400 uppercase tracking-widest">
          Anchor
        </span>
        <span className="text-[9px] font-mono font-bold text-slate-500">
          {compileASTNode(node)}
        </span>
      </div>
      <div className="text-[12px] font-mono font-bold text-slate-100 truncate mt-1">
        {desc}
      </div>
      <div className="flex justify-end gap-1.5 opacity-0 hover:opacity-100 transition-opacity mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(node.id);
          }}
          className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
        >
          <Copy className="h-2.5 w-2.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="p-0.5 hover:bg-red-950/40 rounded text-slate-400 hover:text-red-400"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
};

const GroupNodeComponent = ({ data }: { data: CustomNodeData }) => {
  const { node, onDelete, onDuplicate, onSelect, onAddChild, isSelected } = data;
  let title = 'Group';
  let titleColor = 'text-blue-400';
  let frameColor = isSelected
    ? 'bg-blue-950/45 border-blue-500 ring-2 ring-blue-500/20'
    : 'bg-blue-950/10 border-blue-950/60 hover:border-blue-600/50';

  if (node.type === 'group') {
    if (node.groupType === 'capture') title = 'Capture Group (...)';
    else if (node.groupType === 'named') title = `Named Capture (?<${node.name}>...)`;
    else if (node.groupType === 'non-capture') title = 'Non-capture Group (?:...)';
  } else if (node.type === 'lookaround') {
    titleColor = 'text-fuchsia-400';
    frameColor = isSelected
      ? 'bg-fuchsia-950/45 border-fuchsia-500 ring-2 ring-fuchsia-500/20'
      : 'bg-fuchsia-950/10 border-fuchsia-950/60 hover:border-fuchsia-600/50';
    switch (node.lookaroundType) {
      case 'lookahead':
        title = 'Positive Lookahead (?=)';
        break;
      case 'neg-lookahead':
        title = 'Negative Lookahead (?!)';
        break;
      case 'lookbehind':
        title = 'Positive Lookbehind (?<=)';
        break;
      case 'neg-lookbehind':
        title = 'Negative Lookbehind (?<!)';
        break;
    }
  } else if (node.type === 'alternative') {
    titleColor = 'text-amber-400';
    frameColor = isSelected
      ? 'bg-amber-950/45 border-amber-500 ring-2 ring-amber-500/20'
      : 'bg-amber-950/10 border-amber-950/60 hover:border-amber-600/50';
    title = 'Alternatives (A | B)';
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      className={`p-3 rounded-2xl border flex flex-col gap-2 select-none shadow-md transition cursor-pointer ${frameColor}`}
      style={{ minWidth: 220 }}
    >
      <div className="flex items-center justify-between gap-4">
        <span className={`text-[9px] font-sans font-extrabold uppercase tracking-wider ${titleColor}`}>
          {title}
        </span>
        <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
          {onAddChild && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              title="Add Child Node"
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(node.id);
            }}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 hover:bg-red-950/40 rounded text-slate-400 hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="text-[10px] font-mono text-slate-500">
        Compiled: <span className="text-accent">{compileASTNode(node)}</span>
      </div>
    </div>
  );
};

const BackreferenceNodeComponent = ({ data }: { data: CustomNodeData }) => {
  const { node, onDelete, onDuplicate, onSelect, isSelected } = data;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      className={`px-3 py-2 rounded-xl border flex flex-col justify-between select-none shadow-md transition text-slate-200 cursor-pointer ${
        isSelected
          ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
          : 'bg-purple-950/15 border-purple-950/50 hover:border-purple-600/50'
      }`}
      style={{ minWidth: 140, minHeight: 60 }}
    >
      <div className="flex items-center justify-between gap-2 leading-none">
        <span className="text-[8px] font-sans font-extrabold text-purple-400 uppercase tracking-widest">
          Backreference
        </span>
        <span className="text-[9px] font-mono font-bold text-slate-500">
          {compileASTNode(node)}
        </span>
      </div>
      <div className="text-[12px] font-mono font-bold text-slate-100 truncate mt-1">
        Match Group \{node.value || '1'}
      </div>
      <div className="flex justify-end gap-1.5 opacity-0 hover:opacity-100 transition-opacity mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(node.id);
          }}
          className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
        >
          <Copy className="h-2.5 w-2.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="p-0.5 hover:bg-red-950/40 rounded text-slate-400 hover:text-red-400"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
};

// Map node types to React Flow custom node renderers
const nodeTypes = {
  literal: LiteralNodeComponent,
  range: RangeNodeComponent,
  charset: RangeNodeComponent,
  character: CharacterNodeComponent,
  dot: CharacterNodeComponent,
  digit: CharacterNodeComponent,
  word: CharacterNodeComponent,
  space: CharacterNodeComponent,
  boundary: BoundaryNodeComponent,
  startAnchor: BoundaryNodeComponent,
  endAnchor: BoundaryNodeComponent,
  wordBoundary: BoundaryNodeComponent,
  group: GroupNodeComponent,
  captureGroup: GroupNodeComponent,
  namedGroup: GroupNodeComponent,
  nonCaptureGroup: GroupNodeComponent,
  lookaround: GroupNodeComponent,
  lookahead: GroupNodeComponent,
  negativeLookahead: GroupNodeComponent,
  lookbehind: GroupNodeComponent,
  negativeLookbehind: GroupNodeComponent,
  alternative: GroupNodeComponent,
  alternation: GroupNodeComponent,
  backreference: BackreferenceNodeComponent,
};

export const Canvas: React.FC = () => {
  const {
    activeProject,
    selectedNodeId,
    setSelectedNodeId,
    updateAST,
    compiledRegex,
    compiledFlags,
  } = useRegexStudio();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Reorder helper inside AST
  const deleteNodeInAST = useCallback((nodesList: ASTNode[], id: string): ASTNode[] => {
    return nodesList
      .filter((n) => n.id !== id)
      .map((n) => {
        if (n.children && n.children.length > 0) {
          return { ...n, children: deleteNodeInAST(n.children, id) };
        }
        return n;
      });
  }, []);

  const duplicateNodeInAST = useCallback((nodesList: ASTNode[], id: string): ASTNode[] => {
    const list: ASTNode[] = [];
    for (const node of nodesList) {
      if (node.id === id) {
        const clone = JSON.parse(JSON.stringify(node));
        const assignNewIds = (n: ASTNode) => {
          n.id = Math.random().toString(36).substring(2, 9);
          if (n.children) n.children.forEach(assignNewIds);
        };
        assignNewIds(clone);
        list.push(node);
        list.push(clone);
      } else {
        if (node.children && node.children.length > 0) {
          list.push({ ...node, children: duplicateNodeInAST(node.children, id) });
        } else {
          list.push(node);
        }
      }
    }
    return list;
  }, []);

  const handleDeleteNode = useCallback(
    (id: string) => {
      const updated = deleteNodeInAST(activeProject.ast, id);
      updateAST(updated);
      if (selectedNodeId === id) {
        setSelectedNodeId(null);
      }
    },
    [activeProject.ast, deleteNodeInAST, updateAST, selectedNodeId, setSelectedNodeId]
  );

  const handleDuplicateNode = useCallback(
    (id: string) => {
      const updated = duplicateNodeInAST(activeProject.ast, id);
      updateAST(updated);
    },
    [activeProject.ast, duplicateNodeInAST, updateAST]
  );

  const handleAddChildToContainer = useCallback(
    (containerId: string) => {
      const childNode: ASTNode = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'literal',
        value: 'a',
      };

      const addRecursively = (nodesList: ASTNode[]): ASTNode[] => {
        return nodesList.map((node) => {
          if (node.id === containerId) {
            return {
              ...node,
              children: [...(node.children || []), childNode],
            };
          } else if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: addRecursively(node.children),
            };
          }
          return node;
        });
      };

      updateAST(addRecursively(activeProject.ast));
      setSelectedNodeId(childNode.id);
    },
    [activeProject.ast, updateAST, setSelectedNodeId]
  );

  // Adapter converting Regex AST to React Flow Nodes & Edges layout
  useEffect(() => {
    const tempNodes: Node[] = [];
    const tempEdges: Edge[] = [];

    let currentX = 50;
    let currentY = 150;

    const buildLayout = (
      astNodes: ASTNode[],
      parentX = 0,
      parentY = 0,
      parentId: string | null = null
    ) => {
      let prevNodeId: string | null = null;

      astNodes.forEach((node, index) => {
        const nodeId = node.id;
        const isSelected = selectedNodeId === nodeId;

        // Position offset
        const x = parentId ? parentX + index * 260 + 50 : currentX;
        const y = parentId ? parentY + 80 : currentY;

        // Leaf/Group component definition
        const isContainer =
          node.type === 'group' ||
          node.type === 'lookaround' ||
          node.type === 'alternative' ||
          node.type === 'captureGroup' ||
          node.type === 'namedGroup' ||
          node.type === 'nonCaptureGroup' ||
          node.type === 'lookahead' ||
          node.type === 'negativeLookahead' ||
          node.type === 'lookbehind' ||
          node.type === 'negativeLookbehind' ||
          node.type === 'alternation' ||
          node.type === 'charset';

        tempNodes.push({
          id: nodeId,
          type: node.type,
          position: { x, y },
          parentNode: parentId || undefined,
          extent: parentId ? 'parent' : undefined,
          data: {
            node,
            onDelete: handleDeleteNode,
            onDuplicate: handleDuplicateNode,
            onSelect: (id: string) => setSelectedNodeId(id),
            onAddChild: isContainer ? handleAddChildToContainer : undefined,
            isSelected,
          },
        });

        // Add visual link edge
        if (prevNodeId) {
          tempEdges.push({
            id: `edge-${prevNodeId}-${nodeId}`,
            source: prevNodeId,
            target: nodeId,
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 1.5 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3b82f6',
              width: 10,
              height: 10,
            },
          });
        }

        // Recursively build child nodes
        if (isContainer && node.children && node.children.length > 0) {
          buildLayout(node.children, x, y, nodeId);
        }

        if (!parentId) {
          // Slide main level items to the right
          currentX += 300;
        } else {
          prevNodeId = nodeId;
        }
      });
    };

    buildLayout(activeProject.ast);

    setNodes(tempNodes);
    setEdges(tempEdges);
  }, [
    activeProject.ast,
    selectedNodeId,
    handleDeleteNode,
    handleDuplicateNode,
    handleAddChildToContainer,
    setSelectedNodeId,
    setNodes,
    setEdges,
  ]);

  return (
    <div className="flex-1 bg-bg flex flex-col min-w-0 relative h-full">
      {/* Top compiled bar overlay */}
      <div className="bg-sidebar border-b border-border-custom px-4 py-2 flex items-center justify-between gap-4 shrink-0 shadow-sm backdrop-blur z-20">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-accent/10 border border-accent/20 rounded text-accent shrink-0">
            <SearchCode className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">
              Compiled Expression
            </div>
            <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
              /
              <span className="text-accent font-bold break-all">
                {compiledRegex || '.*'}
              </span>
              /{compiledFlags || ''}
            </div>
          </div>
        </div>

        {/* Canvas Toolbar Info */}
        <div className="flex items-center gap-1.5 text-[10px] font-sans font-semibold text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          <span>Interactive React Flow workspace. Drag nodes to customize your regular expression pipeline!</span>
        </div>
      </div>

      {/* React Flow Board */}
      <div className="flex-1 min-h-0 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          attributionPosition="bottom-left"
          className="bg-bg"
        >
          <Background color="#374151" gap={16} size={1} />
          <Controls className="bg-sidebar border border-border-custom text-slate-200 fill-slate-200" />
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.type === 'literal') return '#10b981';
              if (n.type === 'range') return '#f59e0b';
              if (n.type === 'character') return '#14b8a6';
              return '#6366f1';
            }}
            nodeColor={(n) => '#1e293b'}
            className="bg-sidebar/95 border border-border-custom"
            maskColor="rgba(0, 0, 0, 0.5)"
          />
          <Panel position="bottom-right" className="bg-sidebar border border-border-custom rounded-lg px-2.5 py-1 text-[9px] font-mono text-slate-400 flex items-center gap-1.5 shadow-lg select-none">
            <LayoutGrid className="h-3 w-3 text-accent" />
            <span>REACT FLOW IDE ENABLED</span>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};
