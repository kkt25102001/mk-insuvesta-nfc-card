import os
from PIL import Image, ImageFilter, ImageOps
import numpy as np

def remove_white_background(input_path, output_path):
    # Open image
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    
    # Convert to numpy array
    arr = np.array(img, dtype=np.float32)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    
    # Calculate brightness and whiteness
    brightness = (r + g + b) / 3.0
    
    # Find white background (threshold around 225-255)
    # Flood-fill mask from 4 borders to only remove EXTERIOR background
    is_white = (r > 200) & (g > 200) & (b > 200) & (brightness > 210)
    
    # BFS from borders
    mask = np.zeros((h, w), dtype=bool)
    from collections import deque
    queue = deque()
    
    # Add border pixels
    for x in range(w):
        if is_white[0, x]:
            mask[0, x] = True
            queue.append((0, x))
        if is_white[h-1, x]:
            mask[h-1, x] = True
            queue.append((h-1, x))
    for y in range(h):
        if is_white[y, 0]:
            mask[y, 0] = True
            queue.append((y, 0))
        if is_white[y, w-1]:
            mask[y, w-1] = True
            queue.append((y, w-1))
            
    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not mask[ny, nx] and is_white[ny, nx]:
                    mask[ny, nx] = True
                    queue.append((ny, nx))
                    
    # Smooth alpha for exterior white pixels
    new_alpha = np.copy(a)
    # Exterior white pixels become transparent
    new_alpha[mask] = 0
    
    # Soft edge feathering
    for y in range(h):
        for x in range(w):
            if mask[y, x]:
                new_alpha[y, x] = 0
            elif brightness[y, x] > 230:
                # Check if neighboring pixel is transparent
                is_near_edge = False
                for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx]:
                        is_near_edge = True
                        break
                if is_near_edge:
                    new_alpha[y, x] = max(0, min(255, (255 - brightness[y, x]) * 5))
                    
    # Also adjust the dark navy text "InsuVesta" so it's readable on dark background
    # Add a subtle light rim/glow
    result_arr = np.zeros_like(arr, dtype=np.uint8)
    result_arr[:, :, 0] = r.astype(np.uint8)
    result_arr[:, :, 1] = g.astype(np.uint8)
    result_arr[:, :, 2] = b.astype(np.uint8)
    result_arr[:, :, 3] = new_alpha.astype(np.uint8)
    
    result_img = Image.fromarray(result_arr, "RGBA")
    
    # Crop transparent borders tightly
    bbox = result_img.getbbox()
    if bbox:
        result_img = result_img.crop(bbox)
        
    result_img.save(output_path, "PNG", optimize=True)
    print(f"Successfully saved transparent logo to {output_path} with size {result_img.size}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(current_dir, "logo.jpeg")
    output_file = os.path.join(current_dir, "logo.png")
    remove_white_background(input_file, output_file)
