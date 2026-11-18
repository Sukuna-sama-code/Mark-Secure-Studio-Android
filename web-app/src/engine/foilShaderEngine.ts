/**
 * Interactive Metallic Foil & Hologram Shader Engine
 * Simulates luxury hot-stamped metallic foils (Gold, Rose Gold, Holographic Rainbow, Obsidian Chrome)
 * with dynamic specular reflection that reacts in real-time to cursor / touch movement.
 */

export type FoilType = 'none' | 'gold' | 'rose-gold' | 'hologram' | 'obsidian';

export interface FoilConfig {
  type: FoilType;
  intensity: number; // 0.0 to 1.0
  sheenSpeed: number; // for ambient idle gleam
  sparkleNoise: boolean; // micro-glitter / speckle texture
  targetZone: 'all' | 'seal' | 'borders' | 'watermark';
}

export const FOIL_PRESETS: Record<Exclude<FoilType, 'none'>, {
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentGlow: string;
}> = {
  gold: {
    name: '24K Imperial Gold Foil',
    description: 'Hot-stamped reflective gold with anisotropic specular luster and warm metallic sheen',
    primaryColor: '#D4AF37',
    secondaryColor: '#FFF8DC',
    accentGlow: 'rgba(212, 175, 55, 0.45)',
  },
  'rose-gold': {
    name: 'Blush Rose Gold Foil',
    description: 'Luxurious copper-pink alloy sheen with platinum glare highlights and warm undertones',
    primaryColor: '#B76E79',
    secondaryColor: '#FFE4E6',
    accentGlow: 'rgba(183, 110, 121, 0.45)',
  },
  hologram: {
    name: 'Prismatic Hologram Rainbow',
    description: 'Optical diffraction grating producing spectral rainbow iridescence that shifts with viewing angle',
    primaryColor: '#06B6D4',
    secondaryColor: '#EC4899',
    accentGlow: 'rgba(56, 189, 248, 0.55)',
  },
  obsidian: {
    name: 'Obsidian Liquid Chrome',
    description: 'Ultra-modern high-contrast liquid metal with sharp obsidian mirror specular reflection',
    primaryColor: '#94A3B8',
    secondaryColor: '#FFFFFF',
    accentGlow: 'rgba(255, 255, 255, 0.45)',
  },
};

/**
 * Creates a dynamic metallic foil gradient for a canvas context based on cursor position
 */
export function createFoilGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  foilType: FoilType,
  pointerPos: { x: number; y: number } = { x: 0.5, y: 0.5 },
  time: number = 0
): CanvasGradient | string {
  if (foilType === 'none') return '#FFFFFF';

  // Normalize cursor position (-1 to 1)
  const nx = (pointerPos.x - 0.5) * 2;
  const ny = (pointerPos.y - 0.5) * 2;

  // Dynamic light beam angle & center
  const angle = Math.atan2(ny, nx) + Math.sin(time * 0.5) * 0.15;
  const cx = width * (0.5 + nx * 0.35);
  const cy = height * (0.5 + ny * 0.35);

  const length = Math.hypot(width, height) * 0.8;
  const dx = Math.cos(angle) * length;
  const dy = Math.sin(angle) * length;

  const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);

  if (foilType === 'gold') {
    grad.addColorStop(0.0, '#78350F');
    grad.addColorStop(0.2, '#B45309');
    grad.addColorStop(0.35, '#F59E0B');
    grad.addColorStop(0.48, '#FEF08A');
    grad.addColorStop(0.5, '#FFFFFF'); // Hot specular peak
    grad.addColorStop(0.52, '#FEF08A');
    grad.addColorStop(0.65, '#F59E0B');
    grad.addColorStop(0.85, '#D97706');
    grad.addColorStop(1.0, '#78350F');
  } else if (foilType === 'rose-gold') {
    grad.addColorStop(0.0, '#4C1D24');
    grad.addColorStop(0.2, '#881337');
    grad.addColorStop(0.35, '#BE123C');
    grad.addColorStop(0.48, '#FDA4AF');
    grad.addColorStop(0.5, '#FFF1F2'); // Hot specular peak
    grad.addColorStop(0.52, '#FDA4AF');
    grad.addColorStop(0.65, '#E11D48');
    grad.addColorStop(0.85, '#9F1239');
    grad.addColorStop(1.0, '#4C1D24');
  } else if (foilType === 'obsidian') {
    grad.addColorStop(0.0, '#090D16');
    grad.addColorStop(0.2, '#1E293B');
    grad.addColorStop(0.38, '#475569');
    grad.addColorStop(0.48, '#CBD5E1');
    grad.addColorStop(0.5, '#FFFFFF'); // Mirror gleam peak
    grad.addColorStop(0.52, '#CBD5E1');
    grad.addColorStop(0.68, '#334155');
    grad.addColorStop(0.85, '#0F172A');
    grad.addColorStop(1.0, '#020617');
  } else if (foilType === 'hologram') {
    // Holographic rainbow dispersion
    const cycle = (offset: number) => {
      const hue = ((offset + (nx + ny) * 0.5 + time * 0.2) % 1 + 1) % 1;
      return `hsl(${hue * 360}, 95%, 65%)`;
    };
    grad.addColorStop(0.0, cycle(0.0));
    grad.addColorStop(0.18, cycle(0.18));
    grad.addColorStop(0.35, cycle(0.35));
    grad.addColorStop(0.48, '#FFFFFF');
    grad.addColorStop(0.5, '#FFFFFF'); // Specular center
    grad.addColorStop(0.52, '#FFFFFF');
    grad.addColorStop(0.65, cycle(0.65));
    grad.addColorStop(0.82, cycle(0.82));
    grad.addColorStop(1.0, cycle(1.0));
  }

  return grad;
}

