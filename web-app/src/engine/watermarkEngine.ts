import QRCode from 'qrcode';
import {
  TextWatermarkConfig,
  LogoWatermarkConfig,
  PositionConfig,
  ForensicSecurityConfig,
  WatermarkType,
} from '../types';
import { embedSteganography } from './stegoEngine';
import { generateCryptographicSignature, sha256String } from './cryptoUtils';
import { encodeZeroWidthCanary } from './honeytokenEngine';
import { drawC2paBadgePin } from './c2paEngine';
import {
  applyAntiAiPoisonPerturbation,
  generateAdversarialNoiseVisualizer,
} from './antiAiPoisonEngine';
import {
  analyzeImageSaliency,
  renderSaliencyHeatmapOverlay,
} from './contentAwarePlacement';
import { stegoWorkerManager } from './workerClient';

export interface RenderWatermarkOptions {
  canvas: HTMLCanvasElement;
  baseImage: HTMLImageElement | HTMLCanvasElement;
  type: WatermarkType;
  textConfig: TextWatermarkConfig;
  logoConfig?: LogoWatermarkConfig;
  positionConfig: PositionConfig;
  forensics?: ForensicSecurityConfig;
  customLogoImage?: HTMLImageElement | null;
  qrCodeImage?: HTMLImageElement | null;
  interactiveFastPass?: boolean;
}

// In-memory cache for QR codes so we don't regenerate every frame
const qrCache = new Map<string, HTMLImageElement>();
// OffscreenCanvas cache for tiled watermark patterns
const tiledOverlayCache = new Map<string, OffscreenCanvas | HTMLCanvasElement>();

export async function getOrGenerateQRCode(data: string): Promise<HTMLImageElement> {
  if (qrCache.has(data)) {
    return qrCache.get(data)!;
  }
  const dataUrl = await QRCode.toDataURL(data, {
    margin: 1,
    width: 256,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      qrCache.set(data, img);
      resolve(img);
    };
    img.src = dataUrl;
  });
}

/**
 * Calculates anchor coordinate relative to canvas width/height
 */
export function calculateAnchorCoords(
  anchor: PositionConfig['anchor'],
  canvasWidth: number,
  canvasHeight: number,
  itemWidth: number,
  itemHeight: number,
  percentOffsetX: number,
  percentOffsetY: number
): { x: number; y: number } {
  let baseX = canvasWidth / 2;
  let baseY = canvasHeight / 2;
  const paddingX = canvasWidth * 0.05;
  const paddingY = canvasHeight * 0.05;

  switch (anchor) {
    case 'top-left':
      baseX = paddingX + itemWidth / 2;
      baseY = paddingY + itemHeight / 2;
      break;
    case 'top-center':
      baseX = canvasWidth / 2;
      baseY = paddingY + itemHeight / 2;
      break;
    case 'top-right':
      baseX = canvasWidth - paddingX - itemWidth / 2;
      baseY = paddingY + itemHeight / 2;
      break;
    case 'middle-left':
      baseX = paddingX + itemWidth / 2;
      baseY = canvasHeight / 2;
      break;
    case 'center':
      baseX = canvasWidth / 2;
      baseY = canvasHeight / 2;
      break;
    case 'middle-right':
      baseX = canvasWidth - paddingX - itemWidth / 2;
      baseY = canvasHeight / 2;
      break;
    case 'bottom-left':
      baseX = paddingX + itemWidth / 2;
      baseY = canvasHeight - paddingY - itemHeight / 2;
      break;
    case 'bottom-center':
      baseX = canvasWidth / 2;
      baseY = canvasHeight - paddingY - itemHeight / 2;
      break;
    case 'bottom-right':
      baseX = canvasWidth - paddingX - itemWidth / 2;
      baseY = canvasHeight - paddingY - itemHeight / 2;
      break;
    case 'custom':
    default:
      baseX = canvasWidth / 2;
      baseY = canvasHeight / 2;
      break;
  }

  const finalX = baseX + (canvasWidth * percentOffsetX) / 100;
  const finalY = baseY + (canvasHeight * percentOffsetY) / 100;

  return { x: finalX, y: finalY };
}

/**
 * Main render function that composites base image + watermarks + forensics onto canvas
 */
