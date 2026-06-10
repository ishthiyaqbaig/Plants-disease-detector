import { useState, useEffect } from "react";
import { Scan, ShieldAlert, History, Activity } from "lucide-react";
import API from "../services/api";
import UploadCard from "../components/UploadCard";
import ResultCard from "../components/ResultCard";
import WeatherCard from "../components/WeatherCard";
import Footer from "../components/Footer";
import { translations } from "../locales/translations";

export default function Detection() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Weather state (for local advisory below results)
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const loadHistory = async () => {
    try {
      const res = await API.get("/history");
      if (Array.isArray(res.data)) {
        setHistory(res.data.reverse());
      }
    } catch (err) {
      console.warn("API offline, using mock history log:", err);
      setHistory(generateMockHistory());
    }
  };

  const loadWeatherData = async (city = "Hyderabad") => {
    setWeatherLoading(true);
    try {
      const res = await API.get(`/weather?city=${city}`);
      setWeatherData(res.data);
    } catch (err) {
      console.error("Failed to load weather stats:", err);
    }
    setWeatherLoading(false);
  };

  useEffect(() => {
    loadHistory();
    loadWeatherData();
  }, [result]);

  const generateMockHistory = () => {
    return [
      { disease: "Tomato___Early_blight", confidence: 92, risk: "High", severity: "Moderate", date: "2026-06-05 10:20" },
      { disease: "Potato___Late_blight", confidence: 95, risk: "High", severity: "Severe", date: "2026-06-06 14:15" },
      { disease: "Tomato___Healthy", confidence: 99, risk: "Low", severity: "Low", date: "2026-06-07 09:30" }
    ];
  };

  const uploadImage = async () => {
    if (!file) {
      alert("Please select or drag a leaf photograph first.");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await API.post("/predict", formData);
      setResult(response.data);
    } catch (err) {
      alert(err.response?.data?.detail || "YOLOv8 target scan failed. Please check server.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 text-left min-h-screen flex flex-col pt-12 md:pt-0">
      
      {/* Header Panel */}
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
          🌱 {t.detTitle}
        </h2>
        <p className="text-slate-400 text-sm">
          Execute YOLOv8 computer vision classification weights against plant leaves to identify disease occurrences.
        </p>
      </div>

      {/* Main Grid: Workbench vs History log */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left 3 Columns: Upload Card & Results */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Upload card */}
          <UploadCard file={file} setFile={setFile} loading={loading} />

          {/* Trigger button */}
          {file && !result && (
            <div className="text-center pt-2">
              <button
                onClick={uploadImage}
                disabled={loading}
                className="glow-btn bg-[#22C55E] hover:bg-[#22C55E]/90 text-slate-950 font-bold px-8 py-3.5 rounded-2xl shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-2 mx-auto justify-center disabled:opacity-50 text-xs uppercase tracking-wider"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                ) : (
                  <Scan size={14} />
                )}
                {loading ? t.detAnalyzing : t.detAnalyzeBtn}
              </button>
            </div>
          )}

          {/* ResultsCard panel */}
          {result && (
            <ResultCard result={result} uploadedFile={file} />
          )}

          {/* Weather Advisory Card */}
          {weatherData && (
            <WeatherCard
              weatherData={weatherData}
              loading={weatherLoading}
              t={t}
              onCitySearch={(city) => loadWeatherData(city)}
            />
          )}

        </div>

        {/* Right 1 Column: History log list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="dashboard-card p-5 bg-[var(--card-bg)] text-left space-y-4">
            
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 border-b border-[var(--card-border)] pb-3 uppercase tracking-wide">
              <History className="text-[#22C55E]" size={16} />
              {t.detHistoryTitle || "Recent Analysis Records"}
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No recent diagnostic records found.</p>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 scrollbar">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setResult({
                        disease: item.disease,
                        confidence: item.confidence,
                        cause: "Fungal pathogens or insect vectors identified in past prediction.",
                        treatment: "Refer to treatment plans.",
                        temperature: 30,
                        humidity: item.risk === 'High' ? 82 : item.risk === 'Medium' ? 66 : 48,
                        risk: item.risk || "Medium",
                        severity: item.severity || "Moderate"
                      });
                      setFile(null);
                    }}
                    className="p-3.5 rounded-2xl bg-[var(--bg-dark)]/40 border border-[var(--card-border)] hover:border-[#22C55E]/20 cursor-pointer transition flex justify-between items-start group"
                  >
                    <div className="space-y-1 text-left max-w-[70%]">
                      <h4 className="text-xs font-bold text-slate-300 group-hover:text-[#22C55E] transition-colors truncate">
                        {item.disease.replace(/___/g, " - ").replace(/_/g, " ")}
                      </h4>
                      <p className="text-[9px] text-slate-500 font-bold font-mono">
                        {item.date?.split(" ")[0] || "Date N/A"}
                      </p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-[11px] font-black text-[#22C55E] font-mono">{item.confidence}%</span>
                      <p className="text-[8px] text-slate-500 font-bold uppercase">{item.severity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}