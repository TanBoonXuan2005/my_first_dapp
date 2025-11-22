from PIL import Image
import os

def inspect_alpha(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        width, height = img.size
        center_pixel = img.getpixel((width // 2, height // 2))
        print(f"File: {os.path.basename(image_path)}")
        print(f"Center Pixel (RGBA): {center_pixel}")
        
        # Check for any semi-transparent pixels (0 < A < 255)
        datas = img.getdata()
        semi_transparent_count = 0
        total_pixels = len(datas)
        for item in datas:
            if 0 < item[3] < 255:
                semi_transparent_count += 1
        
        print(f"Semi-transparent pixels: {semi_transparent_count} / {total_pixels} ({semi_transparent_count/total_pixels*100:.2f}%)")
        print("-" * 20)

    except Exception as e:
        print(f"Error processing {image_path}: {e}")

directory = "/Users/juanjue/Documents/Side Projects/my_first_dapp/frontend/assets/animation_frames/B-Cells"

for filename in os.listdir(directory):
    if filename.endswith("Neutral Form).png"):
        inspect_alpha(os.path.join(directory, filename))
