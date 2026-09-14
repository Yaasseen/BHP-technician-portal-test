import React, { useEffect, useState } from "react";
import TaskTable from "../Components/Data/TaskTable";
import "../../../css/Dashboard.css";
import DashboardList from "./DashboardList";
import Card from "./Card";
import TeamSchedulerWeek from "../Screens/TeamScheduler";
import TeamRegionConfig from "./TeamAndRegion";
import ServiceDetails from "./ServiceDetails";
import GigoDashboard from "./Gigo/GigoDashboard";
import AgeingDashboard from "./Ageing/AgeingDashboard";
import SettingsPanel from "./Settings/SettingsPanel";
import OpsDashboard from "./Ops/OpsDashboard";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useSchedule } from "../../context/ScheduleContext";

const Dashboard = ({
    user,
    showDashboard,
    showHome,
    activeView,
    setActiveView,
}) => {
    const { ticketInfo, setTicketInfo } = useSchedule();
    const [documentNo, setDocumentNo] = useState(null);
    const [locationState, setLocationState] = useState(false);
    const [refreshStatistics, setRefreshStatistics] = useState(false);

    useEffect(() => {
        setActiveView("list");
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

    return (
        <div className="w-full"> 
            <div>
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
                    />
                ) : (
                    <>
                        <div className="bg-white rounded-xl p-4 lg:p-10  p-xs-3">
                            <DashboardList
                                user={user}
                                activeView={activeView}
                            />
                            <div>
                                {activeView === "list" ? (
                                    <>
                                        <Card refreshCard={refreshStatistics} />
                                        <TaskTable
                                            user={user}
                                            screenContent={ScreenContent}
                                            RefreshStatistics={() =>
                                                setRefreshStatistics(
                                                    !refreshStatistics
                                                )
                                            }
                                        />
                                    </>
                                ) : activeView === "teamandregion" ? (
                                    <TeamRegionConfig
                                        ticketData={ticketInfo}
                                        returnWeekView={NavigateWeeklyView}
                                        locationState={locationState}
                                    />
                                ) : activeView === "gigo" ? (
                                    <GigoDashboard user={user} />
                                ) : activeView === "ageing" ? (
                                    <AgeingDashboard user={user} />
                                ) : activeView === "settings" ? (
                                    <SettingsPanel user={user} />
                                ) : activeView === "ops" ? (
                                    <OpsDashboard user={user} />
                                ) : null}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
