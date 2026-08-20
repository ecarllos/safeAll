import React, { useState, useEffect } from 'react';
import { X, History, Copy, Eye, EyeOff, Check, ShieldAlert } from 'lucide-react';
import { vaultService, VaultItemSummary, HistoryItemSummary } from '../services/api';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: VaultItemSummary | null;
  masterPassword: string;
  onCopyToast: (msg: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  item,
  masterPassword,
  onCopyToast,
}) => {
  const [historyList, setHistoryList] = useState<HistoryItemSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [decryptedPasswords, setDecryptedPasswords] = useState<{ [historyId: string]: string }>({});
  const [visibleState, setVisibleState] = useState<{ [historyId: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      fetchHistory();
    } else {
      setHistoryList([]);
      setDecryptedPasswords({});
    }
  }, [isOpen, item]);

  const fetchHistory = async () => {
    if (!item) return;
    setLoading(true);
    try {
      const data = await vaultService.getHistory(item.id);
      setHistoryList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async (historyId: string) => {
    if (!item) return;
    try {
      const res = await vaultService.decryptHistory(item.id, historyId, masterPassword);
      setDecryptedPasswords((prev) => ({ ...prev, [historyId]: res.passwordOrSecret }));
      setVisibleState((prev) => ({ ...prev, [historyId]: true }));
    } catch (err) {
      alert('Falha ao descriptografar esta versão do histórico.');
    }
  };

  const toggleVisibility = (historyId: string) => {
    setVisibleState((prev) => ({ ...prev, [historyId]: !prev[historyId] }));
  };

  const handleCopy = (historyId: string) => {
    const pwd = decryptedPasswords[historyId];
    if (pwd) {
      navigator.clipboard.writeText(pwd);
      setCopiedId(historyId);
      onCopyToast('Senha do histórico copiada! Limpeza da área de transferência em 30s.');
      setTimeout(() => navigator.clipboard.writeText(''), 30000);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
        <div className="space-y-6 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Histórico de Revisões</h2>
                <p className="text-xs text-slate-400">{item.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Todas as versões anteriores alteradas nesta credencial permanecem criptografadas e gravadas com registro de data.
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Carregando histórico...</div>
          ) : historyList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-400">Nenhuma alteração anterior gravada.</p>
              <p>O histórico é gerado automaticamente a cada mudança de senha.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((h, idx) => {
                const isDecrypted = !!decryptedPasswords[h.id];
                const isVisible = !!visibleState[h.id];
                const pwd = decryptedPasswords[h.id];

                return (
                  <div
                    key={h.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-cyan-400 font-bold">
                        Versão #{historyList.length - idx}
                      </span>
                      <span className="text-slate-500">
                        {new Date(h.changedAt).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    {isDecrypted ? (
                      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
                        <span className="font-mono text-xs text-teal-300">
                          {isVisible ? pwd : '••••••••••••••••'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleVisibility(h.id)}
                            className="p-1 text-slate-400 hover:text-slate-200"
                          >
                            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleCopy(h.id)}
                            className="p-1 text-cyan-400 hover:text-cyan-300"
                          >
                            {copiedId === h.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDecrypt(h.id)}
                        className="w-full py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Descriptografar esta Versão</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
