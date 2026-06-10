import { useState, useEffect } from "react";
import { FileDown, Search, History, Download, Calendar, Activity } from "lucide-react";
import { translations } from "../locales/translations";
import API from "../services/api";
import Footer from "../components/Footer";

export default function Reports() {
  const [lang, setLang] = useState(localStorage.getItem("agri_lang") || "en");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  useEffect(() => {
    const handleLangUpdate = () => {
      setLang(localStorage.getItem("agri_lang") || "en");
    };
    window.addEventListener("langChange", handleLangUpdate);
    return () => window.removeEventListener("langChange", handleLangUpdate);
  }, []);

  const t = translations[lang] || translations.en;

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get("/history");
      const list = res.data || [];
      setHistory(list.reverse());
    } catch (err) {
      console.warn("API offline, loading mock history for reports panel:", err);
      setHistory(generateMockHistory());
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const generateMockHistory = () => {
    return [
      { disease: "Tomato___Early_blight", confidence: 92, risk: "High", severity: "Moderate", date: "2026-06-05 10:20" },
      { disease: "Potato___Late_blight", confidence: 95, risk: "High", severity: "Severe", date: "2026-06-06 14:15" },
      { disease: "Tomato___Healthy", confidence: 99, risk: "Low", severity: "Low", date: "2026-06-07 09:30" }
    ];
  };

  // Download a single PDF report dynamically
  const downloadReport = async (item, idx) => {
    setDownloadingReportId(idx);
    try {
      const diseaseName = item.disease.replace(/___/g, " - ").replace(/_/g, " ");
      const payload = {
        disease: diseaseName,
        confidence: `${item.confidence}%`,
        cause: "Pathological spore activity recorded in diagnostics history.",
        treatment: "Refer to agronomic guidelines.",
        severity: item.severity || "Moderate",
        risk: item.risk || "Medium",
        temperature: "29°C",
        humidity: "75%",
        irrigation: "Standard irrigation recommendations."
      };

      const res = await API.post("/download-report", payload, {
        responseType: "blob"
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Ish_AI_Doctor_Report_${item.disease}_${idx}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      alert("Failed to download PDF report. Server API offline.");
    }
    setDownloadingReportId(null);
  };

  // Export diagnostic logs to CSV spreadsheet format
  const exportCSV = () => {
    if (history.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Session ID,Disease Detected,Confidence Score,Risk Level,Severity,Date\n";
    
    history.forEach((item, index) => {
      const row = `${index + 1},"${item.disease.replace(/___/g, " - ").replace(/_/g, " ") || "N/A"}",${item.confidence || 0}%,${item.risk || "Medium"},${item.severity || "Moderate"},${item.date || "N/A"}`;
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ish_AI_Doctor_Diagnostic_Spreadsheet_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = history.filter(item => {
    const diseaseName = item.disease.replace(/___/g, " - ").replace(/_/g, " ");
    return diseaseName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 text-left min-h-screen flex flex-col pt-12 md:pt-0">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--card-border)] pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
            📂 Reports & Diagnostic Logs
          </h2>
          <p className="text-slate-400 text-sm">
            Generate, preview, and export dynamic PDF pathology report sheets or download full CSV spreadsheets.
          </p>
        </div>
        
        <button
          onClick={exportCSV}
          disabled={history.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#22C55E]/90 text-slate-950 text-xs font-bold transition duration-300 shadow-md shrink-0 disabled:opacity-40"
        >
          <FileDown size={14} />
          Export CSV Log
        </button>
      </div>

      {/* Main Grid list */}
      <div className="dashboard-card p-5 bg-[var(--card-bg)] space-y-4">
        
        {/* Search filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <History className="text-[#22C55E]" size={14} />
            Diagnostic Session Log List
          </h3>

          <div className="relative w-full sm:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop disease..."
              className="w-full bg-[var(--bg-dark)] border border-[var(--card-border)] rounded-xl py-1.5 pl-3.5 pr-8 text-xs text-slate-300 focus:outline-none focus:border-[#22C55E] transition"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--card-border)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="w-5 h-5 rounded-full border-2 border-[#22C55E] border-t-transparent animate-spin" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-12 text-center">No diagnostic sessions found.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-dark)] border-b border-[var(--card-border)] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Session ID</th>
                  <th className="p-4">Disease Classification</th>
                  <th className="p-4">YOLOv8 Accuracy</th>
                  <th className="p-4">Severity / Risk</th>
                  <th className="p-4">Session Timestamp</th>
                  <th className="p-4 text-center">Action Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)] text-slate-300 font-medium">
                {filteredHistory.map((item, index) => {
                  const diseaseDisplay = item.disease.replace(/___/g, " - ").replace(/_/g, " ");
                  return (
                    <tr key={index} className="hover:bg-[var(--bg-dark)]/20 transition">
                      <td className="p-4 font-mono text-slate-500 font-bold">#AID-{index + 101}</td>
                      <td className="p-4 font-bold text-slate-200 capitalize">{diseaseDisplay}</td>
                      <td className="p-4 font-mono font-bold text-[#22C55E]">{item.confidence}%</td>
                      <td className="p-4 flex gap-1.5 items-center">
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-[var(--bg-dark)] border border-[var(--card-border)] text-slate-400">
                          {item.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-[var(--bg-dark)] border border-[var(--card-border)] text-slate-400">
                          {item.risk}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-500">{item.date || "Date N/A"}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => downloadReport(item, index)}
                          disabled={downloadingReportId === index}
                          className="p-1.5 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E] hover:text-slate-950 transition flex items-center gap-1 mx-auto text-[10px] font-bold uppercase"
                        >
                          {downloadingReportId === index ? (
                            <span className="w-3 h-3 rounded-full border border-slate-950 border-t-transparent animate-spin" />
                          ) : (
                            <Download size={10} />
                          )}
                          PDF
                        </button>
                      </td>
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
