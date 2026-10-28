import * as ort from 'onnxruntime-web';
import { BoundingBox } from '../types/parasitology';
import { USER_MODEL_CLASSES, PARASITE_SPECIES } from '../data/mockData';

// Configure ONNX Runtime Web WASM binaries
// Using 1 thread to avoid SharedArrayBuffer restrictions inside sandboxed iframes
try {
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/';
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
}

export interface InferenceResult {
  boxes: BoundingBox[];
  inferenceTimeMs: number;
  rawDetectionsCount: number;
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
          throw new Error(`Impossible de télécharger le modèle depuis ${source} (HTTP ${response.status})`);
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
        graphOptimizationLevel: 'all',
      });

      this.session = session;

      // Extract input dimensions
      const inputNames = session.inputNames;
      const outputNames = session.outputNames;
      
      // Default to 640x640 if dynamic
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
        statusMessage: `Modèle ${name} chargé et compilé avec succès en WebAssembly`,
      };

      return this.metadata;
    } catch (error: any) {
      console.error('Error loading ONNX model:', error);
      this.session = null;
      this.metadata = null;
      throw new Error(
        error?.message ||
          'Impossible de charger ce fichier ONNX. Vérifiez qu\'il s\'agit d\'un modèle ONNX valide exporté en format standard.'
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
    if (!ctx) throw new Error('Could not get 2D canvas context');

    const origWidth =
      imageSource instanceof HTMLImageElement ? imageSource.naturalWidth || imageSource.width : imageSource.width;
    const origHeight =
      imageSource instanceof HTMLImageElement ? imageSource.naturalHeight || imageSource.height : imageSource.height;

    // Draw and resize
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
   * Run inference on an image using the loaded ONNX model
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

    // Execute session
    const feeds: Record<string, ort.Tensor> = { [inputName]: tensor };
    const results = await this.session.run(feeds);

    const outputName = this.metadata.outputNames[0];
    const outputTensor = results[outputName];
    if (!outputTensor) {
      throw new Error(`Le tenseur de sortie ${outputName} est introuvable.`);
    }

    const endTime = performance.now();
    const inferenceTimeMs = Math.round(endTime - startTime);

    // Decode detections (supports YOLOv8 [1, 23, 8400] or YOLOv5 [1, 8400, 24] or [N, 6])
    const decodedBoxes = this.postprocess(outputTensor, confidenceThreshold, iouThreshold);

    return {
      boxes: decodedBoxes,
      inferenceTimeMs,
      rawDetectionsCount: decodedBoxes.length,
    };
  }

  /**
   * Post-process output tensor to BoundingBox array
   */
  private postprocess(
    tensor: ort.Tensor,
    confThreshold: number,
    iouThreshold: number
  ): BoundingBox[] {
    const data = tensor.data as Float32Array;
    const dims = tensor.dims; // e.g. [1, 23, 8400] or [1, 8400, 23]
    const candidates: Array<{
      classIndex: number;
      score: number;
      x: number;
      y: number;
      w: number;
      h: number;
    }> = [];

    const numClasses = 19;

    if (dims.length === 3) {
      const dim1 = dims[1];
      const dim2 = dims[2];

      // Format A: YOLOv8 shape [1, 23, 8400] (channels x anchors)
      if (dim1 === 4 + numClasses || dim1 > 4) {
        const channels = dim1;
        const anchors = dim2;

        for (let a = 0; a < anchors; a++) {
          // Find max class score
          let maxScore = 0;
          let bestClass = 0;

          for (let c = 0; c < numClasses; c++) {
            const scoreIdx = (4 + c) * anchors + a;
            const score = data[scoreIdx];
            if (score > maxScore) {
              maxScore = score;
              bestClass = c;
            }
          }

          if (maxScore >= confThreshold) {
            // YOLOv8 bounding box format: cx, cy, w, h normalized to 640x640
            const cx = data[0 * anchors + a];
            const cy = data[1 * anchors + a];
            const w = data[2 * anchors + a];
            const h = data[3 * anchors + a];

            candidates.push({
              classIndex: bestClass,
              score: maxScore,
              x: (cx - w / 2) / 640 * 100,
              y: (cy - h / 2) / 640 * 100,
              w: (w / 640) * 100,
              h: (h / 640) * 100,
            });
          }
        }
      }
      // Format B: YOLOv8 / YOLOv5 transposed [1, 8400, 23] (anchors x channels)
      else if (dim2 === 4 + numClasses || dim2 > 4) {
        const anchors = dim1;
        const channels = dim2;

        for (let a = 0; a < anchors; a++) {
          const rowOffset = a * channels;
          let maxScore = 0;
          let bestClass = 0;

          for (let c = 0; c < numClasses; c++) {
            const score = data[rowOffset + 4 + c];
            if (score > maxScore) {
              maxScore = score;
              bestClass = c;
            }
          }

          if (maxScore >= confThreshold) {
            const cx = data[rowOffset];
            const cy = data[rowOffset + 1];
            const w = data[rowOffset + 2];
            const h = data[rowOffset + 3];

            candidates.push({
              classIndex: bestClass,
              score: maxScore,
              x: (cx - w / 2) / 640 * 100,
              y: (cy - h / 2) / 640 * 100,
              w: (w / 640) * 100,
              h: (h / 640) * 100,
            });
          }
        }
      }
    }

    // Apply Non-Maximum Suppression (NMS)
    const nmsResults = this.applyNms(candidates, iouThreshold);

    // Map to BoundingBox objects
    return nmsResults.map((item, index) => {
      const classMeta = USER_MODEL_CLASSES[item.classIndex] || USER_MODEL_CLASSES[0];
      const speciesInfo = PARASITE_SPECIES[classMeta.id];

      return {
        id: `onnx-box-${Date.now()}-${index}`,
        classIndex: item.classIndex,
        speciesId: classMeta.id,
        speciesName: classMeta.label,
        speciesScientific: speciesInfo?.scientificName || classMeta.label,
        stage: 'ONNX Neural Detection',
        confidence: Number(item.score.toFixed(3)),
        x: Math.max(0, Math.min(95, item.x)),
        y: Math.max(0, Math.min(95, item.y)),
        width: Math.max(5, Math.min(60, item.w)),
        height: Math.max(5, Math.min(60, item.h)),
        dimensionsUm: speciesInfo?.typicalSize?.split(' ')[0] || '55 x 35 µm',
        color: speciesInfo?.color || '#0284c7',
      };
    });
  }

  /**
   * Standard Intersection over Union Non-Maximum Suppression
   */
  private applyNms(
    boxes: Array<{ classIndex: number; score: number; x: number; y: number; w: number; h: number }>,
    iouThreshold: number
  ) {
    // Sort descending by score
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
