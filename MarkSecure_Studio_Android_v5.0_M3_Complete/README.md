# 🛡️ MarkSecure Studio — Media Watermarking & Forensic Authenticity Suite

**MarkSecure Studio** (`v3.5.0`) is a full-stack media watermarking, procedural certificate engineering, and cryptographic forensic verification suite. Designed for creators, credential issuers, and enterprise security teams, it combines visible dynamic watermarks with multi-quadrant invisible steganography, C2PA provenance manifests, honeytoken tripwires, and anti-AI adversarial armor—available across **Web**, **Android (Native WebView Studio)**, and **Python/Streamlit**.

---

## ✨ Core Capabilities

### 1. 🎨 Interactive Watermarking & Procedural Certificate Studio
- **Multi-Layer Watermarking**: Combine customizable **Text**, **Brand Logos**, or **Hybrid (`both`)** watermarks with real-time HTML5 Canvas rendering.
- **Dynamic Token Interpolation**: Automatically inject `{cert_id}`, `{recipient}`, `{issuer}`, and `{date}` into visible and invisible watermarks.
- **24K Metallic Foil & Blend Modes**: Interactive specular foil shader (`foilShaderEngine.ts`) and composite blend modes (`source-over`, `multiply`, `screen`, `overlay`, `soft-light`).
- **Content-Aware Saliency Placement**: Sobel-edge and entropy analysis (`contentAwarePlacement.ts`) locates low-saliency zones or high-variance textures to anchor watermarks optimally.
- **Procedural Certificate Generator**: Built-in high-resolution templates (`certificateRenderer.ts`, `certificateTemplates.ts`) including *IP Ownership & Copyright Deed*, *National AI Fellowship Certificate*, and *Military-Immune Clearance Seal*.

### 2. 🔐 Cryptographic & Steganographic Forensics
- **Multi-Sector Redundant LSB Matrix (`MKSEC1` / `MKSEC2` / `MKSEC3`)**: Embeds duplicated, parity-protected bitstreams across 5 independent image quadrants (`2x`, `4x`, `8x` redundancy) to survive up to 75% perimeter cropping and lossy compression (`stegoEngine.ts`, `stegoWorker.ts`).
- **C2PA Content Credentials**: Generates and inspects cryptographic provenance manifests (`c2paEngine.ts`, `C2paInspectorModal.tsx`) with SHA-256 asset digests.
- **Canary Honeytoken Tripwires**: Embeds unique recipient-linked canary tokens (`honeytokenEngine.ts`) for leak attribution and attacker profiling.
- **Anti-AI Adversarial Armor**: Applies $L_\infty$-bounded adversarial perturbations (`antiAiPoisonEngine.ts`) to disrupt unauthorized neural inpainting, style mimicry, and watermark removal models.
- **Forensic Verifier & Takedown Generator**: Audits uploaded assets for pixel tampering, quadrant survival, and inpainting artifacts (`ForensicsVerifier.tsx`), with automated DMCA / legal takedown notice generation (`TakedownNoticeModal.tsx`).

### 3. 📦 Batch Processing & Checkpoint Portability
- **High-Throughput Batch Suite**: Process multiple assets or CSV-driven credential rosters (`BatchProcessor.tsx`, `batchCsvGenerator.ts`) and export packaged `.zip` archives via JSZip.
- **Studio Checkpoints**: Export and import complete studio configurations as portable `.json` manifests (`checkpointExporter.ts`).

### 4. 📱 Mobile-First Redesign & Native Android Studio Wrapper
- **Dedicated Mobile Studio UI (`MobileStudioApp.tsx`, `mobileStudio.css`)**: Touch-optimized workspace with expandable canvas previews, bottom navigation tabs (`Studio`, `Verify`, `Batch`, `Tools`, `Themes`), vision inspection modes (`Normal`, `Saliency`, `Noise`, `Foil`), and 5 curated atmosphere palettes (*Young Passion*, *Cyber Abyss*, *Emerald Matrix*, *Royal Obsidian*, *Solar Flare*).
- **Android Native App (`MainActivity.kt`)**:
  - Offline asset serving via `WebViewClient.shouldInterceptRequest` (`https://appassets.androidplatform.net`).
  - Edge-to-edge system bar styling with `WindowInsetsCompat`.
  - Native Android file picker integration (`ActivityResultContracts.StartActivityForResult`) for images, JSON checkpoints, and ZIPs.
  - `@JavascriptInterface` (`AndroidBridge.saveBase64File`) for saving exported PNG/JPG/JSON/ZIP files directly to `Downloads/MarkSecure/`.

