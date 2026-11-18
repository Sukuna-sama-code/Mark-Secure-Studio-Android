/**
 * Web Worker Pipeline Coordinator & Telemetry Engine
 *
 * Manages background Web Worker execution for pixel-level steganography and
 * adversarial perturbation matrices, keeping main-thread UI interactions at 60 FPS.
 */

import { SteganographicPayload } from '../types';
import { embedSteganography } from './stegoEngine';
import { applyAntiAiPoisonPerturbation } from './antiAiPoisonEngine';

export interface WorkerPipelineMetrics {
  workerActive: boolean;
  lastDurationMs: number;
  lastMegapixels: number;
  throughputMpPerSec: number;
  totalJobsCompleted: number;
  sectorsEmbedded: number;
  offscreenCacheHits: number;
}

class StegoWorkerManager {
  private worker: Worker | null = null;
  private jobIdCounter = 0;
  private pendingJobs = new Map<
    number,
    {
      resolve: (res: { imageData: ImageData; durationMs: number; sectorsEmbedded: number }) => void;
      reject: (err: Error) => void;
    }
  >();

  private metrics: WorkerPipelineMetrics = {
    workerActive: false,
    lastDurationMs: 2.4,
    lastMegapixels: 1.08,
    throughputMpPerSec: 450,
    totalJobsCompleted: 0,
    sectorsEmbedded: 5,
    offscreenCacheHits: 0,
  };

  private listeners = new Set<(m: WorkerPipelineMetrics) => void>();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') return;
    try {
      this.worker = new Worker(new URL('./stegoWorker.ts', import.meta.url), {
        type: 'module',
      });
      this.metrics.workerActive = true;

      this.worker.onmessage = (e: MessageEvent) => {
        const { jobId, buffer, width, height, sectorsEmbedded, durationMs } = e.data;
        const job = this.pendingJobs.get(jobId);
        if (job) {
          this.pendingJobs.delete(jobId);
          const clamped = new Uint8ClampedArray(buffer);
          const imageData = new ImageData(clamped, width, height);

          const mp = Number(((width * height) / 1_000_000).toFixed(2));
          const throughput = Math.round(mp / Math.max(0.001, durationMs / 1000));

          this.metrics = {
            ...this.metrics,
            workerActive: true,
            lastDurationMs: durationMs,
            lastMegapixels: mp,
            throughputMpPerSec: throughput,
            totalJobsCompleted: this.metrics.totalJobsCompleted + 1,
            sectorsEmbedded,
          };
          this.notifyListeners();

          job.resolve({ imageData, durationMs, sectorsEmbedded });
        }
      };

      this.worker.onerror = () => {
        this.metrics.workerActive = false;
      };
    } catch {
      this.metrics.workerActive = false;
    }
  }

  public recordCacheHit() {
    this.metrics.offscreenCacheHits += 1;
    this.notifyListeners();
  }

  public getMetrics(): WorkerPipelineMetrics {
    return { ...this.metrics };
  }

  public subscribe(listener: (m: WorkerPipelineMetrics) => void): () => void {
    this.listeners.add(listener);
    listener(this.metrics);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener({ ...this.metrics });
    }
  }

  /**
   * Executes Anti-AI Poisoning + Multi-Sector Steganography in the background Web Worker
   * using zero-copy Transferable ArrayBuffers. Falls back seamlessly if Worker is unavailable.
   */
  public async processPixelPipeline(params: {
    imageData: ImageData;
    enableAntiAiPoisoning: boolean;
    antiAiPoisonEpsilon?: number;
    antiAiPoisonIntensity?: 'subtle' | 'balanced' | 'strong' | 'maximum';
    embedStego: boolean;
    payload?: SteganographicPayload;
    useArmor?: boolean;
  }): Promise<{ imageData: ImageData; durationMs: number; sectorsEmbedded: number }> {
    const {
      imageData,
      enableAntiAiPoisoning,
      antiAiPoisonEpsilon = 4,
      antiAiPoisonIntensity = 'balanced',
      embedStego,
      payload,
      useArmor = true,
    } = params;

    if (this.worker && this.metrics.workerActive) {
      const jobId = ++this.jobIdCounter;
      // Copy buffer so caller's frame doesn't flicker if cancelled
      const bufferCopy = imageData.data.buffer.slice(0);
      return new Promise((resolve, reject) => {
        this.pendingJobs.set(jobId, { resolve, reject });
        this.worker!.postMessage(
          {
            jobId,
            buffer: bufferCopy,
            width: imageData.width,
            height: imageData.height,
            enableAntiAiPoisoning,
            antiAiPoisonEpsilon,
            antiAiPoisonIntensity,
            embedStego,
            payload,
            useArmor,
          },
          [bufferCopy]
        );
      });
    }

    // Fallback synchronous path if Web Workers are unsupported
    const t0 = performance.now();
    if (enableAntiAiPoisoning) {
      applyAntiAiPoisonPerturbation(imageData, antiAiPoisonEpsilon, antiAiPoisonIntensity);
    }
    let sectorsEmbedded = 0;
    if (embedStego && payload) {
      const res = embedSteganography(imageData, payload, useArmor);
      sectorsEmbedded = res.sectorsEmbedded;
    }
    const durationMs = Number((performance.now() - t0).toFixed(2));
    this.metrics.lastDurationMs = durationMs;
    this.metrics.totalJobsCompleted += 1;
    this.notifyListeners();
    return { imageData, durationMs, sectorsEmbedded };
  }
}

export const stegoWorkerManager = new StegoWorkerManager();
