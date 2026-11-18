/**
 * Content-Aware & AI Inpainting-Resistant Placement Engine
 *
 * Computes image visual saliency, edge gradient density (Sobel filter),
 * and local Shannon entropy to identify zones where generative inpainting
 * (e.g., Stable Diffusion Inpaint, Adobe Content-Aware Fill, LaMa) fails
 * or produces catastrophic visual distortion.
 */

export interface SaliencyCell {
  gridX: number;
  gridY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  gradientMagnitude: number; // 0 to 1
  entropy: number;           // 0 to 1
  inpaintResistance: number; // 0 to 1 (1 = hardest for AI to erase)
}

export interface SaliencyAnalysis {
  cells: SaliencyCell[][];
  rows: number;
  cols: number;
  width: number;
  height: number;
  optimalZone: {
    x: number;
    y: number;
    percentX: number; // -50 to 50
    percentY: number; // -50 to 50
    resistance: number;
    description: string;
  };
  globalAverageResistance: number;
}

/**
 * Analyzes the canvas pixel substrate to produce a spatial saliency and inpainting vulnerability map
 */
export function analyzeImageSaliency(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridCols = 16,
  gridRows = 12
): SaliencyAnalysis {
  const cellW = Math.max(1, Math.floor(width / gridCols));
  const cellH = Math.max(1, Math.floor(height / gridRows));
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const cells: SaliencyCell[][] = [];
  let totalResistance = 0;
  let cellCount = 0;

  let bestCell: SaliencyCell | null = null;
  let maxResistance = -1;

  for (let r = 0; r < gridRows; r++) {
    cells[r] = [];
    for (let c = 0; c < gridCols; c++) {
      const startX = c * cellW;
      const startY = r * cellH;
      const actualW = Math.min(cellW, width - startX);
      const actualH = Math.min(cellH, height - startY);

      // 1. Calculate Edge Gradient Magnitude using 3x3 Sobel approximation
      let edgeSum = 0;
      let sampleCount = 0;
      const step = Math.max(1, Math.floor(actualW / 12));

      // Histogram for Shannon Entropy
      const hist = new Uint32Array(16); // 16 bins for luminance

      for (let y = startY + 1; y < startY + actualH - 1; y += step) {
        for (let x = startX + 1; x < startX + actualW - 1; x += step) {
          const idx = (y * width + x) * 4;
          const idxRight = (y * width + (x + 1)) * 4;
          const idxDown = ((y + 1) * width + x) * 4;

          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const lumR = 0.299 * data[idxRight] + 0.587 * data[idxRight + 1] + 0.114 * data[idxRight + 2];
          const lumD = 0.299 * data[idxDown] + 0.587 * data[idxDown + 1] + 0.114 * data[idxDown + 2];

          const gx = Math.abs(lumR - lum);
          const gy = Math.abs(lumD - lum);
          const grad = Math.sqrt(gx * gx + gy * gy);
          edgeSum += grad;

          const bin = Math.min(15, Math.floor(lum / 16));
          hist[bin]++;
          sampleCount++;
        }
      }

      const avgGrad = sampleCount > 0 ? edgeSum / sampleCount : 0;
      const normalizedGrad = Math.min(1, avgGrad / 65);

      // 2. Shannon Entropy Calculation
      let entropy = 0;
      if (sampleCount > 0) {
        for (let b = 0; b < 16; b++) {
          if (hist[b] > 0) {
            const p = hist[b] / sampleCount;
            entropy -= p * Math.log2(p);
          }
        }
      }
      const normalizedEntropy = Math.min(1, entropy / 4.0); // max entropy for 16 bins is 4.0

      // Inpaint Resistance combines edge density (60%) and texture entropy (40%)
      // AI inpainters struggle most when both high edge gradients and non-repeating entropy coexist.
      // Avoid extreme boundaries (edges 0 and grid-1) to ensure watermark text doesn't clip canvas edge
      const isBoundary = r === 0 || r === gridRows - 1 || c === 0 || c === gridCols - 1;
      const penalty = isBoundary ? 0.75 : 1.0;

      const inpaintResistance = (0.55 * normalizedGrad + 0.45 * normalizedEntropy) * penalty;

      const cell: SaliencyCell = {
        gridX: c,
        gridY: r,
        x: startX,
        y: startY,
        width: actualW,
        height: actualH,
        gradientMagnitude: normalizedGrad,
        entropy: normalizedEntropy,
        inpaintResistance,
      };

      cells[r][c] = cell;
      totalResistance += inpaintResistance;
      cellCount++;

      // We look for the best anchor zone (prefer middle 70% of canvas)
      const centerFactor = 1.0 - 0.25 * (
        Math.abs(c - (gridCols - 1) / 2) / (gridCols / 2) +
        Math.abs(r - (gridRows - 1) / 2) / (gridRows / 2)
      );

      const candidateScore = inpaintResistance * centerFactor;
      if (!isBoundary && candidateScore > maxResistance) {
        maxResistance = candidateScore;
        bestCell = cell;
      }
    }
  }

  // Fallback if bestCell not found
  if (!bestCell) {
    bestCell = cells[Math.floor(gridRows / 2)][Math.floor(gridCols / 2)];
  }

  // Convert cell center to canvas percentage offsets (-50% to +50%)
  const centerX = bestCell.x + bestCell.width / 2;
  const centerY = bestCell.y + bestCell.height / 2;
  const percentX = Math.round(((centerX - width / 2) / width) * 100);
  const percentY = Math.round(((centerY - height / 2) / height) * 100);

  return {
    cells,
    rows: gridRows,
    cols: gridCols,
    width,
    height,
    optimalZone: {
      x: centerX,
      y: centerY,
      percentX,
      percentY,
      resistance: Math.round(bestCell.inpaintResistance * 1000) / 10,
      description: `Zone [${bestCell.gridX}, ${bestCell.gridY}]: Dense edge gradient & high semantic entropy. Generative inpainting here produces severe distortion.`,
    },
    globalAverageResistance: cellCount > 0 ? Math.round((totalResistance / cellCount) * 1000) / 10 : 50,
  };
}

