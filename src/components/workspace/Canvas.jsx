import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWorkspace } from "../../state/workspaceStore.js";
import { usePartsLibrary } from "../../state/partsLibraryStore.js";
import { screenToWorld } from "../../lib/coords.js";
import { snap, snapObjectToPinGrid } from "../../lib/parts.js";
import { rotatePoint } from "../../lib/geometry.js";
import { findNearestPin, nativeSizeFor } from "../../lib/wireResolve.js";
import ObjectNode from "./ObjectNode.jsx";
import WireLayer from "./WireLayer.jsx";
import "./Canvas.css";

const GRID_SIZE = 28;
const DRAG_THRESHOLD = 4; // px of movement before a pin press counts as a drag, not a click

export default function Canvas({ forwardedRef }) {
  const svgRef = useRef(null);
  const setSvgRef = (node) => {
    svgRef.current = node;
    if (forwardedRef) forwardedRef.current = node;
  };

  const doc = useWorkspace((s) => s.doc);
  const selection = useWorkspace((s) => s.selection);
  const viewport = useWorkspace((s) => s.viewport);
  const snapEnabled = useWorkspace((s) => s.snapEnabled);
  const penMode = useWorkspace((s) => s.penMode);
  const wireColor = useWorkspace((s) => s.wireColor);

  const {
    select,
    clearSelection,
    toggleInSelection,
    beginDrag,
    moveObjects,
    createWire,
    moveNode,
    pan,
    zoomAt,
    addObject,
  } = useWorkspace.getState();

  const builtin = usePartsLibrary((s) => s.builtin);
  const custom = usePartsLibrary((s) => s.custom);
  const builtinMeta = usePartsLibrary((s) => s.builtinMeta);
  const partsById = useMemo(() => {
    const map = new Map();
    for (const p of builtin) map.set(p.id, p);
    for (const p of custom) map.set(p.id, p);
    return map;
  }, [builtin, custom]);

  const [hoveredPin, setHoveredPinState] = useState(null);
  const hoveredPinRef = useRef(null); // synchronous mirror, read on pointerup
  const [hoveredWireId, setHoveredWireId] = useState(null);
  const [wirePreview, setWirePreview] = useState(null); // {from:{x,y}, to:{x,y}}
  const wirePreviewRef = useRef(null); // synchronous mirror, read on pointerup
  const [boxRect, setBoxRect] = useState(null);

  function setWirePreviewBoth(value) {
    wirePreviewRef.current = value;
    setWirePreview(value);
  }
  function setHoveredPin(value) {
    hoveredPinRef.current = value;
    setHoveredPinState(value);
  }

  // Escape cancels a wire that's armed (clicked once, waiting for the second click).
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && wirePreviewRef.current) setWirePreviewBoth(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toWorld = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current.getBoundingClientRect();
      return screenToWorld(viewport, rect, clientX, clientY);
    },
    [viewport]
  );

  function endWindowDrag(onMove, onUp) {
    function move(e) {
      onMove(e);
    }
    function up(e) {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      onUp(e);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function handleBackgroundPointerDown(e) {
    if (e.button === 1 || e.altKey) {
      // middle click / alt+drag = pan
      const start = { x: e.clientX, y: e.clientY };
      const startViewport = { ...viewport };
      endWindowDrag(
        (ev) => {
          const dx = ev.clientX - start.x;
          const dy = ev.clientY - start.y;
          useWorkspace.setState({ viewport: { ...startViewport, x: startViewport.x + dx, y: startViewport.y + dy } });
        },
        () => {}
      );
      return;
    }

    const world = toWorld(e.clientX, e.clientY);

    // A wire is already armed (started by an earlier click) — clicking empty
    // canvas either drops a free point (pen mode) or cancels the attempt.
    if (wirePreviewRef.current) {
      const nearest = findNearestPin(world, doc, partsById, builtinMeta);
      if (nearest) {
        finishWireAtPin(nearest.objectId, nearest.pinIndex, nearest.world);
      } else if (penMode) {
        finishWire({ freePoint: world });
      } else {
        setWirePreviewBoth(null);
      }
      return;
    }

    if (penMode) {
      startWireGesture({ x: world.x, y: world.y, attach: null }, "free", e);
      return;
    }

    if (!e.shiftKey) clearSelection();
    setBoxRect({ x1: world.x, y1: world.y, x2: world.x, y2: world.y });
    endWindowDrag(
      (ev) => {
        const w = toWorld(ev.clientX, ev.clientY);
        setBoxRect((b) => (b ? { ...b, x2: w.x, y2: w.y } : b));
      },
      () => finishBoxSelect()
    );
  }

  function finishBoxSelect() {
    setBoxRect((b) => {
      if (!b) return null;
      const x1 = Math.min(b.x1, b.x2);
      const x2 = Math.max(b.x1, b.x2);
      const y1 = Math.min(b.y1, b.y2);
      const y2 = Math.max(b.y1, b.y2);
      if (Math.abs(x2 - x1) > 3 || Math.abs(y2 - y1) > 3) {
        const ids = doc.objects.filter((o) => o.x >= x1 && o.x <= x2 && o.y >= y1 && o.y <= y2).map((o) => o.id);
        if (ids.length) select("object", ids);
      }
      return null;
    });
  }

  function handleObjectPointerDown(e, object) {
    e.stopPropagation();
    if (wirePreviewRef.current) setWirePreviewBoth(null); // moved on — drop the armed wire
    if (e.shiftKey) {
      toggleInSelection("object", object.id);
    } else if (!(selection.type === "object" && selection.ids.includes(object.id))) {
      select("object", [object.id]);
    }
    const ids = e.shiftKey ? useWorkspace.getState().selection.ids : (selection.ids.includes(object.id) ? selection.ids : [object.id]);
    beginDrag();
    let last = { x: e.clientX, y: e.clientY };
    endWindowDrag(
      (ev) => {
        const rect = svgRef.current.getBoundingClientRect();
        const dx = (ev.clientX - last.x) / viewport.zoom;
        const dy = (ev.clientY - last.y) / viewport.zoom;
        last = { x: ev.clientX, y: ev.clientY };
        moveObjects(ids, dx, dy);
      },
      () => {
        if (!snapEnabled) return;
        const latestDoc = useWorkspace.getState().doc;
        for (const id of ids) {
          const obj = latestDoc.objects.find((o) => o.id === id);
          if (!obj) continue;
          const part = partsById.get(obj.partId);
          const snapped = pinAnchoredSnap(part, obj.x, obj.y, obj.rotation);
          moveObjects([id], snapped.x - obj.x, snapped.y - obj.y);
        }
      }
    );
  }

  function pinAnchoredSnap(part, x, y, rotation = 0) {
    if (!part) return { x: snap(x, GRID_SIZE), y: snap(y, GRID_SIZE) };
    return snapObjectToPinGrid(part, { x, y, rotation, scale: 1 }, nativeSizeFor(part), GRID_SIZE);
  }

  function pinWorld(object, localPos) {
    const rotated = rotatePoint(localPos.x, localPos.y, 0, 0, object.rotation);
    return { x: object.x + rotated.x, y: object.y + rotated.y };
  }

  // Wires can be made either way: press a pin and drag to a second pin (old
  // behavior), or just click a pin once and click a second pin later — no
  // need to hold the mouse down in between. A press only counts as a "drag"
  // once it moves past DRAG_THRESHOLD; short of that, releasing just arms
  // the wire and leaves it following the cursor (via onPointerMove on the
  // svg) until the next click finishes or cancels it.
  function startWireGesture(spec, startKey, e) {
    setWirePreviewBoth({ from: spec, to: { x: spec.x, y: spec.y }, startKey });
    const startClient = { x: e.clientX, y: e.clientY };

    function up(ev) {
      window.removeEventListener("pointerup", up);
      const moved = Math.hypot(ev.clientX - startClient.x, ev.clientY - startClient.y) > DRAG_THRESHOLD;
      if (!moved) return; // arm and wait for the next click — see onPointerMove/pin handlers
      const releaseWorld = toWorld(ev.clientX, ev.clientY);
      const hp = hoveredPinRef.current;
      const nearest = hp
        ? { objectId: hp.objectId, pinIndex: hp.pinIndex, world: pinWorld(doc.objects.find((o) => o.id === hp.objectId), hp.localPos) }
        : findNearestPin(releaseWorld, doc, partsById, builtinMeta);
      if (nearest) {
        finishWireAtPin(nearest.objectId, nearest.pinIndex, nearest.world);
      } else if (penMode) {
        finishWire({ freePoint: releaseWorld });
      } else {
        setWirePreviewBoth(null); // dragged and missed — cancel
      }
    }
    window.addEventListener("pointerup", up);
  }

  // world: {x,y} of the target pin, already resolved (exact click, hover, or
  // nearest-pin search all funnel through here).
  function finishWireAtPin(objectId, pinIndex, world) {
    const wp = wirePreviewRef.current;
    if (!wp) return;
    const existingNodeId = useWorkspace.getState().findAttachedNode(objectId, pinIndex);
    const to = existingNodeId ? { existingNodeId } : { x: world.x, y: world.y, attach: { objectId, pinIndex } };
    createWire(wp.from, to);
    setWirePreviewBoth(null);
  }

  function finishWire({ freePoint }) {
    const wp = wirePreviewRef.current;
    if (!wp) return;
    const snapped = snapEnabled ? { x: snap(freePoint.x, GRID_SIZE), y: snap(freePoint.y, GRID_SIZE) } : freePoint;
    createWire(wp.from, { x: snapped.x, y: snapped.y, attach: null });
    setWirePreviewBoth(null);
  }

  function handlePinDown(object, pinIndex, localPos, e) {
    const world = pinWorld(object, localPos);
    const existingNodeId = useWorkspace.getState().findAttachedNode(object.id, pinIndex);
    const startKey = existingNodeId || `pin:${object.id}:${pinIndex}`;

    // A wire is already armed from an earlier click — this click finishes it
    // (unless they clicked the same pin they started from, which is a no-op).
    if (wirePreviewRef.current) {
      if (wirePreviewRef.current.startKey !== startKey) {
        finishWireAtPin(object.id, pinIndex, world);
      }
      return;
    }

    const spec = existingNodeId ? { existingNodeId, x: world.x, y: world.y } : { x: world.x, y: world.y, attach: { objectId: object.id, pinIndex } };
    startWireGesture(spec, startKey, e);
  }

  // Keeps the preview line following the cursor both mid-drag and while a
  // wire is armed-but-not-held (no button down between the two clicks).
  function handleCanvasPointerMove(e) {
    if (!wirePreviewRef.current) return;
    setWirePreviewBoth({ ...wirePreviewRef.current, to: toWorld(e.clientX, e.clientY) });
  }

  function handleWirePointerDown(e, wire) {
    e.stopPropagation();
    if (wirePreviewRef.current) {
      setWirePreviewBoth(null);
      return;
    }
    if (e.shiftKey) {
      toggleInSelection("wire", wire.id);
    } else {
      select("wire", [wire.id]);
    }
  }

  function handleWheel(e) {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) {
      const factor = Math.exp(-e.deltaY * 0.01);
      zoomAt(factor, e.clientX - rect.left, e.clientY - rect.top);
    } else {
      pan(-e.deltaX, -e.deltaY);
    }
  }

  function handleNodePointerDown(e, node) {
    e.stopPropagation();
    // A wire is armed — clicking an existing waypoint joins the new wire to
    // it instead of starting a node drag.
    if (wirePreviewRef.current) {
      const wp = wirePreviewRef.current;
      createWire(wp.from, { existingNodeId: node.id });
      setWirePreviewBoth(null);
      return;
    }
    beginDrag();
    endWindowDrag(
      (ev) => {
        const world = toWorld(ev.clientX, ev.clientY);
        const point = snapEnabled ? { x: snap(world.x, GRID_SIZE), y: snap(world.y, GRID_SIZE) } : world;
        moveNode(node.id, point.x, point.y);
      },
      () => {}
    );
  }

  function handleDragOver(e) {
    e.preventDefault();
  }
  function handleDrop(e) {
    e.preventDefault();
    const partId = e.dataTransfer.getData("text/circuitful-part");
    if (!partId) return;
    const world = toWorld(e.clientX, e.clientY);
    const point = snapEnabled ? pinAnchoredSnap(partsById.get(partId), world.x, world.y) : world;
    addObject(partId, point.x, point.y);
  }

  const gridId = "workspace-grid";

  return (
    <svg
      ref={setSvgRef}
      className="workspace-canvas"
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <defs>
        <pattern id={gridId} width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={1} fill="var(--grid-dot)" />
        </pattern>
      </defs>

      <g className="workspace-viewport" transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
        <rect className="workspace-grid-bg" x={-20000} y={-20000} width={40000} height={40000} fill={`url(#${gridId})`} />

        {[...doc.objects]
          .sort((a, b) => a.depth - b.depth)
          .map((object) => {
            const part = partsById.get(object.partId);
            if (!part) return null;
            return (
              <ObjectNode
                key={object.id}
                part={part}
                object={object}
                catalogMeta={builtinMeta}
                selected={selection.type === "object" && selection.ids.includes(object.id)}
                onPointerDownObject={handleObjectPointerDown}
                onPinDown={handlePinDown}
                hoveredPin={hoveredPin}
                setHoveredPin={setHoveredPin}
              />
            );
          })}

        {/* Wires paint above every part, matching how a real diagram reads. */}
        <WireLayer
          doc={doc}
          partsById={partsById}
          catalogMeta={builtinMeta}
          selection={selection}
          onWirePointerDown={handleWirePointerDown}
          onNodePointerDown={handleNodePointerDown}
          hoveredWireId={hoveredWireId}
          setHoveredWireId={setHoveredWireId}
        />

        {wirePreview && (
          <line
            x1={wirePreview.from.x ?? wirePreview.to.x}
            y1={wirePreview.from.y ?? wirePreview.to.y}
            x2={wirePreview.to.x}
            y2={wirePreview.to.y}
            stroke={wireColor}
            strokeWidth={7}
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
        )}

        {boxRect && (
          <rect
            x={Math.min(boxRect.x1, boxRect.x2)}
            y={Math.min(boxRect.y1, boxRect.y2)}
            width={Math.abs(boxRect.x2 - boxRect.x1)}
            height={Math.abs(boxRect.y2 - boxRect.y1)}
            fill="var(--primary-dim)"
            stroke="var(--primary)"
            strokeWidth={1 / viewport.zoom}
          />
        )}
      </g>
    </svg>
  );
}
