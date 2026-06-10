import { useState, useEffect } from "react";
import { 
  Scan, 
  Bot, 
  CloudSun, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  History,
  FileSpreadsheet,
  Zap,
  TrendingUp
} from "lucide-react";
import StatCard from "../components/StatCard";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";
import { translations } from "../locales/translations";
import API from "../services/api";

// Import the generated smart agricultural backdrop image
import dashboardBg from "../assets/agri_dashboard_bg.png";

export default function Dashboard() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [history, setHistory] = useState([]);
  
  // Stats configurations
  const [totalScans, setTotalScans] = useState(0);
  const [successDetections, setSuccessDetections] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [lastAnalysis, setLastAnalysis] = useState("No Scans");

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const loadStats = async () => {
    try {
      const res = await API.get("/history");
      const list = res.data || [];
      setHistory(list);
      
      setTotalScans(list.length);
      const successful = list.filter(item => item.confidence > 50).length;
      setSuccessDetections(successful);
      
      const sumConf = list.reduce((sum, item) => sum + (parseFloat(item.confidence) || 0), 0);
      setAvgConfidence(list.length > 0 ? Math.round(sumConf / list.length) : 0);
      
      if (list.length > 0) {
        const last = list[list.length - 1];
        setLastAnalysis(last.disease.replace(/___/g, " - ").replace(/_/g, " "));
      }
    } catch (err) {
      console.warn("API offline, using mock stats for dashboard visualizers:", err);
      setTotalScans(6);
      setSuccessDetections(6);
      setAvgConfidence(93);
      setLastAnalysis("Tomato - Early blight");
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const capabilities = [
    {
      title: "Disease Detection",
      description: "Upload leaf photographs to execute computer vision diagnostic scanning.",
      icon: Scan,
      link: "/detect"
    },
    {
      title: "AI Recommendations",
      description: "Ask the context-aware chatbot for organic treatments, prevention guidelines, and spray advice.",
      icon: Bot,
      link: "/chat"
    },
    {
      title: "Weather Intelligence",
      description: "Assess temperature thresholds, rainfall indicators, and fungal risk alarms.",
      icon: CloudSun,
      link: "/weather"
    },
    {
      title: "Real-Time Analysis",
      description: "Inspect close-up leaf pathology symptoms side-by-side with bounding diagnostic targets.",
      icon: Zap,
      link: "/detect"
    },
    {
      title: "PDF Reporting",
      description: "Export structured summaries including severity, weather risk, and agro-advisories.",
      icon: FileSpreadsheet,
      link: "/reports"
    },
    {
      title: "Prediction History",
      description: "Review previous pathology diagnoses and treatment advice to track disease occurrences.",
      icon: History,
      link: "/reports"
    }
  ];

  return (
    <div className="space-y-8 text-left min-h-screen flex flex-col pt-12 md:pt-0">
      
      {/* Premium Dashboard Welcome Hero Card (With generated Background Image) */}
      <div 
        className="w-full rounded-3xl relative overflow-hidden h-44 sm:h-52 bg-cover bg-center border border-[var(--card-border)] shadow-xl flex items-center p-6 sm:p-8"
        style={{ backgroundImage: `url(${dashboardBg})` }}
      >
        {/* Soft emerald overlay for agricultural branding */}
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] z-0" />
        
        <div className="relative z-10 space-y-2 max-w-xl text-left">
          <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 text-[9px] font-bold uppercase tracking-wider">
            Smart Agro SaaS Platform
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Welcome to {t.title} Dashboard
          </h2>
          <p className="text-slate-200 text-xs leading-relaxed filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Real-time crop path diagnostics powered by YOLOv8 deep vision weights and context-aware Gemini agronomy models.
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Scans"
          value={totalScans}
          icon={Scan}
          color="blue"
          change="All-time"
        />
        <StatCard
          title="Successful Detections"
          value={successDetections}
          icon={ShieldCheck}
          color="green"
          change="Confidence >50%"
        />
        <StatCard
          title="Average Confidence"
          value={`${avgConfidence}%`}
          icon={CheckCircle2}
          color="purple"
          change="YOLOv8 target accuracy"
        />
        <StatCard
          title="Last Analysis"
          value={lastAnalysis}
          icon={AlertTriangle}
          color="yellow"
          change="Latest result"
        />
      </div>

      {/* Capability Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Platform Capabilities & Diagnostic Routines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, idx) => (
            <FeatureCard
              key={idx}
              title={cap.title}
              description={cap.description}
              icon={cap.icon}
              link={cap.link}
            />
          ))}
        </div>
      </div>

      {/* Quick Tips Footer Banner */}
      <div className="dashboard-card p-5 bg-[var(--card-bg)] border-l-4 border-[#22C55E] relative overflow-hidden flex gap-4 items-start">
        <div className="p-2.5 bg-[#22C55E]/10 rounded-xl text-[#22C55E] border border-[#22C55E]/20 shrink-0">
          <Bot size={18} />
        </div>
        <div className="space-y-1 text-left">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp size={12} className="text-[#22C55E]" />
            AI Farming Advisory Tip
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-3xl">
            High humidity levels above 75% paired with moderate heat create favorable conditions for Alternaria early blight and Phytophthora late blight pathogens. Spray organic protectants early.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
