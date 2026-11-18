/**
 * High-fidelity, zero-failure procedural sample asset generators.
 * Guarantees that sample certificate, photograph, and studio assets
 * always load instantly without CORS issues or 404 network errors.
 */

// Procedural Certificate Generator (2400 x 1600 high-res canvas)
export function generateProceduralCertificate(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 2400;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Parchment Background with subtle luxury gradient
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#faf6ee');
  bgGrad.addColorStop(0.5, '#f5eee1');
  bgGrad.addColorStop(1, '#ebe0cc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle paper grain noise
  ctx.fillStyle = 'rgba(160, 120, 80, 0.03)';
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // 2. Guilloché Security Wave Borders
  ctx.save();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.35;
  for (let ring = 0; ring < 3; ring++) {
    ctx.beginPath();
    const margin = 80 + ring * 20;
    const w = canvas.width - margin * 2;
    const h = canvas.height - margin * 2;
    ctx.strokeRect(margin, margin, w, h);
  }

  // Intricate sine guilloche wave top and bottom
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  for (let x = 120; x < canvas.width - 120; x += 3) {
    const yTop = 130 + Math.sin(x * 0.05) * 8 + Math.cos(x * 0.02) * 5;
    if (x === 120) ctx.moveTo(x, yTop);
    else ctx.lineTo(x, yTop);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let x = 120; x < canvas.width - 120; x += 3) {
    const yBot = canvas.height - 130 + Math.sin(x * 0.05) * 8 + Math.cos(x * 0.02) * 5;
    if (x === 120) ctx.moveTo(x, yBot);
    else ctx.lineTo(x, yBot);
  }
  ctx.stroke();
  ctx.restore();

  // 3. Inner Ornate Gold Filigree Border
  ctx.strokeStyle = '#8a6217';
  ctx.lineWidth = 6;
  ctx.strokeRect(140, 140, canvas.width - 280, canvas.height - 280);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.strokeRect(152, 152, canvas.width - 304, canvas.height - 304);

  // 4. Header & Emblem Medallion
  ctx.save();
  ctx.translate(canvas.width / 2, 320);

  // Crest Medallion
  ctx.fillStyle = '#b8860b';
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff9e6';
  ctx.font = 'bold 36px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MS', 0, 0);

  ctx.restore();

  // 5. Typography
  ctx.textAlign = 'center';

  // Subtitle
  ctx.fillStyle = '#8a6217';
  ctx.font = '600 24px "Times New Roman", serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('INTERNATIONAL STANDARD FOR DIGITAL MEDIA ACCREDITATION', canvas.width / 2, 420);

  // Main Title
  ctx.fillStyle = '#1e1b18';
  ctx.font = 'bold 78px "Times New Roman", Georgia, serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('CERTIFICATE OF AUTHENTICITY', canvas.width / 2, 530);

  // Latin Motto
  ctx.fillStyle = '#8a6217';
  ctx.font = 'italic 26px "Times New Roman", serif';
  ctx.fillText('— Veritas in Cryptographia et Signum Incorruptibile —', canvas.width / 2, 580);

  // Decorative Rule
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 350, 620);
  ctx.lineTo(canvas.width / 2 + 350, 620);
  ctx.stroke();

  // Presentation text
  ctx.fillStyle = '#4a443e';
  ctx.font = '400 32px "Times New Roman", serif';
  ctx.fillText('This document certifies that the institutional credentials of', canvas.width / 2, 700);

  // Recipient / Asset Name
  ctx.fillStyle = '#1e1b18';
  ctx.font = 'bold italic 68px "Times New Roman", serif';
  ctx.fillText('Master of Cryptographic Forensics', canvas.width / 2, 800);

  // Body text
  ctx.fillStyle = '#4a443e';
  ctx.font = '400 26px "Times New Roman", serif';
  ctx.fillText('Have been rigorously verified under the MarkSecure Multi-Sector Steganography Protocol,', canvas.width / 2, 880);
  ctx.fillText('possessing verified cryptographic provenance and zero undetected structural alterations.', canvas.width / 2, 925);

  // 6. Signatures & Seals
  // Left: Authorized Director
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#2b2622';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(420, 1260);
  ctx.lineTo(820, 1260);
  ctx.stroke();

  ctx.fillStyle = '#1e1b18';
  ctx.font = 'italic bold 32px "Brush Script MT", cursive, serif';
  ctx.fillText('Alexander Vance, Ph.D.', 620, 1240);

  ctx.fillStyle = '#6e655c';
  ctx.font = '600 20px "Times New Roman", serif';
  ctx.fillText('DIRECTOR OF DIGITAL PROVENANCE', 620, 1295);

  // Right: Forensic Registrar
  ctx.beginPath();
  ctx.moveTo(canvas.width - 820, 1260);
  ctx.lineTo(canvas.width - 420, 1260);
  ctx.stroke();

  ctx.fillStyle = '#1e1b18';
  ctx.font = 'italic bold 32px "Brush Script MT", cursive, serif';
  ctx.fillText('Elena Rostova, D.Sc.', canvas.width - 620, 1240);

  ctx.fillStyle = '#6e655c';
  ctx.font = '600 20px "Times New Roman", serif';
  ctx.fillText('CHIEF FORENSIC REGISTRAR', canvas.width - 620, 1295);

  // Center: Embossed Golden Seal Medallion with Ribbons
  ctx.save();
  ctx.translate(canvas.width / 2, 1240);

  // Red Silk Ribbon tails
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(-25, 30);
  ctx.lineTo(-50, 160);
  ctx.lineTo(-20, 140);
  ctx.lineTo(0, 160);
  ctx.lineTo(0, 30);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(25, 30);
  ctx.lineTo(50, 160);
  ctx.lineTo(20, 140);
  ctx.lineTo(0, 160);
  ctx.lineTo(0, 30);
  ctx.fill();

  // Golden Medallion
  const sealGrad = ctx.createRadialGradient(-15, -15, 10, 0, 0, 85);
  sealGrad.addColorStop(0, '#fff3a8');
  sealGrad.addColorStop(0.4, '#d4af37');
  sealGrad.addColorStop(0.8, '#aa7c11');
  sealGrad.addColorStop(1, '#664603');

  ctx.fillStyle = sealGrad;
  ctx.beginPath();
  const teeth = 36;
  for (let i = 0; i < teeth; i++) {
    const angle = (i * Math.PI * 2) / teeth;
    const r = i % 2 === 0 ? 88 : 80;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Inner ring
  ctx.strokeStyle = '#5a3d02';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 68, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#452e02';
  ctx.font = 'bold 15px serif';
  ctx.fillText('VERIFIED AUTHENTIC', 0, -4);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('★ 2026 ★', 0, 16);

  ctx.restore();

  // Serial Number & Date
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8a6217';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('CERTIFICATE NO: MKSEC-AUTHENTIC-2026-X99-PROV-9407', canvas.width / 2, 1470);

  return canvas.toDataURL('image/jpeg', 0.95);
}

