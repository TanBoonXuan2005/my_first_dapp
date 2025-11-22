from PIL import Image, ImageDraw
import os

def remove_background_floodfill(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        width, height = img.size
        
        # Create a mask for flood filling
        # We will flood fill from the corners with transparency
        # Threshold: how different a pixel can be from the start pixel to be included
        # The background is white/light grey.
        
        # Since PIL's floodfill fills with a color, we can't directly fill with "transparency" 
        # in a way that blends. But we can create a mask.
        
        # Alternative: Use ImageDraw.floodfill to fill the background with a specific color (e.g. fully transparent)
        # But ImageDraw.floodfill requires an exact match or a threshold.
        
        # Let's implement a simple BFS flood fill for better control over threshold
        pixels = img.load()
        visited = set()
        queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        
        # Color to replace: White-ish
        # We'll consider anything with high brightness as background if connected to corner
        
        def is_background(r, g, b, a):
            # Check if pixel is light enough to be background
            # The shadow might be grey (e.g. 200, 200, 200)
            return r > 200 and g > 200 and b > 200

        # First, verify corners are actually background
        start_pixels = []
        for x, y in queue:
            r, g, b, a = pixels[x, y]
            if is_background(r, g, b, a):
                start_pixels.append((x, y))
                visited.add((x, y))
        
        queue = start_pixels
        
        while queue:
            x, y = queue.pop(0)
            pixels[x, y] = (0, 0, 0, 0) # Set to transparent
            
            # Check neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        r, g, b, a = pixels[nx, ny]
                        if is_background(r, g, b, a):
                            visited.add((nx, ny))
                            queue.append((nx, ny))
                            
        img.save(image_path, "PNG")
        print(f"Processed with flood fill: {image_path}")
        
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

directory = "/Users/juanjue/Documents/Side Projects/my_first_dapp/frontend/assets/animation_frames/B-Cells"

for filename in os.listdir(directory):
    if filename.endswith(".png"):
        remove_background_floodfill(os.path.join(directory, filename))
