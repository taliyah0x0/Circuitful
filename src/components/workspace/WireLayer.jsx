import { useMemo } from "react";
import { useImageCacheVersion } from "../../lib/useImageSize.js";
import { resolveNodePosition } from "../../lib/wireResolve.js";

export default function WireLayer({ doc, partsById, catalogMeta, selection, onWirePointerDown, onNodePointerDown, hoveredWireId, setHoveredWireId }) {
  useImageCacheVersion();

  const nodePositions = useMemo(() => {
    const map = new Map();
    for (const node of doc.nodes) {
      map.set(node.id, resolveNodePosition(node, doc, partsById, catalogMeta));
    }
    return map;
  }, [doc, partsById, catalogMeta]);

  return (
    <g>
      {doc.wires.map((wire) => {
        const a = nodePositions.get(wire.nodeA);
        const b = nodePositions.get(wire.nodeB);
        if (!a || !b) return null;
        const isSelected = selection.type === "wire" && selection.ids.includes(wire.id);
        const isGroupSelected = selection.type === "wire" && selection.ids.some((id) => doc.wires.find((w) => w.id === id)?.groupId === wire.groupId);
        const isHovered = hoveredWireId === wire.id;
        return (
          <g key={wire.id}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="transparent"
              strokeWidth={24}
              style={{ cursor: "pointer" }}
              onPointerDown={(e) => onWirePointerDown(e, wire)}
              onPointerEnter={() => setHoveredWireId(wire.id)}
              onPointerLeave={() => setHoveredWireId(null)}
            />
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={wire.color}
              strokeWidth={isGroupSelected ? 8 : 7}
              strokeLinecap="round"
              opacity={isHovered ? 0.7 : 1}
              style={{ pointerEvents: "none" }}
            />
            {isSelected && (
              <line
                className="workspace-selection-outline"
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--primary)"
                strokeWidth={11}
                strokeLinecap="round"
                strokeDasharray="2 6"
                opacity={0.6}
                style={{ pointerEvents: "none" }}
              />
            )}
          </g>
        );
      })}
      {doc.nodes.map((node) => {
        const pos = nodePositions.get(node.id);
        if (!pos) return null;
        const isWaypoint = !node.attach;
        if (!isWaypoint) return null;
        return (
          <circle
            key={node.id}
            cx={pos.x}
            cy={pos.y}
            r={5}
            fill="#fff"
            stroke="#888"
            strokeWidth={1.5}
            style={{ cursor: "move" }}
            onPointerDown={(e) => onNodePointerDown(e, node)}
          />
        );
      })}
    </g>
  );
}