### 5. 🤖 Gemini AI Hub & Python Reference Backend
- **Gemini AI Studio Hub (`GeminiAiHub.tsx`, `server.ts`)**: Server-side `@google/genai` integration with domain-specific local fallback reasoning for copyright clauses, watermark opacity guidance, C2PA explanations, and forensic analysis.
- **Python & Streamlit Engine (`python_backend/`)**: Standalone Python implementation using OpenCV, Pillow, and MoviePy for multithreaded video watermarking with harmonic anti-crop bounce trajectories and 100% bitstream-compatible LSB forensic decoding.

---

## 🗂️ Repository Architecture

```text
mark_secure_studio_android/
├── app/                                  # Native Android application module (:app)
│   └── src/main/
│       ├── assets/                       # Bundled Vite production build served offline in WebView
│       └── java/com/example/marksecurestudio/
│           └── MainActivity.kt           # Android WebView shell, file chooser & MediaStore bridge
├── web-app/                              # React 19 + TypeScript + Vite + Express web application
│   ├── src/
│   │   ├── MobileStudioApp.tsx           # Touch-first mobile & hybrid studio workspace
│   │   ├── App.tsx                       # Desktop studio interface
│   │   ├── mobileStudioLayout.ts         # Responsive split/canvas/inspector layout controller
│   │   ├── mobileStudio.css              # Mobile glassmorphic & atmosphere styling
│   │   ├── components/                   # UI modules (Canvas, Forensics, Batch, AI Hub, Modals)
│   │   ├── engine/                       # Core crypto, LSB stego, C2PA, foil, & anti-AI engines
│   │   └── types/                        # TypeScript interfaces & forensic payload schemas
│   ├── python_backend/                   # Standalone Python & Streamlit video/image forensic suite
│   │   ├── streamlit_app.py              # Streamlit dashboard
│   │   ├── watermark_core.py             # PIL/OpenCV diagonal tiling & certificate engine
│   │   ├── video_engine.py               # MoviePy multithreaded video processor
│   │   └── stego_forensics.py            # LSB bitstream encoder/decoder with SHA-256 verification
│   └── server.ts                         # Express API server & Google GenAI integration
└── build.gradle.kts                      # Root Android Gradle configuration
```

---

## 🚀 Getting Started

### 1. Web Application (`web-app/`)

#### Prerequisites
- **Node.js** `>= 22.0.0` (or **Bun**)
- *(Optional)* `GEMINI_API_KEY` in `web-app/.env` for live Gemini AI Hub queries

#### Installation & Development
```bash
cd web-app
npm install
npm run dev
```
The Express + Vite development server starts at `http://localhost:3000`.

#### Production Build
```bash
cd web-app
npm run build
```

---

### 2. Android Application (`:app`)

1. Open the root project (`mark_secure_studio_android`) in **Android Studio**.
2. *(Optional)* If you updated the React frontend in `web-app/`, build it (`npm run build`) and copy the output from `web-app/dist/` into `app/src/main/assets/`.
3. Sync Gradle and run the `:app` configuration on an Android device or emulator (**API 30+**).
4. Exported images, certificates, and JSON checkpoints are saved directly to your device's **`Downloads/MarkSecure/`** folder.

---

### 3. Python & Streamlit Backend (`web-app/python_backend/`)

```bash
cd web-app/python_backend
pip install -r requirements.txt
streamlit run streamlit_app.py
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Studio** | React 19, TypeScript, Vite 8, Tailwind CSS 4, HTML5 Canvas, Web Workers, Lucide Icons |
| **Cryptographic & Vision Engines** | Web Crypto API (SHA-256), Multi-Quadrant LSB Steganography, C2PA Manifests, Sobel Saliency, $L_\infty$ Adversarial Noise |
| **Backend & AI** | Node.js, Express, `@google/genai` (Gemini API) |
| **Android Client** | Kotlin, AndroidX Activity & WindowInsets, WebView Asset Interceptor, `MediaStore.Downloads` |
| **Python Suite** | Python 3, Streamlit, OpenCV, Pillow, MoviePy, NumPy |

---

## 📄 License & Provenance
Built with **MarkSecure Studio** — engineered for tamper-evident digital asset protection, cryptographic credential issuance, and forensic media verification.
