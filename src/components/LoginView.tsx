import React, { useState } from 'react';
import { Language } from '../types/parasitology';
import { translations } from '../translations';
import { Microscope, ShieldCheck, Building2, User, KeyRound, Sparkles } from 'lucide-react';

interface LoginViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (user: { name: string; role: string; branch: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  language,
  onLanguageChange,
  onLoginSuccess,
}) => {
  const t = translations[language];

  const [username, setUsername] = useState('dr.morel');
  const [password, setPassword] = useState('••••••••••');
  const [branch, setBranch] = useState('chu-paris-central');
  const [role, setRole] = useState('biologist');

  const branches = [
    { id: 'chu-paris-central', name: 'CHU Saint-Antoine · Pôle Biologie & Parasitologie' },
    { id: 'lab-biosante-15', name: 'Laboratoire de Biologie Médicale BioSanté Paris' },
    { id: 'clinique-pasteur', name: 'Centre Hospitalier Universitaire Pasteur · Parasito' },
    { id: 'intl-tropical-unit', name: 'Unité Clinique des Maladies Tropicales & Vectorielles' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const branchObj = branches.find((b) => b.id === branch);
    onLoginSuccess({
      name: 'Dr. Thomas Morel',
      role: 'Biologiste Médical (RPPS: 10098421890)',
      branch: branchObj?.name || 'Laboratoire Central',
    });
  };

  const handleDemoLogin = () => {
    onLoginSuccess({
      name: 'Dr. Thomas Morel',
      role: 'Biologiste Médical (RPPS: 10098421890)',
      branch: 'CHU Saint-Antoine · Pôle Biologie & Parasitologie',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Language Switcher Top Right */}
      <div className="absolute top-6 right-6 flex items-center border border-slate-700 rounded-lg p-0.5 bg-slate-800/80 backdrop-blur-xs">
        <button
          onClick={() => onLanguageChange('fr')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            language === 'fr' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          FR
        </button>
        <button
          onClick={() => onLanguageChange('en')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            language === 'en' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => onLanguageChange('ar')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            language === 'ar' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          العربية
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Medical Brand Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-sky-600/30 mb-4 border border-sky-400/30">
            <Microscope className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono">
            DAP
          </h1>
          <p className="mt-1 text-xs text-sky-400 font-semibold tracking-wider uppercase">
            {t.appFullTitle}
          </p>
          <p className="mt-2 text-sm text-slate-400 max-w-sm">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Card Form */}
        <div className="mt-8 bg-slate-800/90 border border-slate-700/80 shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-md">
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Laboratory branch selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                {t.laboratoryBranch}
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Username or RPPS */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                {t.usernameOrRpps}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono"
                placeholder="Ex: 10098421890 ou dr.morel"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                {t.password}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono"
                placeholder="••••••••••••"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.signIn}</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Access Button */}
          <div className="mt-5 pt-5 border-t border-slate-700/60">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-slate-700 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>{t.quickDemoLogin}</span>
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              {t.demoUserHint}
            </p>
          </div>
        </div>

        {/* Clinical Accreditation Footer note */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <span>ISO 15189 Compliant</span>
          <span>·</span>
          <span>CE-IVD Diagnostics Ready</span>
          <span>·</span>
          <span>ONNX Runtime v2.4</span>
        </div>
      </div>
    </div>
  );
};
