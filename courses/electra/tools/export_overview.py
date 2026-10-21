import json, sys

sys.stdout.reconfigure(encoding='utf-8')

with open("curriculum_summary.json", "r", encoding="utf-8") as f:
    data = json.load(f)

with open("curriculum_overview.md", "w", encoding="utf-8") as out:
    for filename, unit_data in sorted(data.items()):
        out.write(f"\n# {filename} ({unit_data['total_slides']} slides)\n\n")
        for slide in unit_data["slides"]:
            content = slide["content"]
            if content:
                out.write(f"### Slide {slide['slide_num']}: {content[0]}\n")
                for bullet in content[1:]:
                    out.write(f"- {bullet}\n")
                out.write("\n")

print("Generated curriculum_overview.md successfully!")
