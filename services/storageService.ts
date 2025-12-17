import { StoredTemplate, FieldMapping } from "../types";

const DB_NAME = "TradeFlowDB";
const STORE_NAME = "templates";
const DB_VERSION = 1;

interface TemplateRecord extends StoredTemplate {
  data: ArrayBuffer;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

export const saveTemplate = async (name: string, data: Uint8Array): Promise<StoredTemplate> => {
  const db = await openDB();
  const id = crypto.randomUUID();
  const record: TemplateRecord = {
    id,
    name,
    createdAt: Date.now(),
    data: data.buffer // Store as ArrayBuffer
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(record);

    request.onsuccess = () => resolve({ id, name, createdAt: record.createdAt });
    request.onerror = () => reject(request.error);
  });
};

// Updated to save both mappings and pattern
export const saveTemplateSettings = async (id: string, mappings: FieldMapping[], filenamePattern?: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const record = getRequest.result as TemplateRecord;
      if (record) {
        record.savedMappings = mappings;
        if (filenamePattern) {
            record.filenamePattern = filenamePattern;
        }
        const putRequest = store.put(record);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject(new Error("Template not found"));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

export const getTemplates = async (): Promise<StoredTemplate[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    // We only need metadata, but getAll fetches everything. 
    // For a small app, this is fine. For larger, we'd use a cursor to strip 'data'.
    const request = store.getAll();

    request.onsuccess = () => {
      const records = request.result as TemplateRecord[];
      // Return without the heavy data payload
      const templates = records.map(({ id, name, createdAt, savedMappings, filenamePattern }) => ({ 
        id, 
        name, 
        createdAt,
        savedMappings,
        filenamePattern
      }));
      // Sort by newest first
      resolve(templates.sort((a, b) => b.createdAt - a.createdAt));
    };
    request.onerror = () => reject(request.error);
  });
};

export const getTemplateData = async (id: string): Promise<Uint8Array> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const record = request.result as TemplateRecord;
      if (record) {
        resolve(new Uint8Array(record.data));
      } else {
        reject(new Error("Template not found"));
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};