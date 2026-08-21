import React, { useState } from 'react';
import { X, Copy, RefreshCw, Check } from 'lucide-react';

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyToast: (msg: string) => void;
}

export const PasswordGeneratorModal: React.FC<PasswordGeneratorModalProps> = ({
  isOpen,
  onClose,
  onCopyToast,
}) => {
  const [length, setLength] = useState(18);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let chars = '';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) return 'Selecione ao menos 1 opção';

    let generated = '';
    const cryptoObj = window.crypto || (window as any).msCrypto;
    const randomValues = new Uint32Array(length);
    cryptoObj.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      generated += chars[randomValues[i] % chars.length];
    }
    return generated;
  };

  const [password, setPassword] = useState(generatePassword());

  const handleRegenerate = () => {
    setPassword(generatePassword());
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    onCopyToast('Senha gerada copiada! Área de transferência expira em 30s.');
    setTimeout(() => {
      navigator.clipboard.writeText('');
    }, 30000);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">Gerador de Senha Forte</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            readOnly
            value={password}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono font-bold text-cyan-400 select-all pr-24 tracking-wider"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              onClick={handleRegenerate}
              title="Gerar Outra"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              title="Copiar Senha"
              className="p-2 text-cyan-400 hover:bg-cyan-950/60 rounded-lg transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Tamanho da Senha</span>
              <span className="text-cyan-400 font-mono">{length} caracteres</span>
            </div>
            <input
              type="range"
              min="8"
              max="40"
              value={length}
              onChange={(e) => {
                setLength(Number(e.target.value));
                setPassword(generatePassword());
              }}
              className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2 bg-slate-950/60 p-2.5 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => {
                  setIncludeUppercase(e.target.checked);
                  setPassword(generatePassword());
                }}
                className="accent-cyan-500 rounded"
              />
              <span className="text-slate-300">Maiúsculas (A-Z)</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-950/60 p-2.5 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => {
                  setIncludeLowercase(e.target.checked);
                  setPassword(generatePassword());
                }}
                className="accent-cyan-500 rounded"
              />
              <span className="text-slate-300">Minúsculas (a-z)</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-950/60 p-2.5 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => {
                  setIncludeNumbers(e.target.checked);
                  setPassword(generatePassword());
                }}
                className="accent-cyan-500 rounded"
              />
              <span className="text-slate-300">Números (0-9)</span>
            </label>

            <label className="flex items-center gap-2 bg-slate-950/60 p-2.5 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => {
                  setIncludeSymbols(e.target.checked);
                  setPassword(generatePassword());
                }}
                className="accent-cyan-500 rounded"
              />
              <span className="text-slate-300">Símbolos (!@#)</span>
            </label>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleCopy}
            className="w-full py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 rounded-xl transition-all shadow-md shadow-cyan-500/20"
          >
            Copiar Senha Gerada
          </button>
        </div>
      </div>
    </div>
  );
};
