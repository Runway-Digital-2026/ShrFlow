import os
import re

docs_dir = "/Users/rahul/Desktop/ShrFlow/docs"
all_files = []

for root, dirs, files in os.walk(docs_dir):
    for file in files:
        if file.endswith((".md", ".html")):
            all_files.append(os.path.join(root, file))

# We will match markdown image syntax: ![alt](path)
md_image_re = re.compile(r'!\[.*?\]\((.*?)\)')
# We will match HTML img syntax: <img ... src="path" ...>
html_image_re = re.compile(r'<img\s+[^>]*src=["\'](.*?)["\']')

broken_links = []
referenced_images = set()

for file_path in all_files:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Extract MD image links
    for match in md_image_re.finditer(content):
        img_path = match.group(1).split('#')[0].split('?')[0] # remove anchor/query if any
        # Skip external http/https urls
        if img_path.startswith(('http://', 'https://', '//')):
            continue
        referenced_images.add(os.path.abspath(os.path.join(os.path.dirname(file_path), img_path)))
        # Verify exist
        full_img_path = os.path.join(os.path.dirname(file_path), img_path)
        if not os.path.exists(full_img_path):
            broken_links.append((file_path, img_path, full_img_path))
            
    # Extract HTML image links
    for match in html_image_re.finditer(content):
        img_path = match.group(1).split('#')[0].split('?')[0]
        if img_path.startswith(('http://', 'https://', '//')):
            continue
        referenced_images.add(os.path.abspath(os.path.join(os.path.dirname(file_path), img_path)))
        full_img_path = os.path.join(os.path.dirname(file_path), img_path)
        if not os.path.exists(full_img_path):
            broken_links.append((file_path, img_path, full_img_path))

print("=== BROKEN IMAGE LINKS ===")
if broken_links:
    for ref_file, rel_path, abs_path in broken_links:
        print(f"File: {ref_file}\n  Refers to missing: {rel_path}\n  Resolved: {abs_path}\n")
else:
    print("None found!")

print("\n=== UNREFERENCED SCREENSHOTS IN docs/screen-shots/ ===")
screenshots_dir = os.path.join(docs_dir, "screen-shots")
unreferenced = []
for file in os.listdir(screenshots_dir):
    if file.endswith((".png", ".jpg", ".jpeg", ".svg")):
        abs_path = os.path.abspath(os.path.join(screenshots_dir, file))
        if abs_path not in referenced_images:
            unreferenced.append(file)

if unreferenced:
    for f in unreferenced:
        print(f"Unreferenced: {f}")
else:
    print("None found!")
