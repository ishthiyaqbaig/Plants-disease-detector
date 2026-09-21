from ultralytics import YOLO
from config import CONFIDENCE_THRESHOLD, MODEL_PATH
import os

_model = None

def get_model():
    """
    Lazy-loads the YOLO model. Prefers trained weights at MODEL_PATH,
    or falls back to a base model / raises a clear error if missing.
    """
    global _model
    if _model is not None:
        return _model

    if MODEL_PATH.exists():
        _model = YOLO(str(MODEL_PATH))
    else:
        # Check if fallback or base weights exist
        fallback_path = MODEL_PATH.parent / "yolov8n-cls.pt"
        if fallback_path.exists():
            _model = YOLO(str(fallback_path))
        else:
            try:
                # Load default YOLOv8 nano classification model as fallback
                _model = YOLO("yolov8n-cls.pt")
            except Exception as e:
                raise FileNotFoundError(
                    f"Model weights not found at '{MODEL_PATH}'. "
                    f"Please train your model and copy best.pt to '{MODEL_PATH}'. Error: {e}"
                )
    return _model

def predict_disease(image_path):
    """
    Infers plant pathology from image using YOLOv8.
    Supports both classification (probs) and detection (boxes) models.
    """
    model = get_model()

    result = model.predict(
        source=image_path,
        conf=CONFIDENCE_THRESHOLD,
        verbose=False
    )

    if not result or len(result) == 0:
        return "No disease detected", 0.0

    res = result[0]

    # 1. Classification model output (YOLOv8-cls)
    if hasattr(res, "probs") and res.probs is not None:
        class_id = int(res.probs.top1)
        confidence = float(res.probs.top1conf)
        disease = model.names[class_id]

        if confidence < CONFIDENCE_THRESHOLD:
            return "No disease detected", round(confidence, 4)

        return disease, round(confidence, 4)

    # 2. Object Detection model output (YOLOv8-detect)
    if hasattr(res, "boxes") and res.boxes is not None and len(res.boxes) > 0:
        boxes = res.boxes
        best_box_index = int(boxes.conf.argmax())
        class_id = int(boxes.cls[best_box_index])
        confidence = float(boxes.conf[best_box_index])
        disease = model.names[class_id]

        return disease, round(confidence, 4)

    return "No disease detected", 0.0

