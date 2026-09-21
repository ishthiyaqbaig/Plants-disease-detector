from datasets import load_dataset

print("Starting PlantVillage dataset download...")

# Load the original color images from the modern Parquet repository
dataset = load_dataset("GVJahnavi/PlantVillage_dataset")

print("\nDataset downloaded successfully!")
print(dataset)

# Display dataset information
for split in dataset:
    print(f"{split}: {len(dataset[split])} images")

# Display the available features
print("\nDataset features:")
print(dataset["train"].features)

# Display class names
label_feature = dataset["train"].features["label"]

if hasattr(label_feature, "names"):
    print("\nDisease classes:")
    for index, name in enumerate(label_feature.names):
        print(f"{index}: {name}")