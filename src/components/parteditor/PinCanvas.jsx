import { useEffect, useRef } from "react";
import "./PinCanvas.css";

const ROLE_COLORS = { power: "#ed4040", ground: "#3b3b3b", null: "#406eed" };
const GRID_SIZE = 20; // world units
const DRAG_THRESHOLD = 4; // px of movement before a press counts as a drag, not a click

function snap(v, grid = GRID_SIZE) {
  return Math.round(v / grid) * grid;
}

// Pins are independent, absolute-world-position objects — not attached to
// the image. That means: the image can be repositioned/rescaled to line its
// artwork up with pins that are already placed, instead of pins having to
// follow the image around. `scale` only ever affects the <image> itself.
// `natural` (native pixel size of imageSrc) is loaded once by the parent —
// it also needs it to normalize pins back to fractions on save.
export default function PinCanvas({ imageSrc, natural, scale, imagePos, onMoveImage, viewport, onViewportChange, pins, selectedIndex, onAddPin, onSelectPin, onMovePin }) {
  const svgRef = useRef(null);

  // Re-center the world origin whenever a (new) image comes in, so swapping
  // images or loading a part for editing doesn't leave the view wherever the
  // previous session happened to scroll to.
  useEffect(() => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !rect.width) return;
    onViewportChange({ zoom: 1, x: rect.width / 2, y: rect.height / 2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  function toWorld(clientX, clientY) {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: (clientX - rect.left - viewport.x) / viewport.zoom, y: (clientY - rect.top - viewport.y) / viewport.zoom };
  }

  const imageSize = natural ? { width: natural.width * scale, height: natural.height * scale } : null;

  // A press anywhere — background or image — is ambiguous until it moves:
  // drag to pan (background) or move the part (image), or release without
  // moving to drop a pin at that spot either way.
  function handleBackgroundPointerDown(e) {
    const start = { x: e.clientX, y: e.clientY, vx: viewport.x, vy: viewport.y, dragging: false };
    function move(ev) {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!start.dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) start.dragging = true;
      if (start.dragging) onViewportChange({ ...viewport, x: start.vx + dx, y: start.vy + dy });
    }
    function up(ev) {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (!start.dragging) {
        const world = toWorld(ev.clientX, ev.clientY);
        onAddPin({ x: snap(world.x), y: snap(world.y) });
      }
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  // A press on the image is ambiguous until it moves: drag it around freely
  // (no grid snap — only pins snap), or release without moving to drop a pin.
  function handleImagePointerDown(e) {
    e.stopPropagation();
    const start = { x: e.clientX, y: e.clientY, imgX: imagePos.x, imgY: imagePos.y, dragging: false };

    function move(ev) {
      const dx = (ev.clientX - start.x) / viewport.zoom;
      const dy = (ev.clientY - start.y) / viewport.zoom;
      if (!start.dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) start.dragging = true;
      if (start.dragging) {
        onMoveImage({ x: start.imgX + dx, y: start.imgY + dy });
      }
    }
    function up(ev) {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (!start.dragging) {
        const world = toWorld(ev.clientX, ev.clientY);
        onAddPin({ x: snap(world.x), y: snap(world.y) });
      }
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function handlePinPointerDown(e, index) {
    e.stopPropagation();
    onSelectPin(index);
    function move(ev) {
      const world = toWorld(ev.clientX, ev.clientY);
      onMovePin(index, { x: snap(world.x), y: snap(world.y) });
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function handleWheel(e) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const rect = svgRef.current.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const factor = Math.exp(-e.deltaY * 0.01);
      const newZoom = Math.min(6, Math.max(0.15, viewport.zoom * factor));
      const worldX = (sx - viewport.x) / viewport.zoom;
      const worldY = (sy - viewport.y) / viewport.zoom;
      onViewportChange({ zoom: newZoom, x: sx - worldX * newZoom, y: sy - worldY * newZoom });
    } else {
      onViewportChange({ ...viewport, x: viewport.x - e.deltaX, y: viewport.y - e.deltaY });
    }
  }

  const gridId = "part-editor-grid";

  return (
    <svg ref={svgRef} className="pin-canvas-svg" onPointerDown={handleBackgroundPointerDown} onWheel={handleWheel}>
      <defs>
        <pattern id={gridId} width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={1} fill="var(--grid-dot)" />
        </pattern>
      </defs>
      <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
        <rect x={-20000} y={-20000} width={40000} height={40000} fill={`url(#${gridId})`} />
        {imageSize && (
          <image
            href={imageSrc}
            x={imagePos.x - imageSize.width / 2}
            y={imagePos.y - imageSize.height / 2}
            width={imageSize.width}
            height={imageSize.height}
            style={{ cursor: "crosshair" }}
            onPointerDown={handleImagePointerDown}
          />
        )}
        {pins.map((pin, i) => (
          <circle
            key={i}
            cx={pin.x}
            cy={pin.y}
            r={7}
            fill={ROLE_COLORS[pin.role] || ROLE_COLORS.null}
            stroke={i === selectedIndex ? "var(--primary)" : "#fff"}
            strokeWidth={2}
            style={{ cursor: "move" }}
            onPointerDown={(e) => handlePinPointerDown(e, i)}
          />
        ))}
      </g>
      {pins.length === 0 && (
        <text x="50%" y={32} textAnchor="middle" className="pin-canvas-hint">
          Click anywhere to drop a pin. Drag the part to move it, or drag empty space to pan.
        </text>
      )}
    </svg>
  );
}