// Procedural High-Res Photograph Generator (2400 x 1600 landscape)
export function generateProceduralPhotograph(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 2400;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Sky Gradient: Golden hour sunset
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.65);
  skyGrad.addColorStop(0, '#1a2a4b');
  skyGrad.addColorStop(0.3, '#354d73');
  skyGrad.addColorStop(0.6, '#a85b67');
  skyGrad.addColorStop(0.85, '#f59e0b');
  skyGrad.addColorStop(1, '#fde68a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.65);

  // Glowing Sun
  const sunGrad = ctx.createRadialGradient(canvas.width * 0.62, canvas.height * 0.45, 10, canvas.width * 0.62, canvas.height * 0.45, 240);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.2, '#fef08a');
  sunGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.6)');
  sunGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(canvas.width * 0.62, canvas.height * 0.45, 240, 0, Math.PI * 2);
  ctx.fill();

  // Distant Mountain Ridges (Layer 1)
  ctx.fillStyle = '#372b49';
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.58);
  ctx.lineTo(400, canvas.height * 0.46);
  ctx.lineTo(850, canvas.height * 0.52);
  ctx.lineTo(1350, canvas.height * 0.42);
  ctx.lineTo(1800, canvas.height * 0.49);
  ctx.lineTo(2400, canvas.height * 0.44);
  ctx.lineTo(2400, canvas.height * 0.65);
  ctx.lineTo(0, canvas.height * 0.65);
  ctx.fill();

  // Nearer Mountain Ridges (Layer 2)
  ctx.fillStyle = '#1e1c31';
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.62);
  ctx.lineTo(300, canvas.height * 0.54);
  ctx.lineTo(700, canvas.height * 0.60);
  ctx.lineTo(1100, canvas.height * 0.48);
  ctx.lineTo(1600, canvas.height * 0.57);
  ctx.lineTo(2100, canvas.height * 0.51);
  ctx.lineTo(2400, canvas.height * 0.59);
  ctx.lineTo(2400, canvas.height * 0.65);
  ctx.lineTo(0, canvas.height * 0.65);
  ctx.fill();

  // Mirror Lake Reflections (Lower 35%)
  const lakeGrad = ctx.createLinearGradient(0, canvas.height * 0.65, 0, canvas.height);
  lakeGrad.addColorStop(0, '#f59e0b');
  lakeGrad.addColorStop(0.15, '#c2410c');
  lakeGrad.addColorStop(0.4, '#312e81');
  lakeGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = lakeGrad;
  ctx.fillRect(0, canvas.height * 0.65, canvas.width, canvas.height * 0.35);

  // Water Ripple Lines
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.25)';
  ctx.lineWidth = 1.5;
  for (let y = canvas.height * 0.67; y < canvas.height; y += 18) {
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 30) {
      const offset = Math.sin(x * 0.03 + y) * 2;
      if (x === 0) ctx.moveTo(x, y + offset);
      else ctx.lineTo(x, y + offset);
    }
    ctx.stroke();
  }

  // Camera Shot Overlay Metadata Badge (Bottom left)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.roundRect(60, canvas.height - 120, 520, 60, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 18px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('CAMERA: Sony α7R V • 24mm F/1.4 GM • 1/250s ISO 100', 80, canvas.height - 82);

  return canvas.toDataURL('image/jpeg', 0.95);
}
