export type Language = 'fr' | 'en' | 'ar';

export type AppMode = 'dashboard' | 'live' | 'upload' | 'patients' | 'settings';

export type InfectionSeverity = 'negative' | 'light' | 'moderate' | 'heavy';

export interface BoundingBox {
  id: string;
  classIndex: number; // 0 to 18 matching user ONNX model
  speciesId: string;
  speciesName: string;
  speciesScientific: string;
  stage: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  dimensionsUm: string; // e.g. "62 x 45 µm"
  color: string;
}

export type ParasiteCategory = 'helminth' | 'protozoa' | 'flagellate' | 'coccidia' | 'ciliate' | 'amoeba' | 'trematode' | 'cestode' | 'nematode';

export interface ParasiteSpeciesInfo {
  classIndex: number; // 0 to 18
  id: string;
  modelLabel: string; // Exact user model label e.g. "Hookworm egg"
  commonName: { fr: string; en: string; ar: string };
  scientificName: string;
  category: ParasiteCategory;
  typicalSize: string;
  shape: string;
  color: string;
  description: { fr: string; en: string; ar: string };
  whoThresholds: {
    light: string;
    moderate: string;
    heavy: string;
  };
  recommendedTreatment: { fr: string; en: string; ar: string };
}

export interface PatientData {
  id: string;
  fileNumber: string; // IPP
  fullName: string;
  age: number;
  gender: 'M' | 'F';
  sampleId: string;
  sampleType: 'stool' | 'urine' | 'blood' | 'aspirate';
  collectionDate: string;
  examinationDate: string;
  department: string;
  prescribingDoctor: string;
  clinicalNotes?: string;
}

export interface DiagnosticResult {
  id: string;
  patient: PatientData;
  imageSrc: string;
  detections: BoundingBox[];
  detectionDate: string;
  totalParasitesFound: number;
  speciesCounts: Record<string, number>;
  primaryFinding: string;
  infectionSeverity: InfectionSeverity;
  estimatedEPG: number; // Eggs per gram
  status: 'validated' | 'pending' | 'flagged';
  biologistNotes: string;
  validatedBy: string;
  validationTimestamp?: string;
}

export interface LabConfig {
  centerName: string;
  hospitalName: string;
  departmentName: string;
  address: string;
  phone: string;
  email: string;
  accreditationNumber: string; // e.g. "ISO 15189 - LAB-4892"
  defaultBiologist: string;
  defaultRole: string;
  confidenceThreshold: number; // 0.50 - 0.99
  iouThreshold: number;
  selectedModel: string;
  activeCameraId: string;
}
