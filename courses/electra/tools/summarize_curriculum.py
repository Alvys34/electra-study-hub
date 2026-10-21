import json

with open("curriculum_summary.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for filename, unit_data in data.items():
    print("=" * 70)
    print("UNIT:", filename, f"({unit_data['total_slides']} slides)")
    print("-" * 70)
    # Collect titles or first lines of each slide
    for slide in unit_data["slides"]:
        content = slide["content"]
        if content:
            title = content[0]
            bullets = " | ".join(content[1:4]) if len(content) > 1 else ""
            print(f"  Slide {slide['slide_num']}: {title[:50]} -> {bullets[:80]}")
    print()
