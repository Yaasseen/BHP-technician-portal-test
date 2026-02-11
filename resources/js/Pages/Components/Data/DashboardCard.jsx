import React from "react";
import { Progress, Statistic } from "antd";
import { motion } from "framer-motion";

const DashboardCard = ({
    title,
    count,
    progress,
    progressColor,
    trailColor,
    trend,
    trendColor = "emerald",
    trendDirection = "up",
    trendText,
}) => {
    return (
        <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="app-card relative p-5 bg-white border-slate-200/60 overflow-hidden"
        >
            {/* Very subtle pattern overlay */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent opacity-50 -mr-8 -mt-8 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                        {title}
                    </p>
                    <div className="flex items-end gap-2">
                        <h2 className="text-3xl font-[900] text-slate-800 tracking-tight">
                            {count}
                        </h2>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: progressColor }}
                        />
                    </div>
                    <div className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter flex items-center gap-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100`}>
                        {trendDirection === "up" ? "↑" : "↓"} {progress}%
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardCard;
