"""
Prepare PlantVillage Dataset for YOLOv8 Classification Training.

This script:
1. Verifies the dataset structure (train, val, and test splits).
2. Sets up the 3-way split (80% train, 10% val, 10% test) if not already done.
3. Validates all 38 classes across all splits.
4. Generates a classes manifest (classes.txt).
5. Displays YOLOv8 training instructions.
"""

from pathlib import Path
import shutil
import sys

# Ensure UTF-8 output on Windows terminals if supported
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def prepare_dataset():
    root_dir = Path(__file__).resolve().parent.parent
    dataset_dir = root_dir / "dataset"
    train_dir = dataset_dir / "train"
    val_dir = dataset_dir / "val"
    test_dir = dataset_dir / "test"

    print("=" * 60)
    print("[*] PlantVillage YOLOv8 Dataset Preparation (3-Way Split)")
    print("=" * 60)
    print(f"Dataset root: {dataset_dir}")

    if not dataset_dir.exists():
        print(f"[!] Error: Dataset directory '{dataset_dir}' not found.")
        print("Please run 'python scripts/export_plantvillage.py' first.")
        sys.exit(1)

    if not train_dir.exists():
        print(f"[!] Error: 'train' directory not found in '{dataset_dir}'.")
        sys.exit(1)

    # Ensure val exists
    if not val_dir.exists():
        if test_dir.exists():
            print("\n[*] Initializing 'val' directory from 'test'...")
            test_dir.rename(val_dir)
        else:
            print("[!] Error: Neither 'val' nor 'test' directory found in dataset.")
            sys.exit(1)

    # Ensure test exists for 3-way split
    image_exts = {".jpg", ".jpeg", ".png", ".webp"}
    if not test_dir.exists() or not any(test_dir.iterdir()):
        print("\n[*] Creating 'test' split (50% of evaluation set)...")
        test_dir.mkdir(parents=True, exist_ok=True)
        for cls_dir in val_dir.iterdir():
            if not cls_dir.is_dir():
                continue
            target_cls = test_dir / cls_dir.name
            target_cls.mkdir(parents=True, exist_ok=True)
            images = sorted([p for p in cls_dir.iterdir() if p.suffix.lower() in image_exts])
            split_idx = len(images) // 2
            for img in images[:split_idx]:
                shutil.move(str(img), str(target_cls / img.name))
        print("    [+] Successfully partitioned into 'val' and 'test'!")

    # Inspect classes across all 3 splits
    train_classes = sorted([d.name for d in train_dir.iterdir() if d.is_dir()])
    val_classes = sorted([d.name for d in val_dir.iterdir() if d.is_dir()])
    test_classes = sorted([d.name for d in test_dir.iterdir() if d.is_dir()])

    print(f"\n[*] Class Statistics:")
    print(f"    Train classes: {len(train_classes)}")
    print(f"    Val classes:   {len(val_classes)}")
    print(f"    Test classes:  {len(test_classes)}")

    if train_classes == val_classes == test_classes:
        print(f"    [+] All {len(train_classes)} classes match perfectly across train, val, and test!")
    else:
        print(f"    [!] Warning: Class mismatches detected between splits.")

    # Count total images
    train_images = sum(1 for p in train_dir.rglob("*") if p.suffix.lower() in image_exts)
    val_images = sum(1 for p in val_dir.rglob("*") if p.suffix.lower() in image_exts)
    test_images = sum(1 for p in test_dir.rglob("*") if p.suffix.lower() in image_exts)
    total_images = train_images + val_images + test_images

    print(f"\n[*] Image Distribution:")
    print(f"    Train images: {train_images:,} ({train_images/total_images*100:.1f}%)")
    print(f"    Val images:   {val_images:,} ({val_images/total_images*100:.1f}%)")
    print(f"    Test images:  {test_images:,} ({test_images/total_images*100:.1f}%)")
    print(f"    Total images: {total_images:,}")

    # Write classes.txt manifest
    classes_file = dataset_dir / "classes.txt"
    with open(classes_file, "w", encoding="utf-8") as f:
        for cls in train_classes:
            f.write(f"{cls}\n")
    print(f"\n[+] Classes manifest saved to: {classes_file}")

    print("\n" + "=" * 60)
    print("[*] YOLOv8 Classification Training Command:")
    print("=" * 60)
    print("To train your YOLOv8 model on this dataset, run:")
    print("\n   python scripts/train_model.py --epochs 5 --batch 32")
    print("\nOr using direct YOLO CLI:")
    print(f'   yolo task=classify mode=train model=yolov8n-cls.pt data="{dataset_dir}" epochs=5 imgsz=224 batch=32')
    print("=" * 60)

if __name__ == "__main__":
    prepare_dataset()
