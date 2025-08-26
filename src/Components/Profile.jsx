import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowLeft
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

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
  
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        setUser(currentUser);
        
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          
          setFormData({
            displayName: data.displayName || currentUser.displayName || '',
            email: currentUser.email || '',
            phone: data.phone || '',
            birthDate: data.birthDate || '',
            bio: data.bio || '',
            location: data.location || '',
            crp: data.crp || '',
            specialty: data.specialty || '',
            yearsExperience: data.yearsExperience || '',
            acceptsOnline: data.acceptsOnline || false,
            profileVisibility: data.profileVisibility || 'public',
            showEmail: data.showEmail !== undefined ? data.showEmail : true,
            showPhone: data.showPhone || false,
            allowMessages: data.allowMessages !== undefined ? data.allowMessages : true
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setError('Erro ao carregar dados do perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setError('');
      setSuccess('');
      
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        phone: formData.phone,
        birthDate: formData.birthDate,
        bio: formData.bio,
        location: formData.location,
        crp: formData.crp,
        specialty: formData.specialty,
        yearsExperience: formData.yearsExperience,
        acceptsOnline: formData.acceptsOnline,
        profileVisibility: formData.profileVisibility,
        showEmail: formData.showEmail,
        showPhone: formData.showPhone,
        allowMessages: formData.allowMessages,
        updatedAt: new Date()
      });

      setSuccess('Perfil atualizado com sucesso!');
      setEditing(false);
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        ...formData
      }));
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setError('');
      setSuccess('');

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('A nova senha deve ter pelo menos 6 caracteres');
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordData.newPassword);

      setSuccess('Senha atualizada com sucesso!');
      setPasswordEditing(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      if (error.code === 'auth/wrong-password') {
        setError('Senha atual incorreta');
      } else {
        setError('Erro ao atualizar senha. Tente novamente.');
      }
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // TODO: Implement photo upload to Firebase Storage
    setUploadingPhoto(true);
    
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      setError('Erro ao fazer upload da foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <h1 className="text-xl font-light">Meu Perfil</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300">
            {success}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white/50" />
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 bg-white/20 hover:bg-white/30 p-2 rounded-full cursor-pointer transition-all duration-300 backdrop-blur-md">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-light mb-2">
                {editing ? (
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                    placeholder="Seu nome"
                  />
                ) : (
                  formData.displayName || 'Usuário'
                )}
              </h2>
              
              <p className="text-white/70 mb-4">
                {userData?.role === 'psicologo' ? 'Psicólogo' : 'Cliente'}
              </p>

              {userData?.role === 'psicologo' && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {formData.crp && (
                    <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-white/80">
                      CRP: {formData.crp}
                    </span>
                  )}
                  {formData.specialty && (
                    <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-white/80">
                      {formData.specialty}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4">
                {editing ? (
                  <button
                    onClick={handleSaveProfile}
                    className="bg-white text-black px-6 py-2 rounded-xl font-light hover:bg-white/90 transition-all duration-300 mr-3"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Salvar
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-white/10 border border-white/30 text-white px-6 py-2 rounded-xl font-light hover:bg-white/20 transition-all duration-300"
                  >
                    <Edit3 className="w-4 h-4 inline mr-2" />
                    Editar Perfil
                  </button>
                )}
                
                {editing && (
                  <button
                    onClick={() => {
                      setEditing(false);
                      // Reset form data
                      setFormData({
                        displayName: userData?.displayName || user?.displayName || '',
                        email: user?.email || '',
                        phone: userData?.phone || '',
                        birthDate: userData?.birthDate || '',
                        bio: userData?.bio || '',
                        location: userData?.location || '',
                        crp: userData?.crp || '',
                        specialty: userData?.specialty || '',
                        yearsExperience: userData?.yearsExperience || '',
                        acceptsOnline: userData?.acceptsOnline || false,
                        profileVisibility: userData?.profileVisibility || 'public',
                        showEmail: userData?.showEmail !== undefined ? userData.showEmail : true,
                        showPhone: userData?.showPhone || false,
                        allowMessages: userData?.allowMessages !== undefined ? userData.allowMessages : true
                      });
                    }}
                    className="bg-transparent border border-white/30 text-white px-6 py-2 rounded-xl font-light hover:bg-white/10 transition-all duration-300 ml-3"
                  >
                    <X className="w-4 h-4 inline mr-2" />
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-xl font-light mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informações Pessoais
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">E-mail</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-white/50" />
                  <span className="text-white">{formData.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Telefone</label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                    placeholder="Seu telefone"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-white/50" />
                    <span className="text-white">{formData.phone || 'Não informado'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Data de Nascimento</label>
                {editing ? (
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-white/50" />
                    <span className="text-white">{formData.birthDate || 'Não informado'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Localização</label>
                {editing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                    placeholder="Sua localização"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-white/50" />
                    <span className="text-white">{formData.location || 'Não informado'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Biografia</label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-full resize-none"
                    placeholder="Conte um pouco sobre você..."
                  />
                ) : (
                  <p className="text-white">{formData.bio || 'Nenhuma biografia adicionada'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information (for psychologists) */}
          {userData?.role === 'psicologo' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-xl font-light mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Informações Profissionais
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">CRP</label>
                  {editing ? (
                    <input
                      type="text"
                      name="crp"
                      value={formData.crp}
                      onChange={handleInputChange}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                      placeholder="Seu CRP"
                    />
                  ) : (
                    <span className="text-white">{formData.crp || 'Não informado'}</span>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Especialidade</label>
                  {editing ? (
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                      placeholder="Sua especialidade"
                    />
                  ) : (
                    <span className="text-white">{formData.specialty || 'Não informado'}</span>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Anos de Experiência</label>
                  {editing ? (
                    <input
                      type="number"
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      min="0"
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                      placeholder="Anos de experiência"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-white/50" />
                      <span className="text-white">{formData.yearsExperience || '0'} anos</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="acceptsOnline"
                    checked={formData.acceptsOnline}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                  />
                  <label className="text-white/70 text-sm">Aceita atendimento online</label>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-xl font-light mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Configurações de Privacidade
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Visibilidade do Perfil</label>
                {editing ? (
                  <select
                    name="profileVisibility"
                    value={formData.profileVisibility}
                    onChange={handleInputChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                  >
                    <option value="public">Público</option>
                    <option value="friends">Apenas amigos</option>
                    <option value="private">Privado</option>
                  </select>
                ) : (
                  <span className="text-white capitalize">{formData.profileVisibility}</span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="showEmail"
                  checked={formData.showEmail}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                />
                <label className="text-white/70 text-sm">Mostrar e-mail no perfil</label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="showPhone"
                  checked={formData.showPhone}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                />
                <label className="text-white/70 text-sm">Mostrar telefone no perfil</label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="allowMessages"
                  checked={formData.allowMessages}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                />
                <label className="text-white/70 text-sm">Permitir mensagens de outros usuários</label>
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-xl font-light mb-6 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Alterar Senha
            </h3>
            
            {passwordEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 pr-10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 pr-10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                      placeholder="Digite a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                    placeholder="Confirme a nova senha"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handlePasswordUpdate}
                    className="bg-white text-black px-4 py-2 rounded-xl font-light hover:bg-white/90 transition-all duration-300 flex-1"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Atualizar Senha
                  </button>
                  <button
                    onClick={() => {
                      setPasswordEditing(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="bg-transparent border border-white/30 text-white px-4 py-2 rounded-xl font-light hover:bg-white/10 transition-all duration-300"
                  >
                    <X className="w-4 h-4 inline mr-2" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-white/70 text-sm mb-4">
                  Mantenha sua senha segura e atualizada regularmente.
                </p>
                <button
                  onClick={() => setPasswordEditing(true)}
                  className="bg-white/10 border border-white/30 text-white px-4 py-2 rounded-xl font-light hover:bg-white/20 transition-all duration-300"
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  Alterar Senha
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Activity Section */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-xl font-light mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Atividades Recentes
          </h3>
          
          <div className="text-center py-8">
            <p className="text-white/50">Nenhuma atividade recente para exibir</p>
            <p className="text-white/30 text-sm mt-2">Suas postagens e interações aparecerão aqui</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
