import React from 'react';
import { AppMode, Language } from '../types/parasitology';
import { translations } from '../translations';
import { Video, UploadCloud, ArrowRight, X, Cpu, Camera } from 'lucide-react';

interface ModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: AppMode) => void;
  language: Language;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  language,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md">
            DAP Optical Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            {t.modeSelectionTitle}
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            {t.modeSelectionDesc}
          </p>
        </div>

        {/* Two Large Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          
          {/* Card 1: Live Microscope */}
          <div
            onClick={() => {
              onSelectMode('live');
              onClose();
            }}
            className="group cursor-pointer border-2 border-slate-200 hover:border-sky-500 rounded-xl p-5 bg-white hover:bg-sky-50/30 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  {t.modeLiveTitle}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs font-medium text-sky-600 mb-2">
                {t.modeLiveSubtitle}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.modeLiveDesc}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600 group-hover:text-sky-700">
              <span>{t.modeLiveAction}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Upload Sample */}
          <div
            onClick={() => {
              onSelectMode('upload');
              onClose();
            }}
            className="group cursor-pointer border-2 border-slate-200 hover:border-sky-500 rounded-xl p-5 bg-white hover:bg-sky-50/30 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors mb-1">
                {t.modeUploadTitle}
              </h3>
              <p className="text-xs font-medium text-indigo-600 mb-2">
                {t.modeUploadSubtitle}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.modeUploadDesc}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
              <span>{t.modeUploadAction}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
