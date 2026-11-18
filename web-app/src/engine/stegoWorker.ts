/**
 * Dedicated Background Web Worker for Pixel-Level Steganography,
 * Perceptual Hashing, and Dual-Layer Anti-AI Poisoning Perturbations.
 *
 * Offloads heavy O(W * H) matrix operations from the main React UI thread
 * using zero-copy Transferable ArrayBuffers to maintain 60 FPS canvas interaction.
 */

interface SectorConfig {
  name: string;
  id: number;
  startX: (w: number) => number;
  startY: (h: number) => number;
  width: (w: number) => number;
  height: (h: number) => number;
}

const MAGIC_HEADER_V2 = 'MKSEC2::';
const TERMINATOR = '::<END_MKSEC>';

const SECTORS: SectorConfig[] = [
  {
    name: 'Top-Left Quadrant',
    id: 0,
    startX: () => 0,
    startY: () => 0,
    width: (w) => Math.floor(w / 2),
    height: (h) => Math.floor(h / 2),
  },
  {
    name: 'Top-Right Quadrant',
    id: 1,
    startX: (w) => Math.floor(w / 2),
    startY: () => 0,
    width: (w) => Math.floor(w / 2),
    height: (h) => Math.floor(h / 2),
  },
  {
    name: 'Bottom-Left Quadrant',
    id: 2,
    startX: () => 0,
    startY: (h) => Math.floor(h / 2),
    width: (w) => Math.floor(w / 2),
    height: (h) => Math.floor(h / 2),
  },
  {
    name: 'Bottom-Right Quadrant',
    id: 3,
    startX: (w) => Math.floor(w / 2),
    startY: (h) => Math.floor(h / 2),
    width: (w) => Math.floor(w / 2),
    height: (h) => Math.floor(h / 2),
  },
  {
    name: 'Center Core Zone',
    id: 4,
    startX: (w) => Math.floor(w / 4),
    startY: (h) => Math.floor(h / 4),
    width: (w) => Math.floor(w / 2),
    height: (h) => Math.floor(h / 2),
  },
];

function computePerceptualFingerprintBuffer(
  data: Uint8ClampedArray,
  width: number,
  height: number
): string {
  const blocksX = 8;
  const blocksY = 8;
  const blockW = Math.max(1, Math.floor(width / blocksX));
  const blockH = Math.max(1, Math.floor(height / blocksY));
  const averages: number[] = [];

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      let sum = 0;
      let count = 0;
      for (let y = by * blockH; y < (by + 1) * blockH; y += 2) {
        for (let x = bx * blockW; x < (bx + 1) * blockW; x += 2) {
          const idx = (y * width + x) * 4;
          if (idx + 2 < data.length) {
            const blueVal = data[idx + 2] & 0xfe;
            sum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * blueVal;
            count++;
          }
        }
      }
      averages.push(count > 0 ? Math.round(sum / count) : 0);
    }
  }

  const sorted = [...averages].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 128;
  let hex = '';
  for (let i = 0; i < averages.length; i += 4) {
    let nibble = 0;
    for (let b = 0; b < 4; b++) {
      if ((averages[i + b] || 0) >= median) {
        nibble |= 1 << (3 - b);
      }
    }
    hex += nibble.toString(16);
  }
  return hex;
}