export async function renderWatermarkOnCanvas(
  options: RenderWatermarkOptions
): Promise<void> {
  const {
    canvas,
    baseImage,
    type,
    textConfig,
    logoConfig,
    positionConfig,
    forensics,
    customLogoImage,
    interactiveFastPass = false,
  } = options;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // 1. Draw base image / frame
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(baseImage, 0, 0, width, height);
  ctx.restore();

  // Helper for text formatting with variables and Honeytoken Canary injection
  const formatText = (template: string) => {
    let formatted = template
      .replace(/{name}/gi, forensics?.recipientName || 'Holder')
      .replace(/{cert_id}/gi, forensics?.certificateId || 'CERT-0001')
      .replace(/{date}/gi, forensics?.issueDate || (() => {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      })())
      .replace(/{issuer}/gi, forensics?.issuingAuthority || 'MarkSecure Authority')
      .replace(/{org}/gi, forensics?.issuingAuthority || 'MarkSecure Authority')
      .replace(/{organization}/gi, forensics?.issuingAuthority || 'MarkSecure Authority')
      .replace(/{year}/gi, String(new Date().getFullYear()));

    // Inject invisible zero-width canary tripwire if honeytokens are armed
    if (forensics?.enableHoneytokens && forensics?.honeytokenCanaryId) {
      const zwCanary = encodeZeroWidthCanary(forensics.honeytokenCanaryId);
      if (formatted.length > 1) {
        formatted = formatted.slice(0, 1) + zwCanary + formatted.slice(1);
      } else {
        formatted = formatted + zwCanary;
      }
    }
    return formatted;
  };

  // 2. Render Tiled mode if enabled (watermark.ws style pattern)
  if (positionConfig.tiled) {
    renderTiledWatermark(ctx, width, height, textConfig, positionConfig, formatText);
  } else {
    // Standard Single Anchor Rendering
    // A. Render Text Watermark
    if (type === 'text' || type === 'both') {
      renderSingleTextWatermark(
        ctx,
        width,
        height,
        textConfig,
        positionConfig,
        formatText
      );
    }

    // B. Render Logo Watermark
    if ((type === 'logo' || type === 'both') && customLogoImage && logoConfig) {
      renderSingleLogoWatermark(
        ctx,
        width,
        height,
        customLogoImage,
        logoConfig,
        positionConfig
      );
    }
  }

  // 3. Render Forensics Layer: QR code & Cryptographic Seal
  if (forensics?.embedQRCode || forensics?.embedVisibleHash) {
    await renderForensicBadges(ctx, width, height, forensics);
  }

  // 4. Render C2PA Content Credentials ("CR") Badge Pin
  if (forensics?.showC2paBadge || forensics?.enableC2paCredentials) {
    drawC2paBadgePin(ctx, width, height, 'top-right');
  }

  // 5 & 6. Background Web Worker Pipeline for Anti-AI Poisoning Shield + Multi-Sector Steganography
  // Skipped during interactive mouse drag (interactiveFastPass) to maintain 60 FPS, then executed on drag end.
  if (!interactiveFastPass && (forensics?.enableAntiAiPoisoning || forensics?.embedSteganography)) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const signature = generateCryptographicSignature(
      forensics.certificateId,
      forensics.recipientName,
      forensics.issueDate
    );

    const c2paHashRef = forensics.enableC2paCredentials
      ? (await sha256String(`C2PA-${forensics.certificateId}`)).slice(0, 12)
      : undefined;
    const antiAiHashRef = forensics.enableAntiAiPoisoning
      ? (await sha256String(`ANTI-AI-L-INF-${forensics.certificateId}`)).slice(0, 12)
      : undefined;

    const payload = {
      magic: 'MKSEC2' as const,
      certId: forensics.certificateId,
      recipient: forensics.recipientName,
      issuer: forensics.issuingAuthority,
      timestamp: Date.now(),
      hash: forensics.certificateId.slice(-8),
      signature,
      securityLevel: forensics.securityLevel,
      honeytokenCanary: forensics.enableHoneytokens ? forensics.honeytokenCanaryId : undefined,
      c2paManifestHash: c2paHashRef,
      antiAiPoisonHash: antiAiHashRef,
    };

    try {
      const workerResult = await stegoWorkerManager.processPixelPipeline({
        imageData: imgData,
        enableAntiAiPoisoning: Boolean(forensics.enableAntiAiPoisoning),
        antiAiPoisonEpsilon: forensics.antiAiPoisonEpsilon || 4,
        antiAiPoisonIntensity: forensics.antiAiPoisonIntensity || 'balanced',
        embedStego: Boolean(forensics.embedSteganography),
        payload,
        useArmor: forensics.antiRemoverArmor !== false,
      });
      ctx.putImageData(workerResult.imageData, 0, 0);
    } catch {
      if (forensics.enableAntiAiPoisoning) {
        applyAntiAiPoisonPerturbation(
          imgData,
          forensics.antiAiPoisonEpsilon || 4,
          forensics.antiAiPoisonIntensity || 'balanced'
        );
      }
      if (forensics.embedSteganography) {
        embedSteganography(imgData, payload, forensics.antiRemoverArmor !== false);
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }

  // 7. Preview Mode: Amplified Adversarial Perturbation Noise Inspector (15x amplified lattice)
  if (forensics?.showAdversarialNoisePreview) {
    const noiseVis = generateAdversarialNoiseVisualizer(width, height, forensics.antiAiPoisonEpsilon || 4);
    ctx.putImageData(noiseVis, 0, 0);
  }

  // 8. Preview Mode: Saliency & Inpaint Vulnerability Heatmap Overlay
  if (forensics?.showSaliencyHeatmap) {
    const saliency = analyzeImageSaliency(ctx, width, height);
    renderSaliencyHeatmapOverlay(
      canvas,
      saliency,
      positionConfig.offsetX,
      positionConfig.offsetY
    );
  }
}

function renderSingleTextWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: TextWatermarkConfig,
  position: PositionConfig,
  formatFn: (str: string) => string
) {
  const displayText = formatFn(config.text);
  if (!displayText.trim()) return;

  // Responsive font size relative to image resolution
  const computedFontSize = Math.max(12, Math.round((config.fontSize / 800) * width));

  ctx.save();
  ctx.font = `${config.fontWeight} ${computedFontSize}px ${config.fontFamily}`;
  const metrics = ctx.measureText(displayText);
  const textWidth = metrics.width;
  const textHeight = computedFontSize;

  const { x, y } = calculateAnchorCoords(
    position.anchor,
    width,
    height,
    textWidth,
    textHeight,
    position.offsetX,
    position.offsetY
  );

  ctx.translate(x, y);
  ctx.rotate((config.rotation * Math.PI) / 180);
  ctx.globalAlpha = config.opacity;

  // Background Box / Banner if configured
  if (config.hasBackground) {
    const pad = config.backgroundPadding * (computedFontSize / 24);
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(
      -textWidth / 2 - pad,
      -textHeight / 2 - pad * 0.7,
      textWidth + pad * 2,
      textHeight + pad * 1.4
    );
  }

  // Shadow
  if (config.shadowBlur > 0) {
    ctx.shadowColor = config.shadowColor;
    ctx.shadowBlur = config.shadowBlur;
    ctx.shadowOffsetX = config.shadowOffsetX;
    ctx.shadowOffsetY = config.shadowOffsetY;
  }

  ctx.fillStyle = config.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayText, 0, 0);

  ctx.restore();
}

function renderSingleLogoWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  logoImg: HTMLImageElement,
  config: LogoWatermarkConfig,
  position: PositionConfig
) {
  const baseScale = Math.min(width, height) * config.scale;
  const aspect = config.aspectRatio || logoImg.naturalWidth / (logoImg.naturalHeight || 1);
  const logoWidth = baseScale;
  const logoHeight = baseScale / aspect;

  const { x, y } = calculateAnchorCoords(
    position.anchor,
    width,
    height,
    logoWidth,
    logoHeight,
    position.offsetX,
    position.offsetY
  );

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((config.rotation * Math.PI) / 180);
  ctx.globalAlpha = config.opacity;
  ctx.globalCompositeOperation = config.blendMode || 'source-over';

  ctx.drawImage(
    logoImg,
    -logoWidth / 2,
    -logoHeight / 2,
    logoWidth,
    logoHeight
  );

  ctx.restore();
}

function renderTiledWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: TextWatermarkConfig,
  position: PositionConfig,
  formatFn: (str: string) => string
) {
  const displayText = formatFn(config.text);
  if (!displayText.trim()) return;

  const tileKey = `${width}x${height}::${displayText}::${config.fontWeight}::${config.fontSize}::${config.fontFamily}::${config.color}::${config.opacity}::${position.tileSpacingX}::${position.tileSpacingY}::${position.tileRotation}`;
  let cachedTile = tiledOverlayCache.get(tileKey);

  if (!cachedTile) {
    const buffer =
      typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(width, height)
        : Object.assign(document.createElement('canvas'), { width, height });
    const tCtx = buffer.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (tCtx) {
      const computedFontSize = Math.max(14, Math.round((config.fontSize / 800) * width * 0.7));
      tCtx.save();
      tCtx.font = `${config.fontWeight} ${computedFontSize}px ${config.fontFamily}`;
      tCtx.fillStyle = config.color;
      tCtx.globalAlpha = config.opacity;

      const metrics = tCtx.measureText(displayText);
      const textWidth = metrics.width;
      const stepX = Math.max(textWidth + 80, (position.tileSpacingX / 100) * width);
      const stepY = Math.max(computedFontSize * 3, (position.tileSpacingY / 100) * height);

      tCtx.translate(width / 2, height / 2);
      tCtx.rotate((position.tileRotation * Math.PI) / 180);

      const extent = Math.sqrt(width * width + height * height);
      for (let y = -extent; y <= extent; y += stepY) {
        const rowOffset = Math.floor(y / stepY) % 2 === 0 ? 0 : stepX / 2;
        for (let x = -extent; x <= extent; x += stepX) {
          tCtx.fillText(displayText, x + rowOffset, y);
        }
      }
      tCtx.restore();

      if (tiledOverlayCache.size > 16) {
        const firstKey = tiledOverlayCache.keys().next().value;
        if (firstKey) tiledOverlayCache.delete(firstKey);
      }
      tiledOverlayCache.set(tileKey, buffer);
      cachedTile = buffer;
    }
  } else {
    stegoWorkerManager.recordCacheHit();
  }

  if (cachedTile) {
    ctx.drawImage(cachedTile as CanvasImageSource, 0, 0);
  }
}

