"""
watermark_core.py - Core PIL and OpenCV Watermarking Operations
Diagonal Tiling, 9-point anchor positioning, and Certificate generation
"""
import math
import qrcode
from PIL import Image, ImageDraw, ImageFont

def apply_watermark(base_image, text, opacity=0.5, rotation=-30, tiled=False, position='center'):
    """
    Applies text watermark with optional watermark.ws diagonal tiling pattern
    """
    img = base_image.convert("RGBA")
    w, h = img.size

    watermark_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(watermark_layer)
    font_size = max(16, int(w * 0.035))
    font = ImageFont.load_default()
    alpha = int(opacity * 255)
    color = (255, 255, 255, alpha)

    if tiled:
        # Create an enlarged rotated canvas for complete diagonal coverage
        diag = int(math.sqrt(w * w + h * h))
        pattern_img = Image.new("RGBA", (diag * 2, diag * 2), (0, 0, 0, 0))
        pdraw = ImageDraw.Draw(pattern_img)

        step_x = max(180, int(w * 0.35))
        step_y = max(80, int(h * 0.2))

        for y in range(0, diag * 2, step_y):
            for x in range(0, diag * 2, step_x):
                pdraw.text((x, y), text, fill=color, font=font)

        rotated_pattern = pattern_img.rotate(rotation, resample=Image.BICUBIC)
        # Center crop to original dimensions
        rx = (rotated_pattern.width - w) // 2
        ry = (rotated_pattern.height - h) // 2
        watermark_layer = rotated_pattern.crop((rx, ry, rx + w, ry + h))
    else:
        # Single anchor
        cx, cy = w // 2, h // 2
        draw.text((cx, cy), text, fill=color, anchor="mm", font=font)

    return Image.alpha_composite(img, watermark_layer).convert("RGB")

def generate_certificate(recipient_name, cert_id):
    """Creates a professional certificate canvas with border and metadata"""
    width, height = 1200, 850
    cert = Image.new("RGB", (width, height), (253, 252, 248))
    draw = ImageDraw.Draw(cert)

    # Outer formal guilloche borders
    draw.rectangle([20, 20, width - 20, height - 20], outline=(30, 41, 59), width=3)
    draw.rectangle([28, 28, width - 28, height - 28], outline=(148, 163, 184), width=1)

    # Certificate Content
    font = ImageFont.load_default()
    draw.text((width // 2, 120), "CERTIFICATE OF AUTHENTICITY", fill=(15, 23, 42), anchor="mm")
    draw.text((width // 2, 260), "THIS IS PRESENTED TO", fill=(100, 116, 139), anchor="mm")
    draw.text((width // 2, 360), recipient_name.upper(), fill=(15, 23, 42), anchor="mm")
    draw.text((width // 2, 460), "For demonstrated excellence and verified integrity credentials.", fill=(71, 85, 105), anchor="mm")
    draw.text((width // 2, 600), f"CREDENTIAL ID: {cert_id}", fill=(15, 23, 42), anchor="mm")

    return cert
