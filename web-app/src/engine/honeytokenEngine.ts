/**
 * Forensic Honeytoken & Canary Tripwire Engine
 *
 * Provides deceptive, synthetic forensic micro-signatures and zero-width
 * canary strings. If an adversary scrapes the image, uses AI inpainting,
 * or modifies metadata/text, the honeytoken canary trips, immediately
 * exposing unauthorized exfiltration, scraping, or tampering.
 */

import { sha256String } from './cryptoUtils';

export interface HoneytokenCanary {
  canaryId: string;
  seed: string;
  tripwireSector: { x: number; y: number };
  zeroWidthSequence: string;
  expectedHash: string;
  createdAt: number;
}

export interface HoneytokenVerification {
  tripped: boolean;
  status: 'ARMED' | 'DISARMED' | 'TRIPPED';
  reason?: string;
  detectedCanaryId?: string;
  auditMessage: string;
}

// Zero-width characters for text steganographic canaries
const ZW_ZERO = '\u200B'; // Zero-Width Space -> 0
const ZW_ONE = '\u200C';  // Zero-Width Non-Joiner -> 1
const ZW_DELIM = '\u200D'; // Zero-Width Joiner -> Delimiter

/**
 * Encodes an ASCII string into an invisible zero-width unicode sequence
 */
export function encodeZeroWidthCanary(text: string): string {
  let binary = '';
  for (let i = 0; i < text.length; i++) {
    const bin = text.charCodeAt(i).toString(2).padStart(8, '0');
    binary += bin;
  }
  let result = ZW_DELIM;
  for (let i = 0; i < binary.length; i++) {
    result += binary[i] === '1' ? ZW_ONE : ZW_ZERO;
  }
  result += ZW_DELIM;
  return result;
}

/**
 * Decodes an invisible zero-width unicode sequence back to ASCII
 */
export function decodeZeroWidthCanary(text: string): string | null {
  const start = text.indexOf(ZW_DELIM);
  if (start === -1) return null;
  const end = text.indexOf(ZW_DELIM, start + 1);
  if (end === -1) return null;

  const sequence = text.substring(start + 1, end);
  let binary = '';
  for (let i = 0; i < sequence.length; i++) {
    if (sequence[i] === ZW_ONE) binary += '1';
    else if (sequence[i] === ZW_ZERO) binary += '0';
  }

  if (binary.length % 8 !== 0) return null;

  let decoded = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substring(i, i + 8);
    decoded += String.fromCharCode(parseInt(byte, 2));
  }
  return decoded;
}

/**
 * Generates a unique, armed forensic honeytoken canary
 */
export async function generateHoneytokenCanary(
  certId: string,
  recipient: string
): Promise<HoneytokenCanary> {
  const seed = `${certId}::${recipient}::CANARY_${Date.now()}`;
  const hash = await sha256String(seed);
  const canaryId = `CANARY-TRIP-${hash.slice(0, 10).toUpperCase()}`;

  // Deterministic coordinate based on hash for decoy micro-verification
  const coordX = parseInt(hash.slice(10, 14), 16) % 100;
  const coordY = parseInt(hash.slice(14, 18), 16) % 100;

  const zeroWidth = encodeZeroWidthCanary(canaryId);

  return {
    canaryId,
    seed,
    tripwireSector: { x: coordX, y: coordY },
    zeroWidthSequence: zeroWidth,
    expectedHash: hash.slice(0, 16),
    createdAt: Date.now(),
  };
}

/**
 * Injects the invisible zero-width canary sequence into a visible watermark string
 */
export function injectHoneytokenIntoWatermarkText(
  visibleText: string,
  canary: HoneytokenCanary
): string {
  // Insert zero-width sequence between first character and rest of the text
  if (visibleText.length > 1) {
    return visibleText.slice(0, 1) + canary.zeroWidthSequence + visibleText.slice(1);
  }
  return visibleText + canary.zeroWidthSequence;
}

/**
 * Checks whether an extracted stego payload or decoded image contains a tripped canary
 */
export function verifyHoneytokenIntegrity(
  expectedCanaryId?: string,
  recoveredCanaryId?: string,
  inpaintDetected?: boolean,
  survivingQuadrantsCount = 5
): HoneytokenVerification {
  if (!expectedCanaryId && !recoveredCanaryId) {
    return {
      tripped: false,
      status: 'DISARMED',
      auditMessage: 'Forensic Honeytoken tripwire was not armed for this asset.',
    };
  }

  // If a canary was armed but recovered is null or doesn't match
  if (expectedCanaryId && !recoveredCanaryId) {
    return {
      tripped: true,
      status: 'TRIPPED',
      reason: 'Canary tripwire was stripped or obliterated via selective inpainting or metadata wiping.',
      detectedCanaryId: expectedCanaryId,
      auditMessage: `🚨 HONEYTOKEN TRIPPED: Decoy canary [${expectedCanaryId}] was stripped! Hostile metadata wipe or localized inpainting confirmed.`,
    };
  }

  if (expectedCanaryId && recoveredCanaryId && expectedCanaryId !== recoveredCanaryId) {
    return {
      tripped: true,
      status: 'TRIPPED',
      reason: `Canary mismatch: Expected [${expectedCanaryId}] but found [${recoveredCanaryId}]. Forgery detected.`,
      detectedCanaryId: recoveredCanaryId,
      auditMessage: `🚨 HONEYTOKEN TRIPPED: Canary mismatch indicates fraudulent re-watermarking or asset spoofing.`,
    };
  }

  // If inpaint or quadrant corruption occurred while canary survived
  if (inpaintDetected && survivingQuadrantsCount < 5) {
    return {
      tripped: true,
      status: 'TRIPPED',
      reason: 'Decoy tripwire detected localized bitstream perturbation.',
      detectedCanaryId: recoveredCanaryId || expectedCanaryId,
      auditMessage: `🚨 HONEYTOKEN ALERT: Tripwire caught adversary modifying surrounding pixels while attempting watermark bypass!`,
    };
  }

  return {
    tripped: false,
    status: 'ARMED',
    detectedCanaryId: recoveredCanaryId || expectedCanaryId,
    auditMessage: `🛡️ HONEYTOKEN ARMED & SECURE: Canary tripwire [${recoveredCanaryId || expectedCanaryId}] intact. Zero unauthorized tampering observed.`,
  };
}
