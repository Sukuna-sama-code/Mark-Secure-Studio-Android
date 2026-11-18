/**
 * Cryptographic utility functions for tamper verification and hashing
 */

export async function sha256String(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256Buffer(buffer: ArrayBuffer | Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateCertId(prefix = 'MKSEC'): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${rand}`;
}

export function generateCryptographicSignature(certId: string, recipient: string, date: string): string {
  // Deterministic signature simulation with secret salt representation
  let hash = 0;
  const combined = `${certId}::${recipient}::${date}::SALT_SECURE_FORENSICS_2026`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  return `SIG-ED25519-${hex}-${certId.slice(-4)}`;
}

export function verifyCryptographicSignature(certId: string, recipient: string, date: string, signature: string): boolean {
  if (!signature) return false;
  const expected = generateCryptographicSignature(certId, recipient, date);
  return expected === signature;
}
