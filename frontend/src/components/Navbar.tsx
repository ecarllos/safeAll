import React from 'react';
import { Shield, KeyRound, Lock, LogOut, Plus } from 'lucide-react';

interface NavbarProps {
  userEmail: string;
  onOpenNewModal: () => void;
  onOpenGenerator: () => void;
  onLockVault: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userEmail,
  onOpenNewModal,
  onOpenGenerator,
  onLockVault,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Shield className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            safeAll
          </h1>
          <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
            Encrypted Vault
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenGenerator}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-all"
        >
          <KeyRound className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Gerador de Senhas</span>
        </button>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-lg shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Senha</span>
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1"></div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden md:inline font-medium text-slate-300">{userEmail}</span>
          <button
            onClick={onLockVault}
            title="Trancar Cofre"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg border border-transparent hover:border-red-900/40 transition-all"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
