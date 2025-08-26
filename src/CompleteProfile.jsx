import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Phone, Calendar, ArrowLeft, User } from 'lucide-react';
import LightRays from './Components/LightRays';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    birthDate: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Verificar se o usuário já tem dados completos
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          
                     // Se já tem telefone e data de nascimento, redirecionar
           if (data.phone && data.birthDate) {
             navigate('/connected');
             return;
           }
        }
      } else {
        // Se não há usuário logado, redirecionar para login
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.birthDate || !formData.phone) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      
      await setDoc(userRef, {
        birthDate: formData.birthDate,
        phone: formData.phone,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      navigate('/connected');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      alert('Erro ao salvar os dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden text-white">
      <LightRays />

      <div className="relative w-full max-w-md z-10">
        <button
          type="button"
          onClick={() => {
            auth.signOut();
            navigate('/login'); 
          }}
          className="absolute -top-2 -left-2 p-2 text-white/80 hover:text-white transition-colors"
          aria-label="Sair e voltar para login"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
              <img 
                src="/Logo-Sereno3.png" 
                alt="Sereno Logo" 
                className="w-full h-full object-contain p-1"
                loading="eager"
              />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-1">Sereno</h1>
          <p className="text-white/60 text-sm">Complete seu perfil</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-light text-white mb-2">Bem-vindo, {user.displayName || user.email}!</h2>
            <p className="text-white/60 text-sm">Para continuar, precisamos de algumas informações adicionais</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="birthDate" className="block text-xs font-light text-white/80">Data de Nascimento</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="phone" className="block text-xs font-light text-white/80">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-sm"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-2.5 px-4 bg-white text-black hover:bg-white/90 disabled:bg-white/60 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg text-sm"
            >
              {isLoading ? 'Salvando...' : 'Completar Perfil'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-white/70 text-xs">
              Estes dados são necessários para personalizar sua experiência
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-white/50 text-xs">
          <p>Conecte-se, Entenda-se, <span className="text-white">Evolua.</span></p>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
