import React, { useEffect, useState } from "react";
import { Avatar, Badge } from "antd";
import { UserOutlined, BellOutlined } from "@ant-design/icons";
import axios from "axios";
import { motion } from "framer-motion";

const MobileHeroHeader = ({ user, title, subtitle, onNotificationClick, onProfileClick }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("/task-statastics");
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: "Total Tasks", count: stats?.total_tasks || 0, color: "text-indigo-600" },
        { title: "Completed", count: stats?.completed_tasks || 0, color: "text-emerald-500" },
        { title: "Active", count: stats?.active_tasks || 0, color: "text-blue-500" },
        { title: "Reschedule", count: stats?.reschedule_tasks || 0, color: "text-orange-500" },
    ];

    return (
        <div className="relative mb-16 sm:hidden">
            {/* Gradient Background */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 pt-6 pb-16 px-4 rounded-b-[2.5rem] shadow-lg shadow-indigo-200/50">
                {/* Top Row: Logo/Title & Actions */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                            <span className="text-white font-black text-xl">B</span>
                        </div>
                        <div>
                            <h1 className="text-white text-xl font-black leading-none tracking-tight">{title || "Tasks"}</h1>
                            <p className="text-indigo-100 text-xs font-medium">{subtitle || "Manage your service orders"}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onNotificationClick} className="relative w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center transition-colors border border-white/10">
                            <BellOutlined className="text-white text-lg" />
                            {/* <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-indigo-600"></div> */}
                        </button>
                        <button onClick={onProfileClick} className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg p-0.5 border border-white/10 transition-colors">
                            <Avatar size={34} icon={<UserOutlined />} className="bg-indigo-800 text-white rounded-md" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlapping Stats Cards */}
            <div className="absolute bottom-0 translate-y-1/2 left-0 right-0 px-4">
                <div className="grid grid-cols-4 gap-2">
                    {statCards.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-2 rounded-xl shadow-lg shadow-slate-200/50 flex flex-col items-center justify-center text-center h-20 border border-slate-50"
                        >
                            <span className={`text-xl font-black ${item.color} leading-none mb-1`}>
                                {loading ? "-" : item.count}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 leading-tight uppercase tracking-wide">
                                {item.title}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobileHeroHeader;
