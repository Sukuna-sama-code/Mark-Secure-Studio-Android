[readme.md](https://github.com/user-attachments/files/34927314/readme.md)
# MarkSecure Studio — Android App

Native Android WebView application for **MarkSecure Studio**, a mobile media watermarking, procedural certificate generation, and cryptographic forensic verification suite.

> **Repository Scope:** This repository contains **only the Android Studio client (`:app`)** and pre-built offline WebView assets (`app/src/main/assets`). The standalone desktop web application lives separately in [`vibe_coded_watermark_embedder_GAIStudio`](https://github.com/Sukuna-sama-code/vibe_coded_watermark_embedder_GAIStudio).

---

## Core Features

- **Touch-First Watermarking Studio**: Text, brand logo, and hybrid (`both`) watermarks with touch-drag positioning, 9-point anchor grid, brick-staggered tiling, and 24K Gold / Rose Gold / Hologram / Obsidian foil shaders.
- **5-Sector LSB Steganography & Verifier**: Embeds redundant `MS35` / `MKSEC2` payloads across quadrants `Q0–Q4` with 64-bit perceptual dHash checking and 4 built-in adversarial attack simulators (AI Eraser, 75% Perimeter Crop, NeurIPS Diffusion Attack, and Counterfeit ID Spoof).
- **C2PA v1.3 Provenance & Canary Honeytokens**: Generates and exports `.c2pa.json` sidecar manifests and zero-width Unicode canary tripwires.
- **Batch Credential Engine & Guilloche Templates**: Mint multiple watermarked credentials at once or customize 6 built-in vector certificate templates.
- **Offline Android WebView Bridge (`MainActivity.kt`)**:
  - Serves bundled frontend assets offline via `https://appassets.androidplatform.net/`.
  - Integrates the native Android file picker (`ActivityResultContracts.StartActivityForResult`) for images and `.json` presets.
  - Saves exported PNG, WebP, JPEG, `.json`, and `.c2pa.json` files directly to **`Downloads/MarkSecure/`** via `AndroidBridge.saveBase64File` (`MediaStore.Downloads`).

---

## Project Structure

```text
mark_secure_studio_android/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── assets/                  # Pre-built offline WebView bundle
│       ├── java/com/example/marksecurestudio/
│       │   └── MainActivity.kt      # Edge-to-edge WebView host & MediaStore bridge
│       └── res/                     # App icons, themes, and XML configs
├── gradle/
├── build.gradle.kts
├── settings.gradle.kts
└── README.md
```

---

## In-(Android Studio)

1. Clone this repository and open the root folder in **Android Studio**.
2. Wait for **Gradle Sync** to finish.
3. Select an Android emulator or physical device (**API 30+ / Android 11+** recommended) and press **Run (`▶`)**.
4. Exported images and manifests are saved to **`Downloads/MarkSecure/`** on the device.
