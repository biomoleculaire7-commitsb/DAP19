import React, { useState, useEffect, useRef } from 'react';
import { 
  AppMode, 
  BoundingBox, 
  Language, 
  PatientData, 
  DiagnosticResult, 
  InfectionSeverity, 
  LabConfig,
  ParasiteCategory
} from '../types/parasitology';
import { translations } from '../translations';
import { SAMPLE_SLIDES, PARASITE_SPECIES, USER_MODEL_CLASSES } from '../data/mockData';
import { onnxEngine, ModelMetadata } from '../services/onnxInference';
import { OnnxModelModal } from './OnnxModelModal';
import { 
  Video, 
  UploadCloud, 
  Play, 
  Pause, 
  UserCheck, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Grid3X3, 
  Crosshair, 
  Sliders, 
  Sparkles, 
  Camera, 
  Maximize2, 
  Info,
  Download,
  RefreshCw,
  PlusCircle,
  Trash2,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  FolderOpen
} from 'lucide-react';

interface AnalysisWorkspaceProps {
  mode: 'live' | 'upload';
  language: Language;
  patient: PatientData;
  onOpenPatientModal: () => void;
  onGenerateReport: (result: DiagnosticResult) => void;
  onSaveToArchive: (result: DiagnosticResult) => void;
  labConfig: LabConfig;
}

