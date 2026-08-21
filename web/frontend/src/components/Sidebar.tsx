import React from 'react';
import { ShieldAlert, Landmark, Terminal, AppWindow, FileText, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  totalCount,
}) => {
  const categories = [
    { id: '', label: 'Todas as Senhas', icon: LayoutGrid },
    { id: 'bank', label: 'Bancos & Finanças', icon: Landmark },
    { id: 'dev', label: 'Dev & Infraestrutura', icon: Terminal },
    { id: 'app', label: 'Aplicativos & Contas', icon: AppWindow },
    { id: 'note', label: 'Notas Secretas', icon: FileText },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/30 p-4 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
            Categorias
          </h2>
          <nav className="space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{cat.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Segurança Total</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Seus segredos são criptografados com <strong>AES-256-GCM</strong>. Nem mesmo a base de dados tem acesso ao conteúdo original.
          </p>
        </div>
      </div>

      <div className="text-[11px] text-slate-600 text-center py-2">
        safeAll v1.0.0 &bull; Open Source
      </div>
    </aside>
  );
};
