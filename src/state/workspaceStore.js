import { create } from "zustand";
import { nanoid } from "nanoid";

const id = () => nanoid(10);

function emptyDoc() {
  return {
    objects: [], // {id, partId, x, y, rotation, scale, depth, settings}
    nodes: [], // {id, x, y, attach: {objectId, pinIndex} | null}
    wires: [], // {id, groupId, strandId, color, nodeA, nodeB}
    customColors: [],
  };
}

function cloneDoc(doc) {
  return {
    objects: doc.objects.map((o) => ({ ...o, settings: { ...o.settings } })),
    nodes: doc.nodes.map((n) => ({ ...n, attach: n.attach ? { ...n.attach } : null })),
    wires: doc.wires.map((w) => ({ ...w })),
    customColors: [...doc.customColors],
  };
}

const MAX_HISTORY = 200;

export const useWorkspace = create((set, get) => ({
  doc: emptyDoc(),
  past: [],
  future: [],

  selection: { type: null, ids: [] }, // type: 'object' | 'wire'
  viewport: { x: 0, y: 0, zoom: 1 },
  snapEnabled: true,
  penMode: false,
  wireColor: "#ed4040",
  filePath: null,
  dirty: false,

  // ---- history ----
  _commit() {
    set((s) => ({
      past: [...s.past, cloneDoc(s.doc)].slice(-MAX_HISTORY),
      future: [],
      dirty: true,
    }));
  },
  undo() {
    const { past, future, doc } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({
      doc: prev,
      past: past.slice(0, -1),
      future: [cloneDoc(doc), ...future],
      selection: { type: null, ids: [] },
    });
  },
  redo() {
    const { past, future, doc } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      doc: next,
      past: [...past, cloneDoc(doc)],
      future: future.slice(1),
      selection: { type: null, ids: [] },
    });
  },

  reset() {
    set({ doc: emptyDoc(), past: [], future: [], selection: { type: null, ids: [] }, filePath: null, dirty: false });
  },

  // ---- objects ----
  addObject(partId, x, y, extra = {}) {
    get()._commit();
    const maxDepth = get().doc.objects.reduce((m, o) => Math.max(m, o.depth), 0);
    const obj = {
      id: id(),
      partId,
      x,
      y,
      rotation: 0,
      scale: 1,
      depth: maxDepth + 1,
      settings: {},
      ...extra,
    };
    set((s) => ({ doc: { ...s.doc, objects: [...s.doc.objects, obj] } }));
    get().select("object", [obj.id]);
    return obj.id;
  },

  beginDrag() {
    get()._commit();
  },

  moveObjects(ids, dx, dy) {
    set((s) => ({
      doc: {
        ...s.doc,
        objects: s.doc.objects.map((o) => (ids.includes(o.id) ? { ...o, x: o.x + dx, y: o.y + dy } : o)),
      },
    }));
  },

  rotateObjects(ids, dir) {
    get()._commit();
    set((s) => ({
      doc: {
        ...s.doc,
        objects: s.doc.objects.map((o) =>
          ids.includes(o.id) ? { ...o, rotation: (((o.rotation + dir * 90) % 360) + 360) % 360 } : o
        ),
      },
    }));
  },

  setObjectSettings(id_, patch) {
    get()._commit();
    get().updateObjectSettingsLive(id_, patch);
  },

  // Same update, but without pushing a new undo step — for continuous input
  // (typing, dragging a slider) where the caller commits history once up
  // front (see beginDrag) rather than on every keystroke.
  updateObjectSettingsLive(id_, patch) {
    set((s) => ({
      doc: {
        ...s.doc,
        objects: s.doc.objects.map((o) => (o.id === id_ ? { ...o, settings: { ...o.settings, ...patch } } : o)),
      },
    }));
  },

  duplicateObjects(ids) {
    get()._commit();
    const offset = 24;
    const newIds = [];
    set((s) => {
      const copies = s.doc.objects
        .filter((o) => ids.includes(o.id))
        .map((o) => {
          const newId = id();
          newIds.push(newId);
          return { ...o, id: newId, x: o.x + offset, y: o.y + offset, settings: { ...o.settings } };
        });
      return { doc: { ...s.doc, objects: [...s.doc.objects, ...copies] } };
    });
    get().select("object", newIds);
    return newIds;
  },

  deleteObjects(ids) {
    get()._commit();
    set((s) => {
      const remainingNodes = s.doc.nodes.filter((n) => !(n.attach && ids.includes(n.attach.objectId)));
      const removedNodeIds = new Set(s.doc.nodes.filter((n) => n.attach && ids.includes(n.attach.objectId)).map((n) => n.id));
      const remainingWires = s.doc.wires.filter((w) => !removedNodeIds.has(w.nodeA) && !removedNodeIds.has(w.nodeB));
      return {
        doc: {
          ...s.doc,
          objects: s.doc.objects.filter((o) => !ids.includes(o.id)),
          nodes: remainingNodes,
          wires: remainingWires,
        },
      };
    });
    get().clearSelection();
  },

  bringToFront(ids) {
    get()._commit();
    set((s) => {
      const maxDepth = s.doc.objects.reduce((m, o) => Math.max(m, o.depth), 0);
      let next = maxDepth;
      const bumped = {};
      for (const objId of ids) bumped[objId] = ++next;
      return {
        doc: {
          ...s.doc,
          objects: s.doc.objects.map((o) => (bumped[o.id] ? { ...o, depth: bumped[o.id] } : o)),
        },
      };
    });
  },

  sendToBack(ids) {
    get()._commit();
    set((s) => {
      const minDepth = s.doc.objects.reduce((m, o) => Math.min(m, o.depth), 0);
      let next = minDepth;
      const bumped = {};
      for (const objId of ids) bumped[objId] = --next;
      return {
        doc: {
          ...s.doc,
          objects: s.doc.objects.map((o) => (bumped[o.id] ? { ...o, depth: bumped[o.id] } : o)),
        },
      };
    });
  },

  // ---- selection ----
  select(type, ids) {
    set({ selection: { type, ids } });
  },
  clearSelection() {
    set({ selection: { type: null, ids: [] } });
  },
  toggleInSelection(type, itemId) {
    set((s) => {
      if (s.selection.type !== type) return { selection: { type, ids: [itemId] } };
      const has = s.selection.ids.includes(itemId);
      const ids = has ? s.selection.ids.filter((i) => i !== itemId) : [...s.selection.ids, itemId];
      return { selection: { type: ids.length ? type : null, ids } };
    });
  },

  // ---- wires / nodes ----
  // spec: {existingNodeId} | {x, y, attach: {objectId, pinIndex} | null}
  resolveNode(spec) {
    if (spec.existingNodeId) return spec.existingNodeId;
    const newNode = { id: id(), x: spec.x, y: spec.y, attach: spec.attach || null };
    set((s) => ({ doc: { ...s.doc, nodes: [...s.doc.nodes, newNode] } }));
    return newNode.id;
  },

  findNodeAt(x, y, tolerance = 10) {
    const nodes = get().doc.nodes;
    for (const n of nodes) {
      if (Math.hypot(n.x - x, n.y - y) <= tolerance) return n.id;
    }
    return null;
  },

  findAttachedNode(objectId, pinIndex) {
    const nodes = get().doc.nodes;
    const found = nodes.find((n) => n.attach && n.attach.objectId === objectId && n.attach.pinIndex === pinIndex);
    return found ? found.id : null;
  },

  groupIdForNode(nodeId) {
    const wire = get().doc.wires.find((w) => w.nodeA === nodeId || w.nodeB === nodeId);
    return wire ? wire.groupId : null;
  },

  createWire(fromSpec, toSpec) {
    get()._commit();
    const fromExisting = fromSpec.existingNodeId ? get().groupIdForNode(fromSpec.existingNodeId) : null;
    const fromNodeId = get().resolveNode(fromSpec);
    const toNodeId = get().resolveNode(toSpec);
    const toExisting = toSpec.existingNodeId ? get().groupIdForNode(toSpec.existingNodeId) : null;
    // groupId marks the electrical net (shared with any other wire branching
    // off the same node) — Delete uses it, so removing one branch clears the
    // whole net. strandId marks just THIS draw operation and is always
    // fresh, never inherited from whatever it's connected to, so Color stays
    // scoped to the one wire the user actually drew, not every wire that
    // happens to touch the same pin.
    const groupId = fromExisting || toExisting || id();
    const strandId = id();
    const wire = { id: id(), groupId, strandId, color: get().wireColor, nodeA: fromNodeId, nodeB: toNodeId };
    set((s) => ({ doc: { ...s.doc, wires: [...s.doc.wires, wire] } }));
    get().select("wire", [wire.id]);
    return wire.id;
  },

  addNodeOnWire(wireId, x, y) {
    get()._commit();
    const wire = get().doc.wires.find((w) => w.id === wireId);
    if (!wire) return;
    const strandId = wire.strandId || wire.id;
    const midNode = { id: id(), x, y, attach: null };
    const w1 = { id: id(), groupId: wire.groupId, strandId, color: wire.color, nodeA: wire.nodeA, nodeB: midNode.id };
    const w2 = { id: id(), groupId: wire.groupId, strandId, color: wire.color, nodeA: midNode.id, nodeB: wire.nodeB };
    set((s) => ({
      doc: {
        ...s.doc,
        nodes: [...s.doc.nodes, midNode],
        wires: [...s.doc.wires.filter((w) => w.id !== wireId), w1, w2],
      },
    }));
  },

  moveNode(nodeId, x, y) {
    set((s) => ({
      doc: { ...s.doc, nodes: s.doc.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)) },
    }));
  },

  deleteWireGroup(groupId) {
    get()._commit();
    set((s) => {
      const keep = s.doc.wires.filter((w) => w.groupId !== groupId);
      const usedNodeIds = new Set(keep.flatMap((w) => [w.nodeA, w.nodeB]));
      return {
        doc: {
          ...s.doc,
          wires: keep,
          nodes: s.doc.nodes.filter((n) => usedNodeIds.has(n.id) || n.attach),
        },
      };
    });
    get().clearSelection();
  },

  // Colors every segment of the one wire the user drew (its strandId), not
  // the whole electrical net (groupId) — "Add Node" splits a wire into two
  // segments sharing a strandId so it still colors as one wire, but a
  // separate wire that merely branches off the same pin has its own
  // strandId and stays untouched. (Falls back to the wire's own id for
  // older documents saved before strandId existed.)
  setSegmentColor(wireId, color) {
    get()._commit();
    const wire = get().doc.wires.find((w) => w.id === wireId);
    if (!wire) return;
    const strandId = wire.strandId || wire.id;
    set((s) => ({
      doc: {
        ...s.doc,
        wires: s.doc.wires.map((w) => ((w.strandId || w.id) === strandId ? { ...w, color } : w)),
      },
    }));
    set({ wireColor: color });
  },

  addCustomColor(hex) {
    set((s) => {
      const next = [hex, ...s.doc.customColors.filter((c) => c !== hex)].slice(0, 9);
      return { doc: { ...s.doc, customColors: next } };
    });
  },
  removeCustomColor(hex) {
    set((s) => ({ doc: { ...s.doc, customColors: s.doc.customColors.filter((c) => c !== hex) } }));
  },
  setWireColor(color) {
    set({ wireColor: color });
  },

  // ---- viewport ----
  pan(dx, dy) {
    set((s) => ({ viewport: { ...s.viewport, x: s.viewport.x + dx, y: s.viewport.y + dy } }));
  },
  zoomAt(factor, screenX, screenY) {
    set((s) => {
      const { x, y, zoom } = s.viewport;
      const newZoom = Math.min(6, Math.max(0.15, zoom * factor));
      const worldX = (screenX - x) / zoom;
      const worldY = (screenY - y) / zoom;
      return {
        viewport: {
          zoom: newZoom,
          x: screenX - worldX * newZoom,
          y: screenY - worldY * newZoom,
        },
      };
    });
  },
  resetViewport() {
    set({ viewport: { x: 0, y: 0, zoom: 1 } });
  },

  toggleSnap() {
    set((s) => ({ snapEnabled: !s.snapEnabled }));
  },
  togglePenMode() {
    set((s) => ({ penMode: !s.penMode }));
  },

  // ---- serialization ----
  toJSON() {
    const { doc } = get();
    return {
      format: "circuitful-workspace",
      version: 1,
      savedAt: new Date().toISOString(),
      objects: doc.objects,
      nodes: doc.nodes,
      wires: doc.wires,
      customColors: doc.customColors,
    };
  },
  loadFromJSON(data) {
    set({
      doc: {
        objects: data.objects || [],
        nodes: data.nodes || [],
        wires: data.wires || [],
        customColors: data.customColors || [],
      },
      past: [],
      future: [],
      selection: { type: null, ids: [] },
      dirty: false,
    });
  },
  markSaved() {
    set({ dirty: false });
  },
}));
