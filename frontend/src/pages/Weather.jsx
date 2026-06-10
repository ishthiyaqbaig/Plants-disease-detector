import { useState, useEffect } from "react";
import { CloudSun, Droplets, Thermometer, Wind, AlertCircle } from "lucide-react";
import WeatherCard from "../components/WeatherCard";
import Footer from "../components/Footer";
import { translations } from "../locales/translations";
import API from "../services/api";

export default function Weather() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [city, setCity] = useState("Hyderabad");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const fetchWeatherData = async (targetCity) => {
    setLoading(true);
    try {
      const res = await API.get(`/weather?city=${targetCity}`);
      setWeatherData(res.data);
    } catch (err) {
      console.error("Failed to load weather:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, [city]);

  // Regional shortcut capsules
  const regionShortcuts = [
    { name: "Hyderabad", district: "Telangana" },
    { name: "Guntur", district: "Andhra Pradesh" },
    { name: "Medak", district: "Telangana" },
    { name: "Bhatinda", district: "Punjab" }
  ];

  return (
    <div className="space-y-8 text-left min-h-screen flex flex-col pt-12 md:pt-0">
      
      {/* Header Panel */}
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
          🌦️ Weather Advisory & Crop stress
        </h2>
        <p className="text-slate-400 text-sm">
          Track real-time microclimate indicators, rain probabilities, and pathogen warnings to schedule crop sprayings.
        </p>
      </div>

      {/* Regional shortcuts selector */}
      <div className="space-y-3">
        <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Quick Regional District Monitoring Shortcuts
        </h4>
        <div className="flex flex-wrap gap-3">
          {regionShortcuts.map((region) => (
            <button
              key={region.name}
              onClick={() => setCity(region.name)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                city === region.name
                  ? "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]"
                  : "bg-[var(--card-bg)] border-[var(--card-border)] text-slate-400 hover:text-[var(--text-primary)] hover:border-[var(--card-border-glow)]"
              }`}
            >
              {region.name} ({region.district})
            </button>
          ))}
        </div>
      </div>

      {/* Core weather card container */}
      <WeatherCard
        weatherData={weatherData}
        loading={loading}
        t={t}
        onCitySearch={(newCity) => setCity(newCity)}
      />

      {/* Weather Safety Notes */}
      <div className="dashboard-card p-5 bg-[var(--card-bg)] border-l-4 border-[#3B82F6] flex gap-4 items-start">
        <div className="p-2.5 bg-[#3B82F6]/10 rounded-xl text-[#3B82F6] border border-[#3B82F6]/20 shrink-0">
          <AlertCircle size={18} />
        </div>
        <div className="space-y-0.5 text-left">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Fungal Infection Risk Safety Note</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Spores of phytophthora and alternaria multiply when temperatures range between 20°C and 30°C accompanied by relative air humidity exceeding 80%. When such events occur, limit overhead watering and apply protective fungicides.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
