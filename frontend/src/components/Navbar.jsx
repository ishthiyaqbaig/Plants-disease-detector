import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Globe, ChevronDown, User } from "lucide-react";
import { translations } from "../locales/translations";

export default function Navbar() {
  const location = useLocation();
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    
    // Force document out of light mode
    document.documentElement.classList.remove("light");

    window.addEventListener("langChange", handleLangUpdate);
    return () => {
      window.removeEventListener("langChange", handleLangUpdate);
    };
  }, []);

  const changeLanguage = (newLang) => {
    localStorage.setItem("agri_lang", newLang);
    window.dispatchEvent(new Event("langChange"));
    setDropdownOpen(false);
  };

  const t = translations[lang] || translations.en;

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/detect":
        return t.navDetection || "Disease Detection";
      case "/chat":
        return t.navChat || "AI Chat Bot";
      case "/weather":
        return "Weather Intelligence";
      case "/analytics":
        return t.navAnalytics || "Analytics Dashboard";
      case "/reports":
        return "Reports & Spreadsheet Logs";
      case "/settings":
        return "System Settings";
      default:
        return "Agriculture Intelligence Dashboard";
    }
  };

  return (
    <header className="h-20 w-full bg-[var(--card-bg)]/40 border-b border-[var(--card-border)] backdrop-blur-xl px-6 sm:px-8 flex justify-between items-center z-30 shrink-0">
      
      {/* Page Title */}
      <div className="text-left pl-10 md:pl-0">
        <h1 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] tracking-wide uppercase">
          {getPageTitle()}
        </h1>
        <p className="text-[9px] text-[var(--text-muted)] font-bold tracking-wider uppercase mt-0.5 hidden sm:block">
          Ish AI Doctor Platform &bull; v2.0
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        


        {/* Language selector dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-bold text-[var(--text-secondary)] hover:text-emerald-400 hover:border-emerald-500/30 transition duration-300"
          >
            <Globe size={14} className="text-[#22C55E]" />
            <span className="uppercase font-mono">{lang}</span>
            <ChevronDown size={12} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl p-1.5 z-50 backdrop-blur-2xl">
              {[
                { code: "en", label: "English" },
                { code: "te", label: "తెలుగు" },
                { code: "hi", label: "हिन्दी" }
              ].map((language) => (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    lang === language.code
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-[var(--bg-dark)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {language.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] p-1.5 pr-3.5 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold shadow-inner">
            <User size={16} />
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-[9px] font-bold text-[var(--text-primary)]">Admin Farmer</p>
            <p className="text-[8px] text-emerald-400 font-semibold uppercase tracking-wider">YOLOv8 Online</p>
          </div>
        </div>

      </div>

    </header>
  );
}