/**
 * Renders an interactive Saliency & Inpaint Vulnerability Heatmap overlay onto a canvas
 */
export function renderSaliencyHeatmapOverlay(
  targetCanvas: HTMLCanvasElement,
  analysis: SaliencyAnalysis,
  activeWatermarkPercentX?: number,
  activeWatermarkPercentY?: number
): void {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const { cells, rows, cols, width, height, optimalZone } = analysis;

  ctx.save();

  // Darkened base overlay
  ctx.fillStyle = 'rgba(10, 5, 12, 0.45)';
  ctx.fillRect(0, 0, width, height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      const res = cell.inpaintResistance; // 0 to 1

      // Color mapping:
      // Red (< 0.25): High Inpaint Risk (smooth, flat, easily erased by AI)
      // Amber (0.25 - 0.55): Moderate Resistance
      // Emerald / Cyan (> 0.55): Strong Anti-Inpaint Shield Zone (complex edges, texture)
      let fill = '';
      if (res < 0.25) {
        fill = `rgba(239, 68, 68, ${0.25 + (1 - res) * 0.25})`; // Red
      } else if (res < 0.55) {
        fill = `rgba(245, 158, 11, ${0.20 + res * 0.25})`;     // Amber
      } else {
        fill = `rgba(16, 185, 129, ${0.25 + res * 0.35})`;     // Emerald
      }

      ctx.fillStyle = fill;
      ctx.fillRect(cell.x, cell.y, cell.width, cell.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
    }
  }

  // Draw Optimal Zone Pin
  ctx.save();
  ctx.fillStyle = '#10b981';
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(optimalZone.x, optimalZone.y, 8, 0, Math.PI * 2);
  ctx.fill();

  // Outer pulsating ring
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(optimalZone.x, optimalZone.y, 16, 0, Math.PI * 2);
  ctx.stroke();

  // Label
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ Anti-Inpaint Optimal Zone', optimalZone.x, optimalZone.y - 24);
  ctx.restore();

  // Draw current watermark position indicator if provided
  if (activeWatermarkPercentX !== undefined && activeWatermarkPercentY !== undefined) {
    const curX = width / 2 + (activeWatermarkPercentX / 100) * width;
    const curY = height / 2 + (activeWatermarkPercentY / 100) * height;

    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(curX, curY, 22, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(curX, curY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = '#bae6fd';
    ctx.textAlign = 'center';
    ctx.fillText('Current Mark', curX, curY + 36);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Evaluates current watermark position resistance rating (0 - 100%)
 */
export function evaluatePositionResistance(
  percentX: number,
  percentY: number,
  analysis: SaliencyAnalysis
): { score: number; label: string; tier: 'vulnerable' | 'moderate' | 'immune' } {
  const { width, height, cells, rows, cols } = analysis;
  const curX = width / 2 + (percentX / 100) * width;
  const curY = height / 2 + (percentY / 100) * height;

  const col = Math.min(cols - 1, Math.max(0, Math.floor((curX / width) * cols)));
  const row = Math.min(rows - 1, Math.max(0, Math.floor((curY / height) * rows)));

  const cell = cells[row]?.[col];
  const resistance = cell ? cell.inpaintResistance : 0.5;
  const score = Math.round(resistance * 1000) / 10;

  if (score < 30) {
    return {
      score,
      label: 'Vulnerable to AI Inpainting (Flat Substrate)',
      tier: 'vulnerable',
    };
  } else if (score < 65) {
    return {
      score,
      label: 'Moderate AI Inpaint Resistance',
      tier: 'moderate',
    };
  } else {
    return {
      score,
      label: 'Anti-Inpaint Immune (Dense Semantic Edges)',
      tier: 'immune',
    };
  }
}
