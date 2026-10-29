import { onnxEngine, ModelMetadata, InferenceResult } from './onnxInference';
import { tfliteEngine, TfliteMetadata, TfliteInferenceResult } from './tfliteInference';
import { BoundingBox } from '../types/parasitology';

export type SupportedModelFormat = 'onnx' | 'tflite';

export interface ActiveModelInfo {
  name: string;
  format: SupportedModelFormat;
  sizeBytes: number;
  isLoaded: boolean;
  statusMessage: string;
}

class UnifiedModelService {
  private activeFormat: SupportedModelFormat = 'onnx';

  public getActiveFormat(): SupportedModelFormat {
    return this.activeFormat;
  }

  public isReady(): boolean {
    if (this.activeFormat === 'tflite') {
      return tfliteEngine.isReady();
    }
    return onnxEngine.isReady();
  }

  public getModelInfo(): ActiveModelInfo | null {
    if (this.activeFormat === 'tflite' && tfliteEngine.isReady()) {
      const meta = tfliteEngine.getMetadata();
      if (!meta) return null;
      return {
        name: meta.name,
        format: 'tflite',
        sizeBytes: meta.sizeBytes,
        isLoaded: meta.isLoaded,
        statusMessage: meta.statusMessage || `Modèle TFLite ${meta.name} actif`,
      };
    }

    if (onnxEngine.isReady()) {
      const meta = onnxEngine.getMetadata();
      if (!meta) return null;
      return {
        name: meta.name,
        format: 'onnx',
        sizeBytes: meta.sizeBytes,
        isLoaded: meta.isLoaded,
        statusMessage: meta.statusMessage || `Modèle ONNX ${meta.name} actif`,
      };
    }

    return null;
  }

  /**
   * Universal loader supporting .onnx and .tflite files or URLs
   */
  public async loadModel(
    source: File | ArrayBuffer | Uint8Array | string,
    explicitName?: string
  ): Promise<ActiveModelInfo> {
    let filename = explicitName || '';
    if (typeof source === 'string') {
      filename = source.split('/').pop()?.split('?')[0] || filename;
    } else if (source instanceof File) {
      filename = source.name;
    }

    const isTflite = filename.toLowerCase().endsWith('.tflite') || filename.toLowerCase().endsWith('.lite');

    if (isTflite) {
      this.activeFormat = 'tflite';
      const meta = await tfliteEngine.loadModel(source, filename || 'model.tflite');
      return {
        name: meta.name,
        format: 'tflite',
        sizeBytes: meta.sizeBytes,
        isLoaded: meta.isLoaded,
        statusMessage: `Modèle TFLite (${meta.name}) activé avec succès`,
      };
    } else {
      this.activeFormat = 'onnx';
      const meta = await onnxEngine.loadModel(source, filename || 'exp.onnx');
      return {
        name: meta.name,
        format: 'onnx',
        sizeBytes: meta.sizeBytes,
        isLoaded: meta.isLoaded,
        statusMessage: `Modèle ONNX (${meta.name}) activé avec succès`,
      };
    }
  }

  /**
   * Run inference with whichever model is currently active
   */
  public async runInference(
    imageSource: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    confidenceThreshold: number = 0.25,
    iouThreshold: number = 0.45
  ): Promise<{
    boxes: BoundingBox[];
    inferenceTimeMs: number;
    rawDetectionsCount: number;
    maxScoreFound: number;
    formatUsed: SupportedModelFormat;
  }> {
    if (this.activeFormat === 'tflite' && tfliteEngine.isReady()) {
      const res = await tfliteEngine.runInference(imageSource, confidenceThreshold);
      return { ...res, formatUsed: 'tflite' };
    }

    if (onnxEngine.isReady()) {
      const res = await onnxEngine.runInference(imageSource, confidenceThreshold, iouThreshold);
      return { ...res, formatUsed: 'onnx' };
    }

    throw new Error('Aucun modèle (ONNX ou TFLite) n\'est actuellement chargé.');
  }
}

export const unifiedModelService = new UnifiedModelService();
