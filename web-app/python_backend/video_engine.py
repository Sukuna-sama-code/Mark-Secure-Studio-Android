"""
video_engine.py - High Performance Video Watermarking Pipeline
Uses MoviePy and OpenCV with audio stream preservation and multithreading
"""
import os
import cv2
import numpy as np
from moviepy.editor import VideoFileClip
from PIL import Image, ImageDraw, ImageFont

def create_text_watermark_frame(width, height, text, opacity=0.7, font_size=32):
    """Generates an RGBA overlay for a video frame"""
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        font = ImageFont.load_default()

    alpha = int(opacity * 255)
    text_color = (255, 255, 255, alpha)

    # Calculate bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

    return overlay, draw, font, (tw, th)

def apply_video_watermark(input_video, output_video, text, position='top-right', opacity=0.7, floating=False):
    """
    Overlays watermark onto each video frame and exports with audio preserved.
    """
    clip = VideoFileClip(input_video)
    w, h = clip.size
    fps = clip.fps or 30

    def process_frame(get_frame, t):
        frame = get_frame(t)  # RGB uint8 numpy array
        pil_frame = Image.fromarray(frame).convert("RGBA")

        # Calculate coordinate
        if floating:
            # Harmonic anti-cropping bounce
            cx = int((w / 2) + np.sin(t * 1.5) * (w * 0.35))
            cy = int((h / 2) + np.cos(t * 1.2) * (h * 0.35))
        else:
            padding = 24
            if position == 'top-right':
                cx, cy = w - 160, padding + 20
            elif position == 'bottom-right':
                cx, cy = w - 160, h - padding - 20
            elif position == 'bottom-center':
                cx, cy = w // 2, h - padding - 20
            else:
                cx, cy = w // 2, h // 2

        overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        font = ImageFont.load_default()

        # Draw background highlight pill
        draw.rectangle([cx - 90, cy - 14, cx + 90, cy + 14], fill=(15, 23, 42, int(opacity * 200)))
        draw.text((cx, cy), text, fill=(255, 255, 255, int(opacity * 255)), anchor="mm", font=font)

        # Alpha composite
        composite = Image.alpha_composite(pil_frame, overlay).convert("RGB")
        return np.array(composite)

    watermarked_clip = clip.fl(process_frame)
    watermarked_clip.write_videofile(
        output_video,
        codec='libx264',
        audio_codec='aac',
        threads=4,
        preset='fast'
    )
    clip.close()
    watermarked_clip.close()
