import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function FeatureCard({ title, description, icon: Icon, link }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Link 
        to={link}
        className="dashboard-card dashboard-card-hover p-6 flex flex-col justify-between items-start text-left group relative overflow-hidden h-full min-h-[170px]"
      >
        {/* Glow indicator line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/0 group-hover:via-[#22C55E]/40 group-hover:to-emerald-500/0 transition-all duration-300" />
        
        <div className="space-y-4">
          <div className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl group-hover:scale-115 group-hover:bg-[#22C55E]/10 group-hover:border-[#22C55E]/20 group-hover:text-[#22C55E] transition-all duration-300 shrink-0">
            <Icon size={18} />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-slate-200 text-sm font-bold tracking-wide group-hover:text-[#22C55E] transition-colors uppercase">
              {title}
            </h3>
            <p className="text-slate-500 text-xs leading-normal">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
