import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Shield, 
  Eye, 
  EyeOff,
  Lock,
  MapPin,
  Award,
  Clock,
  Globe,
  FileText,
  Plus
} from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [passwordEditing, setPasswordEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    birthDate: '',
    bio: '',
    location: '',
    // Psicólogo specific fields
    crp: '',
    specialty: '',
    yearsExperience: '',
    acceptsOnline: false,
    // Privacy settings
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    allowMessages: true
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mock user data
  const mockUserData = {
    uid: 'current-user',
    displayName: 'Dr. Alberto Mendes',
    username: 'dr.-alberto-mendes',
    email: 'alberto.mendes@email.com',
    phone: '+55 11 99999-9999',
    birthDate: '1985-03-20',
    bio: 'Nenhuma biografia adicionada',
    location: 'São Paulo, SP',
    crp: '06/123456',
    specialty: 'Psicologia Clínica',
    yearsExperience: '12',
    acceptsOnline: true,
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    allowMessages: true,
    avatar: null,
    role: 'psychologist',
    joinedAt: new Date('2018-06-15'),
    totalSessions: 450,
    rating: 4.9,
    verified: true
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setUser(mockUserData);
        setUserData(mockUserData);
        
        setFormData({
          displayName: mockUserData.displayName || '',
          email: mockUserData.email || '',
          phone: mockUserData.phone || '',
          birthDate: mockUserData.birthDate || '',
          bio: mockUserData.bio || '',
          location: mockUserData.location || '',
          crp: mockUserData.crp || '',
          specialty: mockUserData.specialty || '',
          yearsExperience: mockUserData.yearsExperience || '',
          acceptsOnline: mockUserData.acceptsOnline || false,
          profileVisibility: mockUserData.profileVisibility || 'public',
          showEmail: mockUserData.showEmail || true,
          showPhone: mockUserData.showPhone || false,
          allowMessages: mockUserData.allowMessages || true
        });
        
        setLoading(false);
      } catch (error) {
        setError('Erro ao carregar dados do usuário');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-white/70">Carregando perfil...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Banner Gradiente */}
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
        {/* Foto de Perfil Sobreposta */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-black flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            {/* Botão de editar foto */}
            <button className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 rounded-full border-2 border-black transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Informações do Usuário */}
      <div className="pt-20 px-8 pb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Nome */}
            <h1 className="text-3xl font-bold text-white mb-2">
              {user?.displayName || 'Usuário'}
            </h1>
            
            {/* Username */}
            <p className="text-white/80 text-lg mb-3">
              @{user?.username || 'usuario'}
            </p>
            
            {/* Biografia */}
            <p className="text-white/70 mb-3">
              {user?.bio || 'Nenhuma biografia adicionada'}
            </p>
            
            {/* Data de entrada */}
            <p className="text-white/60 text-sm">
              Entrou em {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('pt-BR', { 
                year: 'numeric', 
                month: 'long' 
              }) : 'data não disponível'}
            </p>
          </div>

          {/* Botão de editar perfil */}
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Perfil</span>
          </button>
        </div>
      </div>

      {/* Seção de Posts */}
      <div className="px-8 pb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Posts</h2>
        
        {/* Estado vazio */}
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-white/30" />
          </div>
          <h3 className="text-xl text-white/60 mb-2">Nenhum post ainda</h3>
          <p className="text-white/40">
            Quando você postar algo, aparecerá aqui
          </p>
          <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto">
            <Plus className="w-4 h-4" />
            <span>Criar Primeiro Post</span>
          </button>
        </div>
      </div>

      {/* Modal de Edição (será implementado posteriormente) */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-white">Editar Perfil</h3>
              <button
                onClick={() => setEditing(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <p className="text-white/60 mb-6">
              Modal de edição será implementado aqui...
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;