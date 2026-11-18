import { CERTIFICATE_TEMPLATES, DEFAULT_CERTIFICATE_CONTENT } from './certificateTemplates';
import { CertificateContent } from '../types';
import { renderCertificateCanvas, embedForensicWatermarkOnCertificate } from './certificateRenderer';
import { embedSteganography } from './stegoEngine';

export interface ScholarshipApplicantDemo {
  id: string;
  studentName: string;
  filename: string;
  major: string;
  gpa: string;
  certId: string;
  issuingAuthority: string;
  issueDate: string;
  expectedStatus: 'authentic' | 'tampered' | 'forged' | 'not_found';
  notes: string;
}

export const SCHOLARSHIP_DEMO_APPLICANTS: ScholarshipApplicantDemo[] = [
  {
    id: 'demo-app-1',
    studentName: 'Elena Rostova',
    filename: 'Elena_Rostova_Stanford_Honor_Cert.png',
    major: 'Computer Science & AI',
    gpa: '3.98 / 4.0',
    certId: 'STANFORD-CS-2026-904',
    issuingAuthority: 'Stanford Open Academy',
    issueDate: 'October 12, 2026',
    expectedStatus: 'authentic',
    notes: 'Pristine 100% cryptographic integrity. Ed25519 root verified.',
  },
  {
    id: 'demo-app-2',
    studentName: 'Dr. Sarah Lin',
    filename: 'Sarah_Lin_MIT_Fellowship_Cert.png',
    major: 'Quantum Cryptography',
    gpa: '4.00 / 4.0',
    certId: 'MIT-QUANTUM-2026-412',
    issuingAuthority: 'MIT Credential Authority',
    issueDate: 'September 28, 2026',
    expectedStatus: 'authentic',
    notes: 'Valid steganographic multi-sector armor and C2PA content credentials.',
  },
  {
    id: 'demo-app-3',
    studentName: 'Marcus Vance',
    filename: 'Marcus_Vance_Excellence_Cert.png',
    major: 'Data Science & Systems',
    gpa: '3.85 / 4.0 (Altered)',
    certId: 'BERKELEY-DS-2026-881',
    issuingAuthority: 'UC Berkeley Open Campus',
    issueDate: 'August 14, 2026',
    expectedStatus: 'tampered',
    notes: 'AI Inpainting attack detected in Sector 3 (grade text manipulated).',
  },
  {
    id: 'demo-app-4',
    studentName: 'David K. Chen',
    filename: 'David_Chen_Counterfeit_Cert.png',
    major: 'Biomedical Informatics',
    gpa: '3.92 / 4.0',
    certId: 'HARVARD-BIO-2026-001',
    issuingAuthority: 'Harvard Global Institute',
    issueDate: 'October 01, 2026',
    expectedStatus: 'forged',
    notes: 'Ed25519 signature counterfeit replay. Imposter student identity.',
  },
  {
    id: 'demo-app-5',
    studentName: 'Alex Rivera',
    filename: 'Alex_Rivera_Unmarked_Submission.png',
    major: 'Interactive Media Design',
    gpa: '3.75 / 4.0',
    certId: 'UNREGISTERED-CERT-990',
    issuingAuthority: 'Independent Academy',
    issueDate: 'July 19, 2026',
    expectedStatus: 'not_found',
    notes: 'Missing MarkSecure steganographic seal. Requires manual registrar verification.',
  },
];

/**
 * Generates an actual realistic certificate image for each scholarship applicant demo
 */
