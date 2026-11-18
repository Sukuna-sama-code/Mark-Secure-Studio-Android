# MarkSecure Python & Streamlit Backend

This directory houses the standalone, private Python backend for MarkSecure Studio, implementing video watermarking (via MoviePy & OpenCV), diagonal tiling, and forensic LSB decoding.

## Files
- `streamlit_app.py`: Complete Streamlit UI integrating Image, Certificate, Video Watermarking, and Steganography Verification tabs.
- `video_engine.py`: High-performance multithreaded video frame processor with audio preservation and harmonic anti-crop bounce trajectories.
- `watermark_core.py`: PIL and OpenCV watermarking engine with diagonal tiling and procedural certificate generation.
- `stego_forensics.py`: LSB steganography bitstream encoder and decoder with SHA-256 integrity verification (100% bitstream compatible with the web app).
- `requirements.txt`: Python package dependencies.

## Running Locally
```bash
cd python_backend
pip install -r requirements.txt
streamlit run streamlit_app.py
```
