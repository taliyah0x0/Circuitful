import { useEffect, useState } from "react";

const cache = new Map();
const listeners = new Map();
const globalSubscribers = new Set();

function notifyGlobal() {
  globalSubscribers.forEach((fn) => fn());
}

function load(src) {
  if (cache.has(src)) return;
  const img = new Image();
  img.onload = () => {
    cache.set(src, { width: img.naturalWidth, height: img.naturalHeight });
    (listeners.get(src) || []).forEach((fn) => fn());
    listeners.delete(src);
    notifyGlobal();
  };
  img.src = src;
}

export function getCachedSize(src) {
  return cache.get(src) || null;
}

export function useImageSize(src) {
  const [size, setSize] = useState(() => cache.get(src) || null);

  useEffect(() => {
    if (!src) return;
    const cached = cache.get(src);
    if (cached) {
      setSize(cached);
      return;
    }
    const onLoaded = () => setSize(cache.get(src));
    if (!listeners.has(src)) listeners.set(src, []);
    listeners.get(src).push(onLoaded);
    load(src);
  }, [src]);

  return size;
}

// Forces a re-render whenever any tracked image finishes loading — used by
// components (e.g. the wire layer) that need synchronous access to several
// images' sizes without calling a hook per-image in a loop.
export function useImageCacheVersion() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    globalSubscribers.add(fn);
    return () => globalSubscribers.delete(fn);
  }, []);
}

export function preloadImage(src) {
  load(src);
}
