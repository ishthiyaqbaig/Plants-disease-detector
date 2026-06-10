import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0B1120] text-[#F3F4F6] font-sans antialiased overflow-hidden">
      {/* Sidebar - fixed width collapsible */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Navbar />
        <main className="flex-grow p-4 sm:p-6 lg:p-8 bg-[#0B1120]">
          {children}
        </main>
      </div>
    </div>
  );
}
