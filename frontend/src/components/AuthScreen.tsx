import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import { authService } from '../services/api';

interface AuthScreenProps {
  onAuthenticated: (token: string, email: string, masterPassword: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister && masterPassword !== confirmPassword) {
      setError('As senhas mestras não coincidem.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const res = await authService.register(email, masterPassword);
        onAuthenticated(res.accessToken, res.user.email, masterPassword);
      } else {
        const res = await authService.login(email, masterPassword);
        onAuthenticated(res.accessToken, res.user.email, masterPassword);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient glowing circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <Shield className="w-7 h-7 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
              safeAll
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Gerenciador de Senhas com Criptografia de Ponta a Ponta
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-900/60 rounded-2xl p-3.5 text-xs text-red-300 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Seu E-mail
            </label>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Senha Mestra (Master Password)
              </label>
            </div>
            <div className="relative">
              <input
                type={showMasterPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="••••••••••••••••"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-3 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowMasterPassword(!showMasterPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showMasterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              ⚠️ Guarde sua Senha Mestra. Ela é a chave para descriptografar todas as suas senhas.
            </p>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Confirme a Senha Mestra
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{isRegister ? 'Criar Meu Cofre Criptografado' : 'Desbloquear Cofre'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
          >
            {isRegister
              ? 'Já possui uma conta? Desbloquear cofre'
              : 'Novo por aqui? Criar uma conta no safeAll'}
          </button>
        </div>
      </div>
    </div>
  );
};
