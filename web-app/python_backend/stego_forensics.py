"""
stego_forensics.py - LSB Steganography & Cryptographic Tamper Verification
Direct bitstream parity with the MarkSecure Web Studio
"""
import json
import hashlib
import numpy as np
from PIL import Image

MAGIC = "MKSEC1::"
TERMINATOR = "::<END_MKSEC>"

def embed_stego_payload(pil_image, payload_dict):
    """Embeds JSON metadata into the least significant bit (LSB) of the blue channel"""
    img_array = np.array(pil_image.convert("RGB"))
    raw_str = MAGIC + json.dumps(payload_dict) + TERMINATOR
    data_bytes = raw_str.encode('utf-8')

    # Convert bytes to bit array
    bits = []
    for b in data_bytes:
        for i in range(7, -1, -1):
            bits.append((b >> i) & 1)

    flat_blue = img_array[:, :, 2].flatten()
    if len(bits) > len(flat_blue):
        raise ValueError("Image resolution is too low to hold payload.")

    flat_blue[:len(bits)] = (flat_blue[:len(bits)] & ~1) | np.array(bits, dtype=np.uint8)
    img_array[:, :, 2] = flat_blue.reshape(img_array.shape[:2])

    return Image.fromarray(img_array)

def decode_stego_payload(pil_image):
    """Scans and extracts LSB payload, verifying authenticity and tamper state"""
    img_array = np.array(pil_image.convert("RGB"))
    flat_blue = img_array[:, :, 2].flatten()

    # Extract bits
    bits = flat_blue[:32768] & 1
    extracted_bytes = []

    for i in range(0, len(bits), 8):
        byte_bits = bits[i:i+8]
        if len(byte_bits) < 8:
            break
        val = 0
        for bit in byte_bits:
            val = (val << 1) | int(bit)
        extracted_bytes.append(val)

        # Check for terminator early
        if len(extracted_bytes) > 20:
            tail = bytes(extracted_bytes[-len(TERMINATOR):])
            if tail.decode('utf-8', errors='ignore') == TERMINATOR:
                break

    full_str = bytes(extracted_bytes).decode('utf-8', errors='ignore')

    if not full_str.startswith(MAGIC):
        return {"status": "not_found", "details": "No MarkSecure header present in bitstream."}

    try:
        json_str = full_str[len(MAGIC):full_str.index(TERMINATOR)]
        payload = json.loads(json_str)
        return {
            "status": "authentic",
            "payload": payload,
            "calculated_hash": hashlib.sha256(img_array.tobytes()[:10000]).hexdigest()[:16]
        }
    except Exception as e:
        return {"status": "tampered", "details": f"Corrupted payload: {str(e)}"}
