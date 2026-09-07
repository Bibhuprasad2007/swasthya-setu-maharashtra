import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';

export interface UserNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  referenceId?: string;
  read: boolean;
  createdAt?: Timestamp | any;
}

export const notificationsService = {
  /**
   * Real-time listener for current user's notifications
   */
  subscribeUserNotifications(userId: string, callback: (notifications: UserNotification[]) => void) {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserNotification));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(list);
    });
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, {
      read: true
    });
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const docRef = doc(db, 'notifications', notificationId);
    await deleteDoc(docRef);
  }
};
