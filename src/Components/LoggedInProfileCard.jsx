import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoggedInProfileCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-6 text-white">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'Usuário'} className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-white/60" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{user.displayName || 'Usuário'}</div>
          <div className="text-white/60 text-sm truncate">@{user.username || 'usuario'}</div>
        </div>
      </div>
      <button
        onClick={() => navigate('/profile')}
        className="mt-4 w-full bg-white text-black rounded-xl py-2 text-sm font-medium hover:bg-white/90 transition-colors"
      >
        Ver Perfil
      </button>
    </div>
  );
};

export default LoggedInProfileCard;
