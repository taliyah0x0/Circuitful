import { useMemo } from "react";
import PartVisual, { useNativeSize } from "./PartVisual.jsx";
import { objectSize, partPins } from "../../lib/parts.js";
import ResistorBands from "./ResistorBands.jsx";
import ObjectLabel from "./ObjectLabel.jsx";
import ObjectTint from "./ObjectTint.jsx";

export default function ObjectNode({ part, object, catalogMeta, selected, onPointerDownObject, onPinDown, hoveredPin, setHoveredPin }) {
  const natural = useNativeSize(part);
  const size = natural ? objectSize(part, object, natural) : { width: 0, height: 0 };
  const pins = useMemo(() => partPins(part, object, catalogMeta), [part, object, catalogMeta]);

  if (!natural) return null;

  return (
    <g
      transform={`translate(${object.x} ${object.y}) rotate(${object.rotation})`}
      style={{ cursor: "grab" }}
      onPointerDown={(e) => onPointerDownObject(e, object)}
    >
      <PartVisual part={part} object={object} width={size.width} height={size.height} />
      {part.builtinId === 2 && <ResistorBands object={object} width={size.width} height={size.height} />}
      <ObjectTint part={part} objectId={object.id} color={object.settings?.tintColor} width={size.width} height={size.height} />
      {selected && (
        <rect
          className="workspace-selection-outline"
          x={-size.width / 2 - 4}
          y={-size.height / 2 - 4}
          width={size.width + 8}
          height={size.height + 8}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeDasharray="6 4"
          rx={4}
        />
      )}
      {pins.map((pin, idx) => {
        const px = pin.x * size.width;
        const py = pin.y * size.height;
        const isHovered = hoveredPin?.objectId === object.id && hoveredPin?.pinIndex === idx;
        const color = pin.role === "power" ? "#ed4040" : pin.role === "ground" ? "#3b3b3b" : "#406eed";
        const handlers = {
          onPointerEnter: () => setHoveredPin({ objectId: object.id, pinIndex: idx, localPos: { x: px, y: py } }),
          onPointerLeave: () => setHoveredPin(null),
          onPointerDown: (e) => {
            e.stopPropagation();
            onPinDown(object, idx, { x: px, y: py }, e);
          },
        };
        return (
          <g key={idx} style={{ cursor: "crosshair" }}>
            {/* Larger invisible hit-target — the visible dot is small, but a
                comfortable click/tap radius matters more than visual size. */}
            <circle cx={px} cy={py} r={22} fill="transparent" {...handlers} />
            <circle
              cx={px}
              cy={py}
              r={6}
              fill={color}
              fillOpacity={isHovered || selected ? 0.95 : 0.55}
              stroke="#fff"
              strokeWidth={1.5}
              style={{ pointerEvents: "none" }}
            />
          </g>
        );
      })}
      <ObjectLabel part={part} object={object} size={size} />
    </g>
  );
}
