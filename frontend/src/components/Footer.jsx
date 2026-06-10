import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { translations } from "../locales/translations";

export default function Footer() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  return (
    <footer className="w-full bg-[var(--card-bg)]/70 border-t border-[var(--card-border)] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🌱</span>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
                {t.title}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {t.footDesc}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400 tracking-wider uppercase">
              {t.navHome}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  {t.navHome}
                </Link>
              </li>
              <li>
                <Link to="/detect" className="hover:text-emerald-400 transition-colors">
                  {t.navDetection}
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-emerald-400 transition-colors">
                  {t.navChat}
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-emerald-400 transition-colors">
                  {t.navAnalytics || "Analytics"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Status & Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400 tracking-wider uppercase">
              System Indicators
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs text-slate-300">YOLOv8 Diagnosis Engine: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs text-slate-300">Gemini Advisory Bot: Active</span>
              </div>
              <p className="text-xs text-slate-500">
                Support: contact@ish-agri.ai
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-[var(--card-border)] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {t.title}. {t.footRights}
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
