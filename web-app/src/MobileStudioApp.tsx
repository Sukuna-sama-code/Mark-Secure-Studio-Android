import QRCode from 'qrcode';
import {analyzeImageSaliency} from './engine/contentAwarePlacement';
import './spatial.css';
import {Trash2, Home, Search, Layers, Briefcase, Upload, Download, Image as ImageIcon, ArrowLeft, Maximize2, X, Shield, FileText, HelpCircle} from 'lucide-react';
import JSZip from 'jszip';
import {SampleLibrary} from './SampleLibrary';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Types matching MarkSecure Studio v3.5.0 Manifest ---
type WatermarkType = 'text' | 'logo' | 'both';
type MainNavTab = 'studio' | 'verify' | 'batch' | 'tools';
type StudioSubTab = 'text' | 'logo' | 'layout' | 'forensics' | 'certs';
type VisionMode = 'normal' | 'saliency' | 'noise' | 'foil';

interface AtmosphereTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bgDark: string;
  surface: string;
}

const FIXED_THEME: AtmosphereTheme = {id:'obsidian',name:'Obsidian',primary:'#56f5d7',secondary:'#69eadf',bgDark:'#0f1115',surface:'#20252e'};

const FONT_FAMILIES = [
  { label: 'Cabinet Grotesk (Display)', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'JetBrains Mono (Forensic)', value: 'monospace' },
  { label: 'Playfair Display (Serif)', value: 'Georgia, serif' },
  { label: 'Inter Bold (Clean)', value: 'Arial, sans-serif' },
];

const CERT_TEMPLATES = [
  {
    id: 'fortress_ip',
    title: 'IP Ownership & Copyright Deed',
    subtitle: 'MARKSECURE ROOT AUTHORITY • C2PA VERIFIED',
    recipient: 'Kasu Nosam Vikram Swaroop Reddy',
    body: 'This cryptographic deed certifies sovereign intellectual property ownership, protected by 8x LSB steganography and L-infinity adversarial armor.',
    accent: '#ff8177',
  },
  {
    id: 'scholarship_merit',
    title: 'National AI Fellowship Certificate',
    subtitle: 'EXCELLENCE IN DEEP LEARNING & COMPUTER VISION',
    recipient: 'Vikram Swaroop Reddy',
    body: 'Awarded for outstanding research and engineering execution in neural network architectures and cryptographic media verification.',
    accent: '#38ef7d',
  },
  {
    id: 'iso_security',
    title: 'Military-Immune Clearance Seal',
    subtitle: 'FORTRESS-SEC-2026 COMPLIANCE MATRIX',
    recipient: 'Enterprise Security Division',
    body: 'Cleared for zero-trust distribution with embedded Canary Honeytoken tripwires and tamper-evident Reference checksum visual signatures.',
    accent: '#00d2ff',
  },
];

