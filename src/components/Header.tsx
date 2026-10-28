import React from 'react';
import { AppMode, Language } from '../types/parasitology';
import { translations } from '../translations';
import { Microscope, ShieldCheck, Globe, LogOut, Activity, User } from 'lucide-react';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  language,
  onLanguageChange,
  userName,
  userRole,
  onLogout,
}) => {
  const t = translations[language];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 md:gap-8">
          
          {/* Zone 1: Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectMode('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm group-hover:bg-sky-700 transition-colors">
                <Microscope className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">DAP</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100 font-medium">
                    AI-ONNX
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  {t.appSubtitle}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => onSelectMode('dashboard')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                currentMode === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.navDashboard}
            </button>
            <button
              onClick={() => onSelectMode('live')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                currentMode === 'live'
                  ? 'bg-sky-50 text-sky-800 font-semibold border border-sky-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.navLiveMicroscope}
            </button>
            <button
              onClick={() => onSelectMode('upload')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                currentMode === 'upload'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.navUploadSample}
            </button>
            <button
              onClick={() => onSelectMode('patients')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                currentMode === 'patients'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.navPatientRecords}
            </button>
            <button
              onClick={() => onSelectMode('settings')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                currentMode === 'settings'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.navSettings}
            </button>
          </nav>

          {/* Zone 3: Language Selector & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => onLanguageChange('fr')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  language === 'fr'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Français"
              >
                FR
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  language === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('ar')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  language === 'ar'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="العربية"
              >
                AR
              </button>
            </div>

            {/* User Info Capsule */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[130px]">
                  {userRole}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title={t.quickLogout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
