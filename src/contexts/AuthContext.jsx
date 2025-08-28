import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setLoading(true);
      setError(null);
      
      try {
        if (currentUser) {
          // Obter token Firebase
          const idToken = await currentUser.getIdToken();

          // Carregar dados do Firestore (mantemos como perfil complementar do app)
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          const userData = userSnap.exists() ? userSnap.data() : {};

          const hasCompleteProfile = userData.username && userData.phone && userData.birthDate;
          if (!hasCompleteProfile) {
            setNeedsProfileCompletion(true);
          }

          setUser({
            ...currentUser,
            role: userData.role || 'cliente',
            displayName: userData.displayName || currentUser.displayName,
            photoURL: userData.photoURL || currentUser.photoURL, // Adiciona photoURL
            profileData: userData,
            idToken
          });

          // Verificar se o usuário já viu o tour (verificar tanto localStorage quanto Firestore)
          const hasSeenTourLocal = localStorage.getItem(`tour-${currentUser.uid}`);
          const hasSeenTourFirestore = userData.hasSeenTour;
          
          // Só é primeira vez se não viu o tour em nenhum lugar
          if (!hasSeenTourLocal && !hasSeenTourFirestore) {
            setIsFirstTime(true);
          } else {
            setIsFirstTime(false);
            // Se viu no Firestore mas não no localStorage, sincronizar
            if (hasSeenTourFirestore && !hasSeenTourLocal) {
              localStorage.setItem(`tour-${currentUser.uid}`, 'true');
            }
          }
        } else {
          setUser(null);
          setIsFirstTime(false);
          setNeedsProfileCompletion(false);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setError('Erro ao carregar dados do usuário');
        setUser(currentUser); // Fallback para dados básicos
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const markTourAsSeen = async () => {
    if (user) {
      // Marcar no localStorage
      localStorage.setItem(`tour-${user.uid}`, 'true');
      
      // Atualizar estado local
      setIsFirstTime(false);
      
      // Salvar no Firestore também
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { 
          hasSeenTour: true,
          tourSeenAt: new Date().toISOString()
        }, { merge: true });
        
        console.log('Tour marcado como visto com sucesso');
      } catch (error) {
        console.error('Erro ao salvar status do tour:', error);
        // Mesmo com erro, manter o estado local atualizado
      }
    }
  };

  const markProfileAsComplete = async () => {
    if (user) {
      setNeedsProfileCompletion(false);
      
      // Atualizar o usuário local para refletir que o perfil está completo
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser(prev => ({
            ...prev,
            profileData: userData
          }));
        }
      } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error);
      }
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPsychologist: user?.role === 'psicologo',
    isClient: user?.role === 'cliente',
    isFirstTime,
    needsProfileCompletion,
    markTourAsSeen,
    markProfileAsComplete
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