export default function MobileStudioApp() {
  // Remove any legacy floating docks injected by MainActivity or older scripts
  useEffect(() => {
    document.getElementById('ms-mobile-nav')?.remove();
    document.getElementById('ms-android-dock')?.remove();
  }, []);

  // --- Navigation & View State ---
  const [activeNav, setActiveNav] = useState<MainNavTab>('studio');
  const [studioTab, setStudioTab] = useState<StudioSubTab>('text');
  const [visionMode, setVisionMode] = useState<VisionMode>('normal');
  const [canvasExpanded, setCanvasExpanded] = useState(false);
  const theme = FIXED_THEME;
  const [editing,setEditing]=useState(false);
  const [library,setLibrary]=useState<null | string>(null);
  const [busy,setBusy]=useState(false);
  const [batchFiles,setBatchFiles]=useState<File[]>([]);
  const [deleteMode,setDeleteMode]=useState<'files'|'outputs'|null>(null);
  const [selectedItems,setSelectedItems]=useState<Set<number>>(new Set());
  const exitDelete=()=>{setDeleteMode(null);setSelectedItems(new Set());};
  const toggleSelected=(i:number)=>setSelectedItems(previous=>{const next=new Set(previous);if(next.has(i))next.delete(i);else next.add(i);return next;});

  const [help,setHelp]=useState(false);
  const checkpointRef=useRef<HTMLInputElement>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // --- Watermark Configuration State (Matches watermark-settings.json) ---
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');

  // Text State
  const [rawText, setRawText] = useState('© Your name');
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0].value);
  const [fontSize, setFontSize] = useState(20);
  const [fontWeight, setFontWeight] = useState('700');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textOpacity, setTextOpacity] = useState(0.55);
  const [textRotation, setTextRotation] = useState(0);
  const [letterSpacing, setLetterSpacing] = useState(2);
  const [shadowBlur, setShadowBlur] = useState(3);
  const [hasBackground, setHasBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [backgroundPadding, setBackgroundPadding] = useState(6);

  // Logo State
  const [logoUrl, setLogoUrl] = useState('./brand.png');
  const [logoScale, setLogoScale] = useState(0.22);
  const [logoOpacity, setLogoOpacity] = useState(0.85);
  const [logoRotation, setLogoRotation] = useState(0);
  const [logoBlendMode, setLogoBlendMode] = useState<GlobalCompositeOperation>('source-over');

  // Position & Tiling State
  const [anchor, setAnchor] = useState<'tl' | 'tc' | 'tr' | 'ml' | 'center' | 'mr' | 'bl' | 'bc' | 'br'>('br');
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [tiled, setTiled] = useState(false);
  const [tileSpacingX, setTileSpacingX] = useState(30);
  const [tileSpacingY, setTileSpacingY] = useState(25);
  const [enableFoil, setEnableFoil] = useState(false);
  const [enableContentAware, setEnableContentAware] = useState(false);

  // Forensics State
  const [embedSteganography, setEmbedSteganography] = useState(true);
  const [embedVisibleHash, setEmbedVisibleHash] = useState(false);
  const [embedQRCode, setEmbedQRCode] = useState(false);
  const [antiRemoverArmor, setAntiRemoverArmor] = useState(false);
  const [redundancyLevel, setRedundancyLevel] = useState('1x');
  const [recipientName, setRecipientName] = useState('Intellectual Property Owner');
  const [certificateId, setCertificateId] = useState('FORTRESS-SEC-2026');
  const [issuingAuthority, setIssuingAuthority] = useState('Your organization');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0,10));
  const [securityLevel, setSecurityLevel] = useState('embedded');
  const [enableHoneytokens, setEnableHoneytokens] = useState(true);
  const [honeytokenCanaryId, setHoneytokenCanaryId] = useState('CANARY-TRIP-8F4A2C');
  const [enableC2pa, setEnableC2pa] = useState(false);
  const [c2paSignerName, setC2paSignerName] = useState('MarkSecure Root Authority');
  const [showC2paBadge, setShowC2paBadge] = useState(false);
  const [enableAntiAiPoisoning, setEnableAntiAiPoisoning] = useState(false);
  const [antiAiPoisonEpsilon, setAntiAiPoisonEpsilon] = useState(4);

  // --- Canvas & Image Refs ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const verifyInputRef = useRef<HTMLInputElement | null>(null);

  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState<string>('Sample_Certificate.jpg');

  // --- Verify Tab State ---
  const [verifyReport, setVerifyReport] = useState<{
    status: 'detected' | 'unverified';
    certId: string;
    recipient: string;
    authority: string;
    canary: string;
    c2paSigner: string;
    security: string;
    date: string;
    hash: string;
  } | null>(null);

  // --- Batch Tab State ---
  const [batchRecipients, setBatchRecipients] = useState(
    'Recipient One, CERT-001\nRecipient Two, CERT-002'
  );
  const [batchOutputs, setBatchOutputs] = useState<Array<{ name: string; certId: string; dataUrl: string }>>([]);

  // --- Legal / DMCA State ---
  const [dmcaInfringerUrl, setDmcaInfringerUrl] = useState('https://unauthorized-mirror.example.com/stolen-asset.png');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  // --- Helper: Generate Procedural Certificate Image ---
  const generateTemplateBitmap = useCallback((tpl = CERT_TEMPLATES[0]) => {
    const off = document.createElement('canvas');
    off.width = 1200;
    off.height = 850;
    const ctx = off.getContext('2d');
    if (!ctx) return;

    // Rich dark security background
    const grad = ctx.createLinearGradient(0, 0, 1200, 850);
    grad.addColorStop(0, '#140810');
    grad.addColorStop(0.5, '#1f0f1d');
    grad.addColorStop(1, '#0c0612');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 850);

    // Guilloche security grid lines
    ctx.strokeStyle = 'rgba(255, 129, 119, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 850);
      ctx.stroke();
    }
    for (let y = 0; y < 850; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // Double ornamental border
    ctx.strokeStyle = tpl.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, 1128, 778);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(48, 48, 1104, 754);

    // Header
    ctx.fillStyle = tpl.accent;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(tpl.subtitle, 600, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px Georgia, serif';
    ctx.fillText(tpl.title, 600, 215);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '18px sans-serif';
    ctx.fillText('PROUDLY PRESENTED & CRYPTOGRAPHICALLY ISSUED TO', 600, 300);

    // Recipient
    ctx.fillStyle = tpl.accent;
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(tpl.recipient, 600, 370);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(320, 405);
    ctx.lineTo(880, 405);
    ctx.stroke();

    // Body text
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '22px sans-serif';
    ctx.fillText(tpl.body.slice(0, 68), 600, 470);
    ctx.fillText(tpl.body.slice(68), 600, 505);

    // Footer metadata
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '16px monospace';
    ctx.fillText(`CERT ID: ${certificateId}   •   ISSUED: ${issueDate}`, 600, 680);
    ctx.fillText(`AUTHORITY: ${issuingAuthority}`, 600, 715);

    const img = new Image();
    img.onload = () => {
      setSourceImg(img);
      setImageName(`${tpl.id}.png`);
    };
    img.src = off.toDataURL('image/png');
  }, [certificateId, issueDate, issuingAuthority]);

  useEffect(() => { const im=new Image(); im.onload=()=>setLogoImg(im); im.src=logoUrl; },[logoUrl]);
  useEffect(()=>{ const im=new Image(); im.onload=()=>{setSourceImg(im);setImageName('Sample photograph');}; im.src='./sample.jpg'; },[]);
  useEffect(()=>{ (window as any).markSecureBack=()=>{if(library){setLibrary(null);return true;}if(help){setHelp(false);return true;}if(canvasExpanded){setCanvasExpanded(false);return true;}if(editing){setEditing(false);return true;}if(deleteMode){exitDelete();return true;}if(activeNav!=='studio'){setActiveNav('studio');return true;}return false;}; },[library,help,canvasExpanded,editing,activeNav,deleteMode]);
  // --- Resolve Dynamic Tags in Watermark Text ---
  const resolveTags = useCallback(
    (input: string, customName?: string, customCertId?: string) => {
      return input
        .replace(/\{name\}|\{recipient\}/g, customName || recipientName)
        .replace(/\{cert_id\}/g, customCertId || certificateId)
        .replace(/\{date\}/g, issueDate)
        .replace(/\{issuer\}/g, issuingAuthority)
        .replace(/\{org\}/g, c2paSignerName)
        .replace(/\{year\}/g, String(new Date().getFullYear()));
    },
    [recipientName, certificateId, issueDate, issuingAuthority, c2paSignerName]
  );

  // --- Short Forensic Hash Generator ---
  const computeVisualHash = useCallback(() => {
    const raw = `${certificateId}|${recipientName}|${issuingAuthority}|${honeytokenCanaryId}|${c2paSignerName}`;
    let h1 = 0xdeadbeef ^ raw.length;
    let h2 = 0x41c6ce57 ^ raw.length;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0').toUpperCase() + (h1 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  }, [certificateId, recipientName, issuingAuthority, honeytokenCanaryId, c2paSignerName]);

  // --- Main Canvas Watermark & Forensics Pipeline ---
  const renderCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement, customRecipient?: string, customCertId?: string, customSource?: HTMLImageElement) => {
      const baseImage = customSource || sourceImg;
      if (!baseImage) return;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      const W = baseImage.naturalWidth || baseImage.width || 1200;
      const H = baseImage.naturalHeight || baseImage.height || 850;
      targetCanvas.width = W;
      targetCanvas.height = H;

      // 1. Base Image
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(baseImage, 0, 0, W, H);

      // 2. Vision Mode: Saliency Heatmap or Adversarial Noise Preview
      if (visionMode === 'saliency') {
        ctx.save();
        ctx.fillStyle = 'rgba(18, 7, 14, 0.55)';
        ctx.fillRect(0, 0, W, H);
        const rad = ctx.createRadialGradient(W * 0.5, H * 0.5, W * 0.05, W * 0.5, H * 0.5, W * 0.55);
        rad.addColorStop(0, 'rgba(255, 40, 80, 0.65)');
        rad.addColorStop(0.5, 'rgba(255, 190, 0, 0.4)');
        rad.addColorStop(1, 'rgba(0, 210, 255, 0.25)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // 3. Holographic Foil Shader Layer
      if (enableFoil || visionMode === 'foil') {
        ctx.save();
        const foilGrad = ctx.createLinearGradient(0, 0, W, H);
        foilGrad.addColorStop(0, 'rgba(255, 0, 128, 0.14)');
        foilGrad.addColorStop(0.33, 'rgba(0, 255, 255, 0.14)');
        foilGrad.addColorStop(0.66, 'rgba(255, 230, 0, 0.14)');
        foilGrad.addColorStop(1, 'rgba(140, 0, 255, 0.14)');
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = foilGrad;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // Calculate Anchor Coordinates
      const anchorMap: Record<typeof anchor, [number, number]> = {
        tl: [W * 0.18, H * 0.18],
        tc: [W * 0.5, H * 0.18],
        tr: [W * 0.82, H * 0.18],
        ml: [W * 0.18, H * 0.5],
        center: [W * 0.5, H * 0.5],
        mr: [W * 0.82, H * 0.5],
        bl: [W * 0.18, H * 0.82],
        bc: [W * 0.5, H * 0.82],
        br: [W * 0.82, H * 0.82],
      };
      const [baseX, baseY] = anchorMap[anchor];
      const cx = baseX + (offsetX / 100) * (W * 0.4);
      const cy = baseY + (offsetY / 100) * (H * 0.4);

      // 4. Render Text Layer
      if (watermarkType === 'text' || watermarkType === 'both') {
        const resolved = resolveTags(rawText, customRecipient, customCertId);
        const scaledFont = Math.max(14, Math.round((fontSize / 700) * W));

        ctx.save();
        ctx.font = `${fontWeight} ${scaledFont}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = textOpacity;

        const drawSingleText = (tx: number, ty: number) => {
          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate((textRotation * Math.PI) / 180);

          const metrics = ctx.measureText(resolved);
          const tw = metrics.width + letterSpacing * resolved.length;
          const th = scaledFont * 1.35;

          if (hasBackground) {
            ctx.fillStyle = backgroundColor;
            const pad = backgroundPadding * (W / 600);
            ctx.fillRect(-tw / 2 - pad, -th / 2 - pad / 2, tw + pad * 2, th + pad);
          }

          ctx.shadowColor = 'rgba(0,0,0,0.65)';
          ctx.shadowBlur = shadowBlur * 2;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = textColor;
          if ('letterSpacing' in ctx) (ctx as any).letterSpacing = `${letterSpacing}px`;
          ctx.fillText(resolved, 0, 0);
          ctx.restore();
        };

        if (tiled) {
          const metrics = ctx.measureText(resolved);
          const stepX = Math.max(160, metrics.width + (tileSpacingX / 100) * W * 0.45);
          const stepY = Math.max(90, scaledFont * 2 + (tileSpacingY / 100) * H * 0.35);
          const diag = Math.hypot(W, H);

          for (let y = -diag * 0.25; y < H + diag * 0.25; y += stepY) {
            for (let x = -diag * 0.25; x < W + diag * 0.25; x += stepX) {
              drawSingleText(x, y);
            }
          }
        } else {
          drawSingleText(cx, cy);
        }
        ctx.restore();
      }

      // 5. Render Logo Layer
      if ((watermarkType === 'logo' || watermarkType === 'both') && logoImg) {
        ctx.save();
        ctx.globalAlpha = logoOpacity;
        ctx.globalCompositeOperation = logoBlendMode;
        const lw = Math.max(48, W * logoScale);
        const lh = lw * (logoImg.naturalHeight / (logoImg.naturalWidth || 1));

        ctx.translate(cx, cy);
        ctx.rotate((logoRotation * Math.PI) / 180);
        ctx.drawImage(logoImg, -lw / 2, -lh / 2, lw, lh);
        ctx.restore();
      }

      // 6. C2PA Content Credentials Corner Badge
      if (enableC2pa && showC2paBadge) {
        ctx.save();
        const bw = Math.max(210, W * 0.24);
        const bh = Math.max(36, H * 0.052);
        const bx = W - bw - 16;
        const by = 16;

        ctx.fillStyle = 'rgba(15, 7, 14, 0.86)';
        ctx.strokeStyle = theme.secondary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 999);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(11, Math.round(bh * 0.38))}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🛡️ C2PA • ${c2paSignerName.slice(0, 18)}`, bx + bw / 2, by + bh / 2);
        ctx.restore();
      }

      // 7. Visible Cryptographic Hash & QR Matrix Footer
      const hashStr = computeVisualHash();
      if (embedVisibleHash || embedQRCode) {
        ctx.save();
        const barH = Math.max(44, Math.round(H * 0.065));
        ctx.fillStyle = 'rgba(10, 4, 9, 0.88)';
        ctx.fillRect(0, H - barH, W, barH);

        ctx.fillStyle = theme.secondary;
        ctx.fillRect(0, H - barH, W, 2);

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(11, Math.round(barH * 0.33))}px monospace`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const certLabel = customCertId || certificateId;
        ctx.fillText(
          `MARKSECURE [${securityLevel.toUpperCase()}] • ID: ${certLabel} • REF: ${hashStr}`,
          16,
          H - barH / 2
        );

        if (embedQRCode) {
          const qrSize = barH - 10;
          const qx = W - qrSize - 12;
          const qy = H - barH + 5;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(qx, qy, qrSize, qrSize);
          ctx.fillStyle = '#000000';
          const matrix = QRCode.create(`MarkSecure:${customCertId || certificateId}`, {errorCorrectionLevel:'M'}).modules;
          const cells = matrix.size;
          const cellW = qrSize / (cells + 8);
          for (let r=0;r<cells;r++) for(let c=0;c<cells;c++) if(matrix.get(r,c)) ctx.fillRect(qx+(c+4)*cellW,qy+(r+4)*cellW,Math.ceil(cellW),Math.ceil(cellW));
        }
        ctx.restore();
      }

      // 8. Pixel-Level Anti-AI Perturbation & LSB Forensic Steganography
      if (enableAntiAiPoisoning || embedSteganography || visionMode === 'noise') {
        const imgData = ctx.getImageData(0, 0, W, H);
        const data = imgData.data;

        if (enableAntiAiPoisoning || visionMode === 'noise') {
          const eps = visionMode === 'noise' ? Math.max(24, antiAiPoisonEpsilon * 6) : antiAiPoisonEpsilon;
          for (let i = 0; i < data.length; i += 4) {
            const mod = (i / 4) % 2 === 0 ? eps : -eps;
            data[i] = Math.min(255, Math.max(0, data[i] + mod));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] - mod));
          }
        }

        if (embedSteganography) {
          const payload = `MS35|${customCertId || certificateId}|${customRecipient || recipientName}|${issuingAuthority}|${honeytokenCanaryId}|${c2paSignerName}|${securityLevel}|${issueDate}|${hashStr}|END`;
          const encoded = new TextEncoder().encode(payload);
          if(encoded.length * 8 > W * H) throw new Error('Image is too small for the hidden payload');
          for (let charIdx = 0; charIdx < encoded.length; charIdx++) {
            const code = encoded[charIdx];
            for (let bit = 0; bit < 8; bit++) {
              const bVal = (code >> (7 - bit)) & 1;
              const pixelBlueIdx = (charIdx * 8 + bit) * 4 + 2;
              if (pixelBlueIdx < data.length) {
                data[pixelBlueIdx] = (data[pixelBlueIdx] & 0xfe) | bVal;
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
      }
    },
    [
      sourceImg,
      visionMode,
      enableFoil,
      anchor,
      offsetX,
      offsetY,
      watermarkType,
      rawText,
      fontSize,
      fontWeight,
      fontFamily,
      textOpacity,
      textRotation,
      letterSpacing,
      hasBackground,
      backgroundColor,
      backgroundPadding,
      shadowBlur,
      textColor,
      tiled,
      tileSpacingX,
      tileSpacingY,
      logoImg,
      logoOpacity,
      logoBlendMode,
      logoScale,
      logoRotation,
      enableC2pa,
      showC2paBadge,
      c2paSignerName,
      theme.secondary,
      computeVisualHash,
      embedVisibleHash,
      embedQRCode,
      securityLevel,
      certificateId,
      enableAntiAiPoisoning,
      antiAiPoisonEpsilon,
      embedSteganography,
      recipientName,
      issuingAuthority,
      honeytokenCanaryId,
      issueDate,
      resolveTags,
    ]
  );

  useEffect(() => {
    if (canvasRef.current && sourceImg) {
      try { renderCanvas(canvasRef.current); } catch(e) { showToast(e instanceof Error ? e.message : 'Unable to render image'); }
    }
  }, [renderCanvas, sourceImg, editing, activeNav]);

  // --- Decode LSB Steganography in Verify Tab ---
  const decodeCanvasPayload = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, Math.min(20, canvas.height));
    const data = imgData.data;

    let chars = '';
    for (let charIdx = 0; charIdx < 4096; charIdx++) {
      let code = 0;
      for (let bit = 0; bit < 8; bit++) {
        const pixelBlueIdx = (charIdx * 8 + bit) * 4 + 2;
        if (pixelBlueIdx < data.length) {
          code = (code << 1) | (data[pixelBlueIdx] & 1);
        }
      }
      if (code >= 32) {
        chars += String.fromCharCode(code);
        if (chars.endsWith('|END')) break;
      } else {
        break;
      }
    }

    if (chars.startsWith('MS35|') && chars.endsWith('|END')) {
      const parts = new TextDecoder().decode(Uint8Array.from(chars,c=>c.charCodeAt(0))).split('|');
      setVerifyReport({
        status: 'detected',
        certId: parts[1] || certificateId,
        recipient: parts[2] || recipientName,
        authority: parts[3] || issuingAuthority,
        canary: parts[4] || honeytokenCanaryId,
        c2paSigner: parts[5] || c2paSignerName,
        security: parts[6] || securityLevel,
        date: parts[7] || issueDate,
        hash: parts[8] || computeVisualHash(),
      });
      showToast('Embedded watermark detected');
    } else {
      setVerifyReport({
        status: 'unverified',
        certId: 'NONE FOUND',
        recipient: 'Unknown',
        authority: 'Unsigned Media',
        canary: 'No Canary Detected',
        c2paSigner: 'None',
        security: 'unprotected',
        date: 'N/A',
        hash: 'UNSIGNED',
      });
      showToast('⚠️ No MarkSecure Stego Signature Found');
    }
  };

  // --- Export High-Res Protected Image (Works on Web & Android Bridge) ---
  const handleExportImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const fileName = `MarkSecure_${certificateId}_${Date.now()}.png`;

    const androidBridge = (window as unknown as { AndroidBridge?: { saveBase64File: (d: string, m: string, f: string) => void } }).AndroidBridge;
    if (androidBridge && typeof androidBridge.saveBase64File === 'function') {
      androidBridge.saveBase64File(dataUrl, 'image/png', fileName);
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      a.click();
      showToast(`Saved ${fileName}`);
    }
  };

  // --- Export Checkpoint JSON ---
  const handleExportCheckpoint = () => {
    const manifest = {
      appName: 'MarkSecure Studio',
      version: '4.0.0-Mobile',
      exportedAt: new Date().toLocaleString(),
      activeBackground: theme,
      watermarkConfig: {
        text: { text: rawText, fontFamily, fontSize, fontWeight, color: textColor, opacity: textOpacity, rotation: textRotation, letterSpacing },
        logo: { imageUrl: logoUrl, scale: logoScale, opacity: logoOpacity, rotation: logoRotation },
        position: { anchor, offsetX, offsetY, tiled, tileSpacingX, tileSpacingY },
        forensics: {
          embedSteganography,
          embedVisibleHash,
          embedQRCode,
          antiRemoverArmor,
          redundancyLevel,
          recipientName,
          certificateId,
          issuingAuthority,
          issueDate,
          securityLevel,
          enableContentAwarePlacement: enableContentAware,
          enableHoneytokens,
          honeytokenCanaryId,
          enableC2paCredentials: enableC2pa,
          c2paSignerName,
          showC2paBadge,
          enableAntiAiPoisoning,
          antiAiPoisonEpsilon,
        },
        watermarkType,
      },
    };
    const dataUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(manifest, null, 2))));
    const fileName = `MarkSecure_Checkpoint_${Date.now()}.json`;

    const androidBridge = (window as unknown as { AndroidBridge?: { saveBase64File: (d: string, m: string, f: string) => void } }).AndroidBridge;
    if (androidBridge && typeof androidBridge.saveBase64File === 'function') {
      androidBridge.saveBase64File(dataUrl, 'application/json', fileName);
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      a.click();
      showToast('Checkpoint JSON Exported');
    }
  };

  // --- Run Batch Processor ---
  const handleRunBatch = () => {
    const lines = batchRecipients
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const results: Array<{ name: string; certId: string; dataUrl: string }> = [];
    const tempCanvas = document.createElement('canvas');

    lines.forEach((line, idx) => {
      const [namePart, idPart] = line.split(',').map((s) => s.trim());
      const rName = namePart || `Recipient #${idx + 1}`;
      const cId = idPart || `FORTRESS-BATCH-${idx + 101}`;
      renderCanvas(tempCanvas, rName, cId);
      results.push({ name: rName, certId: cId, dataUrl: tempCanvas.toDataURL('image/png') });
    });

    setBatchOutputs(results);
    showToast(`Generated ${results.length} images`);
  };

  const removeCanvas=()=>{setSourceImg(null);setImageName('');setEditing(false);setCanvasExpanded(false);if(canvasRef.current){canvasRef.current.width=0;canvasRef.current.height=0;}if(fileInputRef.current)fileInputRef.current.value='';showToast('Image removed from current canvas');};
  const deletionControls=(kind:'files'|'outputs',count:number)=>deleteMode===kind?<div className="delete-controls"><span role="status">{selectedItems.size} selected</span><button disabled={busy} onClick={()=>setSelectedItems(selectedItems.size===count?new Set():new Set(Array.from({length:count},(_,i)=>i)))}>{selectedItems.size===count?'Deselect all':'Select all'}</button><button disabled={busy||!selectedItems.size} className="danger" onClick={()=>{if(kind==='files')setBatchFiles(items=>items.filter((_,i)=>!selectedItems.has(i)));else setBatchOutputs(items=>items.filter((_,i)=>!selectedItems.has(i)));showToast(`${selectedItems.size} items removed from batch`);exitDelete();}}><Trash2 size={18}/>Delete selected</button><button disabled={busy} onClick={exitDelete}>Cancel</button></div>:<button className="danger" disabled={busy||!count} onClick={()=>{setDeleteMode(kind);setSelectedItems(new Set());}}><Trash2 size={18}/>Delete {kind==='files'?'files':'outputs'}</button>;
  const loadImage = (url:string,name:string) => { const im=new Image(); im.crossOrigin='anonymous'; im.onload=()=>{setSourceImg(im);setImageName(name);setEditing(true);setActiveNav('studio');setLibrary(null);}; im.onerror=()=>showToast('Image could not load. Check your connection or import a local file.');im.src=url; };
  const readImage = (file:File|undefined,mode:string) => {if(!file)return;const r=new FileReader();r.onload=()=>{const url=r.result as string;if(mode==='studio')loadImage(url,file.name);else {const im=new Image();im.onload=()=>{if(mode==='logo'){setLogoUrl(url);setLogoImg(im);}else{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d')!.drawImage(im,0,0);decodeCanvasPayload(c);}};im.onerror=()=>showToast('Unsupported or damaged image');im.src=url;}};r.readAsDataURL(file);};
  const save = (data:string,mime:string,name:string) => {const bridge=(window as any).AndroidBridge;if(bridge)bridge.saveBase64File(data,mime,name);else{const a=document.createElement('a');a.href=data;a.download=name;a.click();}};
  const zipBatch=async()=>{setBusy(true);try{const z=new JSZip();batchOutputs.forEach((o,i)=>z.file(`${i+1}_${o.certId.replace(/[^a-z0-9_-]/gi,'_')}.png`,o.dataUrl.split(',')[1],{base64:true}));save('data:application/zip;base64,'+await z.generateAsync({type:'base64'}),'application/zip','MarkSecure_Batch.zip');}catch(e){console.error('ZIP export failed',e);showToast('Could not export ZIP');}finally{setBusy(false);}};
  const runImages=async()=>{if(!batchFiles.length||batchFiles.length>25){showToast('Choose 1–25 images');return;}setBusy(true);try{const results:Array<{name:string;certId:string;dataUrl:string}>=[];let pixels=0;for(const f of batchFiles){const url=URL.createObjectURL(f);try{const im=await new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=url;});pixels+=im.width*im.height;if(pixels>60000000)throw new Error('Batch exceeds 60 megapixels. Select fewer images.');const c=document.createElement('canvas');renderCanvas(c,undefined,undefined,im);results.push({name:f.name,certId:f.name.replace(/\.[^.]+$/,''),dataUrl:c.toDataURL('image/png')});await new Promise(r=>setTimeout(r,0));}finally{URL.revokeObjectURL(url);}}setBatchOutputs(results);showToast('Batch complete');}catch(e){showToast(e instanceof Error?e.message:'Could not process an image');}finally{setBusy(false);}};
  const restore=async(f?:File)=>{if(!f)return;try{const c=JSON.parse(await f.text()).watermarkConfig;if(!c?.text||!c?.position)throw Error();setRawText(String(c.text.text||''));setFontFamily(c.text.fontFamily||FONT_FAMILIES[0].value);setFontSize(Math.max(10,Math.min(54,Number(c.text.fontSize)||20)));setTextOpacity(Math.max(0,Math.min(1,Number(c.text.opacity)||.65)));setTextRotation(Number(c.text.rotation)||0);setLetterSpacing(Number(c.text.letterSpacing)||0);setFontWeight(c.text.fontWeight||'700');if(['tl','tc','tr','ml','center','mr','bl','bc','br'].includes(c.position.anchor))setAnchor(c.position.anchor);setOffsetX(Number(c.position.offsetX)||0);setOffsetY(Number(c.position.offsetY)||0);setTiled(!!c.position.tiled);setTileSpacingX(Number(c.position.tileSpacingX)||30);setTileSpacingY(Number(c.position.tileSpacingY)||25);if(['text','logo','both'].includes(c.watermarkType))setWatermarkType(c.watermarkType);if(c.logo?.imageUrl){setLogoUrl(c.logo.imageUrl);setLogoScale(Number(c.logo.scale)||.22);setLogoOpacity(Number(c.logo.opacity)||.85);setLogoRotation(Number(c.logo.rotation)||0);}if(c.forensics){const x=c.forensics;setRecipientName(String(x.recipientName||''));setCertificateId(String(x.certificateId||''));setIssuingAuthority(String(x.issuingAuthority||''));setIssueDate(String(x.issueDate||''));setEmbedSteganography(!!x.embedSteganography);setHoneytokenCanaryId(String(x.honeytokenCanaryId||''));}showToast('Checkpoint restored');setEditing(true);setActiveNav('studio');}catch{showToast('This is not a valid MarkSecure checkpoint');}};
  const field=(label:string,value:string,change:(v:string)=>void)=><label className="field">{label}<input value={value} onChange={e=>change(e.target.value.replace(/\|/g,''))}/></label>;
  const slider=(label:string,value:number,min:number,max:number,change:(v:number)=>void,unit='')=><label className="range"><span>{label}<b>{value}{unit}</b></span><input type="range" min={min} max={max} value={value} onChange={e=>change(+e.target.value)}/></label>;
  const toggle=(label:string,value:boolean,change:(v:boolean)=>void)=><label className="toggle"><span>{label}</span><input type="checkbox" checked={value} onChange={e=>change(e.target.checked)}/></label>;
  return <div className="app">
    <input hidden ref={fileInputRef} type="file" accept="image/*" onChange={e=>{readImage(e.target.files?.[0],'studio');e.target.value='';}}/>
    <input hidden ref={logoInputRef} type="file" accept="image/*" onChange={e=>{readImage(e.target.files?.[0],'logo');e.target.value='';}}/>
    <input hidden ref={verifyInputRef} type="file" accept="image/*" onChange={e=>{readImage(e.target.files?.[0],'verify');e.target.value='';}}/>
    <input hidden ref={checkpointRef} type="file" accept="application/json,.json" onChange={e=>{restore(e.target.files?.[0]);e.target.value='';}}/>
    <header>{editing&&activeNav==='studio'?<><button className="icon" aria-label="Back to Studio" onClick={()=>setEditing(false)}><ArrowLeft/></button><div><strong>Watermark studio</strong><small>{imageName}</small></div></>:<><img className="brand" src="./brand.png" alt=""/><strong>MarkSecure Studio</strong></>}<button className="icon help" aria-label="Help" onClick={()=>setHelp(true)}><HelpCircle/></button></header>
    <main>
      {activeNav==='studio'&&!editing&&<section className="home"><p className="eyebrow">CREATE · PROTECT · INSPECT</p><h1>Your creative studio</h1><div className="stage" onPointerMove={e=>{if(e.pointerType==='mouse'||e.buttons){const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--tilt',`${((e.clientX-r.left)/r.width-.5)*12}deg`);}}} onPointerLeave={e=>e.currentTarget.style.setProperty('--tilt','-5deg')}><div className="float-photo"><img src="./sample.jpg" alt="Sample photograph in a layered preview"/><img className="hero-brand" src="./brand.png" alt=""/></div></div><p className="tagline">Your image. Your signature.</p><button className="primary" onClick={()=>fileInputRef.current?.click()}><Upload/>Import image</button><button onClick={()=>setActiveNav('verify')}><Shield/>Verify image</button><div className="section-title"><h2>Create more</h2><button className="text-button" onClick={()=>setLibrary('Images')}>Browse samples</button></div><div className="grid"><button onClick={()=>setActiveNav('batch')}><Layers/>Batch watermark</button><button onClick={()=>setLibrary('Certificates')}><FileText/>Certificates</button></div>{sourceImg&&<div className="current-canvas"><button className="resume" onClick={()=>setEditing(true)}>Open current canvas <span>→</span></button><button className="icon danger" aria-label="Remove current canvas image" onClick={removeCanvas}><Trash2/></button></div>}</section>}
      {activeNav==='studio'&&editing&&<section className="editor"><div className="steps"><span>1 Import</span><b>2 Customize</b><span>3 Export</span></div><div className={'preview '+(canvasExpanded?'expanded':'')}><canvas ref={canvasRef}/><button className="icon canvas-delete danger" aria-label="Remove current canvas image" onClick={removeCanvas}><Trash2/></button><button className="icon" aria-label={canvasExpanded?'Close full preview':'Expand preview'} onClick={()=>setCanvasExpanded(!canvasExpanded)}>{canvasExpanded?<X/>:<Maximize2/>}</button></div><div className="toolbar"><button onClick={()=>fileInputRef.current?.click()}><ImageIcon size={17}/>Replace</button><button onClick={()=>setLibrary('Images')}>Samples</button></div><div className="segments">{(['text','logo','both'] as const).map(t=><button className={watermarkType===t?'active':''} key={t} onClick={()=>setWatermarkType(t)}>{t==='both'?'Text + logo':t==='text'?'Text':'Logo'}</button>)}</div><div className="tabs">{(['text','logo','layout','forensics'] as const).map(t=><button key={t} className={studioTab===t?'active':''} onClick={()=>setStudioTab(t)}>{t==='forensics'?'Protection':t[0].toUpperCase()+t.slice(1)}</button>)}</div><div className="panel">
      {studioTab==='text'&&<>{field('Watermark text',rawText,setRawText)}{slider('Opacity',Math.round(textOpacity*100),0,100,v=>setTextOpacity(v/100),'%')}<details><summary>More adjustments</summary><label className="field">Typeface<select value={fontFamily} onChange={e=>setFontFamily(e.target.value)}>{FONT_FAMILIES.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}</select></label>{slider('Size',fontSize,10,54,setFontSize)}{slider('Rotation',textRotation,-180,180,setTextRotation,'°')}{slider('Letter spacing',letterSpacing,0,12,setLetterSpacing)}{toggle('Bold text',fontWeight==='700',v=>setFontWeight(v?'700':'400'))}{toggle('Dark text background',hasBackground,setHasBackground)}<p className="muted">Dynamic fields: {'{recipient}, {cert_id}, {issuer}, {date}'}</p></details></>}
      {studioTab==='logo'&&<><button onClick={()=>logoInputRef.current?.click()}><Upload/>Choose logo</button>{slider('Scale',Math.round(logoScale*100),5,65,v=>setLogoScale(v/100),'%')}{slider('Opacity',Math.round(logoOpacity*100),0,100,v=>setLogoOpacity(v/100),'%')}{slider('Rotation',logoRotation,-180,180,setLogoRotation,'°')}<label className="field">Blend<select value={logoBlendMode} onChange={e=>setLogoBlendMode(e.target.value as GlobalCompositeOperation)}>{['source-over','multiply','screen','overlay','soft-light'].map(x=><option key={x}>{x}</option>)}</select></label></>}
      {studioTab==='layout'&&<><p className="muted">Watermark position</p><div className="anchors">{(['tl','tc','tr','ml','center','mr','bl','bc','br'] as const).map((x,i)=><button aria-label={['Top left','Top center','Top right','Middle left','Center','Middle right','Bottom left','Bottom center','Bottom right'][i]} className={anchor===x?'active':''} key={x} onClick={()=>setAnchor(x)}>•</button>)}</div>{slider('Horizontal offset',offsetX,-50,50,setOffsetX,'%')}{slider('Vertical offset',offsetY,-50,50,setOffsetY,'%')}{toggle('Repeat text watermark',tiled,setTiled)}{tiled&&<>{slider('Horizontal spacing',tileSpacingX,10,100,setTileSpacingX)}{slider('Vertical spacing',tileSpacingY,10,100,setTileSpacingY)}</>}<button onClick={()=>{if(!sourceImg)return;const c=document.createElement('canvas');c.width=400;c.height=Math.round(400*sourceImg.height/sourceImg.width);const x=c.getContext('2d')!;x.drawImage(sourceImg,0,0,c.width,c.height);const a=analyzeImageSaliency(x,c.width,c.height);setAnchor('center');setOffsetX(Math.max(-50,Math.min(50,a.optimalZone.percentX*2.5)));setOffsetY(Math.max(-50,Math.min(50,a.optimalZone.percentY*2.5)));showToast('Suggested position applied');}}>Suggest placement</button>{toggle('Holographic overlay',enableFoil,setEnableFoil)}</>}
      {studioTab==='forensics'&&<>{toggle('Embed hidden watermark',embedSteganography,setEmbedSteganography)}<p className="muted">Save as PNG to preserve hidden data. Cropping or recompression can remove it.</p>{field('Owner / recipient',recipientName,setRecipientName)}{field('Certificate ID',certificateId,setCertificateId)}{field('Issuer',issuingAuthority,setIssuingAuthority)}{field('Issue date',issueDate,setIssueDate)}{toggle('Reference footer and QR code',embedVisibleHash,v=>{setEmbedVisibleHash(v);setEmbedQRCode(v);})}<p className="muted">QR contains the certificate reference, not proof of ownership.</p><details><summary>Advanced metadata</summary>{field('Recipient tracking ID',honeytokenCanaryId,setHoneytokenCanaryId)}<p className="muted">An embedded identifier, not a live tracking service. Payload detection does not verify identity or ownership.</p>{toggle('Experimental pixel perturbation',enableAntiAiPoisoning,setEnableAntiAiPoisoning)}<p className="muted">Adds pixel noise. No proven protection against AI removal.</p></details></>}
      </div><button className="primary export" onClick={()=>{try{handleExportImage();}catch{showToast('Export failed. Try a local image.');}}}><Download/>Export PNG</button></section>}
      {activeNav==='verify'&&<section><p className="eyebrow">VERIFY</p><h1>Inspect your watermark</h1><p className="muted">Check embedded information.</p><button onClick={()=>verifyInputRef.current?.click()}><ImageIcon/>Choose image</button>{verifyReport?<><div className="panel report"><p className="eyebrow">INSPECTION RESULT</p><h2 className="mint">{verifyReport.status==='detected'?'Watermark detected':'No supported watermark found'}</h2>{Object.entries({Payload:verifyReport.status==='detected'?'Readable':'Not found',Owner:verifyReport.recipient,'Certificate ID':verifyReport.certId,Issuer:verifyReport.authority,'Issue date':verifyReport.date,'Tracking ID':verifyReport.canary,'Signature trust':'Not verified'}).map(([k,v])=><div className="report-row" key={k}><span>{k}</span><strong>{v}</strong></div>)}</div><button onClick={()=>save('data:application/json;base64,'+btoa(unescape(encodeURIComponent(JSON.stringify({...verifyReport,signatureTrust:'not verified'},null,2)))),'application/json','MarkSecure_Report.json')}><Download/>Save report</button></>:<div className="empty"><Shield size={48}/><h2>Ready to inspect</h2><p>Choose an exported MarkSecure PNG.<br/>Your results will appear here.</p></div>}<p className="notice">A watermark alone does not prove authenticity. This scanner reads the mobile MS35 format; other formats may not be detected.</p></section>}
      {activeNav==='batch'&&<section><p className="eyebrow">BATCH</p><h1>One design. Many copies.</h1><p className="muted">Personalize your current image for recipients, or apply the current watermark settings to multiple photos.</p><details className="panel"><summary>Watermark multiple images</summary><label className="file-button">Choose images<input type="file" multiple accept="image/*" disabled={busy} onChange={e=>{setBatchFiles(Array.from(e.target.files||[]));exitDelete();e.target.value='';}}/></label>{batchFiles.length>0&&<><div className="section-title"><h2>{batchFiles.length} input files</h2></div>{deletionControls('files',batchFiles.length)}<div className="batch-file-list">{batchFiles.map((file,i)=><label className={'batch-file '+(deleteMode==='files'?'selectable':'')} key={i}>{deleteMode==='files'&&<input type="checkbox" disabled={busy} aria-label={`Select input ${i+1}: ${file.name}`} checked={selectedItems.has(i)} onChange={()=>toggleSelected(i)}/>}<ImageIcon/><span>{file.name}<small>{(file.size/1024/1024).toFixed(1)} MB</small></span></label>)}</div></>}<button disabled={busy||!batchFiles.length||deleteMode!==null} onClick={runImages}>{busy?'Processing…':`Process ${batchFiles.length} images`}</button></details><button onClick={()=>{setActiveNav('studio');setEditing(!!sourceImg);}}>{sourceImg?'Edit source design':'Choose source image'}</button><div className="panel">{field('Dynamic watermark',rawText,setRawText)}<p className="muted">Use {'{recipient}'} and {'{cert_id}'} to personalize each output.</p><label className="field">Recipients — Name, Certificate ID<textarea rows={6} value={batchRecipients} onChange={e=>setBatchRecipients(e.target.value)}/></label><label className="file-button">Import CSV<input type="file" accept=".csv,text/csv,text/plain" onChange={async e=>{const f=e.target.files?.[0];if(f)setBatchRecipients(await f.text());}}/></label><button className="primary" disabled={busy||!sourceImg||deleteMode!==null} onClick={async()=>{const n=batchRecipients.split('\n').filter(x=>x.trim()).length;if(sourceImg && n*sourceImg.width*sourceImg.height>60000000){showToast('Use fewer recipients for this image size (60 megapixels per batch).');return;}if(!n||n>25){showToast('Enter 1–25 recipients');return;}setBusy(true);await new Promise(r=>setTimeout(r,30));try{handleRunBatch();}catch{showToast('Batch failed. Try a smaller image.');}finally{setBusy(false);}}}>{busy?'Processing…':'Generate batch'}</button></div>{batchOutputs.length>0&&<><div className="section-title"><h2>{batchOutputs.length} outputs</h2><button disabled={busy||deleteMode!==null} onClick={zipBatch}><Download/>Save ZIP</button></div>{deletionControls('outputs',batchOutputs.length)}<div className="grid">{batchOutputs.map((o,i)=><div className="sample" key={i}>{deleteMode==='outputs'&&<label className="output-select"><input type="checkbox" disabled={busy} aria-label={`Select output ${i+1}: ${o.name}`} checked={selectedItems.has(i)} onChange={()=>toggleSelected(i)}/>Select</label>}<img src={o.dataUrl} alt={o.name}/><strong>{o.name}</strong><small>{o.certId}</small></div>)}</div></>}</section>}
      {activeNav==='tools'&&<section><p className="eyebrow">TOOLS</p><h1>Your studio essentials</h1><div className="panel"><h2>Checkpoints</h2><p className="muted">Save your watermark settings. Source images are not included.</p><button onClick={handleExportCheckpoint}><Download/>Save settings</button><button onClick={()=>checkpointRef.current?.click()}><Upload/>Restore settings</button></div><button onClick={()=>setLibrary('Certificates')}><FileText/>Certificate library</button><details className="panel"><summary>Copyright notice draft</summary>{field('Content URL',dmcaInfringerUrl,setDmcaInfringerUrl)}<textarea rows={7} readOnly value={`Copyright review request\nClaimant: ${recipientName}\nContent: ${dmcaInfringerUrl}\nReference: ${certificateId}\n\nI request review of the above content for potential unauthorized use. Please contact me to discuss supporting ownership evidence.`}/><p className="muted">Review and add your contact details and supporting evidence before sending.</p></details><details className="panel"><summary>Decoder reference</summary><p className="muted">Download a Python decoder for this app’s MS35 payload. Requires Pillow. Detects embedded data; does not authenticate the signer.</p><button onClick={()=>save('data:text/plain;base64,'+btoa(`from PIL import Image
import sys
im = Image.open(sys.argv[1]).convert("RGB")
bits = [p[2] & 1 for p in im.getdata()]
out = bytearray()
for i in range(0, min(len(bits)-7,32768),8):
    value = 0
    for bit in bits[i:i+8]: value = value * 2 + bit
    if value < 32: break
    out.append(value)
    if out.endswith(b"|END"): break
print(out.decode("utf-8", errors="replace") if out.startswith(b"MS35|") else "No supported watermark found")
`),'text/plain','marksecure_decoder.py')}>Export Python decoder</button></details><button onClick={()=>setHelp(true)}><HelpCircle/>How to use MarkSecure</button></section>}
    </main><nav aria-label="Main navigation">{([{id:'studio',title:'Studio',Icon:Home},{id:'verify',title:'Verify',Icon:Search},{id:'batch',title:'Batch',Icon:Layers},{id:'tools',title:'Tools',Icon:Briefcase}] as const).map(({id,title,Icon})=><button key={id} aria-current={activeNav===id?'page':undefined} className={activeNav===id?'active':''} onClick={()=>{setActiveNav(id);exitDelete();}}><Icon/><span>{title}</span></button>)}</nav>
    {library&&<SampleLibrary initialTab={library} onClose={()=>setLibrary(null)} onSelect={loadImage} recipient={recipientName} issuer={issuingAuthority}/>}
    {help&&<div className="modal" role="dialog" aria-modal="true" aria-label="Help"><div className="sheet"><div className="section-title"><h2>Make your mark</h2><button aria-label="Close help" className="icon" onClick={()=>setHelp(false)}><X/></button></div><p>1. Import a photo or choose a sample.</p><p>2. Customize text, logo, position and hidden metadata.</p><p>3. Export PNG, then use Verify to read the hidden payload.</p><p className="notice">Samples, imported images and certificate templates work locally. Keep your original image: edits such as cropping and JPEG compression can destroy hidden data.</p><p>Batch uses the current canvas. Settings checkpoints do not include your source photo.</p></div></div>}
    {toastMsg&&<div role="status" className="toast">{toastMsg}</div>}
  </div>;
}
