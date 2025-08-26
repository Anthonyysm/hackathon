import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone,
  Eye,
  EyeOff,
  Save,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    language: 'pt-BR'
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    groupNotifications: true,
    sessionReminders: true,
    moodReminders: true,
    weeklyReports: false
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowFriendRequests: true,
    showOnlineStatus: true,
    dataSharing: false
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    fontSize: 'medium',
    compactMode: false,
    animations: true
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          
          setProfileSettings({
            displayName: data.displayName || currentUser.displayName || '',
            bio: data.bio || '',
            location: data.location || '',
            website: data.website || '',
            language: data.language || 'pt-BR'
          });

          setNotificationSettings({
            emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : true,
            pushNotifications: data.pushNotifications !== undefined ? data.pushNotifications : true,
            messageNotifications: data.messageNotifications !== undefined ? data.messageNotifications : true,
            groupNotifications: data.groupNotifications !== undefined ? data.groupNotifications : true,
            sessionReminders: data.sessionReminders !== undefined ? data.sessionReminders : true,
            moodReminders: data.moodReminders !== undefined ? data.moodReminders : true,
            weeklyReports: data.weeklyReports || false
          });

          setPrivacySettings({
            profileVisibility: data.profileVisibility || 'public',
            showEmail: data.showEmail || false,
            showPhone: data.showPhone || false,
            allowMessages: data.allowMessages !== undefined ? data.allowMessages : true,
            allowFriendRequests: data.allowFriendRequests !== undefined ? data.allowFriendRequests : true,
            showOnlineStatus: data.showOnlineStatus !== undefined ? data.showOnlineStatus : true,
            dataSharing: data.dataSharing || false
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setError('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...profileSettings,
        updatedAt: new Date()
      });

      setSuccess('Configurações de perfil salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...notificationSettings,
        updatedAt: new Date()
      });

      setSuccess('Configurações de notificação salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacySave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...privacySettings,
        updatedAt: new Date()
      });

      setSuccess('Configurações de privacidade salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    switch (section) {
      case 'profile':
        setProfileSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'notifications':
        setNotificationSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'privacy':
        setPrivacySettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'appearance':
        setAppearanceSettings(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-6">
          <SettingsIcon className="w-6 h-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-white">Configurações</h2>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          {[
            { id: 'profile', name: 'Perfil', icon: User },
            { id: 'notifications', name: 'Notificações', icon: Bell },
            { id: 'privacy', name: 'Privacidade', icon: Shield },
            { id: 'appearance', name: 'Aparência', icon: Palette }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeSection === tab.id
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-green-300">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Profile Settings */}
      {activeSection === 'profile' && (
        <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Configurações de Perfil</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">Nome de Exibição</label>
              <input
                type="text"
                value={profileSettings.displayName}
                onChange={(e) => handleInputChange('profile', 'displayName', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Idioma</label>
              <select
                value={profileSettings.language}
                onChange={(e) => handleInputChange('profile', 'language', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/70 text-sm mb-2">Biografia</label>
              <textarea
                value={profileSettings.bio}
                onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Localização</label>
              <input
                type="text"
                value={profileSettings.location}
                onChange={(e) => handleInputChange('profile', 'location', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Sua localização"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Website</label>
              <input
                type="url"
                value={profileSettings.website}
                onChange={(e) => handleInputChange('profile', 'website', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="https://seu-site.com"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleProfileSave}
              disabled={saving}
              className="bg-white text-black px-6 py-2 rounded-xl font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeSection === 'notifications' && (
        <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Configurações de Notificação</h3>
          
          <div className="space-y-4">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <span className="text-white font-medium">
                    {key === 'emailNotifications' && 'Notificações por E-mail'}
                    {key === 'pushNotifications' && 'Notificações Push'}
                    {key === 'messageNotifications' && 'Notificações de Mensagens'}
                    {key === 'groupNotifications' && 'Atividade de Grupos'}
                    {key === 'sessionReminders' && 'Lembretes de Sessões'}
                    {key === 'moodReminders' && 'Lembretes do Humor Tracker'}
                    {key === 'weeklyReports' && 'Relatórios Semanais'}
                  </span>
                  <p className="text-sm text-white/60">
                    {key === 'emailNotifications' && 'Receba notificações importantes por e-mail'}
                    {key === 'pushNotifications' && 'Receba notificações no seu dispositivo'}
                    {key === 'messageNotifications' && 'Seja notificado sobre novas mensagens'}
                    {key === 'groupNotifications' && 'Receba atualizações dos seus grupos'}
                    {key === 'sessionReminders' && 'Lembretes para suas sessões de terapia'}
                    {key === 'moodReminders' && 'Lembretes para registrar seu humor'}
                    {key === 'weeklyReports' && 'Relatórios semanais do seu progresso'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                  className="w-5 h-5 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNotificationSave}
              disabled={saving}
              className="bg-white text-black px-6 py-2 rounded-xl font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Privacy Settings */}
      {activeSection === 'privacy' && (
        <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Configurações de Privacidade</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">Visibilidade do Perfil</label>
              <select
                value={privacySettings.profileVisibility}
                onChange={(e) => handleInputChange('privacy', 'profileVisibility', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="public">Público</option>
                <option value="friends">Apenas amigos</option>
                <option value="private">Privado</option>
              </select>
            </div>

            <div className="space-y-4">
              {Object.entries(privacySettings).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-medium">
                      {key === 'showEmail' && 'Mostrar E-mail'}
                      {key === 'showPhone' && 'Mostrar Telefone'}
                      {key === 'allowMessages' && 'Permitir Mensagens'}
                      {key === 'allowFriendRequests' && 'Permitir Solicitações de Amizade'}
                      {key === 'showOnlineStatus' && 'Mostrar Status Online'}
                      {key === 'dataSharing' && 'Compartilhamento de Dados'}
                    </span>
                    <p className="text-sm text-white/60">
                      {key === 'showEmail' && 'Tornar seu e-mail visível para outros usuários'}
                      {key === 'showPhone' && 'Tornar seu telefone visível para outros usuários'}
                      {key === 'allowMessages' && 'Permitir que outros usuários te enviem mensagens'}
                      {key === 'allowFriendRequests' && 'Permitir solicitações de amizade de outros usuários'}
                      {key === 'showOnlineStatus' && 'Mostrar quando você está online'}
                      {key === 'dataSharing' && 'Compartilhar dados anônimos para melhorar o serviço'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleInputChange('privacy', key, e.target.checked)}
                    className="w-5 h-5 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handlePrivacySave}
              disabled={saving}
              className="bg-white text-black px-6 py-2 rounded-xl font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      {activeSection === 'appearance' && (
        <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-6">Configurações de Aparência</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">Tema</label>
              <select
                value={appearanceSettings.theme}
                onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Tamanho da Fonte</label>
              <select
                value={appearanceSettings.fontSize}
                onChange={(e) => handleInputChange('appearance', 'fontSize', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="small">Pequeno</option>
                <option value="medium">Médio</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div className="space-y-4">
              {Object.entries(appearanceSettings).filter(([key]) => !['theme', 'fontSize'].includes(key)).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-medium">
                      {key === 'compactMode' && 'Modo Compacto'}
                      {key === 'animations' && 'Animações'}
                    </span>
                    <p className="text-sm text-white/60">
                      {key === 'compactMode' && 'Interface mais compacta para economizar espaço'}
                      {key === 'animations' && 'Habilitar animações e transições'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleInputChange('appearance', key, e.target.checked)}
                    className="w-5 h-5 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setSuccess('Configurações de aparência salvas!')}
              className="bg-white text-black px-6 py-2 rounded-xl font-medium hover:bg-white/90 transition-all duration-300 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
