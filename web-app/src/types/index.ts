export type MediaMode = 'image' | 'verify' | 'batch' | 'code' | 'ai' | 'templates';

export type WatermarkType = 'text' | 'logo' | 'both';

export type AnchorPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'custom';

export type BlendMode = 'source-over' | 'multiply' | 'screen' | 'overlay' | 'soft-light';

export interface TextWatermarkConfig {
  text: string;
  fontFamily: string;
  fontSize: number; // in pt/px relative to base
  fontWeight: '400' | '600' | '700' | '800';
  color: string;
  opacity: number; // 0 to 1
  rotation: number; // -180 to 180 deg
  letterSpacing: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  hasBackground: boolean;
  backgroundColor: string;
  backgroundPadding: number;
}

export interface LogoWatermarkConfig {
  imageUrl: string;
  scale: number; // 0.05 to 1
  opacity: number;
  rotation: number;
  blendMode: BlendMode;
  aspectRatio: number;
}

export interface PositionConfig {
  anchor: AnchorPosition;
  offsetX: number; // percent -50 to 50
  offsetY: number; // percent -50 to 50
  tiled: boolean;
  tileSpacingX: number;
  tileSpacingY: number;
  tileRotation: number;
}

export interface C2paManifestData {
  claimGenerator: string;
  title: string;
  format: string;
  instanceId: string;
  signature: {
    issuer: string;
    algorithm: string;
    signedAt: string;
    publicKeyFingerprint: string;
  };
  assertions: Array<{
    label: string;
    data: Record<string, any>;
  }>;
  assetHashSha256: string;
}

export interface ForensicSecurityConfig {
  embedSteganography: boolean;
  embedVisibleHash: boolean;
  embedQRCode: boolean;
  antiRemoverArmor: boolean;
  redundancyLevel: '2x' | '4x' | '8x';
  frequencyModulation: boolean;
  recipientName: string;
  certificateId: string;
  issuingAuthority: string;
  issueDate: string;
  securityLevel: 'standard' | 'tamper-evident' | 'high-forensic' | 'military-immune';
  // Advanced Uniqueness Modules
  enableContentAwarePlacement?: boolean;
  showSaliencyHeatmap?: boolean;
  enableHoneytokens?: boolean;
  honeytokenCanaryId?: string;
  enableC2paCredentials?: boolean;
  c2paSignerName?: string;
  showC2paBadge?: boolean;
  enableAntiAiPoisoning?: boolean;
  antiAiPoisonIntensity?: 'subtle' | 'balanced' | 'strong' | 'maximum';
  antiAiPoisonEpsilon?: number;
  showAdversarialNoisePreview?: boolean;
}

export interface WatermarkPreset {
  id: string;
  name: string;
  description: string;
  type: WatermarkType;
  textConfig: TextWatermarkConfig;
  logoConfig?: Partial<LogoWatermarkConfig>;
  positionConfig: PositionConfig;
  forensics: ForensicSecurityConfig;
}

export interface SteganographicPayload {
  magic: string; // "MKSEC1" | "MKSEC2" | "MKSEC3"
  certId: string;
  recipient: string;
  issuer: string;
  timestamp: number;
  hash: string;
  signature: string;
  securityLevel: string;
  quadrantId?: number;
  redundancyCount?: number;
  perceptualFingerprint?: string;
  // Forensic Honeytokens & Advanced Provenance
  honeytokenCanary?: string;
  c2paManifestHash?: string;
  antiAiPoisonHash?: string;
  optimalSaliencyZone?: { x: number; y: number; entropy: number };
}

export type VerificationStatus = 'authentic' | 'tampered' | 'forged' | 'not_found';

export interface AttackerProfile {
  attackerType: string;
  attributionDetails: string;
  detectedSignature: string;
  sourceCanaryLeaked?: string;
  compromisedEntity?: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW';
  recommendedActions: string[];
  incidentTimestamp: string;
  originatingVector: string;
}

