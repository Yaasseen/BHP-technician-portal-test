import React, { useEffect, useState } from "react";
import Header from "./Components/common/Header";
import MobileHeader from "./Components/common/MobileHeader";
import BottomNav from "./Components/common/BottomNav";
import "../../css/Dashboard.css";
import Dashboard from "./Screens/Dashboard";
import { Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const HomePage = ({ onLoggedOut, user }) => {
    const [showWeekView, setShowWeekView] = useState(false);
    const [handleHome, setHandleHome] = useState(false);
    const [activeView, setActiveView] = useState("list");
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

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

    const viewTitles = {
        list: "Tasks",
        weekly: "Schedule",
        viewDetails: "Service Details",
        teamandregion: "Configuration",
        profile: "My Profile",
        gigo: "GIGO",
        mybasket: "My Basket",
        ageing: "Ageing",
        settings: "Settings"
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
            {/* Desktop Header */}
            <div className="hidden sm:block sticky top-0 z-50">
                <Header
                    userLogout={() => handleGlobalLogout()}
                    user={user}
                    handleView={() => handleWeekView()}
                    handleHome={() => handleHomeScreen()}
                    activeView={activeView}
                    setActiveView={setActiveView}
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
                className={`${activeView === "list" ? "pt-0 px-0" : "pt-20 px-4"} sm:pt-6 sm:px-6 lg:px-8 max-w-7xl mx-auto`}
            >
                <div className="dashboard-card-modern">
                    <Dashboard
                        user={user}
                        showWeekView={showWeekView}
                        showDashboard={() => handleDashboard()}
                        showHome={handleHome}
                        activeView={activeView}
                        setActiveView={setActiveView}
                        onLogout={() => handleUserLoggedOut()}
                    />
                </div>
            </motion.main>

            {/* Mobile Bottom Navigation */}
            <BottomNav
                activeView={activeView}
                setActiveView={setActiveView}
            />
        </div>
    );
};

export default HomePage;

