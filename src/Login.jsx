import React, { useState } from 'react';
import { auth, googleProvider, db } from './firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowLeft, User, Brain } from 'lucide-react';
import LightRays from './Components/LightRays';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('user'); // 'user' or 'psychologist'

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sendToken = async (user) => {
    try {
      const token = await user.getIdToken();

      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid,
          displayName: user.displayName || '',
          userType: userType
        })
      });
      if (!response.ok) {
        throw new Error('Erro ao conectar com o servidor');
      }

      const data = await response.json();
      console.log('Backend response:', data);
      
      return data;
    } catch (error) {
      console.error('Erro ao comunicar com backend:', error);
      // Não impede o login, apenas loga o erro
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, formData.email, formData.password);

      await sendToken(cred.user);
      

      const userRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || '',
          provider: 'password',
          userType: userType,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(userRef, { 
          updatedAt: serverTimestamp(),
          userType: userType 
        }, { merge: true });
      }
      window.location.hash = '#/connected';
    } catch (error) {
      console.error('Erro ao entrar:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      let cred;
      try {
        cred = await signInWithPopup(auth, googleProvider);
        await sendToken(cred.user);
      } catch (popupError) {
        // Fallback para redirect em ambientes que bloqueiam popups
        await signInWithRedirect(auth, googleProvider);
        return; // fluxo continua no getRedirectResult
      }
      const userRef = doc(db, 'users', cred.user.uid);
      await setDoc(userRef, {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || '',
        photoURL: cred.user.photoURL || '',
        provider: 'google',
        userType: userType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      window.location.hash = '#/connected';
    } catch (error) {
      console.error('Erro ao entrar com Google:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    // Trata retorno do signInWithRedirect
    (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          await sendToken(result.user);
          const userRef = doc(db, 'users', result.user.uid);
          await setDoc(userRef, {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || '',
            photoURL: result.user.photoURL || '',
            provider: 'google',
            userType: userType,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
          window.location.hash = '#/connected';
        }
      } catch (e) {
        // ignora se não houver redirect result
      }
    })();
  }, [userType]);

  const handleReset = async () => {
    if (!formData.email) {
      alert('Digite seu e-mail para receber o link.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, formData.email);
      alert('Email de redefinição enviado. Verifique sua caixa de entrada.');
    } catch (error) {
      console.error('Erro ao enviar e-mail de redefinição:', error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden text-white">
      <LightRays />

      {/* Login Container */}
      <div className="relative w-full max-w-md z-10">
        <button
          type="button"
          onClick={() => { window.location.hash = '#/'; }}
          className="absolute -top-2 -left-2 p-2 text-white/80 hover:text-white transition-colors"
          aria-label="Voltar para início"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {/* Header */}
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
          <p className="text-white/60 text-sm">Sua Rede de Apoio em Saúde Mental</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="mb-4">
            <h2 className="text-xl font-light text-white mb-1">Bem-vindo de volta</h2>
            <p className="text-white/60 text-sm">Entre em sua conta para continuar</p>
          </div>

          {/* User Type Toggle */}
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-xs text-white/60">Tipo de usuário:</span>
            </div>
            <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
              <button
                type="button"
                onClick={() => setUserType('user')}
                className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-md transition-all duration-200 text-sm ${
                  userType === 'user' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <User className="w-3 h-3 mr-1.5" />
                Usuário
              </button>
              <button
                type="button"
                onClick={() => setUserType('psychologist')}
                className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-md transition-all duration-200 text-sm ${
                  userType === 'psychologist' 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Brain className="w-3 h-3 mr-1.5" />
                Profissional
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-light text-white/80">
                E-mail
              </label>
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

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-light text-white/80">
                Senha
              </label>
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-3 h-3 rounded border-white/30 bg-black/40 text-white focus:ring-white/30 focus:ring-2"
                />
                <span className="ml-2 text-xs text-white/70">Lembrar de mim</span>
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-white/80 hover:text-white transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white text-black hover:bg-white/90 disabled:bg-white/60 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg text-sm"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Social Login - Only show for regular users */}
          {userType === 'user' && (
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-black text-white/60">ou continue com</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2">
                <button onClick={handleGoogle} type="button" className="flex items-center justify-center py-1.5 px-4 border border-white/20 rounded-lg text-white/80 hover:text-white hover:border-white/30 transition-all duration-200 text-sm">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.37c-.23 1.22-.93 2.25-1.98 2.94v2.45h3.2c1.87-1.72 2.97-4.25 2.97-7.4z" fill="#4285F4"/>
                    <path d="M12 23c2.7 0 4.96-.9 6.62-2.45l-3.2-2.45c-.9.6-2.06.96-3.42.96-2.63 0-4.85-1.77-5.64-4.15H3.01v2.6C4.65 20.98 8.06 23 12 23z" fill="#34A853"/>
                    <path d="M6.36 14.91c-.2-.6-.32-1.24-.32-1.91s.12-1.31.32-1.91V8.49H3.01A11 11 0 0 0 2 12c0 1.76.42 3.41 1.01 4.91l3.35-2z" fill="#FBBC05"/>
                    <path d="M12 5.27c1.47 0 2.8.51 3.84 1.5l2.88-2.88C16.94 2.23 14.7 1.32 12 1.32 8.06 1.32 4.65 3.34 3.01 6.09l3.35 2.6C7.15 7.31 9.37 5.27 12 5.27z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
              </div>
            </div>
          )}

          {/* Psicólogo Info - Only show for psychologists */}
          {userType === 'psychologist' && (
            <div className="mt-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                <Brain className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
                <p className="text-blue-300 text-xs font-medium">Login Profissional</p>
                <p className="text-blue-200/80 text-xs">
                  Psicólogos devem usar suas credenciais registradas
                </p>
              </div>
            </div>
          )}

          {/* Sign up link */}
          <div className="mt-4 text-center">
            <p className="text-white/70 text-sm">
              Não tem uma conta?{' '}
              <button onClick={() => { window.location.hash = '#/register'; }} className="text-white hover:text-white/80 font-medium transition-colors">
                Cadastre-se
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-white/50 text-xs">
          <p>Conecte-se, Entenda-se, <span className="text-white">Evolua.</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;