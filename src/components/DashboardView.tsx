import React from 'react';
import { AppMode, DiagnosticResult, Language } from '../types/parasitology';
import { translations } from '../translations';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Percent, 
  Video, 
  UploadCloud, 
  FileText, 
  ArrowRight, 
  Eye, 
  TrendingUp, 
  Microscope,
  ShieldCheck
} from 'lucide-react';

interface DashboardViewProps {
  onSelectMode: (mode: AppMode) => void;
  language: Language;
  records: DiagnosticResult[];
  onOpenReport: (result: DiagnosticResult) => void;
  onNewAnalysis: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectMode,
  language,
  records,
  onOpenReport,
  onNewAnalysis,
}) => {
  const t = translations[language];

  // Aggregated metrics
  const totalExams = records.length;
  const positiveExams = records.filter((r) => r.infectionSeverity !== 'negative').length;
  const negativeExams = totalExams - positiveExams;
  const positivityRate = totalExams > 0 ? Math.round((positiveExams / totalExams) * 100) : 0;

  // Species distribution
  const speciesTallies: Record<string, number> = {
    'Ascaris lumbricoides': 0,
    'Trichuris trichiura': 0,
    'Ancylostoma / Hookworm': 0,
    'Giardia lamblia': 0,
    'Schistosoma mansoni': 0,
  };

  records.forEach((r) => {
    Object.entries(r.speciesCounts).forEach(([species, count]) => {
      if (species.includes('Ascaris')) speciesTallies['Ascaris lumbricoides'] += count;
      else if (species.includes('Trichuris')) speciesTallies['Trichuris trichiura'] += count;
      else if (species.includes('Ancylostoma')) speciesTallies['Ancylostoma / Hookworm'] += count;
      else if (species.includes('Giardia')) speciesTallies['Giardia lamblia'] += count;
      else speciesTallies['Schistosoma mansoni'] += count;
    });
  });

  const maxCount = Math.max(...Object.values(speciesTallies), 1);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Welcome & Model Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {t.navDashboard} · {t.labBadge}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Surveillance épidémiologique et quantification microscopique en temps réel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {t.activeModelBadge}
            </span>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>{t.todayExaminations}</span>
              <Activity className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
              {totalExams}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Validation automatique conforme ISO
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>{t.positiveCases}</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-600">
              {positiveExams}
            </div>
            <div className="text-[11px] text-rose-500/80 mt-1">
              Charge parasitaire quantifiée
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>{t.negativeCases}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-600">
              {negativeExams}
            </div>
            <div className="text-[11px] text-emerald-600/80 mt-1">
              Examen direct négatif certifié
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>{t.positivityRate}</span>
              <TrendingUp className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-sky-600">
              {positivityRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Indicateur de prévalence locale
            </div>
          </div>

        </div>

        {/* 2 Quick Mode Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div
            onClick={() => onSelectMode('live')}
            className="cursor-pointer group bg-gradient-to-br from-sky-900 to-slate-900 text-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 mb-4 group-hover:scale-105 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white">
                  {t.modeLiveTitle}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-sky-200 font-medium mb-2">
                {t.modeLiveSubtitle}
              </p>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                {t.modeLiveDesc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-sky-300">
              <span>{t.modeLiveAction}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onSelectMode('upload')}
            className="cursor-pointer group bg-white border border-slate-200 hover:border-sky-500 text-slate-900 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors mb-1">
                {t.modeUploadTitle}
              </h3>
              <p className="text-xs text-sky-600 font-medium mb-2">
                {t.modeUploadSubtitle}
              </p>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                {t.modeUploadDesc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600 group-hover:text-sky-700">
              <span>{t.modeUploadAction}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Two-Column Lower Split: Species Chart + Recent Exam Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Species Distribution Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>{t.speciesDistribution}</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono">Total: {positiveExams}</span>
            </h3>

            <div className="space-y-3.5 flex-1 flex flex-col justify-center">
              {Object.entries(speciesTallies).map(([species, count]) => {
                const percentage = Math.round((count / maxCount) * 100);
                return (
                  <div key={species}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 italic truncate max-w-[180px]">
                        {species}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {count} cas
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Classification selon la nomenclature morphologique internationale
            </div>
          </div>

          {/* Recent Records Table */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {t.recentExaminations}
              </h3>
              <button
                onClick={() => onSelectMode('patients')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
              >
                <span>{t.viewAllRecords}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">{t.patientCol}</th>
                    <th className="py-2.5 px-3">{t.findingCol}</th>
                    <th className="py-2.5 px-3 text-center">{t.statusCol}</th>
                    <th className="py-2.5 px-3 text-right">{t.actionsCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.slice(0, 4).map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{rec.patient.fullName}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {rec.patient.fileNumber} · {rec.detectionDate}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800 line-clamp-1">
                          {rec.primaryFinding}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {rec.totalParasitesFound > 0
                            ? `${rec.totalParasitesFound} éléments (${rec.estimatedEPG.toLocaleString()} EPG)`
                            : 'Négatif'}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            rec.infectionSeverity === 'negative'
                              ? 'bg-slate-100 text-slate-600'
                              : rec.infectionSeverity === 'heavy'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {rec.infectionSeverity.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onOpenReport(rec)}
                          className="px-2.5 py-1 text-xs font-semibold text-sky-700 hover:text-white bg-sky-50 hover:bg-sky-600 border border-sky-200 rounded-md transition-colors"
                        >
                          {t.viewReportBtn}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
