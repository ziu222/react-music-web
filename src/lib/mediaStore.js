/* ── Browser media storage qua IndexedDB (frontend-only) ──────────
 * Lưu blob audio/artwork người dùng upload theo id — KHÔNG đưa blob
 * hay base64 lớn vào localStorage. Metadata (id, name, size) nhẹ thì
 * caller tự lưu cùng submission trong localStorage.
 */

const DB_NAME = "melodies_media";
const DB_VERSION = 1;
const STORE = "blobs";

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });
  return dbPromise;
}

function tx(db, mode) {
  return db.transaction(STORE, mode).objectStore(STORE);
}

let counter = 0;

/* Lưu File/Blob, trả về metadata nhẹ để caller giữ trong submission. */
export async function saveMediaBlob(file, kind = "media") {
  const db = await openDb();
  const id = `${kind}-${Date.now()}-${counter++}`;
  const record = {
    blob: file,
    name: file.name ?? "",
    type: file.type ?? "",
    size: file.size ?? 0,
    kind,
    createdAt: new Date().toISOString(),
  };
  await new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").put(record, id);
    req.onsuccess = resolve;
    req.onerror = () => reject(req.error);
  });
  return { id, name: record.name, type: record.type, size: record.size, createdAt: record.createdAt };
}

/* Trả về object URL dùng cho <audio src> / <img src>, hoặc null nếu
 * không tìm thấy. Caller chịu trách nhiệm revoke khi không dùng nữa. */
export async function getMediaBlobUrl(id) {
  if (!id) return null;
  try {
    const db = await openDb();
    const record = await new Promise((resolve, reject) => {
      const req = tx(db, "readonly").get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return record?.blob ? URL.createObjectURL(record.blob) : null;
  } catch {
    return null;
  }
}

export async function deleteMediaBlob(id) {
  if (!id) return;
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const req = tx(db, "readwrite").delete(id);
      req.onsuccess = resolve;
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    void err;
  }
}

export function revokeMediaBlobUrl(url) {
  if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
}

/* Đọc thời lượng (giây) từ file audio ngay trong browser. */
export function readAudioDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const cleanup = () => URL.revokeObjectURL(url);
    audio.onloadedmetadata = () => {
      cleanup();
      resolve(Number.isFinite(audio.duration) ? Math.round(audio.duration) : null);
    };
    audio.onerror = () => {
      cleanup();
      resolve(null);
    };
    audio.src = url;
  });
}