function applyPoisonBuffer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  epsilon: number,
  intensity: 'subtle' | 'balanced' | 'strong' | 'maximum'
): void {
  let eps = Math.min(12, Math.max(1, epsilon));
  if (intensity === 'subtle') eps = 2;
  else if (intensity === 'balanced') eps = 4;
  else if (intensity === 'strong') eps = 7;
  else if (intensity === 'maximum') eps = 11;

  const freq1 = 0.28;
  const freq2 = 0.53;
  const freq3 = 0.89;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const waveR = Math.sin(x * freq1 + y * freq2) * Math.cos(x * freq3);
      const waveG = Math.sin((x + 15) * freq2 + (y - 10) * freq1) * Math.cos(y * freq3);
      const waveB = Math.sin((x - 8) * freq3 + (y + 12) * freq2) * Math.cos((x + y) * freq1);

      const hashVal = ((x * 374761393 + y * 668265263) ^ 0x5bf03635) & 0xff;
      const jitter = (hashVal / 255 - 0.5) * 0.4;

      const deltaR = Math.round(Math.max(-eps, Math.min(eps, (waveR + jitter) * eps)));
      const deltaG = Math.round(Math.max(-eps, Math.min(eps, (waveG + jitter) * eps)));
      const deltaB = Math.round(Math.max(-eps, Math.min(eps, (waveB + jitter) * eps)));

      data[idx] = Math.max(0, Math.min(255, data[idx] + deltaR));
      data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + deltaG));
      const currentBlueLsb = data[idx + 2] & 1;
      const perturbedBlue = Math.max(0, Math.min(255, data[idx + 2] + deltaB));
      data[idx + 2] = (perturbedBlue & 0xfe) | currentBlueLsb;
    }
  }
}

function embedInRegionBuffer(
  data: Uint8ClampedArray,
  totalWidth: number,
  startX: number,
  startY: number,
  w: number,
  h: number,
  bytes: Uint8Array
): boolean {
  const bitsNeeded = bytes.length * 8;
  const availablePixels = w * h;
  if (bitsNeeded > availablePixels) return false;

  let bitIdx = 0;
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    for (let b = 7; b >= 0; b--) {
      const bitVal = (byte >> b) & 1;
      const relPixel = bitIdx;
      const relY = Math.floor(relPixel / w);
      const relX = relPixel % w;
      if (relY >= h) break;

      const px = startX + relX;
      const py = startY + relY;
      const pixelOffset = (py * totalWidth + px) * 4;
      const blueIdx = pixelOffset + 2;

      if (blueIdx < data.length) {
        data[blueIdx] = (data[blueIdx] & 0xfe) | bitVal;
      }
      bitIdx++;
    }
  }
  return true;
}

self.onmessage = (e: MessageEvent) => {
  const {
    jobId,
    buffer,
    width,
    height,
    enableAntiAiPoisoning,
    antiAiPoisonEpsilon,
    antiAiPoisonIntensity,
    embedStego,
    payload,
    useArmor,
  } = e.data;

  const startTime = performance.now();
  const data = new Uint8ClampedArray(buffer);

  if (enableAntiAiPoisoning) {
    applyPoisonBuffer(
      data,
      width,
      height,
      antiAiPoisonEpsilon || 4,
      antiAiPoisonIntensity || 'balanced'
    );
  }

  let sectorsEmbedded = 0;
  if (embedStego && payload) {
    const encoder = new TextEncoder();
    const pFingerprint = computePerceptualFingerprintBuffer(data, width, height);
    const enrichedPayload = {
      ...payload,
      perceptualFingerprint: pFingerprint,
    };

    if (useArmor && width >= 200 && height >= 200) {
      for (const sector of SECTORS) {
        const sectorPayload = {
          ...enrichedPayload,
          quadrantId: sector.id,
          redundancyCount: SECTORS.length,
        };
        const rawString = MAGIC_HEADER_V2 + JSON.stringify(sectorPayload) + TERMINATOR;
        const bytes = encoder.encode(rawString);
        const ok = embedInRegionBuffer(
          data,
          width,
          sector.startX(width),
          sector.startY(height),
          sector.width(width),
          sector.height(height),
          bytes
        );
        if (ok) sectorsEmbedded++;
      }
    } else {
      const rawString = MAGIC_HEADER_V2 + JSON.stringify(enrichedPayload) + TERMINATOR;
      const bytes = encoder.encode(rawString);
      const ok = embedInRegionBuffer(data, width, 0, 0, width, height, bytes);
      if (ok) sectorsEmbedded = 1;
    }
  }

  const durationMs = Math.max(0.1, Number((performance.now() - startTime).toFixed(2)));

  (self as unknown as Worker).postMessage(
    {
      jobId,
      buffer: data.buffer,
      width,
      height,
      sectorsEmbedded,
      durationMs,
    },
    [data.buffer]
  );
};
