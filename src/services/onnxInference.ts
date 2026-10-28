import * as ort from 'onnxruntime-web';
import { BoundingBox } from '../types/parasitology';
import { USER_MODEL_CLASSES, PARASITE_SPECIES } from '../data/mockData';

// Configure ONNX Runtime Web WebAssembly environment
try {
  ort.env.wasm.numThreads = 1;
  // Serve WASM directly from local public root with CDN fallback
  ort.env.wasm.wasmPaths = '/';
} catch (e) {
  console.warn('Configuring ONNX environment:', e);
}

export interface ModelMetadata {
  name: string;
  sizeBytes: number;
  inputNames: readonly string[];
  outputNames: readonly string[];
  inputShape: number[]; // e.g. [1, 3, 640, 640]
  isLoaded: boolean;
  statusMessage?: string;
  detectedFormat?: string;
}

export interface InferenceResult {
  boxes: BoundingBox[];
  inferenceTimeMs: number;
  rawDetectionsCount: number;
  maxScoreFound: number;
}

class OnnxEngine {
  private session: ort.InferenceSession | null = null;
  private metadata: ModelMetadata | null = null;

  public getMetadata(): ModelMetadata | null {
    return this.metadata;
  }

  public isReady(): boolean {
    return this.session !== null;
  }

