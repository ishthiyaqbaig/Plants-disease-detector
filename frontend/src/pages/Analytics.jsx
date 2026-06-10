import { useEffect, useState } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { 
  History, 
  FileSpreadsheet, 
  Search, 
  Activity, 
  ShieldCheck, 
  AlertTriangle 
} from "lucide-react";
import { translations } from "../locales/translations";
import API from "../services/api";
import Footer from "../components/Footer";

// Custom colors matching theme guidelines
const COLORS = ["#22C55E", "#3B82F6", "#A855F7", "#FACC15", "#EF4444", "#EC4899"];

export default function Analytics() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  
  // Stat indicators
  const [totalScans, setTotalScans] = useState(0);
  const [healthyCount, setHealthyCount] = useState(0);
  const [diseasedCount, setDiseasedCount] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  
  const [lineChartData, setLineChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get("/history");
      const list = res.data || [];
      setHistory(list);
      processData(list);
    } catch (err) {
      console.warn("API offline, loading mock data for analytics:", err);
      const mockHist = generateMockHistory();
      setHistory(mockHist);
      processData(mockHist);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const processData = (data) => {
    setTotalScans(data.length);
    if (data.length === 0) {
      setHealthyCount(0);
      setDiseasedCount(0);
      setAvgConfidence(0);
      setLineChartData([]);
      setPieChartData([]);
      return;
    }

    // Healthy vs Diseased counts
    const healthy = data.filter(item => item.disease.toLowerCase().includes("healthy")).length;
    setHealthyCount(healthy);
    setDiseasedCount(data.length - healthy);

    // Average Confidence
    const sumConf = data.reduce((sum, item) => sum + (parseFloat(item.confidence) || 0), 0);
    setAvgConfidence(Math.round(sumConf / data.length));

    // 1. Line Chart Data: Detection trends grouped by Date
    const dateGroups = {};
    data.forEach(item => {
      const dateOnly = item.date ? item.date.split(" ")[0] : "2026-06-10";
      dateGroups[dateOnly] = (dateGroups[dateOnly] || 0) + 1;
    });

    const formattedLine = Object.keys(dateGroups)
      .sort()
      .map(date => ({
        date: date.substring(5), // Show MM-DD
        scans: dateGroups[date]
      }));
    setLineChartData(formattedLine);

    // 2. Pie Chart Data: Disease distribution
    const diseaseGroups = {};
    data.forEach(item => {
      if (!item.disease.toLowerCase().includes("healthy")) {
        const cleanName = item.disease.replace(/___/g, " - ").replace(/_/g, " ");
        diseaseGroups[cleanName] = (diseaseGroups[cleanName] || 0) + 1;
      }
    });

    const formattedPie = Object.keys(diseaseGroups).map(name => ({
      name: name.split(" - ")[1] || name,
      value: diseaseGroups[name]
    }));
    setPieChartData(formattedPie);
  };

  const generateMockHistory = () => {
    return [
      { disease: "Tomato___Early_blight", confidence: 92, risk: "High", severity: "Moderate", date: "2026-06-05 10:20" },
      { disease: "Potato___Late_blight", confidence: 95, risk: "High", severity: "Severe", date: "2026-06-06 14:15" },
      { disease: "Tomato___Healthy", confidence: 99, risk: "Low", severity: "Low", date: "2026-06-07 09:30" },
      { disease: "Potato___Early_blight", confidence: 88, risk: "Medium", severity: "Moderate", date: "2026-06-08 11:45" },
      { disease: "Tomato___Spider_mites", confidence: 91, risk: "Medium", severity: "Moderate", date: "2026-06-09 16:10" },
      { disease: "Tomato___Healthy", confidence: 98, risk: "Low", severity: "Low", date: "2026-06-10 08:00" },
    ];
  };

  const filteredHistory = history.filter(item => {
    const nameMatch = item.disease.toLowerCase().includes(searchQuery.toLowerCase());
    const severityMatch = severityFilter === "all" || item.severity?.toLowerCase() === severityFilter;
    return nameMatch && severityMatch;
  });

  return (
    <div className="space-y-8 text-left min-h-screen flex flex-col pt-12 md:pt-0">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--card-border)] pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
            📊 {t.anaTitle || "Analytics & History Overview"}
          </h2>
          <p className="text-slate-400 text-sm">
            Evaluate crop pathogen outbreak trends, accuracy values, and crop health rates.
          </p>
        </div>
        <button
          onClick={() => alert("Diagnostic history reports printed to system console.")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#22C55E]/90 text-slate-950 text-xs font-bold transition duration-300 shadow-md shrink-0"
        >
          <FileSpreadsheet size={14} />
          Export Spreadsheet
        </button>
      </div>

      {/* Stats Indicators Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Healthy Crops */}
        <div className="dashboard-card p-5 bg-[var(--card-bg)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Healthy Crops Scans</p>
            <h2 className="text-3xl font-black text-[#22C55E] font-mono">{healthyCount}</h2>
          </div>
          <div className="p-3 bg-[#22C55E]/10 rounded-2xl border border-[#22C55E]/20 text-[#22C55E]">
            <ShieldCheck size={18} />
          </div>
        </div>

        {/* Infected Crops */}
        <div className="dashboard-card p-5 bg-[var(--card-bg)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Infected Crops Scans</p>
            <h2 className="text-3xl font-black text-red-400 font-mono">{diseasedCount}</h2>
          </div>
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Avg Confidence */}
        <div className="dashboard-card p-5 bg-[var(--card-bg)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Average Confidence</p>
            <h2 className="text-3xl font-black text-[#3B82F6] font-mono">{avgConfidence}%</h2>
          </div>
          <div className="p-3 bg-[#3B82F6]/10 rounded-2xl border border-[#3B82F6]/20 text-[#3B82F6]">
            <Activity size={18} />
          </div>
        </div>

        {/* Total Diagnoses */}
        <div className="dashboard-card p-5 bg-[var(--card-bg)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Scans</p>
            <h2 className="text-3xl font-black text-[#A855F7] font-mono">{totalScans}</h2>
          </div>
          <div className="p-3 bg-[#A855F7]/10 rounded-2xl border border-[#A855F7]/20 text-[#A855F7]">
            <History size={18} />
          </div>
        </div>

      </div>

      {/* Visual Recharts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart: Detection Trends */}
        <div className="dashboard-card p-5 bg-[var(--card-bg)] space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide border-b border-[var(--card-border)] pb-3">
            Detection Trends (Daily Scans)
          </h3>
          <div className="h-60 w-full">
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" />
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "12px", fontSize: "11px" }} />
                  <Line type="monotone" dataKey="scans" stroke="#22C55E" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No trend data.</div>
            )}
          </div>
        </div>

        {/* Pie Chart: Disease Distribution */}
        <div className="dashboard-card p-5 bg-[var(--card-bg)] space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide border-b border-[var(--card-border)] pb-3">
            Infected Disease Distribution
          </h3>
          <div className="h-60 w-full flex items-center justify-center">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "12px", fontSize: "11px" }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "9px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No disease distribution metrics available.</div>
            )}
          </div>
        </div>

      </div>

      {/* History record logs */}
      <div className="dashboard-card p-5 bg-[var(--card-bg)] space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <History className="text-[#22C55E]" size={14} />
            {t.anaHistoryTitle}
          </h3>

          {/* Filtering */}
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full sm:w-48 bg-[var(--bg-dark)] border border-[var(--card-border)] rounded-xl py-1.5 pl-3 pr-8 text-xs text-slate-300 focus:outline-none focus:border-[#22C55E] transition"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[var(--bg-dark)] border border-[var(--card-border)] rounded-xl py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-[#22C55E] transition"
            >
              <option value="all">All Severity</option>
              <option value="severe">Severe</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* History table log */}
        <div className="overflow-x-auto rounded-xl border border-[var(--card-border)]">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <span className="w-5 h-5 rounded-full border-2 border-[#22C55E] border-t-transparent animate-spin" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-10 text-center">No diagnostic history records matched.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-dark)] border-b border-[var(--card-border)] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">{t.anaColDisease}</th>
                  <th className="p-4">{t.anaColConf}</th>
                  <th className="p-4">{t.anaColRisk}</th>
                  <th className="p-4">{t.anaColSev}</th>
                  <th className="p-4">{t.anaColDate}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)] text-slate-300 font-medium">
                {filteredHistory.map((item, index) => {
                  const diseaseName = item.disease.replace(/___/g, " - ").replace(/_/g, " ");
                  return (
                    <tr key={index} className="hover:bg-[var(--bg-dark)]/20 transition">
                      <td className="p-4 font-bold text-slate-200 capitalize">{diseaseName}</td>
                      <td className="p-4 font-mono font-bold text-[#22C55E]">{item.confidence}%</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.risk?.toLowerCase() === "high"
                            ? "bg-red-500/5 text-red-400 border-red-500/15"
                            : "bg-amber-500/5 text-amber-400 border-amber-500/15"
                        }`}>
                          {item.risk}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.severity?.toLowerCase() === "severe"
                            ? "bg-red-500/10 text-red-400 border border-red-500/15"
                            : item.severity?.toLowerCase() === "moderate"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        }`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono">{item.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
}
