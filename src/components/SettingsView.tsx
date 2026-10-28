import React, { useState } from 'react';
import { LabConfig, Language } from '../types/parasitology';
import { translations } from '../translations';
import { USER_MODEL_CLASSES } from '../data/mockData';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Camera, 
  Building2, 
  Save, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck,
  Video
} from 'lucide-react';

interface SettingsViewProps {
  labConfig: LabConfig;
  onSaveConfig: (updated: LabConfig) => void;
  language: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  labConfig,
  onSaveConfig,
  language,
}) => {
  const t = translations[language];

  const [formData, setFormData] = useState<LabConfig>({ ...labConfig });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const availableCameras = [
    { id: 'usb-cmount-optics-4k', name: 'Micro-Cam Ultra 4K (USB 3.0 C-Mount Sensor)' },
    { id: 'optika-pro-cmount', name: 'Optika Digital Microscope C-Mount Adapter' },
    { id: 'integrated-webcam', name: 'Integrated HD Webcam (Local Optical Setup)' },
    { id: 'virtual-prober', name: 'Simulated High-Speed Slide Scanner (Demo Mode)' },
  ];

  const models = [
    { id: 'ONNX-MicrobeNet-v2.4-DeepClinical', name: 'MicrobeNet v2.4 (F1: 98.4% · ResNet-YOLOv8 Clinical)' },
    { id: 'ONNX-Protozoa-Ova-Fast', name: 'ParasiteScan-Fast v1.9 (Optimized for 60 FPS Live Stream)' },
    { id: 'ONNX-Helminth-Spec-v3', name: 'Helminth-Spec v3.1 (High Specificity for Rare Tropical Ova)' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {t.settingsTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configuration matérielle, seuils du moteur neuronal ONNX et données d'en-tête clinique.
            </p>
          </div>

          {isSaved && (
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.settingsSavedAlert}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: AI Model & Thresholds */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-slate-900 font-bold text-sm">
              <Cpu className="w-4 h-4 text-sky-600" />
              <span>{t.settingsAiModel}</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.modelWeights}
                </label>
                <select
                  value={formData.selectedModel}
                  onChange={(e) => setFormData({ ...formData, selectedModel: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 font-mono"
                >
                  <option value="ONNX-19Parasites-MultiClass-v1">Modèle ONNX 19 Parasites (Classes Spécifiques)</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Custom .onnx file */}
              <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-semibold text-sky-950 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-sky-600" />
                    <span>{t.uploadModelTitle}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                    WebAssembly / ONNX Runtime
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mb-3">
                  {t.uploadModelDesc}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".onnx,.bin,.weights"
                    className="text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* 19 Parasite Classes Overview */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">
                    Dictionnaire des 19 Classes du Modèle ONNX (Indices 0 à 18) :
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                    19 Classes Identifiées
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono">
                  {USER_MODEL_CLASSES.map((cls) => (
                    <div key={cls.index} className="flex items-center gap-1.5 p-1 bg-white rounded border border-slate-200">
                      <span className="px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold text-[10px]">
                        {cls.index}
                      </span>
                      <span className="font-semibold text-slate-900 truncate" title={cls.label}>
                        {cls.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{t.minConfidence}</span>
                    <span className="font-mono text-sky-600">{Math.round(formData.confidenceThreshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.50"
                    max="0.99"
                    step="0.01"
                    value={formData.confidenceThreshold}
                    onChange={(e) => setFormData({ ...formData, confidenceThreshold: parseFloat(e.target.value) })}
                    className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">Élimine les artéfacts et débris sous ce seuil.</span>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{t.iouOverlap}</span>
                    <span className="font-mono text-sky-600">{Math.round(formData.iouThreshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.20"
                    max="0.80"
                    step="0.05"
                    value={formData.iouThreshold}
                    onChange={(e) => setFormData({ ...formData, iouThreshold: parseFloat(e.target.value) })}
                    className="w-full accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">Suppression des détections multiples superposées.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Hardware & Camera Devices */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-slate-900 font-bold text-sm">
              <Camera className="w-4 h-4 text-sky-600" />
              <span>{t.cameraConfig}</span>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.selectedCamera}
                </label>
                <select
                  value={formData.activeCameraId}
                  onChange={(e) => setFormData({ ...formData, activeCameraId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 font-medium"
                >
                  {availableCameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">Prise en charge C-Mount USB 3.0 / UVC</div>
                  <div className="text-[11px] text-slate-500">Auto-calibrage de l'échelle micrométrique activé (1 px = 0.28 µm à 40x).</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  CONNECTÉ
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Hospital & Laboratory Branding */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 text-slate-900 font-bold text-sm">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>{t.labInfoConfig}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nom de l'Hôpital / Établissement
                </label>
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Service / Département
                </label>
                <input
                  type="text"
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Numéro d'Accréditation Légale (ISO 15189 / COFRAC)
                </label>
                <input
                  type="text"
                  value={formData.accreditationNumber}
                  onChange={(e) => setFormData({ ...formData, accreditationNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Téléphone du Laboratoire
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Biologiste Responsable (Signature par défaut)
                </label>
                <input
                  type="text"
                  value={formData.defaultBiologist}
                  onChange={(e) => setFormData({ ...formData, defaultBiologist: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Titre & Fonction Professionnelle
                </label>
                <input
                  type="text"
                  value={formData.defaultRole}
                  onChange={(e) => setFormData({ ...formData, defaultRole: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Adresse Complète de l'Établissement
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveSettings}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
