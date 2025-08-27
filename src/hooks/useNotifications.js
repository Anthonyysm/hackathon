import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date()
      }));
      setNotifications(loaded);
      setUnreadCount(loaded.filter(n => !n.read).length);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Create notification
  const createNotification = useCallback(async (notificationData) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        createdAt: serverTimestamp(),
        read: false
      });
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }, []);

  // Create like notification
  const createLikeNotification = useCallback(async (postId, postAuthorId, postContent) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid === postAuthorId) return false;

    return await createNotification({
      type: 'like_post',
      recipientId: postAuthorId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Usuário',
      postId: postId,
      postContent: postContent?.substring(0, 100)
    });
  }, [createNotification]);

  // Create comment notification
  const createCommentNotification = useCallback(async (postId, postAuthorId, postContent) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid === postAuthorId) return false;

    return await createNotification({
      type: 'comment',
      recipientId: postAuthorId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Usuário',
      postId: postId,
      postContent: postContent?.substring(0, 100)
    });
  }, [createNotification]);

  // Create follow notification
  const createFollowNotification = useCallback(async (followedUserId) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid === followedUserId) return false;

    return await createNotification({
      type: 'follow',
      recipientId: followedUserId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Usuário'
    });
  }, [createNotification]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const { updateDoc, doc, writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      const unreadNotifications = notifications.filter(n => !n.read);
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, { read: true });
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    createLikeNotification,
    createCommentNotification,
    createFollowNotification,
    markAsRead,
    markAllAsRead
  };
};
