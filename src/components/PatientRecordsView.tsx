import React, { useState } from 'react';
import { DiagnosticResult, Language } from '../types/parasitology';
import { translations } from '../translations';
import { 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Microscope,
  Eye,
  Printer
} from 'lucide-react';

interface PatientRecordsViewProps {
  records: DiagnosticResult[];
  onOpenReport: (result: DiagnosticResult) => void;
  language: Language;
}

export const PatientRecordsView: React.FC<PatientRecordsViewProps> = ({
  records,
  onOpenReport,
  language,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');

  const filteredRecords = records.filter((r) => {
    // Search filter
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.patient.fullName.toLowerCase().includes(q) ||
      r.patient.fileNumber.toLowerCase().includes(q) ||
      r.patient.sampleId.toLowerCase().includes(q) ||
      r.primaryFinding.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // Severity filter
    if (filterType === 'positive') return r.infectionSeverity !== 'negative';
    if (filterType === 'negative') return r.infectionSeverity === 'negative';
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {t.navPatientRecords}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Registre d'archivage des analyses parasitologiques et comptes-rendus certifiés.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-xs">
            {filteredRecords.length} / {records.length} dossiers archivés
          </span>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchRecords}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setFilterType('positive')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterType === 'positive'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterPositive}
            </button>
            <button
              onClick={() => setFilterType('negative')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterType === 'negative'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.filterNegative}
            </button>
          </div>

        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t.patientCol}</th>
                  <th className="py-3 px-4">{t.dateCol}</th>
                  <th className="py-3 px-4">{t.sampleId}</th>
                  <th className="py-3 px-4">{t.findingCol}</th>
                  <th className="py-3 px-4 text-center">{t.severityCol}</th>
                  <th className="py-3 px-4">{t.biologistSignature}</th>
                  <th className="py-3 px-4 text-right">{t.actionsCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Aucun dossier ne correspond à votre recherche.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{r.patient.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {r.patient.fileNumber} · {r.patient.age} ans ({r.patient.gender})
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {r.detectionDate}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {r.patient.sampleId}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 max-w-xs truncate">
                          {r.primaryFinding}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {r.totalParasitesFound > 0
                            ? `${r.totalParasitesFound} éléments · ${r.estimatedEPG.toLocaleString()} EPG`
                            : 'Négatif'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            r.infectionSeverity === 'negative'
                              ? 'bg-slate-100 text-slate-600'
                              : r.infectionSeverity === 'heavy'
                              ? 'bg-rose-100 text-rose-700'
                              : r.infectionSeverity === 'moderate'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-sky-100 text-sky-700'
                          }`}
                        >
                          {r.infectionSeverity.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="text-xs truncate max-w-[150px] font-medium">
                          {r.validatedBy}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {t.statusValidated}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onOpenReport(r)}
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white border border-sky-200 hover:border-transparent font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t.viewReportBtn}</span>
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
