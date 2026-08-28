import { create } from "zustand";
import { idbGetAll, idbPut, idbDelete } from "../lib/idb.js";
import { nanoid } from "nanoid";

export const usePartsLibrary = create((set, get) => ({
  builtin: [],
  builtinMeta: null,
  custom: [],
  loaded: false,

  async init() {
    if (get().loaded) return;
    const [catalogRes, custom] = await Promise.all([
      fetch("/data/catalog.json").then((r) => (r.ok ? r.json() : { parts: [] })),
      idbGetAll("customParts"),
    ]);
    set({
      // "Single Point" (builtin-10) was an internal helper in the original
      // app for pen-mode free wire points, never a real placeable part —
      // this rewrite creates free wire nodes directly instead, so it's dead
      // weight in the palette.
      builtin: (catalogRes.parts || []).filter((p) => p.builtinId !== 10),
      builtinMeta: catalogRes,
      custom: custom || [],
      loaded: true,
    });
  },

  allParts() {
    return [...get().builtin, ...get().custom];
  },

  categories() {
    const set = new Set(get().allParts().map((p) => p.category || "Other"));
    return Array.from(set);
  },

  async saveCustomPart(part) {
    const id = part.id || `custom-${nanoid(10)}`;
    const record = { ...part, id, isCustom: true, updatedAt: Date.now() };
    await idbPut("customParts", record);
    set((state) => ({
      custom: [...state.custom.filter((p) => p.id !== id), record],
    }));
    return record;
  },

  async deleteCustomPart(id) {
    await idbDelete("customParts", id);
    set((state) => ({ custom: state.custom.filter((p) => p.id !== id) }));
  },

  findPart(id) {
    return get().allParts().find((p) => p.id === id);
  },
}));
