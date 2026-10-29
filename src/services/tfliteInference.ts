import { ObjectDetector, FilesetResolver, Detection } from '@mediapipe/tasks-vision';
import { BoundingBox } from '../types/parasitology';
import { USER_MODEL_CLASSES, PARASITE_SPECIES } from '../data/mockData';

export interface TfliteMetadata {
  name: string;
  sizeBytes: number;
  format: 'tflite';
  isLoaded: boolean;
  statusMessage?: string;
}

export interface TfliteInferenceResult {
  boxes: BoundingBox[];
  inferenceTimeMs: number;
  rawDetectionsCount: number;
  maxScoreFound: number;
}

class TfliteEngine {
  private detector: ObjectDetector | null = null;
  private metadata: TfliteMetadata | null = null;
  private visionTasks: any = null;

  public getMetadata(): TfliteMetadata | null {
    return this.metadata;
  }

  public isReady(): boolean {
    return this.detector !== null;
  }

  /**
   * Initialize FilesetResolver for MediaPipe Vision tasks
   */
  private async getVisionTasks() {
    if (this.visionTasks) return this.visionTasks;
    try {
      // Try local /mediapipe first
      this.visionTasks = await FilesetResolver.forVisionTasks('/mediapipe');
    } catch (err1) {
      console.warn('Local mediapipe wasm failed, falling back to CDN:', err1);
      this.visionTasks = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
    }
    return this.visionTasks;
  }

  /**
   * Load a .tflite model from File, ArrayBuffer, Uint8Array, or URL
   */
  public async loadModel(
    source: File | ArrayBuffer | Uint8Array | string,
    modelName?: string
  ): Promise<TfliteMetadata> {
    try {
      let uint8Bytes: Uint8Array;
      let name = modelName || 'model.tflite';
      let sizeBytes = 0;

      if (typeof source === 'string') {
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Fichier introuvable à l'adresse ${source} (HTTP ${response.status})`);
        }
        const ab = await response.arrayBuffer();
        uint8Bytes = new Uint8Array(ab);
        name = source.split('/').pop() || name;
        sizeBytes = ab.byteLength;
      } else if (source instanceof File) {
        name = source.name;
        sizeBytes = source.size;
        const ab = await source.arrayBuffer();
        uint8Bytes = new Uint8Array(ab);
      } else if (source instanceof Uint8Array) {
        uint8Bytes = source;
        sizeBytes = source.byteLength;
      } else {
        uint8Bytes = new Uint8Array(source);
        sizeBytes = uint8Bytes.byteLength;
      }

      const vision = await this.getVisionTasks();

      // Create ObjectDetector from TFLite binary buffer
      const detector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetBuffer: uint8Bytes,
        },
        scoreThreshold: 0.05, // low internal threshold so UI confidence slider has full range
        runningMode: 'IMAGE',
      });

      this.detector = detector;
      this.metadata = {
        name,
        sizeBytes,
        format: 'tflite',
        isLoaded: true,
        statusMessage: `Modèle TFLite ${name} prêt pour l'analyse`,
      };

      console.log('✅ TFLite Detector created successfully:', {
        name,
        sizeBytes,
      });

      return this.metadata;
    } catch (error: any) {
      console.error('Error loading TFLite model:', error);
      this.detector = null;
      this.metadata = null;
      throw new Error(
        error?.message ||
          'Impossible de charger ce fichier TFLite. Vérifiez qu\'il s\'agit d\'un modèle TensorFlow Lite valide.'
      );
    }
  }

  /**
   * Run inference using TFLite detector
   */
  public async runInference(
    imageSource: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    confidenceThreshold: number = 0.25
  ): Promise<TfliteInferenceResult> {
    if (!this.detector || !this.metadata) {
      throw new Error('Aucun modèle TFLite n\'est actuellement chargé.');
    }

    let sourceElement: HTMLImageElement | HTMLCanvasElement;
    let imgWidth = 640;
    let imgHeight = 640;

    if (imageSource instanceof HTMLVideoElement) {
      const canvas = document.createElement('canvas');
      canvas.width = imageSource.videoWidth || 1280;
      canvas.height = imageSource.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(imageSource, 0, 0, canvas.width, canvas.height);
      sourceElement = canvas;
      imgWidth = canvas.width;
      imgHeight = canvas.height;
    } else {
      sourceElement = imageSource;
      if (sourceElement instanceof HTMLImageElement) {
        const img = sourceElement;
        if (!img.complete || img.naturalWidth === 0) {
          await new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) return resolve();
            img.onload = () => resolve();
            setTimeout(resolve, 2000);
          });
        }
        imgWidth = img.naturalWidth || img.width || 640;
        imgHeight = img.naturalHeight || img.height || 640;
      } else {
        imgWidth = sourceElement.width || 640;
        imgHeight = sourceElement.height || 640;
      }
    }

    const startTime = performance.now();
    const detectionResult = this.detector.detect(sourceElement);
    const endTime = performance.now();
    const inferenceTimeMs = Math.round(endTime - startTime);

    let maxScoreFound = 0;
    const candidates: BoundingBox[] = [];

    const detections: Detection[] = detectionResult.detections || [];
    detections.forEach((d, index) => {
      const cat = d.categories[0];
      const score = cat?.score ?? 0;
      if (score > maxScoreFound) maxScoreFound = score;

      if (score >= confidenceThreshold && d.boundingBox) {
        const bbox = d.boundingBox; // { originX, originY, width, height } in pixels
        const normX = Math.max(0, Math.min(100, (bbox.originX / imgWidth) * 100));
        const normY = Math.max(0, Math.min(100, (bbox.originY / imgHeight) * 100));
        const normW = Math.max(2, Math.min(100, (bbox.width / imgWidth) * 100));
        const normH = Math.max(2, Math.min(100, (bbox.height / imgHeight) * 100));

        // Determine class index (0 to 18)
        let classIdx = 0;
        if (typeof cat.index === 'number' && cat.index >= 0 && cat.index < USER_MODEL_CLASSES.length) {
          classIdx = cat.index;
        } else if (cat.categoryName) {
          const found = USER_MODEL_CLASSES.find(
            (c) => c.label.toLowerCase() === cat.categoryName.toLowerCase() || c.id === cat.categoryName.toLowerCase()
          );
          if (found) classIdx = found.index;
        }

        const classMeta = USER_MODEL_CLASSES[classIdx] || USER_MODEL_CLASSES[0];
        const speciesInfo = PARASITE_SPECIES[classMeta.id];

        candidates.push({
          id: `tflite-box-${Date.now()}-${index}`,
          classIndex: classIdx,
          speciesId: classMeta.id,
          speciesName: classMeta.label,
          speciesScientific: speciesInfo?.scientificName || classMeta.label,
          stage: 'Détection IA (Modèle TFLite)',
          confidence: Number(score.toFixed(3)),
          x: normX,
          y: normY,
          width: normW,
          height: normH,
          dimensionsUm: speciesInfo?.typicalSize?.split(' ')[0] || '55 x 35 µm',
          color: speciesInfo?.color || '#0284c7',
        });
      }
    });

    console.log('[TFLite Inference complete]', {
      timeMs: inferenceTimeMs,
      maxScoreFound,
      boxesCount: candidates.length,
      thresholdUsed: confidenceThreshold,
    });

    return {
      boxes: candidates,
      inferenceTimeMs,
      rawDetectionsCount: detections.length,
      maxScoreFound,
    };
  }
}

export const tfliteEngine = new TfliteEngine();