export const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({
  mode,
  language,
  patient,
  onOpenPatientModal,
  onGenerateReport,
  onSaveToArchive,
  labConfig,
}) => {
  const t = translations[language];

  // Acquisition mode: 'samples' | 'custom_upload' | 'real_camera' | 'captured_photo'
  const [sourceType, setSourceType] = useState<'samples' | 'custom_upload' | 'real_camera' | 'captured_photo'>(
    mode === 'live' ? 'real_camera' : 'samples'
  );

  // Selected sample slide or custom upload
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [customDetections, setCustomDetections] = useState<BoundingBox[]>([]);

  // Camera devices and streaming state
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelFileInputRef = useRef<HTMLInputElement>(null);

  // ONNX model status & runtime state
  const [uploadedModelName, setUploadedModelName] = useState<string | null>(
    onnxEngine.isReady() ? onnxEngine.getMetadata()?.name || 'exp.onnx' : null
  );
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(onnxEngine.isReady());
  const [isOnnxModalOpen, setIsOnnxModalOpen] = useState<boolean>(false);
  const [isInferenceRunning, setIsInferenceRunning] = useState<boolean>(false);
  const [inferenceStatus, setInferenceStatus] = useState<{
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    duration?: number;
  } | null>(null);
  const activeImageRef = useRef<HTMLImageElement>(null);

  // Optical & display settings (0.25 standard YOLO confidence threshold)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showReticle, setShowReticle] = useState(false);
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [stainFilter, setStainFilter] = useState<'normal' | 'lugol' | 'contrast'>('normal');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // 19 Parasites catalog selection
  const [selectedSpeciesForManual, setSelectedSpeciesForManual] = useState<string>('ascaris');

  // Simulated live motion
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(30);
  const [opticalOffset, setOpticalOffset] = useState({ x: 0, y: 0 });

  // 1. Enumerate and start real camera if in real_camera mode
  useEffect(() => {
    async function getDevices() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setAvailableDevices(videoInputs);
          if (videoInputs.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(videoInputs[0].deviceId);
          }
        }
      } catch (err) {
        console.warn('Unable to enumerate camera devices', err);
      }
    }
    getDevices();
  }, []);

  // Try preloading exp.onnx on mount if hosted on server
  useEffect(() => {
    async function checkPreloadedModel() {
      if (onnxEngine.isReady()) {
        setIsModelLoaded(true);
        setUploadedModelName(onnxEngine.getMetadata()?.name || 'exp.onnx');
        return;
      }
      try {
        const meta = await onnxEngine.loadModel('/models/exp.onnx', 'exp.onnx');
        setUploadedModelName(meta.name);
        setIsModelLoaded(true);
        setInferenceStatus({
          type: 'success',
          message: language === 'ar' ? 'تم تنشيط نموذج exp.onnx بنجاح' : 'Modèle exp.onnx activé avec succès',
        });
      } catch (e1) {
        try {
          const meta = await onnxEngine.loadModel('/exp.onnx', 'exp.onnx');
          setUploadedModelName(meta.name);
          setIsModelLoaded(true);
          setInferenceStatus({
            type: 'success',
            message: language === 'ar' ? 'تم تنشيط نموذج exp.onnx بنجاح' : 'Modèle exp.onnx activé avec succès',
          });
        } catch (e2) {
          // Model will be uploaded directly by user via file picker
          setIsModelLoaded(false);
          setUploadedModelName(null);
        }
      }
    }
    checkPreloadedModel();
  }, []);

  // Manage Camera Stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    if (sourceType === 'real_camera') {
      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      navigator.mediaDevices
        ?.getUserMedia(constraints)
        .then((stream) => {
          currentStream = stream;
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setIsCameraActive(true);
          setCameraError(null);
        })
        .catch((err) => {
          console.warn('Camera access issue:', err);
          setCameraError(t.cameraPermissionDenied);
          setIsCameraActive(false);
        });
    } else {
      // Stop camera if not in camera mode
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setIsCameraActive(false);
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [sourceType, selectedDeviceId]);

  // Capture frame from real camera
  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    setCustomImageSrc(dataUrl);
    setSourceType('captured_photo');
    setCustomDetections([]); // strictly empty until ONNX runs

    if (onnxEngine.isReady()) {
      setInferenceStatus({
        type: 'info',
        message: 'Photo capturée. Cliquez sur "⚡ Lancer Inférence IA" pour analyser avec exp.onnx.',
      });
    } else {
      setInferenceStatus({
        type: 'warning',
        message: 'Photo capturée. Veuillez charger votre modèle exp.onnx pour lancer l\'analyse.',
      });
    }
  };

  // Handle local image file upload (from desktop / mobile)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setCustomImageSrc(src);
        setSourceType('custom_upload');
        setCustomDetections([]); // strictly empty until ONNX runs

        if (onnxEngine.isReady()) {
          setInferenceStatus({
            type: 'info',
            message: `Image ${file.name} chargée. Prête pour l'inférence avec exp.onnx.`,
          });
        } else {
          setInferenceStatus({
            type: 'warning',
            message: `Image ${file.name} chargée. Chargez exp.onnx pour détecter les parasites.`,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle ONNX model file upload directly or via modal
  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.onnx')) {
      if (file.name.toLowerCase().endsWith('.pt') || file.name.toLowerCase().endsWith('.pth')) {
        setInferenceStatus({
          type: 'error',
          message: language === 'ar'
            ? 'تم اكتشاف صيغة PyTorch (.pt)! المتصفح يتطلب صيغة ONNX (.onnx). يرجى تصدير النموذج إلى ONNX.'
            : 'Format PyTorch (.pt) détecté ! Le navigateur requiert le format ONNX (.onnx). Veuillez exporter en ONNX.',
        });
        setIsOnnxModalOpen(true);
        return;
      }
      setInferenceStatus({
        type: 'error',
        message: language === 'ar' 
          ? 'ملف غير صالح: يرجى اختيار ملف النموذج بصيغة .onnx (مثل exp.onnx)'
          : 'Fichier invalide : veuillez sélectionner votre modèle au format .onnx (exp.onnx)',
      });
      return;
    }

    try {
      setInferenceStatus({ 
        type: 'info', 
        message: language === 'ar'
          ? `جاري تحميل النموذج ${file.name} وتخصيص ذاكرة WebAssembly...`
          : `Chargement du modèle ${file.name} en WebAssembly...` 
      });
      const meta = await onnxEngine.loadModel(file);
      setUploadedModelName(meta.name);
      setIsModelLoaded(true);
      setInferenceStatus({
        type: 'success',
        message: language === 'ar'
          ? `تم تفعيل النموذج الحقيقي ${meta.name} (${(meta.sizeBytes / 1024 / 1024).toFixed(1)} MB) بنجاح! جاري فحص الحقل المجهري...`
          : `Modèle réel ${meta.name} (${(meta.sizeBytes / 1024 / 1024).toFixed(1)} MB) activé avec succès ! Analyse en cours...`,
      });

      // Automatically execute inference on current slide/image
      setTimeout(() => {
        handleRunInferenceWithEngine();
      }, 350);
    } catch (err: any) {
      setInferenceStatus({
        type: 'error',
        message: language === 'ar'
          ? `فشل تحميل النموذج ONNX: ${err?.message || 'خطأ داخلي في WebAssembly'}`
          : `Échec du chargement : ${err?.message || 'Erreur interne WebAssembly'}`,
      });
    }
  };

  // Run real in-browser ONNX inference on active image or camera frame
  const handleRunInferenceWithEngine = async () => {
    if (!onnxEngine.isReady()) {
      setIsOnnxModalOpen(true);
      return;
    }

    let targetElement: HTMLImageElement | HTMLVideoElement | null = null;
    if (sourceType === 'real_camera' && videoRef.current) {
      targetElement = videoRef.current;
    } else if (activeImageRef.current) {
      targetElement = activeImageRef.current;
    }

    if (!targetElement) {
      setInferenceStatus({
        type: 'warning',
        message: language === 'ar'
          ? 'يرجى اختيار شريحة عينة أو رفع صورة أو تشغيل الكاميرا قبل تشغيل الكاشف.'
          : 'Veuillez sélectionner ou capturer une image de microscope avant de lancer l\'inférence.',
      });
      return;
    }

    setIsInferenceRunning(true);
    setInferenceStatus({
      type: 'info',
      message: language === 'ar'
        ? 'جاري فحص العينة بواسطة النموذج الحقيقي exp.onnx (19 طفيلي)...'
        : 'Exécution du modèle ONNX réel (19 classes) en WebAssembly...',
    });

    try {
      const result = await onnxEngine.runInference(targetElement, confidenceThreshold, 0.45);
      
      setCustomDetections(result.boxes);
      if (result.boxes.length > 0) {
        setInferenceStatus({
          type: 'success',
          message: language === 'ar'
            ? `اكتمل الفحص (${result.inferenceTimeMs} ms): تم رصد ${result.boxes.length} عنصر/طفيلي. أعلى نسبة ثقة: ${(result.maxScoreFound * 100).toFixed(1)}%.`
            : `Inférence ONNX réussie (${result.inferenceTimeMs} ms) : ${result.boxes.length} élément(s) détecté(s). Score max : ${(result.maxScoreFound * 100).toFixed(1)}%.`,
          duration: result.inferenceTimeMs,
        });
      } else {
        setInferenceStatus({
          type: 'warning',
          message: language === 'ar'
            ? `انتهى فحص exp.onnx (${result.inferenceTimeMs} ms): لم يتم رصد أي طفيليات أعلى من عتبة ${Math.round(confidenceThreshold * 100)}% (أعلى احتمال مسجل في الحقل: ${(result.maxScoreFound * 100).toFixed(1)}%). يمكنك خفض عتبة الدقة لرؤية العناصر الأضعف.`
            : `Inférence ONNX terminée (${result.inferenceTimeMs} ms) : aucun élément au seuil de ${Math.round(confidenceThreshold * 100)}% (Score max trouvé : ${(result.maxScoreFound * 100).toFixed(1)}%). Baissez le seuil de confiance si nécessaire.`,
          duration: result.inferenceTimeMs,
        });
      }
    } catch (err: any) {
      console.error('Inference error:', err);
      setInferenceStatus({
        type: 'error',
        message: language === 'ar'
          ? `خطأ أثناء تنفيذ نموذج ONNX: ${err?.message || 'عدم توافق في أبعاد التنسور'}`
          : `Erreur d'inférence ONNX : ${err?.message || 'Incompatibilité de tenseur'}`,
      });
    } finally {
      setIsInferenceRunning(false);
    }
  };

  const handleRunInference = () => handleRunInferenceWithEngine();

  const removeDetection = (boxId: string) => {
    setCustomDetections((prev) => prev.filter((b) => b.id !== boxId));
    if (selectedBoxId === boxId) setSelectedBoxId(null);
  };

  // Active image & detections: ONLY real ONNX detections!
  const currentSlide = SAMPLE_SLIDES[selectedSlideIndex];
  const activeImageSrc = (sourceType === 'custom_upload' || sourceType === 'captured_photo') 
    ? customImageSrc || currentSlide.imageSrc 
    : currentSlide.imageSrc;

  // Real ONNX detections exclusively
  const visibleDetections = customDetections.filter(
    (box) => box.confidence >= confidenceThreshold
  );

  // Species counts
  const speciesCounts: Record<string, number> = {};
  visibleDetections.forEach((d) => {
    speciesCounts[d.speciesScientific] = (speciesCounts[d.speciesScientific] || 0) + 1;
  });

  const totalCount = visibleDetections.length;
  let severity: InfectionSeverity = 'negative';
  if (totalCount === 0) severity = 'negative';
  else if (totalCount <= 2) severity = 'light';
  else if (totalCount <= 5) severity = 'moderate';
  else severity = 'heavy';

  // Construct current diagnostic result
  const buildCurrentResult = (): DiagnosticResult => {
    return {
      id: `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patient,
      imageSrc: activeImageSrc,
      detections: visibleDetections,
      detectionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalParasitesFound: totalCount,
      speciesCounts,
      primaryFinding:
        totalCount === 0
          ? t.severityNegative
          : `${Object.keys(speciesCounts).join(' + ')} (${totalCount} ${
              language === 'fr' ? 'éléments répérés' : language === 'ar' ? 'عناصر مرصودة' : 'elements detected'
            })`,
      infectionSeverity: severity,
      estimatedEPG: totalCount * 12500,
      status: 'validated',
      biologistNotes:
        totalCount > 0
          ? `Présence de ${totalCount} éléments de ${Object.keys(speciesCounts).join(', ')}. Analyse 19 parasites validée.`
          : 'Absence d\'éléments parasitaires après examen direct.',
      validatedBy: labConfig.defaultBiologist,
      validationTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
  };

  const selectedBox = visibleDetections.find((b) => b.id === selectedBoxId);
  const selectedSpeciesInfo = selectedBox 
    ? PARASITE_SPECIES[selectedBox.speciesId] 
    : PARASITE_SPECIES[selectedSpeciesForManual];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-900 text-slate-100">
      
      {/* 1. Top Mode Selector Bar (Real Camera / Upload Photo / Preset Slides) */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-xs shrink-0 select-none overflow-x-auto gap-3">
        
        {/* Source Switcher Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Button 1: Real Camera / Capture Photo */}
          <button
            onClick={() => {
              setSourceType('real_camera');
              setSelectedBoxId(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              sourceType === 'real_camera'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-1 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Camera className="w-4 h-4 text-white" />
            <span>{t.cameraCaptureBtn}</span>
            {isCameraActive && <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />}
          </button>

          {/* Button 2: Upload File / Picture */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              sourceType === 'custom_upload'
                ? 'bg-sky-600 text-white shadow-md ring-1 ring-sky-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-sky-400" />
            <span>{customImageSrc && sourceType === 'custom_upload' ? 'Photo importée' : t.browseFiles}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Button 3: Preset Reference Slides */}
          <div className="hidden md:flex items-center gap-1 pl-2 border-l border-slate-800">
            {SAMPLE_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => {
                  setSourceType('samples');
                  setSelectedSlideIndex(index);
                  setSelectedBoxId(null);
                  setCustomDetections([]); // strictly 0 detections until real ONNX runs
                  if (onnxEngine.isReady()) {
                    setTimeout(() => {
                      handleRunInferenceWithEngine();
                    }, 200);
                  }
                }}
                className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-colors ${
                  sourceType === 'samples' && selectedSlideIndex === index
                    ? 'bg-slate-700 text-white font-medium border border-slate-600'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {slide.title[language]?.split(':')[1] || slide.title.fr.split(':')[1]}
              </button>
            ))}
          </div>

        </div>

        {/* ONNX Model Status & 19-Parasite Execution Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Primary Action: Run ONNX Model Inference */}
          <button
            onClick={handleRunInference}
            disabled={isInferenceRunning}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-xs transition-all cursor-pointer ${
              isInferenceRunning
                ? 'bg-sky-700 text-white cursor-wait opacity-80'
                : isModelLoaded
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950 ring-1 ring-emerald-400'
                : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-sky-950 ring-1 ring-sky-400'
            }`}
            title={language === 'ar' ? 'تشغيل فحص الذكاء الاصطناعي ONNX' : "Exécuter le modèle ONNX (19 classes) sur l'image affichée"}
          >
            {isInferenceRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>
              {isInferenceRunning
                ? (language === 'ar' ? 'جاري الفحص...' : 'Inférence...')
                : (language === 'ar' ? '⚡ تشغيل الكاشف الحقيقي ONNX' : '⚡ Lancer Inférence IA')}
            </span>
          </button>

          {/* ONNX Model Status Trigger */}
          <button
            onClick={() => setIsOnnxModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              isModelLoaded
                ? 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300 hover:bg-emerald-900'
                : 'bg-amber-950/80 border-amber-600/80 text-amber-300 hover:bg-amber-900'
            }`}
            title={language === 'ar' ? 'إدارة ومعاينة نموذج ONNX' : 'Gérer le modèle ONNX (chargement, diagnostic, classes 0 à 18)'}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-mono">{uploadedModelName || 'exp.onnx'}</span>
            {isModelLoaded ? (
              <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-bold">
                {language === 'ar' ? 'نشط' : 'Actif'}
              </span>
            ) : (
              <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-bold">
                {language === 'ar' ? 'غير محمّل' : 'Non chargé'}
              </span>
            )}
          </button>

          {/* Direct File Picker for exp.onnx */}
          <button
            onClick={() => modelFileInputRef.current?.click()}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
              !isModelLoaded
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                : 'bg-sky-950/80 border border-sky-700/80 text-sky-300 hover:bg-sky-900'
            }`}
            title={language === 'ar' ? 'اختر ملف exp.onnx من جهازك' : 'Sélectionner directement votre fichier exp.onnx'}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>
              {isModelLoaded
                ? (language === 'ar' ? 'تغيير exp.onnx' : 'Changer exp.onnx')
                : (language === 'ar' ? '📥 رفع exp.onnx' : '📥 Charger exp.onnx')}
            </span>
          </button>

          {/* Hidden File Input for direct ONNX upload */}
          <input
            type="file"
            ref={modelFileInputRef}
            onChange={handleModelUpload}
            accept=".onnx,.pt,.pth"
            className="hidden"
          />

          {/* Camera device picker if multiple available */}
          {availableDevices.length > 1 && sourceType === 'real_camera' && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-1 focus:outline-none"
            >
              {availableDevices.map((dev, idx) => (
                <option key={dev.deviceId || idx} value={dev.deviceId}>
                  {dev.label || `Caméra ${idx + 1}`}
                </option>
              ))}
            </select>
          )}

        </div>

      </div>

      {/* Real-time Status / Diagnostic Banner */}
      {inferenceStatus && (
        <div
          className={`px-4 py-2 flex items-center justify-between text-xs border-b shrink-0 animate-in fade-in transition-all ${
            inferenceStatus.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : inferenceStatus.type === 'warning'
              ? 'bg-amber-950 text-amber-200 border-amber-800'
              : inferenceStatus.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-sky-950 text-sky-200 border-sky-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {inferenceStatus.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {inferenceStatus.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {inferenceStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {inferenceStatus.type === 'info' && <RefreshCw className="w-4 h-4 text-sky-400 animate-spin shrink-0" />}
            <span className="font-medium">{inferenceStatus.message}</span>
          </div>
          <div className="flex items-center gap-3">
            {inferenceStatus.type === 'error' && (
              <button
                onClick={() => setIsOnnxModalOpen(true)}
                className="underline font-bold text-sky-300 hover:text-white"
              >
                Résoudre / Guide d'Export
              </button>
            )}
            <button
              onClick={() => setInferenceStatus(null)}
              className="p-1 hover:text-white rounded"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Notice Banner when exp.onnx is not yet loaded */}
      {!isModelLoaded && (
        <div className="bg-amber-950/90 border-b border-amber-600/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 shadow-inner">
          <div className="flex items-center gap-2.5 text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <span className="font-bold text-amber-300">
                {language === 'ar' 
                  ? 'تنبيه سريري: تم إلغاء كافة الكواشف التجريبية والمحاكاة لضمان دقة التحليل.'
                  : 'Alerte Clinique : Toutes les détections simulées ont été purgées.'}
              </span>
              <span className="block text-[11px] text-amber-200/80 mt-0.5">
                {language === 'ar'
                  ? 'يرجى رفع ملف النموذج الحقيقي (exp.onnx) لتشغيل الكاشف بدقة على الـ 19 فئة طفيلية.'
                  : 'Veuillez charger votre modèle réel (exp.onnx) pour lancer la détection sur les 19 classes.'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => modelFileInputRef.current?.click()}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95 text-xs"
            >
              <UploadCloud className="w-4 h-4 text-slate-950" />
              <span>{language === 'ar' ? '📥 رفع ملف exp.onnx الآن' : '📥 Charger exp.onnx'}</span>
            </button>
            <button
              onClick={() => setIsOnnxModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-amber-700/50 text-xs cursor-pointer"
            >
              {language === 'ar' ? 'فحص التنسور' : 'Diagnostic'}
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Center Split: Viewport (Left) + Live Metrics Panel (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* VIEWPORT STAGE */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden p-2">
          
          {/* Real Camera Live Streaming Mode */}
          {sourceType === 'real_camera' ? (
            <div className="relative max-w-full max-h-full rounded-lg overflow-hidden border border-emerald-500/40 shadow-2xl flex flex-col items-center justify-center">
              
              {cameraError ? (
                <div className="p-8 text-center max-w-md bg-slate-900/90 rounded-xl border border-slate-700 m-4">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white mb-2">{cameraError}</p>
                  <p className="text-xs text-slate-400 mb-4">
                    Assurez-vous qu'une webcam ou caméra de microscope USB C-Mount est branchée et autorisée.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                  >
                    {t.browseFiles}
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="max-h-[70vh] w-auto object-contain block bg-black"
                  />

                  {/* Camera Live Floating Overlay Bar */}
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/50 flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-emerald-300 font-mono">
                      {t.cameraLiveFeed} (Microscope USB C-Mount)
                    </span>
                  </div>

                  {/* Primary Snapshot Capture Button in Center Bottom */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    <button
                      onClick={capturePhotoFromCamera}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm rounded-full shadow-2xl shadow-emerald-500/50 flex items-center gap-2.5 border-2 border-white transition-all"
                    >
                      <Camera className="w-5 h-5" />
                      <span>{t.cameraCaptureBtn}</span>
                    </button>
                  </div>
                </>
              )}

            </div>
          ) : (
            
            /* Still Image Viewport with Bounding Boxes (Captured, Uploaded, or Reference Sample) */
            <div 
              className="relative max-w-full max-h-full rounded-lg overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center select-none"
              style={{
                filter:
                  stainFilter === 'lugol'
                    ? 'sepia(0.6) saturate(1.4) hue-rotate(-10deg)'
                    : stainFilter === 'contrast'
                    ? 'contrast(1.4) brightness(0.95)'
                    : 'none',
                transform: `scale(${zoomLevel}) translate(${opticalOffset.x}px, ${opticalOffset.y}px)`,
                transition: 'transform 0.15s ease-out',
              }}
            >
              {/* Image element with DOM ref for tensor preprocessing */}
              <img
                ref={activeImageRef}
                src={activeImageSrc}
                alt="Microscope field"
                className="max-h-[70vh] w-auto object-contain block pointer-events-none"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />

              {/* Micrometric Grid Reticle */}
              {showReticle && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #0284c7 1px, transparent 1px),
                      linear-gradient(to bottom, #0284c7 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                  }}
                >
                  <div className="absolute bottom-2 left-2 text-[10px] text-sky-400 font-mono bg-black/60 px-1 rounded">
                    Grid pitch: 10 µm / div
                  </div>
                </div>
              )}

              {/* Crosshair Overlay */}
              {showCrosshair && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-full h-px bg-rose-500/40" />
                  <div className="h-full w-px bg-rose-500/40 absolute" />
                  <div className="w-8 h-8 rounded-full border border-rose-500/60 absolute" />
                </div>
              )}

              {/* Bounding Boxes */}
              {showBoxes &&
                visibleDetections.map((box) => {
                  const isSelected = selectedBoxId === box.id;
                  return (
                    <div
                      key={box.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBoxId(box.id);
                      }}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.width}%`,
                        height: `${box.height}%`,
                        borderColor: box.color,
                      }}
                      className={`absolute cursor-pointer border-2 rounded transition-all duration-150 ${
                        isSelected
                          ? 'ring-4 ring-white/90 shadow-lg shadow-sky-500/50'
                          : 'hover:border-white'
                      }`}
                    >
                      {/* Floating Tag */}
                      <div
                        style={{ backgroundColor: box.color }}
                        className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-md flex items-center gap-1 whitespace-nowrap pointer-events-auto"
                      >
                        <span>{box.speciesScientific}</span>
                        <span className="font-mono opacity-90">
                          {Math.round(box.confidence * 100)}%
                        </span>
                      </div>

                      {/* Dimensions Pill at Bottom */}
                      <div className="absolute -bottom-5 left-0 px-1 py-0.2 bg-black/80 rounded text-[9px] font-mono text-slate-200 pointer-events-none whitespace-nowrap">
                        {box.dimensionsUm}
                      </div>
                    </div>
                  );
                })}

              {/* Scale bar */}
              <div className="absolute bottom-3 right-3 bg-black/75 border border-slate-700/80 rounded px-2 py-1 flex items-center gap-2 text-[10px] font-mono text-slate-200 pointer-events-none">
                <div className="w-12 h-1 bg-white rounded-xs" />
                <span>50 µm</span>
              </div>
            </div>
          )}

          {/* Floating Retake Button if in Captured Photo Mode */}
          {sourceType === 'captured_photo' && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <button
                onClick={() => setSourceType('real_camera')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.retakePhoto}</span>
              </button>
            </div>
          )}

          {/* Floating Viewport HUD Controls */}
          {sourceType !== 'real_camera' && (
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 shadow-lg">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="w-full h-px bg-slate-700 my-0.5" />
              <button
                onClick={() => setShowBoxes(!showBoxes)}
                className={`p-1.5 rounded transition-colors ${
                  showBoxes ? 'text-sky-400 bg-sky-950/60' : 'text-slate-400 hover:text-white'
                }`}
                title="Toggle AI Bounding Boxes"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowReticle(!showReticle)}
                className={`p-1.5 rounded transition-colors ${
                  showReticle ? 'text-sky-400 bg-sky-950/60' : 'text-slate-400 hover:text-white'
                }`}
                title={t.reticleGrid}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowCrosshair(!showCrosshair)}
                className={`p-1.5 rounded transition-colors ${
                  showCrosshair ? 'text-rose-400 bg-rose-950/60' : 'text-slate-400 hover:text-white'
                }`}
                title={t.crosshair}
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Floating Staining Filter Segmented Control */}
          {sourceType !== 'real_camera' && (
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 flex items-center gap-1 text-xs">
              <button
                onClick={() => setStainFilter('normal')}
                className={`px-2 py-1 rounded transition-colors ${
                  stainFilter === 'normal' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.stainNormal}
              </button>
              <button
                onClick={() => setStainFilter('lugol')}
                className={`px-2 py-1 rounded transition-colors ${
                  stainFilter === 'lugol' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.stainLugol}
              </button>
              <button
                onClick={() => setStainFilter('contrast')}
                className={`px-2 py-1 rounded transition-colors ${
                  stainFilter === 'contrast' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.stainContrast}
              </button>
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR: 19 PARASITES PANEL & LIVE METRICS */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          
          {/* Section A: Active Parasites Detected in Field */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                {t.detectedParasites}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-mono font-bold">
                {visibleDetections.length} {visibleDetections.length === 1 ? 'OVA' : 'OVA / CYSTS'}
              </span>
            </div>

            {/* Confidence Slider with Real-Time Update */}
            <div className="mt-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{t.confidenceSlider}</span>
                <span className="font-mono font-bold text-sky-400">
                  {Math.round(confidenceThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.01"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Section B: 19 Parasites Reference Dictionary for ONNX Model */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/70 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300">
                {t.panel19Parasites}
              </span>
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded font-mono font-semibold">
                Classes 0 à 18
              </span>
            </div>

            {/* Select among 19 Parasites dropdown mapped 0 to 18 */}
            <select
              value={selectedSpeciesForManual}
              onChange={(e) => setSelectedSpeciesForManual(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-sky-500 font-mono"
            >
              {USER_MODEL_CLASSES.map((cls) => {
                const p = PARASITE_SPECIES[cls.id];
                return (
                  <option key={cls.id} value={cls.id}>
                    [{cls.index}] {cls.label} {p ? `· ${p.scientificName}` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Section C: Clinical Severity & Estimated EPG */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
              {t.infectionLoad}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`text-base font-bold px-2 py-1 rounded inline-block ${
                    severity === 'heavy'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : severity === 'moderate'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : severity === 'light'
                      ? 'bg-sky-950 text-sky-300 border border-sky-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {severity === 'heavy' && t.severityHeavy}
                  {severity === 'moderate' && t.severityModerate}
                  {severity === 'light' && t.severityLight}
                  {severity === 'negative' && t.severityNegative}
                </span>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-slate-400">{t.estimatedEPG}</div>
                <div className="text-base font-mono font-bold text-slate-100">
                  {totalCount > 0 ? (totalCount * 12500).toLocaleString() : '0'} <span className="text-xs font-normal text-slate-400">EPG</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section D: Detected Items List */}
          <div className="flex-1 p-4 space-y-2.5 overflow-y-auto">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              {t.currentField}
            </div>

            {visibleDetections.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/50 rounded-lg border border-slate-800">
                {t.noParasitesDetected}
              </div>
            ) : (
              visibleDetections.map((box) => {
                const isSelected = selectedBoxId === box.id;
                return (
                  <div
                    key={box.id}
                    onClick={() => setSelectedBoxId(box.id)}
                    style={{ borderLeftColor: box.color }}
                    className={`p-3 rounded-lg border-l-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-y border-r border-slate-700 shadow-md'
                        : 'bg-slate-950/60 border-y border-r border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">
                        {box.speciesScientific}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sky-400">
                          {Math.round(box.confidence * 100)}%
                        </span>
                        {/* Delete button if custom annotation */}
                        {(sourceType === 'custom_upload' || sourceType === 'captured_photo') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDetection(box.id);
                            }}
                            className="text-slate-500 hover:text-rose-400"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 mb-1.5">
                      {box.stage}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{t.eggDimensions}: {box.dimensionsUm}</span>
                      <span className="text-sky-500 hover:underline">
                        {language === 'fr' ? 'Localiser' : language === 'ar' ? 'تحديد' : 'Highlight'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Species Monograph & WHO Clinical Reference */}
            {selectedSpeciesInfo && (
              <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-2">
                  <Info className="w-3.5 h-3.5" />
                  <span>{t.speciesDetails} : {selectedSpeciesInfo.scientificName}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                  {selectedSpeciesInfo.description[language] || selectedSpeciesInfo.description.fr}
                </p>
                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                  <span className="font-semibold text-slate-200">{t.suggestedTherapy} </span>
                  {selectedSpeciesInfo.recommendedTreatment[language] || selectedSpeciesInfo.recommendedTreatment.fr}
                </div>
              </div>
            )}
          </div>

          {/* Quick Species Breakdown Table */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-semibold">
              <span>{t.parasiteNameCol}</span>
              <span>{t.countCol}</span>
            </div>
            {Object.entries(speciesCounts).map(([species, count]) => (
              <div key={species} className="flex items-center justify-between py-0.5 text-slate-200">
                <span className="italic truncate">{species}</span>
                <span className="font-mono font-bold text-sky-400">{count}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* 3. Bottom Action Panel */}
      <div className="h-16 bg-slate-950 border-t border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
        
        {/* Left: Camera / Source Indicator */}
        <div className="flex items-center gap-2">
          {sourceType === 'real_camera' ? (
            <button
              onClick={capturePhotoFromCamera}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>{t.cameraCaptureBtn}</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-sky-400" />
              <span>{sourceType === 'captured_photo' ? 'Photo capturée par caméra' : 'Objectif 40x plan-achromatique'}</span>
            </div>
          )}
        </div>

        {/* Center: Current Patient Badge */}
        <div 
          onClick={onOpenPatientModal}
          className="cursor-pointer hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors text-xs"
        >
          <div className="w-6 h-6 rounded-full bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{patient.fullName}</span>
              <span className="font-mono text-[10px] text-slate-400">{patient.fileNumber}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {patient.sampleId} · {patient.sampleType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right: Export Report Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPatientModal}
            className="sm:hidden p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
            title={t.actionEditPatient}
          >
            <UserCheck className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const res = buildCurrentResult();
              onSaveToArchive(res);
            }}
            className="hidden md:flex px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t.actionSaveArchive}</span>
          </button>

          <button
            onClick={() => {
              const res = buildCurrentResult();
              onGenerateReport(res);
            }}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:shadow-sky-500/25"
          >
            <FileText className="w-4 h-4" />
            <span>{t.actionGenerateReport}</span>
          </button>
        </div>

      </div>

      {/* ONNX Model Management & Diagnostic Modal */}
      <OnnxModelModal
        isOpen={isOnnxModalOpen}
        onClose={() => setIsOnnxModalOpen(false)}
        language={language}
        onModelLoaded={(meta) => {
          setIsModelLoaded(true);
          setUploadedModelName(meta.name);
          setInferenceStatus({
            type: 'success',
            message: `Modèle ${meta.name} prêt pour l'inférence. Cliquez sur "⚡ Lancer Inférence IA".`,
          });
        }}
        onRunTestInference={handleRunInference}
      />

    </div>
  );
};