export async function generateApplicantCertificateDataUrl(
  applicant: ScholarshipApplicantDemo
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 850;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';

  const templateIndex = applicant.expectedStatus === 'authentic' ? 0 : applicant.expectedStatus === 'tampered' ? 1 : 2;
  const template = CERTIFICATE_TEMPLATES[templateIndex] || CERTIFICATE_TEMPLATES[0];

  const content: CertificateContent = {
    ...DEFAULT_CERTIFICATE_CONTENT,
    title: 'CERTIFICATE OF ACADEMIC EXCELLENCE',
    subtitle: 'Presented for outstanding merit and scholarship eligibility',
    recipientName: applicant.studentName,
    description: `In recognition of superior academic achievement in ${applicant.major} with cumulative GPA of ${applicant.gpa}.`,
    issuerOrganization: applicant.issuingAuthority,
    signatory1Name: 'Dr. Jane Vance, Provost',
    signatory1Title: 'Dean of Academic Affairs',
    signatory2Name: 'Marcus Thorne, Registrar',
    signatory2Title: 'Credential Controller',
    certificateId: applicant.certId,
    issueDate: applicant.issueDate,
  };

  // 1. Render base certificate
  renderCertificateCanvas(canvas, template, content, 1);

  if (applicant.expectedStatus === 'not_found') {
    // Return plain unwatermarked certificate
    return canvas.toDataURL('image/png');
  }

  if (applicant.expectedStatus === 'authentic') {
    // Embed authentic military-grade steganography
    const res = await embedForensicWatermarkOnCertificate(canvas, content, {
      embedSteganography: true,
      antiRemoverArmor: true,
      enableHoneytokens: true,
      honeytokenCanaryId: `CANARY-${applicant.certId.slice(-6)}`,
      enableC2paCredentials: true,
      enableAntiAiPoisoning: true,
      securityLevel: 'military-immune',
    });
    return res.dataUrl || canvas.toDataURL('image/png');
  }

  if (applicant.expectedStatus === 'tampered') {
    // Embed authentic stego first
    await embedForensicWatermarkOnCertificate(canvas, content, {
      embedSteganography: true,
      antiRemoverArmor: true,
      enableHoneytokens: true,
      honeytokenCanaryId: `CANARY-${applicant.certId.slice(-6)}`,
      securityLevel: 'military-immune',
    });

    // Simulate AI Inpainting Attack on Sector 3 (bottom-right grade area)
    const sx = Math.floor(canvas.width * 0.55);
    const sy = Math.floor(canvas.height * 0.55);
    const sw = Math.floor(canvas.width * 0.40);
    const sh = Math.floor(canvas.height * 0.38);

    const patch = ctx.getImageData(sx, sy, sw, sh);
    const d = patch.data;
    // Corrupt high-frequency LSBs in Sector 3 (erasing steganography bits)
    for (let i = 0; i < d.length; i += 4) {
      d[i] = (d[i] & 0xfc) ^ 0x02; // Flip LSBs
      d[i + 1] = (d[i + 1] & 0xfc) ^ 0x01;
      d[i + 2] = (d[i + 2] & 0xfc) ^ 0x03;
    }
    ctx.putImageData(patch, sx, sy);

    // Draw visual tamper patch over grade
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillRect(canvas.width * 0.58, canvas.height * 0.62, 280, 42);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(canvas.width * 0.58, canvas.height * 0.62, 280, 42);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('GPA: 4.00 (Summa Cum Laude)', canvas.width * 0.60, canvas.height * 0.65);
    ctx.restore();

    return canvas.toDataURL('image/png');
  }

  if (applicant.expectedStatus === 'forged') {
    // Embed counterfeit / forged stego payload with magic: 'FORGED' and invalid signature
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    embedSteganography(
      imgData,
      {
        magic: 'FORGED',
        certId: applicant.certId,
        recipient: 'IMPOSTER_IDENTITY_MISMATCH',
        issuer: 'COUNTERFEIT_ACADEMY',
        timestamp: Date.now() - 9999999,
        hash: 'COUNTERFEIT',
        signature: 'FORGED-ED25519-TAMPERED-REPLAY',
        securityLevel: 'standard-lsb',
      },
      false
    );
    ctx.putImageData(imgData, 0, 0);

    return canvas.toDataURL('image/png');
  }

  return canvas.toDataURL('image/png');
}