  /**
   * Load an ONNX model from a File, ArrayBuffer, or URL path (e.g. /exp.onnx)
   */
  public async loadModel(source: File | ArrayBuffer | string, modelName?: string): Promise<ModelMetadata> {
    try {
      let buffer: ArrayBuffer;
      let name = modelName || 'exp.onnx';
      let sizeBytes = 0;

      if (typeof source === 'string') {
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Fichier introuvable à l'adresse ${source} (HTTP ${response.status})`);
        }
        buffer = await response.arrayBuffer();
        name = source.split('/').pop() || name;
        sizeBytes = buffer.byteLength;
      } else if (source instanceof File) {
        name = source.name;
        sizeBytes = source.size;
        buffer = await source.arrayBuffer();
      } else {
        buffer = source;
        sizeBytes = buffer.byteLength;
      }

      // Create inference session with WebAssembly provider
      const session = await ort.InferenceSession.create(buffer, {
        executionProviders: ['wasm'],
      });

      this.session = session;

      // Extract input dimensions
      const inputNames = session.inputNames;
      const outputNames = session.outputNames;
      
      let inputShape = [1, 3, 640, 640];
      try {
        // @ts-ignore
        const metaInput = session.inputMetadata?.[inputNames[0]];
        if (metaInput && metaInput.dimensions) {
          inputShape = metaInput.dimensions.map((d: any) => (typeof d === 'number' && d > 0 ? d : 640));
          if (inputShape.length === 4 && inputShape[0] !== 1) inputShape[0] = 1;
        }
      } catch (err) {
        console.warn('Could not read explicit input shape, using 1x3x640x640', err);
      }

      this.metadata = {
        name,
        sizeBytes,
        inputNames,
        outputNames,
        inputShape,
        isLoaded: true,
        statusMessage: `Modèle ${name} prêt pour l'analyse microscopique`,
      };

      return this.metadata;
    } catch (error: any) {
      console.error('Error loading ONNX model:', error);
      this.session = null;
      this.metadata = null;
      throw new Error(
        error?.message ||
          'Impossible de charger ce fichier ONNX. Vérifiez qu\'il s\'agit d\'un modèle ONNX standard valide.'
      );
    }
  }

  /**
   * Preprocess image to Float32Array tensor [1, 3, H, W]
   */
  private preprocess(
    imageSource: HTMLImageElement | HTMLCanvasElement,
    targetWidth: number = 640,
    targetHeight: number = 640
  ): { tensor: ort.Tensor; originalWidth: number; originalHeight: number } {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Impossible de créer le contexte 2D pour le prétraitement');

    const origWidth =
      imageSource instanceof HTMLImageElement ? imageSource.naturalWidth || imageSource.width : imageSource.width;
    const origHeight =
      imageSource instanceof HTMLImageElement ? imageSource.naturalHeight || imageSource.height : imageSource.height;

    // Draw and resize to model expected dimensions
    ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const { data } = imageData;

    // Convert RGBA to planar RGB float normalized to [0, 1]
    const numPixels = targetWidth * targetHeight;
    const float32Data = new Float32Array(3 * numPixels);

    const rOffset = 0;
    const gOffset = numPixels;
    const bOffset = 2 * numPixels;

    for (let i = 0; i < numPixels; i++) {
      const srcIdx = i * 4;
      float32Data[rOffset + i] = data[srcIdx] / 255.0; // R
      float32Data[gOffset + i] = data[srcIdx + 1] / 255.0; // G
      float32Data[bOffset + i] = data[srcIdx + 2] / 255.0; // B
    }

    const tensor = new ort.Tensor('float32', float32Data, [1, 3, targetHeight, targetWidth]);
    return { tensor, originalWidth: origWidth, originalHeight: origHeight };
  }

  /**
   * Helper: sigmoid function for logits
   */
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Run real inference on an image using the loaded ONNX model
   */
  public async runInference(
    imageElement: HTMLImageElement | HTMLCanvasElement,
    confidenceThreshold: number = 0.5,
    iouThreshold: number = 0.45
  ): Promise<InferenceResult> {
    if (!this.session || !this.metadata) {
      throw new Error('Aucun modèle ONNX n\'est actuellement chargé.');
    }

    const startTime = performance.now();
    const targetW = this.metadata.inputShape[3] || 640;
    const targetH = this.metadata.inputShape[2] || 640;

    const { tensor } = this.preprocess(imageElement, targetW, targetH);
    const inputName = this.metadata.inputNames[0];

    // Execute ONNX session
    const feeds: Record<string, ort.Tensor> = { [inputName]: tensor };
    const results = await this.session.run(feeds);

    const outputName = this.metadata.outputNames[0];
    const outputTensor = results[outputName];
    if (!outputTensor) {
      throw new Error(`Le tenseur de sortie ${outputName} est introuvable.`);
    }

    const endTime = performance.now();
    const inferenceTimeMs = Math.round(endTime - startTime);

    // Decode detections with universal parser
    const { boxes, maxScore } = this.postprocess(outputTensor, confidenceThreshold, iouThreshold, targetW, targetH);

    return {
      boxes,
      inferenceTimeMs,
      rawDetectionsCount: boxes.length,
      maxScoreFound: maxScore,
    };
  }

  /**
   * Post-process output tensor to BoundingBox array supporting YOLOv8, YOLOv5, and End2End ONNX
   */
  private postprocess(
    tensor: ort.Tensor,
    confThreshold: number,
    iouThreshold: number,
    targetW: number,
    targetH: number
  ): { boxes: BoundingBox[]; maxScore: number } {
    const data = tensor.data as Float32Array;
    const dims = tensor.dims; // e.g. [1, 23, 8400] or [1, 8400, 23] or [1, 300, 6]
    const candidates: Array<{
      classIndex: number;
      score: number;
      x: number;
      y: number;
      w: number;
      h: number;
    }> = [];

    let maxScoreEncountered = 0;
    const numClasses = 19;

    // Helper to normalize coordinates: handles both pixel space [0..640] and normalized [0..1]
    const toPercent = (cx: number, cy: number, w: number, h: number) => {
      const isNormalized = cx <= 1.05 && cy <= 1.05 && w <= 1.05 && h <= 1.05;
      const normX = isNormalized ? cx - w / 2 : (cx - w / 2) / targetW;
      const normY = isNormalized ? cy - h / 2 : (cy - h / 2) / targetH;
      const normW = isNormalized ? w : w / targetW;
      const normH = isNormalized ? h : h / targetH;

      return {
        x: Math.max(0, Math.min(100, normX * 100)),
        y: Math.max(0, Math.min(100, normY * 100)),
        w: Math.max(1, Math.min(100, normW * 100)),
        h: Math.max(1, Math.min(100, normH * 100)),
      };
    };

    // Helper to evaluate class probability: converts logits to probability if needed
    const getProb = (val: number) => {
      if (val < 0 || val > 1.0) {
        return this.sigmoid(val);
      }
      return val;
    };

    // Format 1: 3D Tensor [1, C, A] or [1, A, C]
    if (dims.length === 3) {
      const dim1 = dims[1];
      const dim2 = dims[2];

      // Subcase 1A: End-to-end NMS [1, N, 6] where row is [x1, y1, x2, y2, score, class_id]
      if (dim2 === 6) {
        const numDetections = dim1;
        for (let i = 0; i < numDetections; i++) {
          const offset = i * 6;
          const score = getProb(data[offset + 4]);
          if (score > maxScoreEncountered) maxScoreEncountered = score;

          if (score >= confThreshold) {
            const x1 = data[offset];
            const y1 = data[offset + 1];
            const x2 = data[offset + 2];
            const y2 = data[offset + 3];
            const classIndex = Math.round(data[offset + 5]);

            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;
            const w = Math.abs(x2 - x1);
            const h = Math.abs(y2 - y1);
            const p = toPercent(cx, cy, w, h);

            candidates.push({
              classIndex: Math.max(0, Math.min(numClasses - 1, classIndex)),
              score,
              ...p,
            });
          }
        }
      }
      // Subcase 1B: YOLOv8 channels x anchors format [1, 23, 8400]
      else if (dim1 < dim2) {
        const channels = dim1;
        const anchors = dim2;
        const isYolov5 = channels >= 4 + 1 + numClasses; // has objectness

        for (let a = 0; a < anchors; a++) {
          let maxClassScore = 0;
          let bestClass = 0;
          const objConf = isYolov5 ? getProb(data[4 * anchors + a]) : 1.0;

          const classOffset = isYolov5 ? 5 : 4;
          const actualClasses = Math.min(numClasses, channels - classOffset);

          for (let c = 0; c < actualClasses; c++) {
            const rawScore = data[(classOffset + c) * anchors + a];
            const prob = getProb(rawScore);
            if (prob > maxClassScore) {
              maxClassScore = prob;
              bestClass = c;
            }
          }

          const finalScore = maxClassScore * objConf;
          if (finalScore > maxScoreEncountered) maxScoreEncountered = finalScore;

          if (finalScore >= confThreshold) {
            const cx = data[0 * anchors + a];
            const cy = data[1 * anchors + a];
            const w = data[2 * anchors + a];
            const h = data[3 * anchors + a];
            const p = toPercent(cx, cy, w, h);

            candidates.push({
              classIndex: bestClass,
              score: finalScore,
              ...p,
            });
          }
        }
      }
      // Subcase 1C: YOLOv8 / YOLOv5 transposed anchors x channels [1, 8400, 23]
      else {
        const anchors = dim1;
        const channels = dim2;
        const isYolov5 = channels >= 4 + 1 + numClasses;

        for (let a = 0; a < anchors; a++) {
          const rowOffset = a * channels;
          const objConf = isYolov5 ? getProb(data[rowOffset + 4]) : 1.0;
          const classOffset = isYolov5 ? 5 : 4;
          const actualClasses = Math.min(numClasses, channels - classOffset);

          let maxClassScore = 0;
          let bestClass = 0;

          for (let c = 0; c < actualClasses; c++) {
            const rawScore = data[rowOffset + classOffset + c];
            const prob = getProb(rawScore);
            if (prob > maxClassScore) {
              maxClassScore = prob;
              bestClass = c;
            }
          }

          const finalScore = maxClassScore * objConf;
          if (finalScore > maxScoreEncountered) maxScoreEncountered = finalScore;

          if (finalScore >= confThreshold) {
            const cx = data[rowOffset];
            const cy = data[rowOffset + 1];
            const w = data[rowOffset + 2];
            const h = data[rowOffset + 3];
            const p = toPercent(cx, cy, w, h);

            candidates.push({
              classIndex: bestClass,
              score: finalScore,
              ...p,
            });
          }
        }
      }
    }
    // Format 2: 2D Tensor [N, 6] or [8400, 23]
    else if (dims.length === 2) {
      const rows = dims[0];
      const cols = dims[1];

      if (cols === 6) {
        for (let i = 0; i < rows; i++) {
          const offset = i * 6;
          const score = getProb(data[offset + 4]);
          if (score > maxScoreEncountered) maxScoreEncountered = score;

          if (score >= confThreshold) {
            const x1 = data[offset];
            const y1 = data[offset + 1];
            const x2 = data[offset + 2];
            const y2 = data[offset + 3];
            const classIndex = Math.round(data[offset + 5]);
            const p = toPercent((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1), Math.abs(y2 - y1));

            candidates.push({
              classIndex: Math.max(0, Math.min(numClasses - 1, classIndex)),
              score,
              ...p,
            });
          }
        }
      }
    }

    // Apply Non-Maximum Suppression (NMS)
    const nmsResults = this.applyNms(candidates, iouThreshold);

    // Map to BoundingBox objects
    const boxes = nmsResults.map((item, index) => {
      const classMeta = USER_MODEL_CLASSES[item.classIndex] || USER_MODEL_CLASSES[0];
      const speciesInfo = PARASITE_SPECIES[classMeta.id];

      return {
        id: `onnx-box-${Date.now()}-${index}`,
        classIndex: item.classIndex,
        speciesId: classMeta.id,
        speciesName: classMeta.label,
        speciesScientific: speciesInfo?.scientificName || classMeta.label,
        stage: 'Détection IA (Modèle ONNX)',
        confidence: Number(item.score.toFixed(3)),
        x: Math.max(0, Math.min(95, item.x)),
        y: Math.max(0, Math.min(95, item.y)),
        width: Math.max(3, Math.min(90, item.w)),
        height: Math.max(3, Math.min(90, item.h)),
        dimensionsUm: speciesInfo?.typicalSize?.split(' ')[0] || '55 x 35 µm',
        color: speciesInfo?.color || '#0284c7',
      };
    });

    return { boxes, maxScore: maxScoreEncountered };
  }

  /**
   * Standard Intersection over Union Non-Maximum Suppression
   */
  private applyNms(
    boxes: Array<{ classIndex: number; score: number; x: number; y: number; w: number; h: number }>,
    iouThreshold: number
  ) {
    boxes.sort((a, b) => b.score - a.score);
    const selected: typeof boxes = [];

    for (const box of boxes) {
      let keep = true;
      for (const sel of selected) {
        if (box.classIndex === sel.classIndex) {
          const iou = this.calculateIou(box, sel);
          if (iou > iouThreshold) {
            keep = false;
            break;
          }
        }
      }
      if (keep) {
        selected.push(box);
      }
    }

    return selected;
  }

  private calculateIou(
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number }
  ): number {
    const xA = Math.max(a.x, b.x);
    const yA = Math.max(a.y, b.y);
    const xB = Math.min(a.x + a.w, b.x + b.w);
    const yB = Math.min(a.y + a.h, b.y + b.h);

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    const boxAArea = a.w * a.h;
    const boxBArea = b.w * b.h;

    const unionArea = boxAArea + boxBArea - interArea;
    return unionArea > 0 ? interArea / unionArea : 0;
  }
}

export const onnxEngine = new OnnxEngine();
