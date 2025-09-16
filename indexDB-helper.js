
// indexedDB-helper.js
const DB_NAME = "EduKidsDB";
const DB_VERSION = 1;
let db;

/**
 * Open or create the IndexedDB database
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      db = e.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains("students")) {
        db.createObjectStore("students", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("progress")) {
        const store = db.createObjectStore("progress", { keyPath: "id", autoIncrement: true });
        store.createIndex("studentId", "studentId", { unique: false });
        store.createIndex("lessonId", "lessonId", { unique: false });
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    request.onerror = (e) => {
      reject("DB error: " + e.target.errorCode);
    };
  });
}

/**
 * Add a student
 */
export async function addStudent(student) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("students", "readwrite");
    tx.objectStore("students").add(student);

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e);
  });
}

/**
 * Save lesson/game progress
 */
export async function saveProgress(progress) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("progress", "readwrite");
    tx.objectStore("progress").add(progress);

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e);
  });
}

/**
 * Get all students
 */
export async function getStudents() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("students", "readonly");
    const request = tx.objectStore("students").getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
}

/**
 * Get progress by studentId
 */
export async function getProgressByStudent(studentId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("progress", "readonly");
    const index = tx.objectStore("progress").index("studentId");
    const request = index.getAll(studentId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
}
