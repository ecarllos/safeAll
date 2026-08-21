import React, { useState, useEffect } from 'react';
import { X, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { vaultService, VaultItemSummary } from '../services/api';

interface VaultItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  masterPassword: string;
  initialItem?: VaultItemSummary | null;
}

export const VaultItemModal: React.FC<VaultItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  masterPassword,
  initialItem,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'bank' | 'dev' | 'app' | 'note'>('app');
  const [username, setUsername] = useState('');
  const [url, setUrl] = useState('');
  const [passwordOrSecret, setPasswordOrSecret] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setCategory(initialItem.category);
      setUsername(initialItem.username || '');
      setUrl(initialItem.url || '');
      setNotes(initialItem.notes || '');
      setPasswordOrSecret('');
    } else {
      setTitle('');
      setCategory('app');
      setUsername('');
      setUrl('');
      setPasswordOrSecret('');
      setNotes('');
    }
    setError('');
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }

    if (!initialItem && !passwordOrSecret.trim()) {
      setError('A senha/segredo é obrigatória para novos itens.');
      return;
    }

    setLoading(true);
    try {
      if (initialItem) {
        await vaultService.update(initialItem.id, {
          title,
          category,
          username: username || undefined,
          url: url || undefined,
          notes: notes || undefined,
          passwordOrSecret: passwordOrSecret || undefined,
          masterPassword: passwordOrSecret ? masterPassword : undefined,
        });
      } else {
        await vaultService.create({
          title,
          category,
          username: username || undefined,
          url: url || undefined,
          passwordOrSecret,
          notes: notes || undefined,
          masterPassword,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar o item no cofre.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-100">
              {initialItem ? 'Editar Credencial' : 'Nova Credencial / Senha'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-900/60 rounded-xl p-3 text-xs text-red-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Título / Serviço *</label>
              <input
                type="text"
                placeholder="Ex: Banco Itaú, AWS, GitHub..."
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Categoria *</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="bank">🏦 Bancos & Finanças</option>
                <option value="dev">💻 Dev & Infraestrutura</option>
                <option value="app">📱 Aplicativos & Contas</option>
                <option value="note">📝 Notas Secretas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Usuário / E-mail</label>
              <input
                type="text"
                placeholder="ex: usuario@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Link / URL (opcional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-400">
                {initialItem ? 'Nova Senha (deixe em branco se não alterar)' : 'Senha / Token / Segredo *'}
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={initialItem ? 'Manter senha atual' : 'Digite a senha a ser criptografada'}
                value={passwordOrSecret}
                onChange={(e) => setPasswordOrSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {initialItem && passwordOrSecret && (
              <p className="text-[11px] text-teal-400 mt-1">
                ℹ️ Ao alterar a senha, a versão atual será gravada automaticamente no histórico de revisões.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Observações / Notas</label>
            <textarea
              rows={2}
              placeholder="Notas adicionais, perguntas de segurança ou chaves..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? 'Salvando Criptografado...' : 'Salvar no Cofre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
