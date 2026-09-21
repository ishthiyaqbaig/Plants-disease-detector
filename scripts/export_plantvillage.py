from pathlib import Path
from datasets import load_dataset
from tqdm import tqdm

print("Loading PlantVillage dataset...")

# Match download_plantvillage.py: load without the invalid "color" argument
dataset = load_dataset("GVJahnavi/PlantVillage_dataset")

# Ensure dataset exports to project root /dataset
output_dir = Path(__file__).resolve().parent.parent / "dataset"

for split in dataset:
    split_dir = output_dir / split
    split_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nExporting {split} ({len(dataset[split])} images)...")

    # Hoisted outside the inner loop for high performance
    label_feature = dataset[split].features["label"]

    for i, item in enumerate(tqdm(dataset[split])):
        image = item["image"]
        label = item["label"]
        label_name = label_feature.int2str(label)

        class_dir = split_dir / label_name
        class_dir.mkdir(parents=True, exist_ok=True)

        image = image.convert("RGB")
        image.save(class_dir / f"{i}.jpg")

print("\nFull dataset export completed!")