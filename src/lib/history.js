const MAX_HISTORY = 200;

export function createHistory() {
  return { past: [], future: [] };
}

export function pushSnapshot(history, snapshot) {
  history.past.push(snapshot);
  if (history.past.length > MAX_HISTORY) history.past.shift();
  history.future.length = 0;
}

export function undo(history, current) {
  if (history.past.length === 0) return current;
  const previous = history.past.pop();
  history.future.push(current);
  return previous;
}

export function redo(history, current) {
  if (history.future.length === 0) return current;
  const next = history.future.pop();
  history.past.push(current);
  return next;
}

export function canUndo(history) {
  return history.past.length > 0;
}

export function canRedo(history) {
  return history.future.length > 0;
}
