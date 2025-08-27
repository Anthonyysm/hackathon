import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';

export const useLikes = (postId) => {
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [user, setUser] = useState(null);

  // Fetch user data and liked posts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user's liked posts
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const likedPostsData = userSnap.data().likedPosts || [];
            setLikedPosts(new Set(likedPostsData));
          }
        } catch (error) {
          console.error('Error fetching liked posts:', error);
        }
      } else {
        setUser(null);
        setLikedPosts(new Set());
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleLike = useCallback(async (postId) => {
    if (!user) return false;

    try {
      const isLiked = likedPosts.has(postId);
      const newLikedPosts = new Set(likedPosts);
      
      if (isLiked) {
        // Remove like
        newLikedPosts.delete(postId);
        setLikedPosts(newLikedPosts);
        
        // Update Firebase
        await updateDoc(doc(db, 'posts', postId), {
          likes: increment(-1)
        });

        // Remove from user's liked posts
        await updateDoc(doc(db, 'users', user.uid), {
          likedPosts: arrayRemove(postId)
        });
      } else {
        // Add like
        newLikedPosts.add(postId);
        setLikedPosts(newLikedPosts);
        
        // Update Firebase
        await updateDoc(doc(db, 'posts', postId), {
          likes: increment(1)
        });

        // Add to user's liked posts
        await updateDoc(doc(db, 'users', user.uid), {
          likedPosts: arrayUnion(postId)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  }, [user, likedPosts]);

  const isLiked = useCallback((postId) => {
    return likedPosts.has(postId);
  }, [likedPosts]);

  return {
    likedPosts,
    toggleLike,
    isLiked,
    user
  };
};
