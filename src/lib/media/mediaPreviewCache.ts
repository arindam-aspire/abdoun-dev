const DB_NAME = "abdoun-media-preview";
const STORE_NAME = "previews";
const DB_VERSION = 1;

export type MediaPreviewCacheEntry = {
  /** Canonical storage URL from the API (`media_documents.*.url`). */
  url: string;
  fileName: string;
  contentType: string;
  blob: Blob;
  savedAt: number;
};

function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("indexedDB open failed"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "url" });
      }
    };
  });
}

/** Persist upload bytes so draft media previews survive a full page reload (same browser). */
export async function putMediaPreviewCache(
  url: string,
  file: File | Blob,
  fileName: string,
): Promise<void> {
  if (!isIndexedDbAvailable()) return;
  const key = url.trim();
  if (!key) return;

  const contentType =
    file instanceof File && file.type
      ? file.type
      : file.type || "application/octet-stream";

  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const entry: MediaPreviewCacheEntry = {
        url: key,
        fileName: fileName.trim() || "file",
        contentType,
        blob: file,
        savedAt: Date.now(),
      };
      const req = store.put(entry);
      req.onerror = () => reject(req.error ?? new Error("indexedDB put failed"));
      req.onsuccess = () => resolve();
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error ?? new Error("indexedDB transaction failed"));
    });
  } catch {
    // Quota / private mode — preview cache is best-effort only.
  }
}

export async function getMediaPreviewCache(url: string): Promise<MediaPreviewCacheEntry | null> {
  if (!isIndexedDbAvailable()) return null;
  const key = url.trim();
  if (!key) return null;

  try {
    const db = await openDb();
    return await new Promise<MediaPreviewCacheEntry | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onerror = () => reject(req.error ?? new Error("indexedDB get failed"));
      req.onsuccess = () => {
        const row = req.result as MediaPreviewCacheEntry | undefined;
        resolve(row?.blob ? row : null);
      };
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error ?? new Error("indexedDB transaction failed"));
    });
  } catch {
    return null;
  }
}

export async function deleteMediaPreviewCache(url: string): Promise<void> {
  if (!isIndexedDbAvailable()) return;
  const key = url.trim();
  if (!key) return;

  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onerror = () => reject(req.error ?? new Error("indexedDB delete failed"));
      req.onsuccess = () => resolve();
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error ?? new Error("indexedDB transaction failed"));
    });
  } catch {
    // ignore
  }
}
