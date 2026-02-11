import React from "react";
import { Progress, Statistic } from "antd";
import { motion } from "framer-motion";

const DashboardCard = ({
    title,
    count,
}) => {
    return (
        <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="app-card relative sm:p-5 bg-white border-slate-200/60 overflow-hidden h-full flex flex-col justify-center"
        >
            {/* Very subtle pattern overlay */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent opacity-50 -mr-8 -mt-8 rounded-none blur-2xl"></div>

            <div className="relative z-10 flex flex-col justify-between">
                <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                        {title}
                    </p>
                    <div className="flex items-end gap-2">
                        <h2 className="text-2xl sm:text-3xl font-[900] text-slate-800 tracking-tight leading-none">
                            {count}
                        </h2>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardCard;
