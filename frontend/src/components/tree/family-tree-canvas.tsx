'use client';

import React, { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Sparkles, Network, Compass, Move, GitFork, User, Heart } from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface MemberNode {
  id: string;
  firstName: string;
  lastName: string;
  maidenName?: string | null;
  gender: string;
  birthDate?: string | null;
  deathDate?: string | null;
  isDeceased: boolean;
  avatarUrl?: string | null;
  occupation?: string | null;
  role: string;
}

interface RelationshipLink {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  relationType: string;
}

export function FamilyTreeCanvas({
  nodes,
  links,
  onSelectMember,
}: {
  nodes: MemberNode[];
  links: RelationshipLink[];
  onSelectMember: (memberId: string) => void;
}) {
  const [viewMode, setViewMode] = useState<'constellation' | 'tree'>('constellation');
  const [zoom, setZoom] = useState(0.95);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Currently focused / hovered member for glowing highlighting
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  // Center member ID (defaults to Eleanor or first member)
  const [centerMemberId, setCenterMemberId] = useState<string>(() => {
    const defaultCenter = nodes.find((n) => n.firstName.toLowerCase() === 'eleanor') || nodes[0];
    return defaultCenter?.id || '';
  });

  const nodeMap = useMemo(() => {
    const map = new Map<string, MemberNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Compute Directional Constellation Layout (Ancestors Top, Spouse Sides, Children Bottom)
  const webLayout = useMemo(() => {
    const centerNode = nodeMap.get(centerMemberId) || nodes[0];
    const CANVAS_WIDTH = 1800;
    const CANVAS_HEIGHT = 1200;
    const CX = CANVAS_WIDTH / 2;
    const CY = CANVAS_HEIGHT / 2;

    if (!centerNode) {
      return { centerNode: null, computedNodes: [], validLines: [], width: CANVAS_WIDTH, height: CANVAS_HEIGHT, cx: CX, cy: CY };
    }

    const centerYr = centerNode.birthDate ? new Date(centerNode.birthDate).getFullYear() : 1970;

    // Group other members into Ancestors (older), Peers/Spouses (same generation), Descendants (younger)
    const ancestors: MemberNode[] = [];
    const peers: MemberNode[] = [];
    const descendants: MemberNode[] = [];

    nodes.forEach((n) => {
      if (n.id === centerNode.id) return;
      const nYr = n.birthDate ? new Date(n.birthDate).getFullYear() : 1970;
      if (nYr < centerYr - 15) {
        ancestors.push(n);
      } else if (nYr > centerYr + 15) {
        descendants.push(n);
      } else {
        peers.push(n);
      }
    });

    const computedNodes: Array<{
      node: MemberNode;
      x: number;
      y: number;
      isCenter: boolean;
      group: 'center' | 'ancestor' | 'peer' | 'descendant';
    }> = [];

    // 1. Center Node
    computedNodes.push({
      node: centerNode,
      x: CX,
      y: CY,
      isCenter: true,
      group: 'center',
    });

    // 2. Ancestors placed in TOP Arc (y < CY)
    const R_ANCESTOR = 340;
    ancestors.forEach((m, idx) => {
      const startAngle = -Math.PI * 0.8;
      const totalArc = Math.PI * 0.6;
      const angle = ancestors.length === 1 ? -Math.PI / 2 : startAngle + (idx / (ancestors.length - 1)) * totalArc;
      computedNodes.push({
        node: m,
        x: CX + R_ANCESTOR * Math.cos(angle),
        y: CY + R_ANCESTOR * Math.sin(angle),
        isCenter: false,
        group: 'ancestor',
      });
    });

    // 3. Peers & Spouses placed on SIDES (Left / Right)
    const R_PEER = 320;
    peers.forEach((m, idx) => {
      const angle = idx % 2 === 0 ? 0 : Math.PI; // Right or Left
      const offset = (Math.floor(idx / 2) - (peers.length > 2 ? 0.5 : 0)) * 60;
      computedNodes.push({
        node: m,
        x: CX + R_PEER * Math.cos(angle),
        y: CY + offset,
        isCenter: false,
        group: 'peer',
      });
    });

    // 4. Descendants placed in BOTTOM Arc (y > CY)
    const R_DESCENDANT = 340;
    descendants.forEach((m, idx) => {
      const startAngle = Math.PI * 0.2;
      const totalArc = Math.PI * 0.6;
      const angle = descendants.length === 1 ? Math.PI / 2 : startAngle + (idx / (descendants.length - 1)) * totalArc;
      computedNodes.push({
        node: m,
        x: CX + R_DESCENDANT * Math.cos(angle),
        y: CY + R_DESCENDANT * Math.sin(angle),
        isCenter: false,
        group: 'descendant',
      });
    });

    // Build position lookup map
    const posMap = new Map<string, { x: number; y: number }>();
    computedNodes.forEach((cn) => posMap.set(cn.node.id, { x: cn.x, y: cn.y }));

    // Build SVG link paths between endpoints
    const validLines: Array<{
      id: string;
      fromId: string;
      toId: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      label: string;
    }> = [];

    links.forEach((l) => {
      const p1 = posMap.get(l.fromMemberId);
      const p2 = posMap.get(l.toMemberId);
      if (p1 && p2) {
        validLines.push({
          id: `${l.fromMemberId}-${l.toMemberId}-${l.relationType}`,
          fromId: l.fromMemberId,
          toId: l.toMemberId,
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          label: l.relationType,
        });
      }
    });

    return {
      centerNode,
      computedNodes,
      validLines,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      cx: CX,
      cy: CY,
    };
  }, [nodes, links, centerMemberId, nodeMap]);

  // Handle Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const formatYear = (d?: string | null) => (d ? new Date(d).getFullYear() : '');

  return (
    <div
      className="relative w-full h-[78vh] border border-stone-200/80 dark:border-stone-800/80 rounded-3xl bg-stone-950 overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Header HUD: Mode Switcher & Guide */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-1 p-1 rounded-2xl bg-stone-900/90 border border-stone-800 backdrop-blur-md shadow-xl text-xs">
          <button
            onClick={() => setViewMode('constellation')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              viewMode === 'constellation'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Spider Constellation</span>
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              viewMode === 'tree'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Tree Hierarchy</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-md text-xs text-stone-400">
          <Move className="w-3 h-3 text-amber-400" />
          <span>Click & Drag to Pan • Hover to Highlight Connections • Click Card to Focus</span>
        </div>
      </div>

      {/* Canvas Zoom Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 p-1.5 rounded-2xl bg-stone-900/90 border border-stone-800 backdrop-blur-md shadow-xl">
        <button
          onClick={() => {
            setZoom(0.95);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 rounded-xl text-stone-300 hover:bg-stone-800 transition-colors flex items-center text-xs space-x-1"
          title="Recenter Canvas"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>Recenter</span>
        </button>
        <div className="h-4 w-px bg-stone-800 mx-1" />
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 1.5))}
          className="p-2 rounded-xl text-stone-300 hover:bg-stone-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
          className="p-2 rounded-xl text-stone-300 hover:bg-stone-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(0.95);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 rounded-xl text-stone-300 hover:bg-stone-800 transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Viewport */}
      <div
        className="w-full h-full relative transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${webLayout.width} ${webLayout.height}`}
        >
          <defs>
            <radialGradient id="centerAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Center Member Soft Glow Aura */}
          <circle cx={webLayout.cx} cy={webLayout.cy} r="500" fill="url(#centerAura)" />

          {/* Directional Sector Guides */}
          {viewMode === 'constellation' && (
            <>
              <line
                x1={webLayout.cx - 600}
                y1={webLayout.cy}
                x2={webLayout.cx + 600}
                y2={webLayout.cy}
                stroke="#44403c"
                strokeWidth="1"
                strokeDasharray="4 8"
                className="opacity-30"
              />
              <text x={webLayout.cx} y={webLayout.cy - 480} textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="bold" fontFamily="serif" letterSpacing="2">
                ANCESTORS & PARENTS (UP)
              </text>
              <text x={webLayout.cx} y={webLayout.cy + 500} textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="bold" fontFamily="serif" letterSpacing="2">
                CHILDREN & DESCENDANTS (DOWN)
              </text>
            </>
          )}

          {/* Glowing Bezier Connecting Strands */}
          {webLayout.validLines.map((line) => {
            const isHighlighted =
              hoveredMemberId &&
              (line.fromId === hoveredMemberId || line.toId === hoveredMemberId);

            // Compute curved SVG path
            const dx = line.x2 - line.x1;
            const dy = line.y2 - line.y1;
            const cx = (line.x1 + line.x2) / 2 - dy * 0.15;
            const cy = (line.y1 + line.y2) / 2 + dx * 0.15;
            const pathD = `M ${line.x1} ${line.y1} Q ${cx} ${cy} ${line.x2} ${line.y2}`;

            return (
              <g key={line.id}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isHighlighted ? '#f59e0b' : '#b45309'}
                  strokeWidth={isHighlighted ? 3.5 : 1.8}
                  strokeOpacity={hoveredMemberId ? (isHighlighted ? 1 : 0.15) : 0.45}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
        </svg>

        {/* HTML Member Cards */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ width: webLayout.width, height: webLayout.height }}
        >
          {webLayout.computedNodes.map(({ node, x, y, isCenter, group }) => {
            const birthYr = formatYear(node.birthDate);
            const deathYr = formatYear(node.deathDate);
            const isHovered = hoveredMemberId === node.id;

            return (
              <div
                key={node.id}
                onMouseEnter={() => setHoveredMemberId(node.id)}
                onMouseLeave={() => setHoveredMemberId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setCenterMemberId(node.id);
                  onSelectMember(node.id);
                }}
                className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-300 ${
                  isCenter ? 'z-30 scale-110' : isHovered ? 'z-30 scale-105' : 'z-10'
                }`}
                style={{ left: `${x}px`, top: `${y}px` }}
              >
                <div
                  className={`p-4 rounded-3xl backdrop-blur-xl border transition-all flex items-center space-x-3.5 shadow-2xl ${
                    isCenter
                      ? 'bg-gradient-to-tr from-stone-900 via-amber-950 to-stone-900 border-amber-500 shadow-[0_0_40px_rgba(217,119,6,0.4)] w-72'
                      : isHovered
                      ? 'bg-stone-900 border-amber-400 shadow-[0_0_25px_rgba(217,119,6,0.3)] w-64'
                      : 'bg-stone-900/90 border-stone-800 hover:border-amber-700/60 w-64'
                  }`}
                >
                  <Avatar
                    src={node.avatarUrl}
                    alt={`${node.firstName} ${node.lastName}`}
                    size={isCenter ? 'lg' : 'md'}
                    className={isCenter ? 'ring-4 ring-amber-500 shadow-xl' : 'ring-2 ring-amber-700/40'}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`font-serif font-bold truncate ${
                          isCenter ? 'text-base text-amber-200' : 'text-sm text-stone-100'
                        }`}
                      >
                        {node.firstName} {node.lastName}
                      </h4>
                      {isCenter && (
                        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shrink-0">
                          WEB CENTER
                        </span>
                      )}
                    </div>

                    {node.maidenName && (
                      <p className="text-[11px] text-amber-400 italic">née {node.maidenName}</p>
                    )}

                    <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                      {birthYr ? `${birthYr} - ${deathYr || 'Present'}` : 'Heritage Record'}
                    </p>

                    {node.occupation && (
                      <p className="text-[11px] text-stone-400 truncate mt-1">{node.occupation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
