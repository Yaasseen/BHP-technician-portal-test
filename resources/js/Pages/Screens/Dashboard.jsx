import React, { useEffect, useState } from "react";
import TaskTable from "../Components/Data/TaskTable";
import "../../../css/Dashboard.css";
import DashboardList from "./DashboardList";
import Card from "./Card";
import TeamSchedulerWeek from "../Screens/TeamScheduler";
import TeamRegionConfig from "./TeamAndRegion";
import ServiceDetails from "./ServiceDetails";
import Profile from "./Profile";
import GigoDashboard from "./Gigo/GigoDashboard";
import MyBasket from "./Gigo/MyBasket";
import AgeingDashboard from "./Ageing/AgeingDashboard";
import SettingsPanel from "./Settings/SettingsPanel";
import OpsDashboard from "./Ops/OpsDashboard";
import MobileHeroHeader from "../Components/common/MobileHeroHeader";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = ({
    user,
    showDashboard,
    showHome,
    activeView,
    setActiveView,
    onLogout, // Added onLogout prop
    showWeekView,
}) => {
    const [documentNo, setDocumentNo] = useState(null);
    const [ticketInfo, setTicketInfo] = useState();
    const [locationState, setLocationState] = useState(false);
    const [refreshStatistics, setRefreshStatistics] = useState(false);

    useEffect(() => {
        if (showHome) {
            setActiveView("list");
        }
    }, [showHome]);

    useEffect(() => {
        if (ticketInfo) {
            setActiveView("teamandregion");
        }
    }, [ticketInfo]);

    useEffect(() => {
        setLocationState(activeView !== "list");
    }, [activeView]);

    const ScreenContent = (document_no) => {
        setDocumentNo(document_no);
        setActiveView("viewDetails");
    };

    const ScreenDashboard = () => {
        setActiveView("list");
    };

    const NavigateWeeklyView = () => {
        setActiveView("weekly");
        setTicketInfo(null);
    };

    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={{ duration: 0.2 }}
                >
                    {activeView === "viewDetails" ? (
                        <ServiceDetails
                            user={user}
                            document_no={documentNo}
                            ScreenDashboard={ScreenDashboard}
                        />
                    ) : activeView === "weekly" ? (
                        <TeamSchedulerWeek
                            user={user}
                            handleScreen={() => setActiveView("list")}
                            setTicketInfo={setTicketInfo}
                            screenContent={ScreenContent}
                            showWeekView={showWeekView}
                        />
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="hidden sm:block">
                                <DashboardList user={user} activeView={activeView} />
                            </div>

                            {activeView === "list" ? (
                                <div className="flex flex-col gap-6">
                                    <MobileHeroHeader
                                        user={user}
                                        onNotificationClick={() => console.log("Notifications")}
                                        onProfileClick={() => setActiveView("profile")}
                                    />
                                    <div className="hidden sm:block">
                                        <Card refreshCard={refreshStatistics} />
                                    </div>
                                    <div>
                                        <TaskTable
                                            user={user}
                                            screenContent={ScreenContent}
                                            RefreshStatistics={() =>
                                                setRefreshStatistics(
                                                    !refreshStatistics
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                            ) : activeView === "teamandregion" ? (
                                <div className="bg-slate-50/50 p-8 rounded-none border border-slate-100">
                                    <TeamRegionConfig
                                        ticketData={ticketInfo}
                                        returnWeekView={NavigateWeeklyView}
                                        locationState={locationState}
                                    />
                                </div>
                            ) : activeView === "profile" ? (
                                <Profile
                                    user={user}
                                    onLogout={onLogout}
                                    onBack={() => setActiveView("list")}
                                />
                            ) : activeView === "gigo" ? (
                                <GigoDashboard user={user} screenContent={ScreenContent} />
                            ) : activeView === "mybasket" ? (
                                <MyBasket user={user} screenContent={ScreenContent} />
                            ) : activeView === "ageing" ? (
                                <AgeingDashboard user={user} screenContent={ScreenContent} />
                            ) : activeView === "settings" ? (
                                <SettingsPanel user={user} />
                            ) : activeView === "ops" ? (
                                <OpsDashboard user={user} />
                            ) : null}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
