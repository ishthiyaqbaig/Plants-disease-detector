import { useState, useEffect } from "react";
import { Download, FileText, Volume2, VolumeX, Thermometer, Droplets, AlertTriangle, Leaf, FlaskConical, CheckCircle2 } from "lucide-react";
import { translations } from "../locales/translations";
import { speechService } from "../services/speak";
import API from "../services/api";

export default function ResultCard({ result, uploadedFile }) {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Interactive Treatment tab: 'organic' or 'chemical'
  const [treatmentTab, setTreatmentTab] = useState("organic");

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => {
      window.removeEventListener("langChange", handleLangUpdate);
      speechService.stopSpeaking();
    };
  }, []);

  useEffect(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setExplanation("");
    setTreatmentTab("organic");
  }, [result]);

  if (!result) return null;

  const t = translations[lang] || translations.en;
  const diseaseName = result.disease.replace(/___/g, " - ").replace(/_/g, " ");

  // Severity style utilities
  const getSeverityStyle = (level) => {
    switch (level?.toLowerCase()) {
      case "severe":
        return { text: "text-red-400 border-red-500/20 bg-red-500/5", bg: "bg-red-500" };
      case "moderate":
        return { text: "text-amber-400 border-amber-500/20 bg-amber-500/5", bg: "bg-amber-500" };
      default:
        return { text: "text-[#22C55E] border-[#22C55E]/20 bg-[#22C55E]/5", bg: "bg-[#22C55E]" };
    }
  };

  const severityStyle = getSeverityStyle(result.severity);

  // Circular gauge config
  const radius = 35;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.confidence / 100) * circumference;

  const getAIExplanation = async () => {
    setExplaining(true);
    try {
      const res = await API.post("/explain", {
        disease: result.disease,
        confidence: result.confidence,
        lang: lang
      });
      setExplanation(res.data.explanation);
    } catch (err) {
      setExplanation("Unable to generate detailed AI progression insights.");
    }
    setExplaining(false);
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const payload = {
        disease: diseaseName,
        confidence: `${result.confidence}%`,
        cause: result.cause,
        treatment: result.treatment,
        severity: result.severity,
        risk: result.risk,
        temperature: `${result.temperature}°C`,
        humidity: `${result.humidity}%`,
        irrigation: result.temperature > 30 ? "Increase watering frequency." : "Standard watering schedule."
      };

      const res = await API.post("/download-report", payload, {
        responseType: "blob"
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Ish_AI_Doctor_Report_${result.disease}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      alert("Failed to download PDF report.");
    }
    setDownloading(false);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      const textToSpeak = `
        ${t.detDisease}: ${diseaseName}. 
        ${t.detConfidence}: ${result.confidence}%. 
        ${t.detSeverity}: ${result.severity}. 
        ${t.detCause}: ${result.cause}. 
        ${t.detTreatment}: ${result.treatment}
      `;
      setIsSpeaking(true);
      speechService.speak(
        textToSpeak,
        lang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Side-by-Side Analysis (FIRST) */}
      <div className="dashboard-card p-5 bg-[var(--card-bg)]">
        <div className="flex justify-between items-center border-b border-[var(--card-border)] pb-3 mb-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <span>🔍</span> {t.detSideBySide}
          </h3>
          <span className="text-[10px] text-slate-500 font-mono tracking-wider">COMP_VISION_INSPECTOR</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clean Uploaded Image */}
          <div className="space-y-1.5 text-left">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.detOriginal}</p>
            <div className="aspect-video bg-[var(--bg-dark)] rounded-2xl overflow-hidden border border-[var(--card-border)] flex items-center justify-center relative shadow-inner">
              {uploadedFile && (
                <img
                  src={URL.createObjectURL(uploadedFile)}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </div>

          {/* YOLO Detection Overlay */}
          <div className="space-y-1.5 text-left">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.detMarked}</p>
            <div className="aspect-video bg-[var(--bg-dark)] rounded-2xl overflow-hidden border border-[var(--card-border)] flex items-center justify-center relative shadow-2xl">
              {uploadedFile && (
                <>
                  <img
                    src={URL.createObjectURL(uploadedFile)}
                    alt="YOLOv8 target"
                    className="max-w-full max-h-full object-contain opacity-80 filter contrast-125"
                  />
                  {result.confidence > 50 && (
                    <div className="absolute inset-x-[15%] inset-y-[20%] border-2 border-dashed border-[#22C55E] rounded-2xl bg-[#22C55E]/5 flex flex-col justify-start p-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse">
                      <span className="text-[8px] font-extrabold bg-[#22C55E] text-slate-950 px-2 py-0.5 rounded-lg self-start tracking-wider font-mono">
                        {diseaseName} ({result.confidence}%)
                      </span>
                    </div>
                  )}
                  <div className="scan-line" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Detected Disease & Confidence Score (SECOND) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Disease Summary details */}
        <div className="md:col-span-2 dashboard-card p-5 bg-[var(--card-bg)] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider border ${severityStyle.text}`}>
                Severity: {result.severity}
              </span>
              
              <button
                onClick={toggleSpeech}
                className={`p-2 rounded-lg border text-xs transition duration-300 ${
                  isSpeaking
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]"
                }`}
                title={isSpeaking ? t.chatTTSStop : t.chatTTSPlay}
              >
                {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
            </div>

            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{t.detDisease}</p>
              <h2 className="text-xl font-black text-slate-100 mt-1 tracking-tight leading-tight">
                {diseaseName}
              </h2>
            </div>
            
            <div className="text-left">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{t.detCause}</p>
              <p className="text-xs font-bold text-slate-300 mt-0.5 leading-normal">
                {result.cause}
              </p>
            </div>
          </div>
        </div>

        {/* Circular vector gauge card */}
        <div className="dashboard-card p-5 bg-[var(--card-bg)] flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32" cy="32" r={radius}
                stroke="rgba(255,255,255,0.02)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="32" cy="32" r={radius}
                stroke="url(#accGrad)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#84cc16" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-200 font-mono">
              {result.confidence}%
            </div>
          </div>
          <div className="text-left space-y-0.5">
            <h4 className="text-xs font-bold text-slate-300">{t.detConfidence}</h4>
            <p className="text-[9px] text-slate-500 leading-normal">
              YOLOv8 deep neural weights inference confidence.
            </p>
          </div>
        </div>

      </div>

      {/* 3. Recommended Action Plan (THIRD) */}
      <div className="dashboard-card p-5 bg-[var(--card-bg)] space-y-4">
        
        {/* Tabs selector */}
        <div className="flex justify-between items-center border-b border-[var(--card-border)] pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <span>🩺</span> {t.detTreatment}
          </h3>
          
          <div className="flex gap-1.5 bg-[var(--bg-dark)] p-1 rounded-xl border border-[var(--card-border)]">
            <button
              onClick={() => setTreatmentTab("organic")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1.5 transition-all ${
                treatmentTab === "organic"
                  ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/15"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Leaf size={10} />
              Organic
            </button>
            <button
              onClick={() => setTreatmentTab("chemical")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1.5 transition-all ${
                treatmentTab === "chemical"
                  ? "bg-red-500/10 text-red-400 border border-red-500/15"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FlaskConical size={10} />
              Chemical
            </button>
          </div>
        </div>

        {/* Tab content panel */}
        <div className="pt-1 min-h-[60px]">
          {treatmentTab === "organic" ? (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#22C55E] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                Eco-Friendly Remedial Advice
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prune affected foliage immediately. Dispose of infected tissues far from crop fields. Spray biological Neem Seed Kernel Extract (NSKE 5%) or Neem Oil (5ml/L mixed with soap emulsifier) to disrupt fungal wall spores. Apply soil bio-agents like Trichoderma viride to target root-level path spreading.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Targeted Chemical Fungicides & Doses
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {result.treatment}
                <br />
                <span className="font-semibold text-slate-200">Advisory:</span> Spray in early mornings (6-8 AM) or late afternoons (5-7 PM) to minimize chemical phytotoxicity leaf burns. Always wear protective masks during application.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 4. Climate stats, risk, and Gemini AI explain panel (FOURTH) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Climate advisory block */}
        <div className="dashboard-card p-5 bg-[var(--card-bg)] space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide border-b border-[var(--card-border)] pb-2">Climate Risk Diagnostics</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-[var(--bg-dark)] p-3 rounded-2xl border border-[var(--card-border)] w-1/2">
                <Thermometer className="text-yellow-400" size={16} />
                <div>
                  <p className="text-[8px] text-slate-500 font-bold uppercase">{t.weaTemp}</p>
                  <p className="text-xs font-black text-slate-200">{result.temperature}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[var(--bg-dark)] p-3 rounded-2xl border border-[var(--card-border)] w-1/2">
                <Droplets className="text-[#3B82F6]" size={16} />
                <div>
                  <p className="text-[8px] text-slate-500 font-bold uppercase">{t.weaHumidity}</p>
                  <p className="text-xs font-black text-slate-200">{result.humidity}%</p>
                </div>
              </div>
            </div>
            
            {/* Risk details */}
            <div className="p-3 bg-[var(--bg-dark)] border border-[var(--card-border)] rounded-xl flex items-start gap-2">
              <AlertTriangle className={`mt-0.5 shrink-0 ${result.risk.toLowerCase() === 'high' ? 'text-red-400' : 'text-yellow-400'}`} size={14} />
              <div>
                <h5 className="text-xs font-bold text-slate-300">{t.detRisk}: {result.risk}</h5>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Atmospheric moisture indexes are calculated as {result.risk.toLowerCase() === 'high' ? 'favorable' : 'moderate'} for fungal path cell growth.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={downloadReport}
            disabled={downloading}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#22C55E] hover:bg-[#22C55E]/90 text-slate-950 flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50 shadow-md"
          >
            {downloading ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {t.detDownloadPdf}
          </button>
        </div>

        {/* AI progression triggers block */}
        <div className="dashboard-card p-5 bg-[var(--card-bg)] flex flex-col justify-between space-y-4">
          <div className="space-y-2.5 text-left h-full">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide border-b border-[var(--card-border)] pb-2">AI Diagnostic Insights</h4>
            
            {explaining ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <span className="w-5 h-5 rounded-full border-2 border-[#22C55E] border-t-transparent animate-spin" />
                <p className="text-[9px] text-slate-500 font-bold uppercase">{t.detExplaining}</p>
              </div>
            ) : explanation ? (
              <div className="text-[10px] text-slate-300 leading-relaxed overflow-y-auto max-h-[120px] scrollbar whitespace-pre-line">
                {explanation}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4">
                Click below to request detailed Gemini progression insights about this crop infection.
              </p>
            )}
          </div>

          {!explanation && !explaining && (
            <button
              onClick={getAIExplanation}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs border border-[var(--card-border)] bg-[var(--bg-dark)] hover:bg-slate-900 text-slate-300 flex items-center justify-center gap-2 transition duration-300"
            >
              <FileText size={14} />
              {t.detExplainBtn}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}