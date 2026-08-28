export function screenToWorld(viewport, containerRect, clientX, clientY) {
  const sx = clientX - containerRect.left;
  const sy = clientY - containerRect.top;
  return {
    x: (sx - viewport.x) / viewport.zoom,
    y: (sy - viewport.y) / viewport.zoom,
  };
}

export function worldToScreen(viewport, x, y) {
  return {
    x: x * viewport.zoom + viewport.x,
    y: y * viewport.zoom + viewport.y,
  };
}
