const DB_NAME = "circuitful-modern";
const DB_VERSION = 1;

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("customParts")) {
        db.createObjectStore("customParts", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("workspaces")) {
        db.createObjectStore("workspaces", { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx(storeName, mode) {
  const db = await openDb();
  return db.transaction(storeName, mode).objectStore(storeName);
}

function wrap(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGetAll(storeName) {
  const store = await tx(storeName, "readonly");
  return wrap(store.getAll());
}

export async function idbGet(storeName, id) {
  const store = await tx(storeName, "readonly");
  return wrap(store.get(id));
}

export async function idbPut(storeName, value) {
  const store = await tx(storeName, "readwrite");
  return wrap(store.put(value));
}

export async function idbDelete(storeName, id) {
  const store = await tx(storeName, "readwrite");
  return wrap(store.delete(id));
}
