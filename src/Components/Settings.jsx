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
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    username: '',
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

  // Mock user data
  const mockUserData = {
    username: 'joao.silva',
    displayName: 'João Silva',
    bio: 'Psicólogo clínico especializado em terapia cognitivo-comportamental.',
    location: 'São Paulo, SP',
    website: 'https://joaosilva.psi.br',
    language: 'pt-BR',
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    groupNotifications: true,
    sessionReminders: true,
    moodReminders: true,
    weeklyReports: false,
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowFriendRequests: true,
    showOnlineStatus: true,
    dataSharing: false
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUserData(mockUserData);
        
        setProfileSettings({
          username: mockUserData.username || '',
          displayName: mockUserData.displayName || '',
          bio: mockUserData.bio || '',
          location: mockUserData.location || '',
          website: mockUserData.website || '',
          language: mockUserData.language || 'pt-BR'
        });

        setNotificationSettings({
          emailNotifications: mockUserData.emailNotifications !== undefined ? mockUserData.emailNotifications : true,
          pushNotifications: mockUserData.pushNotifications !== undefined ? mockUserData.pushNotifications : true,
          messageNotifications: mockUserData.messageNotifications !== undefined ? mockUserData.messageNotifications : true,
          groupNotifications: mockUserData.groupNotifications !== undefined ? mockUserData.groupNotifications : true,
          sessionReminders: mockUserData.sessionReminders !== undefined ? mockUserData.sessionReminders : true,
          moodReminders: mockUserData.moodReminders !== undefined ? mockUserData.moodReminders : true,
          weeklyReports: mockUserData.weeklyReports || false
        });

        setPrivacySettings({
          profileVisibility: mockUserData.profileVisibility || 'public',
          showEmail: mockUserData.showEmail || false,
          showPhone: mockUserData.showPhone || false,
          allowMessages: mockUserData.allowMessages !== undefined ? mockUserData.allowMessages : true,
          allowFriendRequests: mockUserData.allowFriendRequests !== undefined ? mockUserData.allowFriendRequests : true,
          showOnlineStatus: mockUserData.showOnlineStatus !== undefined ? mockUserData.showOnlineStatus : true,
          dataSharing: mockUserData.dataSharing || false
        });
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

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Configurações de perfil salvas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
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

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Configurações de notificação salvas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
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

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Configurações de privacidade salvas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleAppearanceSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Configurações de aparência salvas com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
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
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-white/70">Carregando configurações...</span>
        </div>
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
            <h3 className="text-xl font-semibold text-white mb-6">Configurações do Perfil</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Username da Plataforma
                </label>
                                 <input
                   type="text"
                   value={profileSettings.username}
                   onChange={(e) => handleInputChange('profile', 'username', e.target.value.toLowerCase())}
                   placeholder="Digite seu username"
                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                 />
                <p className="text-white/50 text-xs mt-1">Este será seu identificador único na plataforma</p>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={profileSettings.displayName}
                  onChange={(e) => handleInputChange('profile', 'displayName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Biografia
                </label>
                <textarea
                  value={profileSettings.bio}
                  onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={profileSettings.location}
                    onChange={(e) => handleInputChange('profile', 'location', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileSettings.website}
                    onChange={(e) => handleInputChange('profile', 'website', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Idioma
                </label>
                <select
                  value={profileSettings.language}
                  onChange={(e) => handleInputChange('profile', 'language', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Perfil</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeSection === 'notifications' && (
          <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6">Configurações de Notificação</h3>
            
            <div className="space-y-6">
              {[
                { key: 'emailNotifications', label: 'Notificações por Email', description: 'Receber notificações importantes por email' },
                { key: 'pushNotifications', label: 'Notificações Push', description: 'Receber notificações no dispositivo' },
                { key: 'messageNotifications', label: 'Mensagens', description: 'Notificar sobre novas mensagens' },
                { key: 'groupNotifications', label: 'Atividade em Grupos', description: 'Notificar sobre atividades nos grupos' },
                { key: 'sessionReminders', label: 'Lembretes de Sessão', description: 'Lembrar sobre sessões agendadas' },
                { key: 'moodReminders', label: 'Lembretes de Humor', description: 'Lembrar de registrar seu humor diário' },
                { key: 'weeklyReports', label: 'Relatórios Semanais', description: 'Receber resumo semanal de atividades' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{setting.label}</h4>
                    <p className="text-white/60 text-sm">{setting.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings[setting.key]}
                      onChange={(e) => handleInputChange('notifications', setting.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={handleNotificationSave}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Notificações</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeSection === 'privacy' && (
          <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6">Configurações de Privacidade</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Visibilidade do Perfil
                </label>
                <select
                  value={privacySettings.profileVisibility}
                  onChange={(e) => handleInputChange('privacy', 'profileVisibility', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="public">Público</option>
                  <option value="friends">Apenas Amigos</option>
                  <option value="private">Privado</option>
                </select>
              </div>

              {[
                { key: 'showEmail', label: 'Mostrar Email', description: 'Permitir que outros vejam seu email' },
                { key: 'showPhone', label: 'Mostrar Telefone', description: 'Permitir que outros vejam seu telefone' },
                { key: 'allowMessages', label: 'Permitir Mensagens', description: 'Permitir que outros te enviem mensagens' },
                { key: 'allowFriendRequests', label: 'Permitir Solicitações', description: 'Permitir solicitações de amizade' },
                { key: 'showOnlineStatus', label: 'Mostrar Status Online', description: 'Mostrar quando você está online' },
                { key: 'dataSharing', label: 'Compartilhar Dados', description: 'Permitir compartilhamento de dados para pesquisas' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{setting.label}</h4>
                    <p className="text-white/60 text-sm">{setting.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings[setting.key]}
                      onChange={(e) => handleInputChange('privacy', setting.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={handlePrivacySave}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Privacidade</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        {activeSection === 'appearance' && (
          <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6">Configurações de Aparência</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'dark', label: 'Escuro', description: 'Tema padrão escuro' },
                    { value: 'light', label: 'Claro', description: 'Tema claro (em breve)' },
                    { value: 'auto', label: 'Automático', description: 'Seguir sistema' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleInputChange('appearance', 'theme', theme.value)}
                      className={`p-4 rounded-lg border transition-all ${
                        appearanceSettings.theme === theme.value
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-white font-medium">{theme.label}</div>
                      <div className="text-white/60 text-xs">{theme.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Tamanho da Fonte
                </label>
                <select
                  value={appearanceSettings.fontSize}
                  onChange={(e) => handleInputChange('appearance', 'fontSize', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="small">Pequeno</option>
                  <option value="medium">Médio</option>
                  <option value="large">Grande</option>
                </select>
              </div>

              {[
                { key: 'compactMode', label: 'Modo Compacto', description: 'Interface mais densa com menos espaçamento' },
                { key: 'animations', label: 'Animações', description: 'Habilitar animações da interface' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{setting.label}</h4>
                    <p className="text-white/60 text-sm">{setting.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appearanceSettings[setting.key]}
                      onChange={(e) => handleInputChange('appearance', setting.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={handleAppearanceSave}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Aparência</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default Settings;