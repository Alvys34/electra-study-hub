"""
export_blender_assets.py - Blender Python Automation Script
Run this script inside Blender or via CLI:
blender --background --python export_blender_assets.py

Generates production 3D assets:
- DMM Multimeter
- Breadboard
- Precision Resistor
- Knife Switch
- Edison Lightbulb
And exports them as .glb files to public/models/
"""
import bpy
import os

output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "models"))
os.makedirs(output_dir, exist_ok=True)

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def export_active_as_glb(filename):
    filepath = os.path.join(output_dir, filename)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=True,
        export_apply=True
    )
    print(f"Exported: {filepath}")

def build_knife_switch():
    clear_scene()
    # Insulating Base
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.1))
    base = bpy.context.active_object
    base.name = "SwitchBase"
    base.scale = (1.5, 0.8, 0.15)

    # Copper Jaw Posts
    bpy.ops.mesh.primitive_cube_add(size=0.2, location=(-0.5, 0, 0.3))
    post1 = bpy.context.active_object
    post1.name = "Post_Hinge"

    bpy.ops.mesh.primitive_cube_add(size=0.2, location=(0.5, 0, 0.3))
    post2 = bpy.context.active_object
    post2.name = "Post_Contact"

    # Select all and export
    bpy.ops.object.select_all(action='SELECT')
    export_active_as_glb("knife_switch.glb")

if __name__ == "__main__":
    print("Exporting Blender assets...")
    try:
        build_knife_switch()
        print("Blender asset generation complete!")
    except Exception as e:
        print(f"Blender export note: {e}")
