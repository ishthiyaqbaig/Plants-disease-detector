import { useState, useEffect, useRef } from "react";
import { UploadCloud, Image, Trash2, ShieldAlert, Camera, StopCircle } from "lucide-react";
import { translations } from "../locales/translations";

export default function UploadCard({ file, setFile, loading }) {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  
  // Camera capture states
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => {
      window.removeEventListener("langChange", handleLangUpdate);
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const t = translations[lang] || translations.en;

  const validateFile = (selectedFile) => {
    setError("");
    if (!selectedFile) return false;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB size limit.");
      return false;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Allowed formats: JPEG, PNG, WEBP.");
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  // 1. Start camera streaming
  const startCamera = async () => {
    setError("");
    setFile(null);
    setCameraActive(true);
    try {
      const constraints = {
        video: { facingMode: "environment" } // Prefer back camera on mobile
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Unable to access system camera. Please check permissions.");
      setCameraActive(false);
    }
  };

  // 2. Stop camera streaming
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // 3. Take snapshot snapshot and convert to File
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    
    // Set matching dimensions
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const capturedFile = new File([blob], `captured_leaf_${Date.now()}.jpg`, { type: "image/jpeg" });
        setFile(capturedFile);
        stopCamera();
      }
    }, "image/jpeg", 0.95);
  };

  return (
    <div className="w-full">
      {/* Active Camera Viewfinder */}
      {cameraActive ? (
        <div className="dashboard-card p-5 bg-[var(--card-bg)] relative overflow-hidden flex flex-col items-center space-y-4">
          <div className="flex justify-between items-center w-full border-b border-[var(--card-border)] pb-3">
            <span className="flex items-center gap-2 text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">
              <Camera size={14} className="animate-pulse" />
              Live Camera Viewfinder
            </span>
            
            <button
              onClick={stopCamera}
              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition text-[10px] font-bold uppercase"
            >
              Cancel
            </button>
          </div>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-900">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Guide rectangle for leaf closeup alignment */}
            <div className="absolute inset-[15%] border border-dashed border-[#22C55E]/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#22C55E]/50 uppercase tracking-widest bg-slate-950/60 px-2.5 py-1 rounded-lg">
                Align Leaf Here
              </span>
            </div>
          </div>

          <button
            onClick={captureSnapshot}
            className="px-6 py-2.5 rounded-2xl bg-[#22C55E] hover:bg-[#22C55E]/90 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          >
            <Camera size={14} />
            Take Snapshot
          </button>
        </div>
      ) : !previewUrl ? (
        /* Standard Drag and Drop Dropzone plus Camera trigger */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`dashboard-card p-6 border-2 border-dashed text-center transition-all duration-300 relative ${
            dragActive
              ? "border-[#22C55E] bg-[#22C55E]/5 scale-[1.01]"
              : "border-[var(--card-border)] bg-[var(--card-bg)]/40 hover:border-[var(--card-border-glow)]/30"
          }`}
        >
          <input
            type="file"
            id="leaf-file"
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
          />
          
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="flex gap-4">
              <label
                htmlFor="leaf-file"
                className="p-4 bg-[#22C55E]/10 rounded-full text-[#22C55E] border border-[#22C55E]/20 text-3xl hover:bg-[#22C55E]/20 transition cursor-pointer"
                title="Upload Image"
              >
                <UploadCloud size={28} />
              </label>
              
              <button
                onClick={startCamera}
                className="p-4 bg-[#3B82F6]/10 rounded-full text-[#3B82F6] border border-[#3B82F6]/20 text-3xl hover:bg-[#3B82F6]/20 transition"
                title="Capture with Camera"
              >
                <Camera size={28} />
              </button>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                {t.detDragDrop}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {t.detSupported} or click camera to capture
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-xs text-red-400 font-bold flex items-center justify-center gap-1.5 uppercase">
              <ShieldAlert size={14} />
              {error}
            </div>
          )}
        </div>
      ) : (
        /* Preview details */
        <div className="dashboard-card p-5 relative overflow-hidden bg-[var(--card-bg)]">
          <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)] pb-3">
            <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <Image size={14} className="text-[#22C55E]" />
              {file.name || "Captured Image"} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
            
            <div className="flex gap-2">
              <button
                onClick={startCamera}
                className="p-1.5 rounded-lg bg-[#3B82F6]/15 border border-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white transition text-[10px] flex items-center gap-1 font-bold uppercase"
              >
                <Camera size={12} />
                Retake
              </button>
              
              <button
                onClick={() => { setFile(null); setError(""); }}
                className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition text-[10px] flex items-center gap-1 font-bold uppercase"
              >
                <Trash2 size={12} />
                Remove
              </button>
            </div>
          </div>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-900/60 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Leaf Preview"
              className="max-w-full max-h-full object-contain"
            />
            <div
              className="absolute inset-0 opacity-15 filter blur-3xl pointer-events-none"
              style={{
                backgroundImage: `url(${previewUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
