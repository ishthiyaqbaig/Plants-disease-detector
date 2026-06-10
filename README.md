# 🌱 Ish AI Doctor - Agriculture Intelligence Dashboard

Ish AI Doctor is an enterprise-grade Agriculture Intelligence Dashboard offering real-time plant leaf pathology diagnostics (YOLOv8), localized weather advisories, multilingual AI consulting (Gemini), and dynamic PDF report generation.

---

## 🛠️ Stack & Features
* **Frontend**: React + Vite + Tailwind CSS + Recharts
* **Backend**: FastAPI + Uvicorn (Python)
* **AI Models**: YOLOv8 (Pathology Vision) + Google Gemini (Agronomy Advice)
* **Key Features**: Live Camera Capture, Multilingual Audio (EN, TE, HI), Weather Alarms, Analytics Charts, CSV/PDF Reports.

---

## 🚀 Quick Start

### 1. Backend Setup
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Activate Virtual Env:
   * Windows: `..\venv\Scripts\activate`
   * macOS/Linux: `source ../venv/bin/activate`
3. Install packages & run:
   ```bash
   pip install -r requirements.txt
   echo GEMINI_API_KEY=your_key_here > .env
   python -m uvicorn app:app --reload
   ```
   *Runs at:* `http://127.0.0.1:8000`

### 2. Frontend Setup
1. Navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install & run:
   ```bash
   npm install
   npm run dev
   ```
   *Runs at:* `http://localhost:5173`

---

## 📊 Datasets & YOLOv8 Training

### 1. Dataset Directory
Place YOLO format datasets inside the root `/dataset` folder:
```
dataset/
├── data.yaml                 <- Names config (Tomato___Healthy, Potato___Late_blight, etc.)
├── train/                    <- train/images and train/labels
└── val/                      <- val/images and val/labels
```

### 2. Train and Deploy
* **Train Command**:
  ```bash
  yolo task=detect mode=train model=yolov8n.pt data=dataset/data.yaml epochs=50 imgsz=640
  ```
* **Deploy**: Copy the trained weights file from `runs/detect/train/weights/best.pt` to `backend/weights/best.pt`, then restart the FastAPI server.
