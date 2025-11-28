
import os
from PIL import Image
import math
from collections import deque

ASSETS_BASE = os.path.join(os.getcwd(), "public/assets/animation_frames")
TASKS = [
    {"dir": "Adenovirus", "files": ["Adenovirus.png", "Adenovirus (death).png"]},
    {"dir": "HIV", "files": ["HIV.png", "HIV death.png"]}
]

def distance(c1, c2):
    (r1, g1, b1) = c1[:3]
    (r2, g2, b2) = c2[:3]
    return math.sqrt((r1 - r2)**2 + (g1 - g2)**2 + (b1 - b2)**2)

def flood_fill(img, start_x, start_y, threshold):
    width, height = img.size
    pixels = img.load()
    
    # Get seed color
    seed_color = pixels[start_x, start_y]
    
    # If already transparent, skip
    if len(seed_color) == 4 and seed_color[3] == 0:
        return

    queue = deque([(start_x, start_y)])
    visited = set()
    visited.add((start_x, start_y))
    
    # We will modify pixels in place, so we need to be careful.
    # Actually, checking visited is enough.
    
    while queue:
        x, y = queue.popleft()
        
        current_color = pixels[x, y]
        
        # Check if color matches seed within threshold
        # Note: We check current_color even if we are about to change it? 
        # No, we only add to queue if we haven't visited/changed it.
        # But wait, we added (start_x, start_y) to queue and visited.
        # We process it now.
        
        if distance(current_color, seed_color) <= threshold:
            # Make transparent
            pixels[x, y] = (0, 0, 0, 0)
            
            # Add neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))

def process_image(dir_name, filename):
    file_path = os.path.join(ASSETS_BASE, dir_name, filename)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"Processing {dir_name}/{filename}...")
    
    try:
        img = Image.open(file_path)
        img = img.convert("RGBA")
        
        # Resize if needed (ensure it stays at 200px)
        if img.width > 200:
            print(f"Resizing from {img.width}px to 200px")
            ratio = 200 / img.width
            new_height = int(img.height * ratio)
            img = img.resize((200, new_height), Image.Resampling.LANCZOS)

        # Flood fill from all 4 corners
        width, height = img.size
        corners = [
            (0, 0),
            (width - 1, 0),
            (0, height - 1),
            (width - 1, height - 1)
        ]
        
        # High threshold to catch compression artifacts/shadows
        # 60 is quite generous (approx 23% difference)
        THRESHOLD = 60 
        
        for x, y in corners:
            flood_fill(img, x, y, THRESHOLD)

        img.save(file_path, "PNG")
        print(f"Successfully processed {filename}")

    except Exception as e:
        print(f"Error processing {filename}: {e}")

def main():
    for task in TASKS:
        for file in task["files"]:
            process_image(task["dir"], file)

if __name__ == "__main__":
    main()
