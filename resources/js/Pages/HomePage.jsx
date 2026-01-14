import React, { useEffect, useState } from "react";
import Header from "./Components/common/Header";
import "../../css/Dashboard.css";
import Dashboard from "./Screens/Dashboard";
import { Spin } from "antd";

const HomePage = ({ onLoggedOut, user }) => {
    const [showWeekView, setShowWeekView] = useState(false);
    const [handleHome, setHandleHome] = useState(false);
    const [activeView, setActiveView] = useState("list");

    const handleUserLoggedOut = () => {
        onLoggedOut();
    };
    const handleWeekView = () => {
        setShowWeekView(true);
    };
    const handleDashboard = () => {
        setShowWeekView(false);
    };

    const handleHomeScreen = () => {
        setHandleHome((prev) => !prev);
    };

    return (
        <div>
            <div className="sticky top-0 z-50">
                <Header
                    userLogout={() => handleUserLoggedOut()}
                    user={user}
                    handleView={() => handleWeekView()}
                    handleHome={() => handleHomeScreen()}
                    activeView={activeView}
                    setActiveView={setActiveView}
                />
            </div>
            <div className="dashboard-card">
                <Dashboard
                    user={user}
                    handleView={showWeekView}
                    showDashboard={() => handleDashboard()}
                    showHome={handleHome}
                    activeView={activeView}
                    setActiveView={setActiveView}
                />
            </div>
        </div>
    );
};

export default HomePage;
