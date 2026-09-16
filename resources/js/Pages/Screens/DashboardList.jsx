import React from "react";
import { motion } from "framer-motion";

function DashboardList({ user, activeView }) {
    if (activeView !== "list") return null;

    return (
        <div className="bg-transparent mb-6">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-1.5"
            >
                <h2 className="text-3xl sm:text-4xl font-[900] text-slate-900 tracking-tight leading-none">
                    Welcome, <span className="text-red-600 font-black">{user.First_Name}</span>
                </h2>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 rounded-none">
                        <span className="w-1.5 h-1.5 rounded-none bg-red-600 animate-pulse"></span>
                        <span className="text-red-700 text-[10px] font-black uppercase tracking-widest">
                            {user.Role}
                        </span>
                    </div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-slate-200"></span>
                        Technician Portal
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

export default DashboardList;
