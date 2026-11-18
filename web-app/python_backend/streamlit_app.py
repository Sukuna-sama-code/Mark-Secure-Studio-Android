"""
MarkSecure Streamlit Studio - Complete Integration
Includes Image, Certificate, Video Watermarking & Steganographic Verification
"""
import streamlit as st
import tempfile
import os
import cv2
import numpy as np
from PIL import Image
from watermark_core import apply_watermark, generate_certificate
from video_engine import apply_video_watermark
from stego_forensics import embed_stego_payload, decode_stego_payload

st.set_page_config(page_title="MarkSecure Watermark Studio", layout="wide", page_icon="🛡️")

st.title("🛡️ MarkSecure Media & Forensics Studio")
st.caption("Enhanced watermarking engine with video support and cryptographic authenticity verification")

tabs = st.tabs(["🖼️ Image & Certificate", "🎥 Video Watermarking", "🔍 Verify Authenticity", "⚙️ Architecture"])

# ----------------- TAB 1: IMAGE & CERTIFICATE -----------------
with tabs[0]:
    col1, col2 = st.columns([1, 2])
    with col1:
        st.subheader("1. Source & Configuration")
        mode = st.radio("Target Media", ["Upload Image", "Generate Certificate"])

        if mode == "Upload Image":
            uploaded_file = st.file_uploader("Upload Image", type=["jpg", "jpeg", "png", "webp"])
            base_image = Image.open(uploaded_file) if uploaded_file else Image.new("RGB", (800, 600), (245, 247, 250))
        else:
            recipient = st.text_input("Recipient Name", "Dr. Sarah Lin")
            cert_id = st.text_input("Certificate ID", "MKSEC-2026-94819")
            base_image = generate_certificate(recipient, cert_id)

        watermark_text = st.text_input("Watermark Text", "SAMPLE • DO NOT COPY")
        opacity = st.slider("Opacity", 0.05, 1.0, 0.45)
        rotation = st.slider("Rotation Angle", -90, 90, -30)
        is_tiled = st.checkbox("Diagonal Tiled Grid (watermark.ws style)", value=True)
        embed_stego = st.checkbox("Embed Invisible Steganographic Payload (LSB)", value=True)

    with col2:
        st.subheader("2. Real-Time Watermarked Result")
        result_img = apply_watermark(
            base_image=base_image,
            text=watermark_text,
            opacity=opacity,
            rotation=rotation,
            tiled=is_tiled
        )
        if embed_stego:
            result_img = embed_stego_payload(result_img, {
                "certId": "MKSEC-2026-94819",
                "recipient": "Verified Holder",
                "issuer": "MarkSecure Authority"
            })
        st.image(result_img, use_container_width=True)


# ----------------- TAB 2: VIDEO WATERMARKING -----------------
with tabs[1]:
    st.subheader("🎥 High-Performance Video Watermarking Pipeline")
    v_col1, v_col2 = st.columns([1, 2])

    with v_col1:
        video_file = st.file_uploader("Upload MP4 / WebM Video", type=["mp4", "webm", "mov"])
        v_text = st.text_input("Video Watermark Text", "MARKSEC BROADCAST HD")
        v_anim = st.selectbox("Trajectory Animation", ["Static Anchor", "Anti-Crop Floating Bounce"])
        v_pos = st.selectbox("Position Anchor", ["top-right", "bottom-right", "center", "bottom-center"])
        v_opacity = st.slider("Video Watermark Opacity", 0.1, 1.0, 0.75)

        btn_render = st.button("🚀 Process & Watermark Video", type="primary")

    with v_col2:
        if video_file and btn_render:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_in:
                temp_in.write(video_file.read())
                temp_in_path = temp_in.name

            output_path = temp_in_path.replace(".mp4", "_watermarked.mp4")

            with st.spinner("Processing video frames with MoviePy & OpenCV..."):
                apply_video_watermark(
                    input_video=temp_in_path,
                    output_video=output_path,
                    text=v_text,
                    position=v_pos,
                    opacity=v_opacity,
                    floating=(v_anim == "Anti-Crop Floating Bounce")
                )
            st.success("Video watermarking completed successfully!")
            st.video(output_path)
        else:
            st.info("Upload a video and click 'Process & Watermark Video' to test.")


# ----------------- TAB 3: AUTHENTICITY VERIFICATION -----------------
with tabs[2]:
    st.subheader("🔍 Forensic Steganography & Tamper Verifier")
    v_file = st.file_uploader("Upload Watermarked Certificate or Image to Verify", type=["png", "webp", "jpg"])

    if v_file:
        img_to_check = Image.open(v_file)
        st.image(img_to_check, caption="Inspected Document", width=400)

        with st.spinner("Executing custom LSB decoding algorithm..."):
            verification = decode_stego_payload(img_to_check)

        if verification["status"] == "authentic":
            st.success("✅ AUTHENTIC: Watermark valid and verified against cryptographic authority.")
            st.json(verification["payload"])
        elif verification["status"] == "tampered":
            st.error("⚠️ TAMPER WARNING: Document was altered or corrupted after signing.")
            st.write(verification["details"])
        else:
            st.warning("❌ NO WATERMARK DETECTED: No valid MarkSecure bitstream found.")
