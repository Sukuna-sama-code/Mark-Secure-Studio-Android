import JSZip from 'jszip';
import type { WebGradient } from './webGradients';

export interface CheckpointExportOptions {
  config: Record<string, unknown>;
  activeGradient: WebGradient;
  activeAtmosphereId: string;
  currentImage: {
    name: string;
    width: number;
    height: number;
    dataUrl?: string | null;
  } | null;
  canvasElement?: HTMLCanvasElement | null;
}

/**
 * Creates a comprehensive project checkpoint backup ZIP containing:
 * 1. project-manifest.json with all watermark settings, styling configs, and gradient info
 * 2. studio-watermark-config.json
 * 3. canvas-snapshot.png (if canvas is loaded)
 * 4. original-source-info.json
 * 5. README-CHECKPOINT.txt explaining how to restore or inspect this session
 */
export async function exportStudioCheckpointZip(options: CheckpointExportOptions): Promise<void> {
  const { config, activeGradient, activeAtmosphereId, currentImage, canvasElement } = options;
  const zip = new JSZip();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dateStr = new Date().toLocaleString();

  // 1. Manifest
  const manifest = {
    appName: 'MarkSecure Studio',
    version: '3.5.0',
    exportedAt: dateStr,
    timestamp,
    activeBackground: {
      id: activeGradient.id,
      name: activeGradient.name,
      primaryColor: activeGradient.primaryColor,
      secondaryColor: activeGradient.secondaryColor,
      atmosphereId: activeAtmosphereId,
    },
    canvasState: {
      hasImageLoaded: Boolean(currentImage),
      imageName: currentImage?.name || 'none',
      dimensions: currentImage ? { width: currentImage.width, height: currentImage.height } : null,
    },
    watermarkConfig: config,
  };

  zip.file('checkpoint-manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('watermark-settings.json', JSON.stringify(config, null, 2));

  // 2. Readme
  const readmeContent = `=====================================================
 MARKSECURE STUDIO — PROJECT CHECKPOINT BACKUP
 Generated on: ${dateStr}
=====================================================

This archive contains the snapshot of your active MarkSecure Studio session.

FILES IN THIS BACKUP:
1. checkpoint-manifest.json
   Complete session metadata including active background palette, atmosphere,
   canvas dimensions, and watermark configuration.

2. watermark-settings.json
   Stand-alone exported settings (text, font, opacity, steganography payload,
   forensic signatures, tiling, holographic foil configuration).

3. canvas-rendered-snapshot.png (if image was loaded)
   Full-resolution export of the rendered canvas at the exact moment of saving.

4. source-original.png (if available)
   The raw source image used before applying the watermarking layer.

MarkSecure Studio: Enterprise Media Protection & Forensics Engine.
`;
  zip.file('README-CHECKPOINT.txt', readmeContent);

  // 3. Rendered Canvas Snapshot
  if (canvasElement) {
    try {
      const dataUrl = canvasElement.toDataURL('image/png');
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      zip.file('canvas-rendered-snapshot.png', base64Data, { base64: true });
    } catch {
      // Ignore if canvas is tainted by external cross-origin image
    }
  }

  // 4. Original Image if available as dataUrl
  if (currentImage?.dataUrl && currentImage.dataUrl.startsWith('data:image/')) {
    try {
      const parts = currentImage.dataUrl.split(',');
      if (parts[1]) {
        zip.file(`source-original-${currentImage.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`, parts[1], { base64: true });
      }
    } catch {
      // Ignore
    }
  }

  // Generate ZIP blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MarkSecure_Studio_Checkpoint_${timestamp}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
