"use client";

import { useCallback } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";

const initialNodes: Node[] = [
  { id: "1", position: { x: 0, y: 80 }, data: { label: "1 · Start with a link" }, type: "input" },
  { id: "2", position: { x: 240, y: 0 }, data: { label: "2 · Sign in" } },
  { id: "3", position: { x: 240, y: 160 }, data: { label: "3 · Search" } },
  { id: "4", position: { x: 500, y: 80 }, data: { label: "4 · Copy items" } },
  { id: "5", position: { x: 740, y: 20 }, data: { label: "5 · Add extra info" } },
  { id: "6", position: { x: 740, y: 160 }, data: { label: "6 · Clean duplicates" } },
  { id: "7", position: { x: 980, y: 80 }, data: { label: "7 · Send to HubSpot" }, type: "output" },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
  { id: "e2-4", source: "2", target: "4" },
  { id: "e3-4", source: "3", target: "4" },
  { id: "e4-5", source: "4", target: "5", animated: true },
  { id: "e4-6", source: "4", target: "6" },
  { id: "e5-7", source: "5", target: "7" },
  { id: "e6-7", source: "6", target: "7" },
];

export function WorkflowCanvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  return (
    <div>
      <Topbar
        title="Automate"
        subtitle="Drag boxes to build a recipe: open site → search → copy data → save."
      />
      <div className="mb-3 flex gap-2">
        <Badge>recipe</Badge>
        <Badge tone="zinc">drag to connect</Badge>
      </div>
      <div className="h-[680px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="light"
        >
          <MiniMap pannable zoomable />
          <Controls />
          <Background gap={18} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>
    </div>
  );
}
