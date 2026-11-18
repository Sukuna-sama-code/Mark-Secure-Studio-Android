# MarkSecure Studio for Android

A Kotlin Android shell with an offline React/TypeScript watermark studio. This repository includes the spatial mobile redesign, image removal and batch deletion controls, editable web source, and rebuilt Android assets.

## Repository layout
- `app/`: Android application, native file/download bridge and bundled web assets.
- `web-app/`: editable React/TypeScript source, sample assets and build scripts.
- `web-app/python_backend/`: reference Python tools; not integrated into Android.
- `gradle/`, `gradlew`, `gradlew.bat`: Gradle wrapper and configuration.
- `VALIDATION.txt`: recorded checks and device-testing limitations.

The project at the repository root is the current version. Older nested project copies have been removed; previous versions remain in Git history.

## Open and run
1. Clone this repository or download and extract its ZIP.
2. In Android Studio, open the repository root: the folder containing `settings.gradle.kts` and `app/`.
3. Allow Gradle sync and install the SDK required by the existing project (compile/target 37, minimum 30).
4. Select an emulator or phone and Run. Updated web assets are already bundled; no npm step is required for this first run.

The original Gradle/AGP versions were preserved. This environment could not download the Gradle distribution and has no configured Android SDK, so APK compilation and real-device testing are still required in Android Studio. This is source code, not a signed APK.

## Rebuild after editing React
In web-app, use Node 22 or later:
```
npm ci
npm run lint
npm run android:assets
```
Then build/run from Android Studio. android:assets replaces app/src/main/assets with the fresh Vite build. Editing React without this step will leave Android showing an old build.

## Implemented
- Fixed obsidian/mint UI, original logo, layered tilting home preview, four-tab navigation.
- Contextual text, logo, layout and protection controls; full-screen image preview.
- Text/font/size/opacity/rotation/spacing, dark text backing, logo blend/scale/rotation, position/offsets/repeating text, placement suggestion and foil overlay.
- Hidden MS35 watermark metadata with UTF-8 encoding, payload capacity checks, accurate detection wording.
- PNG export, actual reference QR footer, JSON reports, settings save/restore, Python decoder download.
- Multi-image and recipient batch generation, simple Name, ID CSV input, output thumbnails and ZIP export. 25-recipient and 60-megapixel aggregate limits protect memory. CSV is simple comma-separated input, not quoted/embedded-comma CSV.
- 15 photo samples, 15 editable certificate designs and 5 originals with width at least 3840px. Photos and thumbnails are bundled offline; certificate designs render locally.
- Android keyboard insets, internal Back handling, file picker and download bridge. No AI Hub, Gemini API server, theme selector or color picker.

## Honest boundaries
This is the redesigned mobile implementation, not full parity with every desktop engine. The desktop reference engines and Python backend are retained in source for future integration, but are not presented as working native Android capabilities.
- The scanner supports mobile MS35 payloads, not every older MKSEC payload format.
- Payload detection does not prove authenticity, ownership or signer trust. The original simulated C2PA identity system is not exposed as certified verification.
- Redundancy/anti-removal guarantees are not exposed because the mobile encoder does not implement those claims.
- Pixel perturbation is explicitly experimental, not guaranteed AI protection.
- The reference footer checksum is not a cryptographic image integrity signature. QR encodes a certificate reference only.
- Python video processing and formal C2PA signing are not integrated in the Android app.
- Batch personalizes watermarks/metadata on the current source image; it does not regenerate all baked certificate recipient text. Use dynamic watermark fields for batch recipients.
- Checkpoints save watermark settings, not the source image. Some advanced experimental settings are not restored.
- Spatial effects use lightweight CSS transforms, not an XR runtime or a freely rotatable 3D scene.
- No fake profile, notification, or account feature was added.

## Validation
TypeScript and production Vite build passed. See VALIDATION.txt for final test results. Native APK, real-device performance, touch layout and native download bridge still require device verification.

## Sample sources
Selected photograph URLs came from the supplied project's Unsplash catalog. The original catalog's titles are descriptive labels and may not identify exact locations. Source IDs and original URLs are retained in web-app/src/assets/defaultImageSamples.ts; bundled selection and actual dimensions are in web-app/src/assets/curatedSamples.json. Certificate designs are taken from the supplied certificate renderer/catalog. Review asset rights before distributing the app publicly.

## Canvas and batch removal update
Remove the current image using the trash button on the home canvas row or image preview. Watermark settings remain available for the next image. In Batch, Delete files or Delete outputs opens checkbox selection with Select all / Deselect all, Delete selected and Cancel. Removing items only clears the app workspace; it never deletes phone originals or saved exports.

To update a Git checkout, pull the latest `main`, open the repository root in Android Studio, sync Gradle, and press Run. The bundled assets are ready to use. After editing React source, run `npm run android:assets` from `web-app/` before rebuilding Android.
