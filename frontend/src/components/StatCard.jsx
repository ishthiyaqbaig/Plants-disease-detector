import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, color, change }) {
  
  // Custom colors matching theme guidelines
  const getColorClasses = (colorName) => {
    switch (colorName) {
      case "green":
        return {
          border: "hover:border-[#22C55E]/30",
          iconBg: "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]",
          shadow: "shadow-[#22C55E]/5",
          changeText: "text-[#22C55E]"
        };
      case "blue":
        return {
          border: "hover:border-[#3B82F6]/30",
          iconBg: "bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]",
          shadow: "shadow-[#3B82F6]/5",
          changeText: "text-[#3B82F6]"
        };
      case "purple":
        return {
          border: "hover:border-[#A855F7]/30",
          iconBg: "bg-[#A855F7]/10 border-[#A855F7]/20 text-[#A855F7]",
          shadow: "shadow-[#A855F7]/5",
          changeText: "text-[#A855F7]"
        };
      case "yellow":
        return {
          border: "hover:border-[#FACC15]/30",
          iconBg: "bg-[#FACC15]/10 border-[#FACC15]/20 text-[#FACC15]",
          shadow: "shadow-[#FACC15]/5",
          changeText: "text-[#FACC15]"
        };
      default:
        return {
          border: "hover:border-slate-800",
          iconBg: "bg-slate-900/50 border-slate-800 text-slate-400",
          shadow: "shadow-transparent",
          changeText: "text-slate-400"
        };
    }
  };

  const style = getColorClasses(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`dashboard-card dashboard-card-hover p-5 flex items-center justify-between text-left relative overflow-hidden shadow-lg ${style.border} ${style.shadow}`}
    >
      <div className="space-y-2.5">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {value}
          </h2>
          {change && (
            <span className={`text-[10px] font-bold ${style.changeText}`}>
              {change}
            </span>
          )}
        </div>
      </div>

      <div className={`p-3.5 rounded-2xl border ${style.iconBg} shrink-0`}>
        <Icon size={20} />
      </div>
    </motion.div>
  );
}
