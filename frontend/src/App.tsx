import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Lock,
  Copy,
  Check,
  Eye,
  EyeOff,
  History,
  Trash2,
  Edit,
  ExternalLink,
  Shield,
  Landmark,
  Terminal,
  AppWindow,
  FileText,
  KeyRound,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthScreen } from './components/AuthScreen';
import { PasswordGeneratorModal } from './components/PasswordGeneratorModal';
import { VaultItemModal } from './components/VaultItemModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { vaultService, VaultItemSummary } from './services/api';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('safeall_token'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('safeall_email'));
  const [masterPassword, setMasterPassword] = useState<string | null>(
    sessionStorage.getItem('safeall_mp'),
  );

  const [items, setItems] = useState<VaultItemSummary[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItemSummary | null>(null);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<VaultItemSummary | null>(null);

  // Decrypted passwords cache map: { [itemId]: string }
  const [decryptedState, setDecryptedState] = useState<{ [itemId: string]: string }>({});
  const [visibleState, setVisibleState] = useState<{ [itemId: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (token && masterPassword) {
      fetchItems();
    }
  }, [token, masterPassword, search, selectedCategory]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await vaultService.getAll(search, selectedCategory);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticated = (tkn: string, email: string, mp: string) => {
    localStorage.setItem('safeall_token', tkn);
    localStorage.setItem('safeall_email', email);
    sessionStorage.setItem('safeall_mp', mp);

    setToken(tkn);
    setUserEmail(email);
    setMasterPassword(mp);
  };

  const handleLockVault = () => {
    sessionStorage.removeItem('safeall_mp');
    setMasterPassword(null);
    setDecryptedState({});
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDecryptItem = async (item: VaultItemSummary) => {
    if (!masterPassword) return;
    try {
      const res = await vaultService.decrypt(item.id, masterPassword);
      setDecryptedState((prev) => ({ ...prev, [item.id]: res.passwordOrSecret }));
      setVisibleState((prev) => ({ ...prev, [item.id]: true }));
    } catch (err) {
      showToast('Erro ao descriptografar item.');
    }
  };

  const toggleVisibility = (id: string) => {
    setVisibleState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPassword = async (item: VaultItemSummary) => {
    let pwd = decryptedState[item.id];
    if (!pwd) {
      if (!masterPassword) return;
      try {
        const res = await vaultService.decrypt(item.id, masterPassword);
        pwd = res.passwordOrSecret;
        setDecryptedState((prev) => ({ ...prev, [item.id]: pwd }));
      } catch (err) {
        showToast('Erro ao descriptografar para cópia.');
        return;
      }
    }

    navigator.clipboard.writeText(pwd);
    setCopiedId(item.id);
    showToast(`Senha de "${item.title}" copiada! Limpeza automática em 30s.`);

    setTimeout(() => {
      navigator.clipboard.writeText('');
    }, 30000);

    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteItem = async (item: VaultItemSummary) => {
    if (confirm(`Tem certeza que deseja excluir "${item.title}" e seu histórico?`)) {
      try {
        await vaultService.remove(item.id);
        showToast('Item excluído com sucesso.');
        fetchItems();
      } catch (err) {
        showToast('Erro ao excluir item.');
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bank':
        return <Landmark className="w-4 h-4 text-emerald-400" />;
      case 'dev':
        return <Terminal className="w-4 h-4 text-cyan-400" />;
      case 'app':
        return <AppWindow className="w-4 h-4 text-indigo-400" />;
      case 'note':
        return <FileText className="w-4 h-4 text-amber-400" />;
      default:
        return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  if (!token || !masterPassword) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        userEmail={userEmail || ''}
        onOpenNewModal={() => {
          setEditingItem(null);
          setIsItemModalOpen(true);
        }}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onLockVault={handleLockVault}
      />

      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-cyan-950 border border-cyan-500/40 text-cyan-200 text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl shadow-cyan-950/80 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <KeyRound className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          totalCount={items.length}
        />

        <main className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por título, usuário ou nota..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto">
              <span>{items.length} credenciais gravadas</span>
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500">
              Carregando cofre seguro...
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">Seu cofre está vazio</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Adicione suas senhas de bancos, servidores, infraestrutura e aplicativos para mantê-las 100% criptografadas e versionadas.
              </p>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-xl shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Primeira Senha</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const isDecrypted = !!decryptedState[item.id];
                const isVisible = !!visibleState[item.id];
                const pwd = decryptedState[item.id];

                return (
                  <div
                    key={item.id}
                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {item.username || 'Sem usuário'}
                            </p>
                          </div>
                        </div>

                        {item.url && (
                          <a
                            href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800"
                            title="Abrir URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Password / Decrypt View */}
                      <div className="bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center justify-between">
                        <span className="font-mono text-xs text-cyan-300">
                          {isDecrypted
                            ? isVisible
                              ? pwd
                              : '••••••••••••••••'
                            : '••••••••••••••••'}
                        </span>

                        <div className="flex items-center gap-1">
                          {isDecrypted ? (
                            <button
                              onClick={() => toggleVisibility(item.id)}
                              className="p-1 text-slate-400 hover:text-slate-200"
                              title={isVisible ? 'Ocultar' : 'Mostrar'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDecryptItem(item)}
                              className="p-1 text-slate-500 hover:text-cyan-400"
                              title="Descriptografar e Ver"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleCopyPassword(item)}
                            className="p-1 text-cyan-400 hover:text-cyan-300"
                            title="Copiar Senha"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setHistoryItem(item);
                          setIsHistoryDrawerOpen(true);
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-teal-400 transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Histórico ({item.historyCount})</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsItemModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <PasswordGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onCopyToast={showToast}
      />

      <VaultItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSuccess={fetchItems}
        masterPassword={masterPassword}
        initialItem={editingItem}
      />

      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        item={historyItem}
        masterPassword={masterPassword}
        onCopyToast={showToast}
      />
    </div>
  );
};
