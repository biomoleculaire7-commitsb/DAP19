import React from 'react';
import { AppMode, Language } from '../types/parasitology';
import { translations } from '../translations';
import { 
  LayoutDashboard, 
  Video, 
  UploadCloud, 
  FileText, 
  Settings, 
  PlusCircle, 
  Radio, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  language: Language;
  todayCount: number;
  positiveCount: number;
  onNewAnalysis: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onSelectMode,
  language,
  todayCount,
  positiveCount,
  onNewAnalysis,
}) => {
  const t = translations[language];

  const navItems = [
    {
      id: 'dashboard' as AppMode,
      label: t.navDashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'live' as AppMode,
      label: t.navLiveMicroscope,
      icon: Video,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'upload' as AppMode,
      label: t.navUploadSample,
      icon: UploadCloud,
      badge: null,
    },
    {
      id: 'patients' as AppMode,
      label: t.navPatientRecords,
      icon: FileText,
      badge: `${todayCount}`,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'settings' as AppMode,
      label: t.navSettings,
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 no-print select-none">
      {/* Quick Action Top Button */}
      <div className="p-4 border-b border-slate-100">
        <button
          onClick={onNewAnalysis}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.quickNewExam}</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
          {t.switchMode}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectMode(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-50 text-sky-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                    item.badgeColor || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Daily Metrics Mini Widget in Sidebar */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>{t.todayExaminations}</span>
          <span className="font-mono font-semibold text-slate-800">{todayCount}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{t.positiveCases}</span>
          <span className="font-mono font-semibold text-rose-600">{positiveCount}</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className="bg-rose-500 h-full rounded-full transition-all"
            style={{ width: `${todayCount > 0 ? (positiveCount / todayCount) * 100 : 0}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
