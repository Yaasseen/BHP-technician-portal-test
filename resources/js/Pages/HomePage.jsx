import React, { useEffect, useState } from "react";
import Header from "./Components/common/Header";
import Sidebar from "./Components/common/Sidebar";
import MobileHeader from "./Components/common/MobileHeader";
import BottomNav from "./Components/common/BottomNav";
import "../../css/Dashboard.css";
import Dashboard from "./Screens/Dashboard";
import { Spin, Drawer } from "antd";
import {
    TeamOutlined,
    ScanOutlined,
    BarChartOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const HomePage = ({ onLoggedOut, user }) => {
    const [showWeekView, setShowWeekView] = useState(false);
    const [handleHome, setHandleHome] = useState(false);
    const [activeView, setActiveView] = useState("list");
    const [previousView, setPreviousView] = useState("list");
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);

    const handleUserLoggedOut = () => {
        onLoggedOut();
    };

    const handleGlobalLogout = () => {
        setLoading(true);
        axios
            .post("/logout")
            .then(() => {
                onLoggedOut();
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleWeekView = () => {
        setShowWeekView(true);
        setActiveView("weekly");
    };
    const handleDashboard = () => {
        setShowWeekView(false);
        setActiveView("list");
    };

    const handleHomeScreen = () => {
        setHandleHome((prev) => !prev);
        setActiveView("list");
    };

    const moreMenuItems = [
        { key: "teamandregion", label: "Team and Region", icon: <TeamOutlined />, show: user.Role !== "Technician" },
        { key: "gigo", label: "GIGO", icon: <ScanOutlined />, show: user.Role === "Team Leader" || user.Role === "Admin" || user.Role === "CSC" },
        { key: "ageing", label: "Ageing", icon: <BarChartOutlined />, show: user.Role === "Team Leader" },
        { key: "ops", label: "OPS Dashboard", icon: <BarChartOutlined />, show: user.Role === "Team Leader" },
        { key: "settings", label: "Settings", icon: <SettingOutlined />, show: user.Role === "Admin" },
    ].filter((item) => item.show);

    const handleMoreSelect = (key) => {
        setActiveView(key);
        setMoreOpen(false);
    };

    const viewTitles = {
        list: "Tasks",
        weekly: "Schedule",
        viewDetails: "Service Details",
        teamandregion: "Configuration",
        profile: "My Profile",
        gigo: "GIGO",
        mybasket: "My Basket",
        ageing: "Ageing",
        settings: "Settings",
        ops: "OPS Dashboard"
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
            {/* Desktop Sidebar */}
            <Sidebar user={user} activeView={activeView} setActiveView={setActiveView} />

            {/* Desktop Header */}
            <div className="hidden sm:block sticky top-0 z-30 sm:pl-60">
                <Header
                    userLogout={() => handleGlobalLogout()}
                    user={user}
                    handleView={() => handleWeekView()}
                    handleHome={() => handleHomeScreen()}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    previousView={previousView}
                />
            </div>

            {/* Mobile Header */}
            {activeView !== "list" && (
                <MobileHeader
                    title={viewTitles[activeView]}
                    user={user}
                    unreadCount={unreadCount}
                    onNotificationClick={() => console.log("Notifications clicked")}
                    onLogout={() => handleGlobalLogout()}
                />
            )}

            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${activeView === "list" ? "pt-0 pl-0 pr-0" : "pt-20 pl-4 pr-4"} sm:pt-6 sm:pl-60 sm:pr-6 lg:pr-8 max-w-7xl mx-auto`}
            >
                <div className="dashboard-card-modern">
                    <Dashboard
                        user={user}
                        showWeekView={showWeekView}
                        showDashboard={() => handleDashboard()}
                        showHome={handleHome}
                        activeView={activeView}
                        setActiveView={setActiveView}
                        previousView={previousView}
                        setPreviousView={setPreviousView}
                        onLogout={() => handleUserLoggedOut()}
                    />
                </div>
            </motion.main>

            {/* Mobile Bottom Navigation */}
            <BottomNav
                activeView={activeView}
                setActiveView={setActiveView}
                user={user}
                onMoreClick={() => setMoreOpen(true)}
            />

            <Drawer
                title="More"
                placement="bottom"
                open={moreOpen}
                onClose={() => setMoreOpen(false)}
                height="auto"
                className="sm:hidden"
            >
                <div className="flex flex-col gap-1 pb-4">
                    {moreMenuItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => handleMoreSelect(item.key)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-none text-sm font-bold transition-all text-left ${activeView === item.key
                                ? "bg-red-50 text-red-600"
                                : "text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </Drawer>
        </div>
    );
};

export default HomePage;