async function renderForensicBadges(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  forensics: ForensicSecurityConfig
) {
  const badgeSize = Math.max(64, Math.round(width * 0.1));
  const padding = Math.max(16, Math.round(width * 0.03));

  if (forensics.embedQRCode) {
    const qrPayload = JSON.stringify({
      id: forensics.certificateId,
      name: forensics.recipientName,
      iss: forensics.issuingAuthority,
      date: forensics.issueDate,
    });
    const qrImg = await getOrGenerateQRCode(qrPayload);

    // Place QR Code in bottom-right corner with subtle container
    const qrX = width - padding - badgeSize;
    const qrY = height - padding - badgeSize;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX - 4, qrY - 4, badgeSize + 8, badgeSize + 8);
    ctx.drawImage(qrImg, qrX, qrY, badgeSize, badgeSize);

    // Micro text label
    ctx.fillStyle = '#0f172a';
    ctx.font = `600 ${Math.max(9, Math.round(badgeSize * 0.12))}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('VERIFY', qrX + badgeSize / 2, qrY + badgeSize + 12);
    ctx.restore();
  }

  if (forensics.embedVisibleHash) {
    // Bottom-left cryptographic security ribbon
    const ribbonX = padding;
    const ribbonY = height - padding;
    const fontSize = Math.max(10, Math.round(width * 0.014));

    ctx.save();
    ctx.font = `500 ${fontSize}px monospace`;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    const signature = generateCryptographicSignature(
      forensics.certificateId,
      forensics.recipientName,
      forensics.issueDate
    );
    const hashLabel = `SECURE VERIFY: ${forensics.certificateId} | ${signature.slice(0, 22)}...`;
    const labelWidth = ctx.measureText(hashLabel).width;

    // Background pill for readability on any background
    ctx.fillRect(ribbonX - 6, ribbonY - fontSize - 6, labelWidth + 12, fontSize + 10);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(hashLabel, ribbonX, ribbonY - 2);
    ctx.restore();
  }
}
