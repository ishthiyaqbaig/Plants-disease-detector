import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Scan, 
  MessageSquare, 
  CloudSun, 
  BarChart3, 
  FileDown, 
  Settings, 
  ChevronLeft, 
  Menu,
  X
} from "lucide-react";
import { translations } from "../locales/translations";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;
  const isActive = (path) => location.pathname === path;

  // Sidebar link items (including reports and settings)
  const menuItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/detect", label: t.navDetection || "Disease Detection", icon: Scan },
    { path: "/chat", label: t.navChat || "AI Chat Bot", icon: MessageSquare },
    { path: "/weather", label: t.navWeatherTitle?.split(" & ")[0] || "Weather Advisory", icon: CloudSun },
    { path: "/analytics", label: t.navAnalytics || "Analytics", icon: BarChart3 },
    { path: "/reports", label: "Reports", icon: FileDown },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Trigger (Floating hamburger top-left) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-[#111827] border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-lg"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Panel Container */}
      <aside 
        className={`bg-[#111827]/95 border-r border-slate-800/80 backdrop-blur-2xl flex flex-col justify-between h-screen transition-all duration-300 z-45 shrink-0 ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen 
            ? "fixed inset-y-0 left-0 w-64 translate-x-0" 
            : "hidden md:flex relative translate-x-0"
        }`}
      >
        <div className="space-y-6 pt-5 flex flex-col h-full overflow-hidden">
          
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
              <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(34,197,94,0.35)] shrink-0">🌱</span>
              {!collapsed && (
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent truncate">
                  Ish AI Doctor
                </span>
              )}
            </Link>

            {/* Collapse toggle button on desktop */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg border border-slate-800 bg-[#0B1120] text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-all shrink-0"
            >
              <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Navigation Links Grid */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs font-bold transition-all group ${
                    active
                      ? "bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 border border-emerald-500/15"
                      : "text-slate-400 border border-transparent hover:bg-slate-900/60 hover:text-slate-200"
                  }`}
                >
                  <Icon size={18} className={active ? "text-emerald-400 shrink-0" : "text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0"} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>

        </div>
      </aside>

      {/* Backdrop cover overlay on mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="md:hidden fixed inset-0 z-35 bg-black/60 backdrop-blur-sm"
        />
      )}
    </>
  );
}
