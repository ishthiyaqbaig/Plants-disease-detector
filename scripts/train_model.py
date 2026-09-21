"""
Train YOLOv8 Classification Model on PlantVillage Dataset.

Automatically resolves dataset paths, configures CPU/GPU settings,
trains the model, and deploys best.pt to backend/weights/best.pt.
"""

from pathlib import Path
import argparse
import shutil
import sys
import torch
from ultralytics import YOLO

def main():
    parser = argparse.ArgumentParser(description="Train YOLOv8 Classification on PlantVillage")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs (default: 15)")
    parser.add_argument("--batch", type=int, default=32, help="Batch size (default: 32)")
    parser.add_argument("--imgsz", type=int, default=224, help="Image size (default: 224)")
    parser.add_argument("--model", type=str, default="yolov8n-cls.pt", help="Base model architecture (default: yolov8n-cls.pt)")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    dataset_dir = project_root / "dataset"
    backend_weights_dir = project_root / "backend" / "weights"

    if not (dataset_dir / "train").exists() or not (dataset_dir / "val").exists():
        print(f"[!] Error: Dataset not prepared at '{dataset_dir}'.")
        print("    Please run: python scripts/prepare_classification_datset.py")
        sys.exit(1)

    device = "0" if torch.cuda.is_available() else "cpu"
    print("=" * 60)
    print("🌱 YOLOv8 PlantVillage Training Pipeline")
    print("=" * 60)
    print(f"Dataset path: {dataset_dir}")
    print(f"Device:       {device} ({'GPU' if device == '0' else 'CPU'})")
    print(f"Epochs:       {args.epochs}")
    print(f"Batch Size:   {args.batch}")
    print(f"Image Size:   {args.imgsz}")
    print(f"Base Model:   {args.model}")
    print("=" * 60)

    # Initialize model
    model = YOLO(args.model)

    # Run training
    print("\n[*] Starting training...")
    results = model.train(
        data=str(dataset_dir),
        epochs=args.epochs,
        batch=args.batch,
        imgsz=args.imgsz,
        device=device,
        project=str(project_root / "runs" / "classify"),
        name="plantvillage",
        exist_ok=True
    )

    # Locate best.pt
    best_weights = project_root / "runs" / "classify" / "plantvillage" / "weights" / "best.pt"
    if best_weights.exists():
        backend_weights_dir.mkdir(parents=True, exist_ok=True)
        dest = backend_weights_dir / "best.pt"
        shutil.copy2(best_weights, dest)
        print("\n" + "=" * 60)
        print(f"[+] Training complete!")
        print(f"[+] Best weights saved at:   {best_weights}")
        print(f"[+] Automatically deployed: {dest}")
        print("=" * 60)
        print("\nYou can now start the backend server:")
        print("   cd backend")
        print("   python -m uvicorn app:app --reload")
    else:
        print(f"\n[!] Warning: Could not locate best weights at '{best_weights}'.")

if __name__ == "__main__":
    main()
