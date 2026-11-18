import { CertificateTemplate, CertificateContent, ForensicSecurityConfig } from '../types';
import { embedSteganography } from './stegoEngine';
import { generateCryptographicSignature } from './cryptoUtils';
import { applyAntiAiPoisonPerturbation } from './antiAiPoisonEngine';
import { stegoWorkerManager } from './workerClient';

// OffscreenCanvas & Path2D Vector Caches for 60fps zoom/pan and fast batch generation
const guillochePathCache = new Map<string, { hypotrochoid: Path2D; perimeter: Path2D }>();
const certificateShellCache = new Map<string, OffscreenCanvas | HTMLCanvasElement>();

function createOffscreenBuffer(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return c;
}

/**
 * Draws realistic signature flourish paths
 */
function drawSignature(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  variant: 1 | 2 = 1
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  if (variant === 1) {
    ctx.moveTo(x - 50, y);
    ctx.bezierCurveTo(x - 30, y - 25, x - 10, y + 10, x + 10, y - 15);
    ctx.bezierCurveTo(x + 25, y - 30, x + 35, y + 5, x + 50, y - 8);
    // Loop
    ctx.bezierCurveTo(x + 60, y - 18, x + 40, y - 35, x + 30, y - 10);
    // Underline flourish
    ctx.moveTo(x - 55, y + 6);
    ctx.quadraticCurveTo(x, y + 14, x + 65, y + 2);
  } else {
    ctx.moveTo(x - 45, y - 5);
    ctx.quadraticCurveTo(x - 20, y - 28, x - 5, y - 8);
    ctx.quadraticCurveTo(x + 10, y + 12, x + 25, y - 20);
    ctx.bezierCurveTo(x + 35, y - 35, x + 55, y - 5, x + 60, y - 12);
    // Double cross flourish
    ctx.moveTo(x - 20, y - 18);
    ctx.lineTo(x + 40, y - 16);
    ctx.moveTo(x - 40, y + 8);
    ctx.quadraticCurveTo(x + 10, y + 16, x + 55, y + 4);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws guilloche wave patterns for security using cached Path2D geometry
 */
function drawGuillocheWaves(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  opacity: number = 0.08
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  ctx.lineWidth = 1;

  const pathKey = `${width}x${height}`;
  let cachedPaths = guillochePathCache.get(pathKey);

  if (!cachedPaths && typeof Path2D !== 'undefined') {
    const centerX = width / 2;
    const centerY = height / 2;
    const R = Math.min(width, height) * 0.38;
    const r = R * 0.28;
    const p = R * 0.55;

    const hypotrochoid = new Path2D();
    const steps = 360 * 3;
    for (let i = 0; i <= steps; i += 3) {
      const theta = (i * Math.PI) / 180;
      const x = centerX + (R - r) * Math.cos(theta) + p * Math.cos(((R - r) * theta) / r);
      const y = centerY - (R - r) * Math.sin(theta) + p * Math.sin(((R - r) * theta) / r);
      if (i === 0) hypotrochoid.moveTo(x, y);
      else hypotrochoid.lineTo(x, y);
    }

    const perimeter = new Path2D();
    for (let x = 60; x <= width - 60; x += 12) {
      const y1 = 55 + Math.sin(x * 0.04) * 4;
      const y2 = height - 55 + Math.sin(x * 0.04) * 4;
      perimeter.moveTo(x, y1);
      perimeter.lineTo(x + 6, y1);
      perimeter.moveTo(x, y2);
      perimeter.lineTo(x + 6, y2);
    }

    cachedPaths = { hypotrochoid, perimeter };
    guillochePathCache.set(pathKey, cachedPaths);
  }

  if (cachedPaths) {
    ctx.stroke(cachedPaths.hypotrochoid);
    ctx.stroke(cachedPaths.perimeter);
  } else {
    const centerX = width / 2;
    const centerY = height / 2;
    const R = Math.min(width, height) * 0.38;
    const r = R * 0.28;
    const p = R * 0.55;

    ctx.beginPath();
    const steps = 360 * 3;
    for (let i = 0; i <= steps; i += 3) {
      const theta = (i * Math.PI) / 180;
      const x = centerX + (R - r) * Math.cos(theta) + p * Math.cos(((R - r) * theta) / r);
      const y = centerY - (R - r) * Math.sin(theta) + p * Math.sin(((R - r) * theta) / r);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws ornate corner ornaments based on cornerStyle
 */
function drawCornerOrnaments(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  margin: number,
  style: CertificateTemplate['cornerStyle'],
  primary: string,
  secondary: string
) {
  if (style === 'none') return;

  const corners = [
    { x: margin, y: margin, flipX: 1, flipY: 1 },
    { x: width - margin, y: margin, flipX: -1, flipY: 1 },
    { x: margin, y: height - margin, flipX: 1, flipY: -1 },
    { x: width - margin, y: height - margin, flipX: -1, flipY: -1 },
  ];

  ctx.save();
  for (const c of corners) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(c.flipX, c.flipY);

    if (style === 'baroque-flourish') {
      ctx.strokeStyle = secondary;
      ctx.fillStyle = primary;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(15, 0, 30, 8, 35, 25);
      ctx.bezierCurveTo(40, 42, 28, 55, 12, 52);
      ctx.bezierCurveTo(0, 48, -4, 30, 5, 20);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(0, 15, 8, 30, 25, 35);
      ctx.bezierCurveTo(42, 40, 55, 28, 52, 12);
      ctx.bezierCurveTo(48, 0, 30, -4, 20, 5);
      ctx.stroke();

      // Corner gold dot
      ctx.beginPath();
      ctx.arc(8, 8, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'art-deco-bracket') {
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(0, 40);
      ctx.lineTo(0, 0);
      ctx.lineTo(40, 0);
      ctx.stroke();

      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, 32);
      ctx.lineTo(8, 8);
      ctx.lineTo(32, 8);
      ctx.stroke();

      ctx.fillStyle = primary;
      ctx.fillRect(4, 4, 4, 4);
    } else if (style === 'greek-corner') {
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.lineTo(0, 10);
      ctx.lineTo(20, 10);
      ctx.lineTo(20, 25);
      ctx.lineTo(10, 25);
      ctx.lineTo(10, 0);
      ctx.lineTo(30, 0);
      ctx.stroke();
    } else if (style === 'tech-target') {
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 25);
      ctx.lineTo(0, 0);
      ctx.lineTo(25, 0);
      ctx.stroke();

      ctx.strokeStyle = primary;
      ctx.beginPath();
      ctx.arc(14, 14, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = secondary;
      ctx.fillRect(12, 12, 4, 4);
    } else if (style === 'royal-crest') {
      ctx.fillStyle = primary;
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, 0);
      ctx.lineTo(0, 24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(10, 10, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (style === 'minimal-cross') {
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(20, 0);
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 20);
      ctx.stroke();
    } else if (style === 'cyber-bracket') {
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 35);
      ctx.lineTo(0, 0);
      ctx.lineTo(35, 0);
      ctx.stroke();

      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, 8, 8);
    } else if (style === 'vintage-knot') {
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(15, 15, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(15, 15, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Draws decorative borders based on borderStyle
 */
function drawBorders(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  template: CertificateTemplate
) {
  const { borderStyle, palette } = template;
  const p = palette;

  ctx.save();
  const m1 = 28;
  const m2 = 36;
  const m3 = 44;

  if (borderStyle === 'double-filigree') {
    // Outer thick fillet
    ctx.strokeStyle = p.borderPrimary;
    ctx.lineWidth = 6;
    ctx.strokeRect(m1, m1, width - m1 * 2, height - m1 * 2);

    // Fine inner gold line
    ctx.strokeStyle = p.borderSecondary;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(m2, m2, width - m2 * 2, height - m2 * 2);

    // Third hairline
    ctx.strokeStyle = p.borderPrimary;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(m3, m3, width - m3 * 2, height - m3 * 2);
  } else if (borderStyle === 'guilloche-ornament') {
    ctx.strokeStyle = p.borderPrimary;
    ctx.lineWidth = 4;
    ctx.strokeRect(m1, m1, width - m1 * 2, height - m1 * 2);

    // Decorative dashed ribbon
    ctx.strokeStyle = p.borderSecondary;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4, 2, 4]);
    ctx.strokeRect(m2, m2, width - m2 * 2, height - m2 * 2);
    ctx.setLineDash([]);

    ctx.strokeStyle = p.accentGold;
    ctx.lineWidth = 1;
    ctx.strokeRect(m3, m3, width - m3 * 2, height - m3 * 2);
  } else if (borderStyle === 'art-deco-chevron') {
    ctx.strokeStyle = p.borderPrimary;
    ctx.lineWidth = 5;
    ctx.strokeRect(m1, m1, width - m1 * 2, height - m1 * 2);

    ctx.strokeStyle = p.borderSecondary;
    ctx.lineWidth = 2;
    ctx.strokeRect(m2 + 4, m2 + 4, width - (m2 + 4) * 2, height - (m2 + 4) * 2);

    // Corner Art Deco steps
    const stepSize = 25;
    ctx.fillStyle = p.borderPrimary;
    ctx.fillRect(m1, m1, stepSize, stepSize);
    ctx.fillRect(width - m1 - stepSize, m1, stepSize, stepSize);
    ctx.fillRect(m1, height - m1 - stepSize, stepSize, stepSize);
    ctx.fillRect(width - m1 - stepSize, height - m1 - stepSize, stepSize, stepSize);
  } else if (borderStyle === 'greek-fret') {
    ctx.strokeStyle = p.borderPrimary;
    ctx.lineWidth = 7;
    ctx.strokeRect(m1, m1, width - m1 * 2, height - m1 * 2);

    ctx.strokeStyle = p.borderSecondary;
    ctx.lineWidth = 2;
    ctx.strokeRect(m2, m2, width - m2 * 2, height - m2 * 2);

    // Fretwork dots around border
    ctx.fillStyle = p.accentGold;
    for (let x = m1 + 20; x < width - m1 - 20; x += 30) {
      ctx.fillRect(x, m1 - 2, 4, 4);
      ctx.fillRect(x, height - m1 - 2, 4, 4);
    }
  } else if (borderStyle === 'royal-laurel') {
    // Rich royal double border with gold shimmer
    ctx.strokeStyle = p.borderPrimary;
    ctx.lineWidth = 8;
    ctx.strokeRect(m1, m1, width - m1 * 2, height - m1 * 2);

    ctx.strokeStyle = p.borderSecondary;
    ctx.lineWidth = 3;
    ctx.strokeRect(m2 + 2, m2 + 2, width - (m2 + 2) * 2, height - (m2 + 2) * 2);

    ctx.strokeStyle = p.accentGold;
    ctx.lineWidth = 1;
    ctx.strokeRect(m3, m3, width - m3 * 2, height - m3 * 2);
  } else if (borderStyle === 'tech-circuit') {
    ctx.strokeStyle = p.borderPrimary;
    ctx.lineWidth = 3;
    ctx.strokeRect(m1, m1, width - m1 * 2, height - m1 * 2);

    ctx.strokeStyle = p.borderSecondary;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(m2 + 2, m2 + 2, width - (m2 + 2) * 2, height - (m2 + 2) * 2);

    // Circuit trace nodes
    ctx.fillStyle = p.accentGold;
    const nodes = [
      { x: width * 0.25, y: m1 },
      { x: width * 0.75, y: m1 },
      { x: width * 0.25, y: height - m1 },
      { x: width * 0.75, y: height - m1 },
      { x: m1, y: height * 0.35 },
      { x: m1, y: height * 0.65 },
      { x: width - m1, y: height * 0.35 },
      { x: width - m1, y: height * 0.65 },
    ];
    for (const node of nodes) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (borderStyle === 'swiss-grid') {
    // Razor sharp architectural frame
    ctx.strokeStyle = p.borderPrimary;
    ctx.lineWidth = 4;
    ctx.strokeRect(m1, m1, width - m1 * 2, height - m1 * 2);

    ctx.strokeStyle = p.borderSecondary;
    ctx.lineWidth = 1;
    ctx.strokeRect(m2, m2, width - m2 * 2, height - m2 * 2);
  } else if (borderStyle === 'cyber-glow') {
    // Neon glow line
    ctx.shadowColor = p.borderPrimary;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = p.borderPrimary;
    ctx.lineWidth = 3;
    ctx.strokeRect(m1, m1, width - m1 * 2, height - m1 * 2);

    ctx.shadowColor = p.borderSecondary;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = p.borderSecondary;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(m2 + 2, m2 + 2, width - (m2 + 2) * 2, height - (m2 + 2) * 2);
    ctx.shadowBlur = 0;
  } else {
    // Vintage copper or baroque default
    ctx.strokeStyle = p.borderPrimary;
    ctx.lineWidth = 5;
    ctx.strokeRect(m1, m1, width - m1 * 2, height - m1 * 2);

    ctx.strokeStyle = p.borderSecondary;
    ctx.lineWidth = 2;
    ctx.strokeRect(m2, m2, width - m2 * 2, height - m2 * 2);
  }

  // Draw corner ornaments
  drawCornerOrnaments(ctx, width, height, m1 + 2, template.cornerStyle, p.borderPrimary, p.borderSecondary);
  ctx.restore();
}

/**
 * Draws the 3D embossed seal and ribbon
 */
function drawSealAndRibbon(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  template: CertificateTemplate,
  sealLogo?: HTMLImageElement | null
) {
  const p = template.palette;

  ctx.save();

  // 1. Ribbon tails (two hanging ribbons extending downward)
  ctx.save();
  ctx.fillStyle = p.sealRibbon || p.sealSecondary;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 4;

  // Left ribbon
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy + radius * 0.6);
  ctx.lineTo(cx - 32, cy + radius + 42);
  ctx.lineTo(cx - 18, cy + radius + 32); // notch
  ctx.lineTo(cx - 4, cy + radius + 42);
  ctx.lineTo(cx - 2, cy + radius * 0.6);
  ctx.closePath();
  ctx.fill();

  // Right ribbon
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy + radius * 0.6);
  ctx.lineTo(cx + 4, cy + radius + 42);
  ctx.lineTo(cx + 18, cy + radius + 32); // notch
  ctx.lineTo(cx + 32, cy + radius + 42);
  ctx.lineTo(cx + 14, cy + radius * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. Outer Scalloped Gear Teeth
  ctx.save();
  const teeth = 36;
  ctx.fillStyle = p.sealSecondary;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i * Math.PI) / teeth;
    const r = i % 2 === 0 ? radius + 5 : radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 3. Main Seal Radial Metallic Body
  ctx.save();
  const gradient = ctx.createRadialGradient(
    cx - radius * 0.3,
    cy - radius * 0.3,
    radius * 0.1,
    cx,
    cy,
    radius
  );
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.3, p.sealPrimary);
  gradient.addColorStop(0.85, p.sealSecondary);
  gradient.addColorStop(1, '#111111');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner ring bevel
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = p.sealSecondary;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Center emblem or official brand seal logo
  if (sealLogo && sealLogo.complete && sealLogo.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.44, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(sealLogo, cx - radius * 0.44, cy - radius * 0.44, radius * 0.88, radius * 0.88);
    ctx.restore();
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 3;
    drawStar(ctx, cx, cy, 5, radius * 0.35, radius * 0.18);
    ctx.fill();
  }

  // 5. Seal circular micro text
  ctx.font = 'bold 7px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VERIFIED', cx, cy + radius * 0.52);

  ctx.restore();
  ctx.restore();
}

/**
 * Draws a 5-point star
 */
function drawStar(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

/**
 * Wraps text into multiple lines
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export interface CertificateRenderOptions {
  sampleCertImage?: HTMLImageElement | null;
  samplePhotoImage?: HTMLImageElement | null;
  sealLogoImage?: HTMLImageElement | null;
  includePhotoBadge?: boolean;
  useOfficialCertImage?: boolean;
}

/**
 * Draws an ornate circular photo badge with gold rim
 */
function drawPhotoBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  photoImg: HTMLImageElement,
  goldColor: string
) {
  ctx.save();
  // Outer embossed gold ring
  ctx.beginPath();
  ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
  ctx.fillStyle = goldColor;
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 6;
  ctx.fill();

  // Secondary inner line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner portrait clip
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(photoImg, x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

/**
 * Main render function for drawing a certificate with locked template shell and custom editable content
 */
export function renderCertificateCanvas(
  canvas: HTMLCanvasElement,
  template: CertificateTemplate,
  content: CertificateContent,
  scale: number = 1,
  options?: CertificateRenderOptions
): void {
  const width = 1200 * scale;
  const height = 850 * scale;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const p = template.palette;

  // If using official scanned certificate image sample as base
  if (options?.useOfficialCertImage && options.sampleCertImage && options.sampleCertImage.complete && options.sampleCertImage.naturalWidth > 0) {
    ctx.drawImage(options.sampleCertImage, 0, 0, width, height);

    // If photo badge is enabled, overlay recipient photo on top right
    if (options.includePhotoBadge && options.samplePhotoImage && options.samplePhotoImage.complete) {
      drawPhotoBadge(ctx, width - 150 * scale, 150 * scale, 48 * scale, options.samplePhotoImage, p.accentGold || '#d4af37');
    }

    // Microprint security line overlay at bottom
    ctx.save();
    ctx.fillStyle = 'rgba(30, 20, 15, 0.85)';
    ctx.font = `mono ${9.5 * scale}px monospace, monospace`;
    ctx.textAlign = 'left';
    const issueDateStr = `VERIFIED SCAN  •  DATE: ${content.issueDate || 'October 10, 2026'}`;
    const certIdStr = `CERTIFICATE ID: ${content.certificateId || 'CERT-2026-X9942'}`;
    ctx.fillText(`${issueDateStr}  •  ${certIdStr}`, 70 * scale, height - 38 * scale);
    ctx.restore();
    return;
  }

  // 1-3. OffscreenCanvas Cached Shell (Background + Guilloché Path2D + Filigree Borders + Heraldic Seal)
  const sealLogoKey = options?.sealLogoImage?.src ? options.sealLogoImage.src.slice(-24) : 'default-star';
  const shellCacheKey = `${template.id}::${scale}::${sealLogoKey}`;
  let cachedShell = certificateShellCache.get(shellCacheKey);

  if (!cachedShell) {
    const shellBuffer = createOffscreenBuffer(width, height);
    const sCtx = shellBuffer.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (sCtx) {
      if (p.backgroundGradient) {
        const grad = sCtx.createLinearGradient(0, 0, width, height);
        if (template.category === 'Cyberpunk & Sci-Fi Neon') {
          grad.addColorStop(0, '#0a0514');
          grad.addColorStop(0.5, '#120824');
          grad.addColorStop(1, '#06030a');
        } else {
          grad.addColorStop(0, p.background);
          grad.addColorStop(1, '#f0ede6');
        }
        sCtx.fillStyle = grad;
      } else {
        sCtx.fillStyle = p.background;
      }
      sCtx.fillRect(0, 0, width, height);

      // Subtle security guilloche background waves (using cached Path2D)
      drawGuillocheWaves(sCtx, width, height, p.borderSecondary, 0.07);

      // Ornate Template Borders & Corner Flourishes
      drawBorders(sCtx, width, height, template);

      // Pre-render 3D Embossed Heraldic Seal & Ribbon onto cached shell
      const sealX = width - 180 * scale;
      const sealY = height - 170 * scale;
      drawSealAndRibbon(sCtx, sealX, sealY, 48 * scale, template, options?.sealLogoImage);

      if (certificateShellCache.size > 32) {
        const oldestKey = certificateShellCache.keys().next().value;
        if (oldestKey) certificateShellCache.delete(oldestKey);
      }
      certificateShellCache.set(shellCacheKey, shellBuffer);
      cachedShell = shellBuffer;
    }
  } else {
    stegoWorkerManager.recordCacheHit();
  }

  if (cachedShell) {
    ctx.drawImage(cachedShell as CanvasImageSource, 0, 0);
  }

  // 4. Center Institutional Heraldry / Header Crest
  const centerX = width / 2;
  ctx.save();
  ctx.fillStyle = p.borderSecondary;
  ctx.font = `bold ${12 * scale}px serif`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = `${4 * scale}px`;
  ctx.fillText(
    (content.issuerOrganization || 'OFFICIAL ACCREDITATION BUREAU').toUpperCase(),
    centerX,
    88 * scale
  );
  ctx.restore();

  // 5. Certificate Title (LOCKED POSITION & FONT, EDITABLE TEXT)
  ctx.save();
  ctx.fillStyle = p.textTitle;
  const isSerif = template.fontTheme === 'classic-serif' || template.fontTheme === 'luxury-roman';
  const fontFam = isSerif ? 'Georgia, "Times New Roman", serif' : 'system-ui, -apple-system, sans-serif';

  ctx.font = `bold ${32 * scale}px ${fontFam}`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = `${3 * scale}px`;
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 3 * scale;
  ctx.fillText(content.title || 'CERTIFICATE OF ACHIEVEMENT', centerX, 138 * scale);
  ctx.shadowBlur = 0;

  // Decorative divider below title
  ctx.strokeStyle = p.borderSecondary;
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(centerX - 160 * scale, 155 * scale);
  ctx.lineTo(centerX + 160 * scale, 155 * scale);
  ctx.stroke();

  // Little diamond in center of divider
  ctx.fillStyle = p.accentGold;
  ctx.fillRect(centerX - 3 * scale, 153.5 * scale, 6 * scale, 3 * scale);
  ctx.restore();

  // 6. Subtitle / Presentation text
  ctx.save();
  ctx.fillStyle = p.textMuted;
  ctx.font = `italic ${15 * scale}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(
    content.subtitle || 'This credential is proud to confer upon',
    centerX,
    192 * scale
  );
  ctx.restore();

  // 7. Recipient Name (HERO FIELD: Large, prominent, distinct)
  ctx.save();
  ctx.fillStyle = p.textRecipient;
  const recipientFont =
    template.fontTheme === 'calligraphy'
      ? 'cursive, "Brush Script MT", Georgia'
      : template.fontTheme === 'tech-mono'
      ? 'monospace, "Courier New"'
      : 'Georgia, "Times New Roman", serif';

  ctx.font = `bold ${44 * scale}px ${recipientFont}`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = `${1.5 * scale}px`;
  ctx.fillText(content.recipientName || 'Recipient Name', centerX, 258 * scale);

  // Recipient underline flourish
  ctx.strokeStyle = p.accentGold;
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  const nameWidth = Math.max(340 * scale, ctx.measureText(content.recipientName || 'Recipient').width + 40 * scale);
  ctx.moveTo(centerX - nameWidth / 2, 276 * scale);
  ctx.lineTo(centerX + nameWidth / 2, 276 * scale);
  ctx.stroke();

  // Underline double end flourishes
  ctx.beginPath();
  ctx.arc(centerX - nameWidth / 2, 276 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.arc(centerX + nameWidth / 2, 276 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.fillStyle = p.borderPrimary;
  ctx.fill();
  ctx.restore();

  // 8. Description / Achievement body copy
  ctx.save();
  ctx.fillStyle = p.textBody;
  ctx.font = `${14.5 * scale}px "Times New Roman", Georgia, serif`;
  ctx.textAlign = 'center';
  const maxWidth = 760 * scale;
  const descLines = wrapText(ctx, content.description || '', maxWidth);
  let descY = 325 * scale;
  for (const line of descLines.slice(0, 4)) {
    ctx.fillText(line, centerX, descY);
    descY += 24 * scale;
  }
  ctx.restore();

  // 9. Institutional Seal & Ribbon is already blitted from the cached OffscreenCanvas shell

  // Recipient portrait photo badge if enabled
  if (options?.includePhotoBadge && options.samplePhotoImage && options.samplePhotoImage.complete) {
    drawPhotoBadge(ctx, width - 160 * scale, 160 * scale, 45 * scale, options.samplePhotoImage, p.accentGold || '#d4af37');
  }

  // 10. Dual Signatories & Lines (Bottom Left & Center Left)
  const sig1X = 220 * scale;
  const sig2X = 520 * scale;
  const sigLineY = height - 150 * scale;

  // Signatory 1
  ctx.save();
  drawSignature(ctx, sig1X, sigLineY - 24 * scale, p.borderPrimary, 1);
  ctx.strokeStyle = p.borderSecondary;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(sig1X - 100 * scale, sigLineY);
  ctx.lineTo(sig1X + 100 * scale, sigLineY);
  ctx.stroke();

  ctx.fillStyle = p.textTitle;
  ctx.font = `bold ${13 * scale}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(content.signatory1Name || 'Dr. Eleanor Vance', sig1X, sigLineY + 18 * scale);

  ctx.fillStyle = p.textMuted;
  ctx.font = `${11 * scale}px sans-serif`;
  ctx.fillText(content.signatory1Title || 'Dean of Academic Affairs', sig1X, sigLineY + 34 * scale);
  ctx.restore();

  // Signatory 2
  ctx.save();
  drawSignature(ctx, sig2X, sigLineY - 24 * scale, p.borderPrimary, 2);
  ctx.strokeStyle = p.borderSecondary;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(sig2X - 100 * scale, sigLineY);
  ctx.lineTo(sig2X + 100 * scale, sigLineY);
  ctx.stroke();

  ctx.fillStyle = p.textTitle;
  ctx.font = `bold ${13 * scale}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(content.signatory2Name || 'Jonathan Sterling', sig2X, sigLineY + 18 * scale);

  ctx.fillStyle = p.textMuted;
  ctx.font = `${11 * scale}px sans-serif`;
  ctx.fillText(content.signatory2Title || 'Executive Director', sig2X, sigLineY + 34 * scale);
  ctx.restore();

  // 11. Bottom Microprint & Security Metadata Line
  ctx.save();
  ctx.fillStyle = p.textMuted;
  ctx.font = `mono ${9.5 * scale}px monospace, monospace`;
  ctx.textAlign = 'left';
  const issueDateStr = `DATE ISSUED: ${content.issueDate || 'October 10, 2026'}`;
  const certIdStr = `CERTIFICATE ID: ${content.certificateId || 'CERT-2026-X9942'}`;
  const verifyUrlStr = `VERIFICATION: ${content.verificationUrl || 'verify.marksecure.io'}`;

  ctx.fillText(`${issueDateStr}  •  ${certIdStr}`, 70 * scale, height - 58 * scale);
  ctx.fillText(verifyUrlStr, 70 * scale, height - 44 * scale);

  // Micro-dot anti-counterfeiting rule
  ctx.strokeStyle = p.borderSecondary;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 0.5 * scale;
  ctx.setLineDash([2 * scale, 2 * scale]);
  ctx.beginPath();
  ctx.moveTo(68 * scale, height - 38 * scale);
  ctx.lineTo(width - 68 * scale, height - 38 * scale);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/**
 * Exports certificate canvas as PNG Data URL at standard or 300 DPI high-resolution print scale
 */
export async function exportCertificateDataUrl(
  template: CertificateTemplate,
  content: CertificateContent,
  highRes: boolean = false,
  options?: CertificateRenderOptions
): Promise<string> {
  const canvas = document.createElement('canvas');
  const scale = highRes ? 2 : 1;
  renderCertificateCanvas(canvas, template, content, scale, options);
  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Embeds MarkSecure invisible forensic steganography onto the certificate with anti-remover armor
 */
export async function embedForensicWatermarkOnCertificate(
  canvas: HTMLCanvasElement,
  content: CertificateContent,
  forensics?: Partial<ForensicSecurityConfig>
): Promise<{ success: boolean; dataUrl: string; sectors: number }> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { success: false, dataUrl: '', sectors: 0 };

  const certId = content.certificateId || 'CERT-2026-X9942';
  const recipient = content.recipientName || 'Alexander J. Sterling';
  const issueDate = content.issueDate || 'October 10, 2026';
  const issuer = content.issuerOrganization || 'MarkSecure Authority';

  const signature = generateCryptographicSignature(certId, recipient, issueDate);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const payload = {
    magic: 'MKSEC2' as const,
    certId,
    recipient,
    issuer,
    timestamp: Date.now(),
    hash: certId.slice(-8),
    signature,
    securityLevel: forensics?.securityLevel || 'military-immune',
    honeytokenCanary: forensics?.enableHoneytokens ? forensics?.honeytokenCanaryId || 'CANARY-TRIP-8F4A2C' : undefined,
    antiAiPoisonHash: forensics?.enableAntiAiPoisoning ? 'ANTI-AI-DEF-V2' : undefined,
    c2paManifestHash: forensics?.enableC2paCredentials ? 'C2PA-CERT-V2' : undefined,
  };

  try {
    const workerOut = await stegoWorkerManager.processPixelPipeline({
      imageData: imgData,
      enableAntiAiPoisoning: Boolean(forensics?.enableAntiAiPoisoning),
      antiAiPoisonEpsilon: forensics?.antiAiPoisonEpsilon || 4,
      antiAiPoisonIntensity: forensics?.antiAiPoisonIntensity || 'balanced',
      embedStego: true,
      payload,
      useArmor: forensics?.antiRemoverArmor !== false,
    });
    ctx.putImageData(workerOut.imageData, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    return { success: true, dataUrl, sectors: workerOut.sectorsEmbedded };
  } catch {
    // Fallback if worker fails
    if (forensics?.enableAntiAiPoisoning) {
      applyAntiAiPoisonPerturbation(
        imgData,
        forensics.antiAiPoisonEpsilon || 4,
        forensics.antiAiPoisonIntensity || 'balanced'
      );
    }
    const result = embedSteganography(imgData, payload, forensics?.antiRemoverArmor !== false);
    ctx.putImageData(imgData, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    return { success: result.success, dataUrl, sectors: result.sectorsEmbedded };
  }
}
