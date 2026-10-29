import React, { useState } from 'react';
import { unifiedModelService, ActiveModelInfo } from '../services/unifiedModelService';
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
  Play, 
  Link,
  Sparkles
} from 'lucide-react';

interface OnnxModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onModelLoaded: (meta: any) => void;
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
  const [modelInfo, setModelInfo] = useState<ActiveModelInfo | null>(unifiedModelService.getModelInfo());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'classes' | 'guide'>('upload');
  const [modelUrl, setModelUrl] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(null);

    const lower = file.name.toLowerCase();
    const isSupported = lower.endsWith('.onnx') || lower.endsWith('.tflite') || lower.endsWith('.lite');

    if (!isSupported) {
      if (lower.endsWith('.pt') || lower.endsWith('.pth')) {
        setErrorMessage(
          language === 'ar'
            ? 'تنبيه: ملف PyTorch (.pt) غير مدعوم مباشرة في المتصفح. يرجى تصديره إلى ONNX (.onnx) أو TFLite (.tflite).'
            : 'Attention : Vous avez sélectionné un fichier PyTorch (.pt/.pth). Veuillez exporter en ONNX (.onnx) ou TFLite (.tflite).'
        );
      } else {
        setErrorMessage(
          language === 'ar'
            ? 'يرجى اختيار ملف نموذج بصيغة .onnx أو .tflite'
            : 'Veuillez sélectionner un fichier avec l\'extension .onnx ou .tflite.'
        );
      }
      setIsLoading(false);
      return;
    }

    try {
      const info = await unifiedModelService.loadModel(file);
      setModelInfo(info);
      onModelLoaded(info);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          (language === 'ar' ? 'فشل تحميل النموذج' : 'Erreur lors de l\'initialisation du modèle.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromUrl = async () => {
    if (!modelUrl.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const info = await unifiedModelService.loadModel(modelUrl.trim());
      setModelInfo(info);
      onModelLoaded(info);
    } catch (err: any) {
      setErrorMessage(
        language === 'ar'
          ? `تعذر تنزيل النموذج من الرابط: ${err?.message || 'تأكد من صحة الرابط وسماحه بالوصول المباشر CORS'}`
          : `Impossible de charger le modèle depuis l'URL : ${err?.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryLoadServerModel = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const candidates = ['/models/exp.onnx', '/exp.onnx', '/models/model.tflite', '/model.tflite'];
    for (const path of candidates) {
      try {
        const info = await unifiedModelService.loadModel(path);
        setModelInfo(info);
        onModelLoaded(info);
        setIsLoading(false);
        return;
      } catch (e) {
        // try next
      }
    }
    setErrorMessage(
      language === 'ar'
        ? 'لم يتم العثور على ملف exp.onnx أو model.tflite في مسار السيرفر. يرجى استخدام زر اختيار الملف من جهازك أدناه.'
        : 'Aucun modèle exp.onnx ou model.tflite trouvé sur le serveur. Veuillez sélectionner votre fichier depuis votre ordinateur.'
    );
    setIsLoading(false);
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
                {language === 'ar' ? 'إدارة نماذج الذكاء الاصطناعي (ONNX و TFLite)' : 'Gestionnaire de Modèle IA (ONNX & TFLite)'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'تشخيص، تحميل، وتنسيق الـ 19 فئة طفيلية' : 'Diagnostic, chargement et inférence WebAssembly / MediaPipe'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 text-xs font-semibold shrink-0 bg-slate-50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'رفع ملف (ONNX / TFLite)' : 'Importer un fichier'}
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'url'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'تنزيل عبر رابط URL' : 'Charger par URL'}
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'classes'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'قاموس الـ 19 طفيلي (0 - 18)' : 'Classes cibles (19 parasites)'}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'دليل التصدير (ONNX / TFLite)' : 'Guide d\'Exportation'}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          {activeTab === 'upload' && (
            <div className="space-y-4">
              
              {/* Formats Banner */}
              <div className="p-3.5 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
                    <span className="bg-sky-600 text-white px-2 py-1 rounded">.ONNX</span>
                    <span className="text-slate-400">+</span>
                    <span className="bg-amber-600 text-white px-2 py-1 rounded">.TFLITE</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">
                      {language === 'ar' ? 'صيغ الويب المدعومة للتشخيص الفوري' : 'Formats Web Haute Performance'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {language === 'ar' ? 'يدعم نماذج YOLO المصدرة إلى ONNX أو TensorFlow Lite' : 'Prend en charge YOLO exporté en ONNX ou TFLite'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTryLoadServerModel}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>{language === 'ar' ? 'فحص السيرفر' : 'Vérifier serveur'}</span>
                </button>
              </div>

              {/* Dropzone */}
              <div className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-xl p-6 bg-sky-50/40 text-center transition-colors">
                <input
                  type="file"
                  id="model-file-input"
                  accept=".onnx,.tflite,.lite,.bin,.pt,.pth"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="model-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {language === 'ar' ? (
                      <>اختر ملف نموذجك <span className="font-mono text-sky-600">exp.onnx</span> أو <span className="font-mono text-amber-600">model.tflite</span></>
                    ) : (
                      <>Sélectionnez votre fichier <span className="font-mono text-sky-600">exp.onnx</span> ou <span className="font-mono text-amber-600">model.tflite</span></>
                    )}
                  </span>
                  <span className="text-slate-500 text-[11px] max-w-md">
                    {language === 'ar' 
                      ? 'اسحب الملف وأفلته هنا أو اضغط للاستعراض من جهاز الحاسوب أو الهاتف'
                      : 'Glissez-déposez ou sélectionnez votre modèle exporté depuis votre appareil.'}
                  </span>
                  <span className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-md shadow-sky-600/20 inline-flex items-center gap-2 mt-1">
                    <UploadCloud className="w-4 h-4" />
                    <span>{language === 'ar' ? 'اختيار ملف النموذج الآن' : 'Choisir mon fichier'}</span>
                  </span>
                </label>
              </div>

              {isLoading && (
                <div className="p-4 bg-sky-50 text-sky-800 rounded-lg flex items-center gap-3 animate-pulse">
                  <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  <span>{language === 'ar' ? 'جاري تهيئة وتخصيص الذاكرة للنموذج...' : 'Chargement et allocation de la mémoire...'}</span>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{language === 'ar' ? 'تنبيه حول ملف النموذج' : 'Problème de chargement'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Active Model Info */}
              {modelInfo && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'ar' ? 'النموذج نشط وجاهز للفحص السريري' : 'Modèle Actif et Prêt pour Inférence'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-mono text-[10px] font-bold uppercase">
                        {modelInfo.format}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-mono text-[10px] font-bold">
                        {(modelInfo.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700 bg-white p-3 rounded-lg border border-emerald-100">
                    <div>
                      <span className="text-slate-400">{language === 'ar' ? 'اسم الملف : ' : 'Fichier : '}</span>
                      <span className="font-semibold">{modelInfo.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{language === 'ar' ? 'الصيغة : ' : 'Format : '}</span>
                      <span className="font-semibold uppercase">{modelInfo.format}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{language === 'ar' ? 'الفئات : ' : 'Classes : '}</span>
                      <span className="font-semibold text-emerald-700">19 Parasites (0..18)</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{language === 'ar' ? 'الحالة : ' : 'Statut : '}</span>
                      <span className="font-semibold text-emerald-600">{language === 'ar' ? 'جاهز' : 'Opérationnel'}</span>
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

          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Link className="w-4 h-4 text-sky-600" />
                  <span>{language === 'ar' ? 'تنزيل النموذج من رابط مباشر (Direct Link)' : 'Chargement depuis une URL distante'}</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  {language === 'ar'
                    ? 'إذا كان لديك ملف exp.onnx أو model.tflite مرفوعاً على رابط مباشر أو Hugging Face أو Google Drive (رابط مباشر)، ضعه هنا:'
                    : 'Collez l\'URL directe vers votre fichier .onnx ou .tflite pour le charger automatiquement :'}
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={modelUrl}
                    onChange={(e) => setModelUrl(e.target.value)}
                    placeholder="https://example.com/models/exp.onnx"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-sky-500"
                  />
                  <button
                    onClick={handleLoadFromUrl}
                    disabled={isLoading || !modelUrl.trim()}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs cursor-pointer whitespace-nowrap"
                  >
                    {language === 'ar' ? 'تنزيل وتفعيل' : 'Télécharger'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="space-y-3">
              <p className="text-slate-600 text-[11px]">
                {language === 'ar'
                  ? 'يقوم النظام بربط مخرجات النموذج للـ 19 فئة طفيلية بالترتيب التالي:'
                  : 'Le système associe chaque indice de sortie de votre modèle (de 0 à 18) aux coordonnées et caractéristiques biologiques suivantes :'}
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
                <span>{language === 'ar' ? 'كيفية تصدير النموذج إلى ONNX أو TFLite من بايثون' : 'Exportation depuis Ultralytics YOLO'}</span>
              </div>
              
              <div className="space-y-2 font-sans text-slate-700 text-xs">
                <p><strong>1. لتصدير النموذج إلى صيغة TFLite (.tflite):</strong></p>
                <div className="p-3 bg-slate-900 text-amber-400 font-mono rounded-lg overflow-x-auto text-xs">
                  yolo export model=best.pt format=tflite imgsz=640
                </div>

                <p className="mt-3"><strong>2. لتصدير النموذج إلى صيغة ONNX (.onnx):</strong></p>
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono rounded-lg overflow-x-auto text-xs">
                  yolo export model=best.pt format=onnx imgsz=640 opset=12
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Runtime: WebAssembly (ONNX Runtime Web + MediaPipe TFLite)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Fermer'}
          </button>
        </div>

      </div>
    </div>
  );
};