/**
 * Renders an interactive reactive foil sheen overlay onto a destination canvas
 * Uses composite operation 'source-atop' or 'screen' to illuminate underlying certificate/badge
 */
export function renderFoilSheenOverlay(
  targetCanvas: HTMLCanvasElement,
  foilType: FoilType,
  pointerPos: { x: number; y: number },
  intensity: number = 0.85,
  time: number = 0
): void {
  if (foilType === 'none' || intensity <= 0) return;

  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const w = targetCanvas.width;
  const h = targetCanvas.height;

  ctx.save();
  // Screen or soft-light composite to produce realistic metallic sheen
  ctx.globalCompositeOperation = foilType === 'obsidian' ? 'overlay' : 'screen';
  ctx.globalAlpha = intensity * 0.8;

  // 1. Moving specular light beam
  const foilGrad = createFoilGradient(ctx, w, h, foilType, pointerPos, time);
  ctx.fillStyle = foilGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Focused Radial Specular Glare following the cursor
  const glareX = w * pointerPos.x;
  const glareY = h * pointerPos.y;
  const glareRadius = Math.min(w, h) * 0.45;

  const radialGlare = ctx.createRadialGradient(
    glareX,
    glareY,
    0,
    glareX,
    glareY,
    glareRadius
  );

  if (foilType === 'gold') {
    radialGlare.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    radialGlare.addColorStop(0.2, 'rgba(254, 240, 138, 0.4)');
    radialGlare.addColorStop(0.5, 'rgba(217, 119, 6, 0.15)');
    radialGlare.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else if (foilType === 'rose-gold') {
    radialGlare.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    radialGlare.addColorStop(0.2, 'rgba(253, 164, 175, 0.4)');
    radialGlare.addColorStop(0.5, 'rgba(225, 29, 72, 0.15)');
    radialGlare.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else if (foilType === 'hologram') {
    radialGlare.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    radialGlare.addColorStop(0.25, 'rgba(56, 189, 248, 0.4)');
    radialGlare.addColorStop(0.5, 'rgba(236, 72, 153, 0.25)');
    radialGlare.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else if (foilType === 'obsidian') {
    radialGlare.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    radialGlare.addColorStop(0.25, 'rgba(203, 213, 225, 0.35)');
    radialGlare.addColorStop(0.6, 'rgba(30, 41, 59, 0.15)');
    radialGlare.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }

  ctx.fillStyle = radialGlare;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}
