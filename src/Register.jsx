import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowLeft, Phone, Calendar } from 'lucide-react';
import LightRays from './Components/LightRays';

const Register = () => {
  const [role, setRole] = useState('cliente'); // 'cliente' | 'psicologo'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthDate: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Campos do psicólogo
    crp: '',
    specialty: '',
    yearsExperience: '',
    acceptsOnline: false,
    bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(cred.user, { displayName: formData.name });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: formData.name,
        birthDate: formData.birthDate || '',
        phone: formData.phone || '',
        role,
        crp: formData.crp || '',
        specialty: formData.specialty || '',
        yearsExperience: formData.yearsExperience || '',
        acceptsOnline: !!formData.acceptsOnline,
        bio: formData.bio || '',
        provider: 'password',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      navigate('/connected');
    } catch (error) {
      console.error('Erro ao registrar:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden text-white">
      <LightRays />

      <div className="relative w-full max-w-md z-10">
        <button
          type="button"
          onClick={() => { window.location.hash = '#/'; }}
          className="absolute -top-2 -left-2 p-2 text-white/80 hover:text-white transition-colors"
          aria-label="Voltar para início"
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
          <p className="text-white/60 text-sm">Crie sua conta e comece hoje</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="mb-4">
            <h2 className="text-xl font-light text-white mb-1">Criar Conta</h2>
            <p className="text-white/60 text-sm">Leva menos de 2 minutos</p>
          </div>

          {/* Seletor de Tipo */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('cliente')}
              className={`py-2 rounded-lg border transition-all duration-200 text-sm ${
                role === 'cliente'
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-white/80 border-white/20 hover:border-white/30 hover:text-white'
              }`}
            >
              Sou Cliente
            </button>
            <button
              type="button"
              onClick={() => setRole('psicologo')}
              className={`py-2 rounded-lg border transition-all duration-200 text-sm ${
                role === 'psicologo'
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-white/80 border-white/20 hover:border-white/30 hover:text-white'
              }`}
            >
              Sou Psicólogo(a)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs font-light text-white/80">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-sm"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-light text-white/80">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-sm"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

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

            {/* Campos específicos para Psicólogo */}
            {role === 'psicologo' && (
              <>
                <div className="space-y-1">
                  <label htmlFor="crp" className="block text-xs font-light text-white/80">CRP</label>
                  <input
                    type="text"
                    id="crp"
                    name="crp"
                    value={formData.crp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-sm"
                    placeholder="CRP 00/00000"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="specialty" className="block text-xs font-light text-white/80">Especialidade</label>
                  <input
                    type="text"
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-sm"
                    placeholder="Ex.: TCC, Ansiedade, Depressão"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="yearsExperience" className="block text-xs font-light text-white/80">Anos de experiência</label>
                    <input
                      type="number"
                      id="yearsExperience"
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-sm"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <label className="flex items-center justify-start gap-2 mt-5">
                    <input
                      type="checkbox"
                      name="acceptsOnline"
                      checked={formData.acceptsOnline}
                      onChange={handleInputChange}
                      className="w-3 h-3 rounded border-white/30 bg-black/40 text-white focus:ring-white/30 focus:ring-2"
                    />
                    <span className="text-xs text-white/80">Atende online</span>
                  </label>
                </div>
                <div className="space-y-1">
                  <label htmlFor="bio" className="block text-xs font-light text-white/80">Bio (opcional)</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="2"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-sm"
                    placeholder="Fale brevemente sobre sua abordagem."
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-light text-white/80">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-10 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-sm"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-xs font-light text-white/80">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-10 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200 text-sm"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-2.5 px-4 bg-white text-black hover:bg-white/90 disabled:bg-white/60 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg text-sm">
              {isLoading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-white/70 text-sm">
              Já tem uma conta?{' '}
              <button onClick={() => { window.location.hash = '#/login'; }} className="text-white hover:text-white/80 font-medium transition-colors">
                Fazer login
              </button>
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

export default Register;
