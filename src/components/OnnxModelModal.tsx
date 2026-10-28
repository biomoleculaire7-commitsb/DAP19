import React, { useState } from 'react';
import { onnxEngine, ModelMetadata } from '../services/onnxInference';
import { USER_MODEL_CLASSES, PARASITE_SPECIES } from '../data/mockData';
import { Language } from '../types/parasitology';
import { translations } from '../translations';
import { 
  Cpu, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Terminal, 
  FileCode, 
  Play, 
  Info,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface OnnxModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onModelLoaded: (meta: ModelMetadata) => void;
  onRunTestInference?: () => void;
}

export const OnnxModelModal: React.FC<OnnxModelModalProps> = ({
  isOpen,
  onClose,
  language,
  onModelLoaded,
  onRunTestInference,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [isLoading, setIsLoading] = useState(false);
  const [modelMeta, setModelMeta] = useState<ModelMetadata | null>(onnxEngine.getMetadata());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'classes' | 'guide'>('upload');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Check extension
    if (!file.name.toLowerCase().endsWith('.onnx')) {
      if (file.name.toLowerCase().endsWith('.pt') || file.name.toLowerCase().endsWith('.pth')) {
        setErrorMessage(
          'Attention : Vous avez sélectionné un fichier PyTorch (.pt/.pth). Le navigateur ne peut exécuter que le format Web (.onnx). Veuillez exporter votre modèle en ONNX (ex: model.export(format="onnx")).'
        );
      } else {
        setErrorMessage(
          'Veuillez sélectionner un fichier avec l\'extension .onnx valide.'
        );
      }
      setIsLoading(false);
      return;
    }

    try {
      const meta = await onnxEngine.loadModel(file);
      setModelMeta(meta);
      onModelLoaded(meta);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Erreur lors de l\'initialisation du modèle ONNX. Assurez-vous que le modèle est au format standard float32.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryLoadServerModel = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Try /models/exp.onnx first, then /exp.onnx
      const meta = await onnxEngine.loadModel('/models/exp.onnx', 'exp.onnx');
      setModelMeta(meta);
      onModelLoaded(meta);
    } catch (err1) {
      try {
        const meta = await onnxEngine.loadModel('/exp.onnx', 'exp.onnx');
        setModelMeta(meta);
        onModelLoaded(meta);
      } catch (err2: any) {
        setErrorMessage(
          'Le fichier exp.onnx n\'est pas encore déposé sur le serveur (/models/exp.onnx). Veuillez cliquer sur "Parcourir" ci-dessous pour sélectionner votre fichier exp.onnx depuis votre ordinateur.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Gestionnaire de Modèle ONNX (19 Parasites)
              </h2>
              <p className="text-xs text-slate-400">
                Diagnostic, chargement et inférence WebAssembly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 text-xs font-semibold shrink-0 bg-slate-50">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Importer / Statut du Modèle
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'classes'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Dictionnaire des 19 Classes (0 - 18)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Guide d'Exportation ONNX
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          {activeTab === 'upload' && (
            <div className="space-y-4">
              
              {/* exp.onnx Quick Badge Banner */}
              <div className="p-3.5 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs font-mono">
                    .ONNX
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                      <span>Modèle détecté : </span>
                      <span className="font-mono text-sky-700 bg-sky-100 px-2 py-0.5 rounded">exp.onnx</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-semibold">19 Classes</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Format WebAssembly optimisé pour le diagnostic microscopique DAP
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTryLoadServerModel}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  title="Vérifie si exp.onnx est présent dans le dossier public/models du serveur"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Vérifier serveur</span>
                </button>
              </div>

              {/* Dropzone */}
              <div className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-xl p-6 bg-sky-50/40 text-center transition-colors">
                <input
                  type="file"
                  id="onnx-file-input"
                  accept=".onnx,.pt,.pth"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="onnx-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    Cliquez ici pour sélectionner votre fichier <span className="font-mono text-sky-600">exp.onnx</span>
                  </span>
                  <span className="text-slate-500 text-[11px] max-w-md">
                    Glissez-déposez ou sélectionnez votre modèle exporté depuis votre ordinateur ou téléphone.
                  </span>
                  <span className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-md shadow-sky-600/20 inline-flex items-center gap-2 mt-1">
                    <UploadCloud className="w-4 h-4" />
                    <span>Choisir mon fichier exp.onnx</span>
                  </span>
                </label>
              </div>

              {isLoading && (
                <div className="p-4 bg-sky-50 text-sky-800 rounded-lg flex items-center gap-3 animate-pulse">
                  <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  <span>Chargement et allocation de la mémoire WebAssembly...</span>
                </div>
              )}

              {/* Error Alert with diagnostic help */}
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Problème de chargement du modèle</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Model Info when loaded */}
              {modelMeta && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Modèle Actif et Prêt pour Inférence</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-mono text-[10px] font-bold">
                      {(modelMeta.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700 bg-white p-3 rounded-lg border border-emerald-100">
                    <div>
                      <span className="text-slate-400">Fichier : </span>
                      <span className="font-semibold">{modelMeta.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Entrée : </span>
                      <span className="font-semibold">{modelMeta.inputNames[0]} [{modelMeta.inputShape.join(', ')}]</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Sortie : </span>
                      <span className="font-semibold">{modelMeta.outputNames[0]}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Classes cibles : </span>
                      <span className="font-semibold text-emerald-700">19 Parasites</span>
                    </div>
                  </div>

                  {onRunTestInference && (
                    <button
                      onClick={() => {
                        onRunTestInference();
                        onClose();
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors text-xs cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تشغيل الكاشف الحقيقي على العينة المعروضة الآن' : 'Exécuter l\'Inférence sur l\'Image Active'}</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          )}

          {activeTab === 'classes' && (
            <div className="space-y-3">
              <p className="text-slate-600 text-[11px]">
                Le système associe chaque indice de sortie de votre modèle (de 0 à 18) aux coordonnées et caractéristiques biologiques suivantes :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {USER_MODEL_CLASSES.map((cls) => {
                  const species = PARASITE_SPECIES[cls.id];
                  return (
                    <div
                      key={cls.index}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5"
                    >
                      <span className="w-6 h-6 rounded bg-sky-100 text-sky-800 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                        {cls.index}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {cls.label}
                        </div>
                        <div className="text-[10px] text-slate-500 italic truncate">
                          {species?.scientificName}
                        </div>
                        <div className="text-[10px] text-sky-600 mt-0.5">
                          Taille : {species?.typicalSize}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px]">
              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-sans">
                <Terminal className="w-4 h-4 text-sky-600" />
                <span>Comment exporter correctement votre modèle en ONNX ?</span>
              </div>
              
              <p className="font-sans text-slate-600 text-xs">
                Si vous avez entraîné votre modèle avec YOLO (Ultralytics) en Python, exportez-le simplement avec la commande :
              </p>

              <div className="p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto text-xs">
                yolo export model=best.pt format=onnx imgsz=640 opset=12
              </div>

              <p className="font-sans text-slate-600 text-xs mt-2">
                Ou via script Python :
              </p>

              <div className="p-3 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto text-xs">
                <span className="text-purple-400">from</span> ultralytics <span className="text-purple-400">import</span> YOLO<br />
                model = YOLO(<span className="text-amber-300">'best.pt'</span>)<br />
                model.export(format=<span className="text-amber-300">'onnx'</span>, imgsz=640, opset=12)
              </div>

              <div className="p-3 bg-sky-100 text-sky-900 rounded-lg font-sans text-xs">
                <strong>Conseil important :</strong> Vérifiez que votre fichier résultant se termine par <code className="font-mono bg-white px-1 rounded">.onnx</code> et que les 19 classes correspondent à l'ordre [0: Hookworm egg ... 18: Cyclospora].
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Runtime: onnxruntime-web (WebAssembly)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
