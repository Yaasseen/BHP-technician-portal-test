import { Button } from "antd";
import {
    UnorderedListOutlined,
    CalendarOutlined,
    TeamOutlined,
    ScanOutlined,
    BarChartOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import React from "react";
import { motion } from "framer-motion";

function DashboardList({
    user,
    ShowList,
    HideShowList,
    ShowTeamRegion,
    ShowGigo,
    ShowMyBasket,
    ShowAgeing,
    ShowSettings,
    ShowOps,
    activeView,
}) {
    return (
        <div className="bg-transparent mb-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                {activeView === "list" && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1.5"
                    >
                        <h2 className="text-3xl sm:text-4xl font-[900] text-slate-900 tracking-tight leading-none">
                            Welcome, <span className="text-indigo-600 font-black">{user.First_Name}</span>
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-none">
                                <span className="w-1.5 h-1.5 rounded-none bg-indigo-600 animate-pulse"></span>
                                <span className="text-indigo-700 text-[10px] font-black uppercase tracking-widest">
                                    {user.Role}
                                </span>
                            </div>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="w-4 h-[1px] bg-slate-200"></span>
                                Technician Portal
                            </span>
                        </div>
                    </motion.div>
                )}

                <div className="flex bg-white p-1 rounded-none shadow-sm border border-slate-100 self-start md:self-auto">
                    <button
                        onClick={ShowList}
                        className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-bold transition-all ${activeView === "list"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <UnorderedListOutlined />
                        <span>List</span>
                    </button>
                    <button
                        onClick={HideShowList}
                        className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-bold transition-all ${activeView === "weekly"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <CalendarOutlined />
                        <span>Weekly</span>
                    </button>
                    {user.Role !== "Technician" && (
                        <button
                            onClick={ShowTeamRegion}
                            className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-bold transition-all ${activeView === "teamandregion"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <TeamOutlined />
                            <span>Config</span>
                        </button>
                    )}
                    <button
                        onClick={ShowMyBasket}
                        className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-bold transition-all ${activeView === "mybasket"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <ScanOutlined />
                        <span>My Basket</span>
                    </button>
                    {user.Role === "Team Leader" && (
                        <button
                            onClick={ShowGigo}
                            className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-bold transition-all ${activeView === "gigo"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <ScanOutlined />
                            <span>GIGO</span>
                        </button>
                    )}
                    {user.Role === "Team Leader" && (
                        <button
                            onClick={ShowAgeing}
                            className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-bold transition-all ${activeView === "ageing"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <BarChartOutlined />
                            <span>Ageing</span>
                        </button>
                    )}
                    {user.Role === "Team Leader" && (
                        <button
                            onClick={ShowOps}
                            className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-bold transition-all ${activeView === "ops"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <BarChartOutlined />
                            <span>OPS Dashboard</span>
                        </button>
                    )}
                    {user.Role === "Admin" && (
                        <button
                            onClick={ShowSettings}
                            className={`flex items-center gap-2 px-4 py-2 rounded-none text-sm font-bold transition-all ${activeView === "settings"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <SettingOutlined />
                            <span>Settings</span>
                        </button>
                    )}
                </div>
            </header>
        </div>
    );
}

export default DashboardList;