export interface VerificationResult {
  status: VerificationStatus;
  payload?: SteganographicPayload;
  calculatedHash?: string;
  matchScore?: number;
  tamperDetails?: string;
  extractedQrData?: string;
  survivingQuadrants?: number[];
  attackResistanceLog?: string[];
  inpaintDetected?: boolean;
  // Forgery, Tamper & Attacker Attribution
  forgeryDetected?: boolean;
  forgeryType?: string;
  forgeryDetails?: string;
  tamperedSectors?: number[];
  attackerProfile?: AttackerProfile;
  revoked?: boolean;
  quarantinedCanary?: boolean;
  // Advanced Uniqueness Verification Results
  honeytokenTripped?: boolean;
  honeytokenDetails?: string;
  c2paManifest?: C2paManifestData;
  c2paVerified?: boolean;
  antiAiShieldDetected?: boolean;
  antiAiDisruptionScore?: number;
  neuripsRegenerationDetected?: boolean;
}

export interface CertificateContent {
  recipientName: string;
  title: string;
  subtitle: string;
  description: string;
  issuerName: string;
  issuerOrganization: string;
  issueDate: string;
  certificateId: string;
  signatory1Name: string;
  signatory1Title: string;
  signatory2Name: string;
  signatory2Title: string;
  verificationUrl: string;
  sealText: string;
}

export type CertificateCategory =
  | 'Academic & University'
  | 'Corporate & Executive'
  | 'Modern Tech & AI'
  | 'Luxury Gold & Filigree'
  | 'Minimalist & Swiss Modern'
  | 'Healthcare & Medical'
  | 'Sports & Tournaments'
  | 'Creative Arts & Design'
  | 'Vintage Victorian & Parchment'
  | 'Cyberpunk & Sci-Fi Neon';

export interface CertificateTemplate {
  id: string;
  name: string;
  category: CertificateCategory;
  description: string;
  tags: string[];
  palette: {
    background: string;
    backgroundGradient?: string;
    borderPrimary: string;
    borderSecondary: string;
    accentGold: string;
    textTitle: string;
    textRecipient: string;
    textBody: string;
    textMuted: string;
    sealPrimary: string;
    sealSecondary: string;
    sealRibbon: string;
  };
  borderStyle:
    | 'double-filigree'
    | 'guilloche-ornament'
    | 'art-deco-chevron'
    | 'greek-fret'
    | 'royal-laurel'
    | 'tech-circuit'
    | 'vintage-copper'
    | 'swiss-grid'
    | 'cyber-glow'
    | 'baroque-crest';
  cornerStyle:
    | 'baroque-flourish'
    | 'art-deco-bracket'
    | 'greek-corner'
    | 'tech-target'
    | 'royal-crest'
    | 'minimal-cross'
    | 'vintage-knot'
    | 'cyber-bracket'
    | 'none';
  sealType:
    | 'gold-wax'
    | 'blue-ribbon'
    | 'red-wax'
    | 'silver-star'
    | 'hologram-shield'
    | 'laurel-crest'
    | 'diamond-guild'
    | 'neon-badge'
    | 'vintage-stamp'
    | 'emerald-rosette';
  sealText: string;
  fontTheme: 'classic-serif' | 'modern-sans' | 'calligraphy' | 'tech-mono' | 'luxury-roman';
  defaultContent: CertificateContent;
}

export interface FloatingSecondaryStamp {
  id: string;
  xPercent: number; // 0 to 100 on image
  yPercent: number; // 0 to 100 on image
  text: string;
  badgeType: 'date-badge' | 'verified-seal' | 'confidential' | 'custom';
  color: string;
  bgOpacity: number;
}

export interface MarkpackPreset {
  version: '1.0';
  exportDate: string;
  presetName: string;
  author?: string;
  watermarkType: WatermarkType;
  textConfig: TextWatermarkConfig;
  logoConfig?: Partial<LogoWatermarkConfig>;
  positionConfig: PositionConfig;
  forensics: ForensicSecurityConfig;
  activeGradientId?: string;
  floatingStamps?: FloatingSecondaryStamp[];
}

export interface BatchCsvRecord {
  id: string;
  name: string;
  studentId: string;
  date: string;
  status?: 'pending' | 'processing' | 'done';
  extraField?: string;
}
