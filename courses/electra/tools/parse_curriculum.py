import os
import zipfile
import xml.etree.ElementTree as ET
import re
import json

curriculum_dir = r"C:\Users\iznop\.gemini\antigravity\scratch\circuit-analysis-3d\curriculum"
output_json = r"C:\Users\iznop\.gemini\antigravity\scratch\circuit-analysis-3d\curriculum_summary.json"

data = {}

for f in sorted(os.listdir(curriculum_dir)):
    if not f.endswith(".pptx"):
        continue
    filepath = os.path.join(curriculum_dir, f)
    with zipfile.ZipFile(filepath, "r") as z:
        slides = [n for n in z.namelist() if n.startswith("ppt/slides/slide") and n.endswith(".xml")]
        slides.sort(key=lambda x: int(re.search(r"\d+", x).group()))
        file_slides = []
        for i, s in enumerate(slides):
            xml_content = z.read(s)
            root = ET.fromstring(xml_content)
            paras = []
            for p in root.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}p"):
                texts = [node.text for node in p.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}t") if node.text]
                if texts:
                    clean_text = "".join(texts).strip()
                    if clean_text:
                        paras.append(clean_text)
            file_slides.append({
                "slide_num": i + 1,
                "content": paras
            })
        data[f] = {
            "total_slides": len(slides),
            "slides": file_slides
        }

with open(output_json, "w", encoding="utf-8") as out:
    json.dump(data, out, indent=2, ensure_ascii=False)

print("Parsed successfully!")
for k, v in data.items():
    print(f"- {k}: {v['total_slides']} slides")
