import React, { useState } from 'react';
import { PatientData, Language } from '../types/parasitology';
import { translations } from '../translations';
import { X, UserCheck, Stethoscope, Sparkles } from 'lucide-react';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientData;
  onSave: (updated: PatientData) => void;
  language: Language;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
  language,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [formData, setFormData] = useState<PatientData>({ ...patient });

  const presets = [
    {
      fullName: 'Marc Fontaine',
      fileNumber: 'IPP-904128',
      age: 42,
      gender: 'M' as const,
      sampleId: 'TUB-9912-ST',
      sampleType: 'stool' as const,
      department: 'Gastro-entérologie & Hépatologie',
      prescribingDoctor: 'Dr. Éric Lambert',
      clinicalNotes: 'Syndrome diarrhéique persistant au retour de mission humanitaire.',
    },
    {
      fullName: 'Fatima Zahra Mansouri',
      fileNumber: 'IPP-904129',
      age: 29,
      gender: 'F' as const,
      sampleId: 'TUB-9915-ST',
      sampleType: 'stool' as const,
      department: 'Maladies Infectieuses & Tropicales',
      prescribingDoctor: 'Pr. Claire Delorme',
      clinicalNotes: 'Douleurs épigastriques chroniques, hyperéosinophilie à 1200/mm³.',
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setFormData((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.patientModalTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.actionEditPatient}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets for easy demonstration */}
        <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Exemples rapides :</span>
          </div>
          <div className="flex items-center gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 rounded-md font-medium text-[11px] transition-colors"
              >
                {p.fullName.split(' ')[0]} ({p.age}a)
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          {/* Row 1: Full Name & IPP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.patientFullName} *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.patientFileNo} *
              </label>
              <input
                type="text"
                required
                value={formData.fileNumber}
                onChange={(e) => setFormData({ ...formData, fileNumber: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Age, Gender, Sample ID */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.patientAge}
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.patientGender}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="M">{t.male}</option>
                <option value="F">{t.female}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.sampleId} *
              </label>
              <input
                type="text"
                required
                value={formData.sampleId}
                onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Sample Type & Prescribing Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.sampleType}
              </label>
              <select
                value={formData.sampleType}
                onChange={(e) => setFormData({ ...formData, sampleType: e.target.value as any })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="stool">{t.sampleStool}</option>
                <option value="urine">{t.sampleUrine}</option>
                <option value="blood">{t.sampleBlood}</option>
                <option value="aspirate">{t.sampleAspirate}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.prescribingDoctor}
              </label>
              <input
                type="text"
                value={formData.prescribingDoctor}
                onChange={(e) => setFormData({ ...formData, prescribingDoctor: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Department & Clinical Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.department}
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.clinicalNotes}
            </label>
            <textarea
              rows={2}
              value={formData.clinicalNotes || ''}
              onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
              placeholder={t.clinicalNotesPlaceholder}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              {t.savePatientData}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
