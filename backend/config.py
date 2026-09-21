from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "weights" / "best.pt"
UPLOAD_FOLDER = BASE_DIR / "uploads"
CONFIDENCE_THRESHOLD = 0.5
