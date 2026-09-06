import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  CollectionReference,
  Query,
  DocumentData,
  WithFieldValue,
  UpdateData
} from 'firebase/firestore';
import { db } from './firebase';

export const firebaseDataService = {
  /**
   * Generic method to subscribe to a collection
   */
  subscribeToCollection<T>(collectionName: string, callback: (data: T[]) => void, filterField?: string, filterValue?: unknown) {
    const colRef = collection(db, collectionName);
    let q: Query<DocumentData> | CollectionReference<DocumentData> = colRef;

    if (filterField && filterValue !== undefined) {
      q = query(colRef, where(filterField, '==', filterValue));
    }

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as T[];
      callback(data);
    });
  },

  /**
   * Generic method to add a document
   */
  async addDocument<T extends WithFieldValue<DocumentData> = WithFieldValue<DocumentData>>(collectionName: string, data: T): Promise<string> {
    const docRef = await addDoc(collection(db, collectionName), data as DocumentData);
    return docRef.id;
  },

  /**
   * Generic method to update a document
   */
  async updateDocument(collectionName: string, docId: string, updates: UpdateData<DocumentData> | Record<string, any>) {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, updates as UpdateData<DocumentData>);
  },

  /**
   * Generic method to set a document (create or overwrite)
   */
  async setDocument<T extends WithFieldValue<DocumentData> = WithFieldValue<DocumentData>>(collectionName: string, docId: string, data: T) {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
  },

  /**
   * Generic method to delete a document
   */
  async deleteDocument(collectionName: string, docId: string) {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  },

  /**
   * Get a single document
   */
  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }
};
