import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Globe, Shield, Cloud, Save, User } from "lucide-react";
import { translations } from "../locales/translations";
import Footer from "../components/Footer";

export default function Settings() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  
  // Settings configurations
  const [farmerName, setFarmerName] = useState(localStorage.getItem("agri_farmer_name") || "Admin Farmer");
  const [yoloThreshold, setYoloThreshold] = useState(localStorage.getItem("agri_yolo_threshold") || "0.5");
  const [weatherKey, setWeatherKey] = useState(localStorage.getItem("agri_weather_key") || "");

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const handleLanguageChange = (newLang) => {
    localStorage.setItem("agri_lang", newLang);
    window.dispatchEvent(new Event("langChange"));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem("agri_farmer_name", farmerName);
    localStorage.setItem("agri_yolo_threshold", yoloThreshold);
    localStorage.setItem("agri_weather_key", weatherKey);
    alert("System configurations updated successfully.");
  };

  return (
    <div className="space-y-8 text-left min-h-screen flex flex-col pt-12 md:pt-0">
      
      {/* Header Panel */}
      <div className="border-b border-[var(--card-border)] pb-5">
        <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight leading-tight flex items-center gap-2.5">
          <SettingsIcon size={28} className="text-[#22C55E]" />
          Platform Settings & Configurations
        </h2>
        <p className="text-slate-400 text-sm">
          Optimize YOLOv8 path thresholds, configure weather connections, and save regional language details.
        </p>
      </div>

      {/* Settings Grid form */}
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        
        {/* Left 2 Cols: Form options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General profile info */}
          <div className="dashboard-card p-5 bg-[var(--card-bg)] space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2 border-b border-[var(--card-border)] pb-3">
              <User size={14} className="text-[#22C55E]" />
              Farmer / Admin Profile
            </h3>
            
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Farmer Name / Farm ID</label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full bg-[var(--bg-dark)] border border-[var(--card-border)] rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-[#22C55E] transition font-bold"
              />
            </div>
          </div>

          {/* Localization options */}
          <div className="dashboard-card p-5 bg-[var(--card-bg)] space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2 border-b border-[var(--card-border)] pb-3">
              <Globe size={14} className="text-[#3B82F6]" />
              System Language Preference
            </h3>
            
            <div className="space-y-3">
              <p className="text-[10px] text-slate-500 leading-normal">
                Choose the primary language dialect for UI texts, suggested prompt bubbles, and AI voice consultations.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { code: "en", label: "English" },
                  { code: "te", label: "తెలుగు (Telugu)" },
                  { code: "hi", label: "हिन्दी (Hindi)" }
                ].map((language) => (
                  <button
                    type="button"
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                      lang === language.code
                        ? "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E] shadow-inner"
                        : "bg-[var(--bg-dark)] border border-[var(--card-border)] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* YOLO diagnostic threshold */}
          <div className="dashboard-card p-5 bg-[var(--card-bg)] space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2 border-b border-[var(--card-border)] pb-3">
              <SidIcon size={14} className="text-[#A855F7]" />
              YOLOv8 Inference Threshold
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Detection Cutoff Ratio</span>
                <span className="font-bold text-[#A855F7] font-mono">{yoloThreshold}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.95"
                step="0.05"
                value={yoloThreshold}
                onChange={(e) => setYoloThreshold(e.target.value)}
                className="w-full h-1 bg-[var(--bg-dark)] rounded-lg appearance-none cursor-pointer accent-[#A855F7]"
              />
              <p className="text-[10px] text-slate-500 leading-normal">
                Adjusting this ratio changes YOLOv8 diagnostic filters. Lower thresholds capture moderate/minor infections but increase false positives.
              </p>
            </div>
          </div>

          {/* Weather API configuration */}
          <div className="dashboard-card p-5 bg-[var(--card-bg)] space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2 border-b border-[var(--card-border)] pb-3">
              <Cloud size={14} className="text-[#FACC15]" />
              OpenWeather API Integrator
            </h3>
            <div className="space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">OpenWeather Map Key</label>
                <input
                  type="password"
                  value={weatherKey}
                  onChange={(e) => setWeatherKey(e.target.value)}
                  placeholder="Enter your OpenWeather Map Key..."
                  className="w-full bg-[var(--bg-dark)] border border-[var(--card-border)] rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-[#22C55E] transition"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                If left blank, Ish AI Doctor serves regional climate forecaster simulations safely without key errors.
              </p>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Save Trigger block */}
        <div className="space-y-6">
          <div className="dashboard-card p-5 bg-[var(--card-bg)] text-left space-y-5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-[var(--card-border)] pb-3">System Actions</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Click save to write changes into the configuration caches. System settings take effect instantly without restarting page viewports.
            </p>
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#22C55E] hover:bg-[#22C55E]/90 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.25)] transition duration-300"
            >
              <Save size={14} />
              Save Configurations
            </button>
          </div>
        </div>

      </form>

      <Footer />
    </div>
  );
}

// Custom Icon helper for sidebar settings matching
function SidIcon({ size, className }) {
  return <Shield size={size} className={className} />;
}
