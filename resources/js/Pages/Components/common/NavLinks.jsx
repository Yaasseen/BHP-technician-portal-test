import React from "react";
import {
    UnorderedListOutlined,
    CalendarOutlined,
    TeamOutlined,
    ScanOutlined,
    BarChartOutlined,
    SettingOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import { useSchedule } from "../../../context/ScheduleContext";

const NavLinks = ({ user, activeView, setActiveView, onItemClick }) => {
    const { setWeekOffset, setStartDate, setTicketInfo } = useSchedule();

    const navigateTo = (view) => {
        setActiveView(view);
        if (view === "weekly") {
            setTicketInfo(null);
            setWeekOffset(0);
            setStartDate(null);
        }
        onItemClick?.();
    };

    const itemClass = (view) =>
        `flex items-center gap-2 px-4 py-2 rounded transition duration-300 cursor-pointer border-l-4 ${
            activeView === view
                ? "bg-red-50 text-red-600 font-medium border-red-500"
                : "text-black hover:bg-gray-100 hover:text-red-600 border-transparent"
        }`;

    return (
        <ul className="space-y-1">
            <li>
                <p onClick={() => navigateTo("list")} className={itemClass("list")}>
                    <HomeOutlined /> Home
                </p>
            </li>
            <li>
                <p onClick={() => navigateTo("list")} className={itemClass("list")}>
                    <UnorderedListOutlined /> List
                </p>
            </li>
            <li>
                <p onClick={() => navigateTo("weekly")} className={itemClass("weekly")}>
                    <CalendarOutlined /> Weekly View
                </p>
            </li>
            {user.Role !== "Technician" && (
                <li>
                    <p
                        onClick={() => navigateTo("teamandregion")}
                        className={itemClass("teamandregion")}
                    >
                        <TeamOutlined /> Team and Region
                    </p>
                </li>
            )}
            {user.Role !== "Technician" && (
                <li>
                    <p onClick={() => navigateTo("gigo")} className={itemClass("gigo")}>
                        <ScanOutlined /> GIGO
                    </p>
                </li>
            )}
            {user.Role !== "Technician" && (
                <li>
                    <p onClick={() => navigateTo("ageing")} className={itemClass("ageing")}>
                        <BarChartOutlined /> Ageing
                    </p>
                </li>
            )}
            {user.Role !== "Technician" && (
                <li>
                    <p onClick={() => navigateTo("ops")} className={itemClass("ops")}>
                        <BarChartOutlined /> OPS Dashboard
                    </p>
                </li>
            )}
            {user.Role === "Admin" && (
                <li>
                    <p
                        onClick={() => navigateTo("settings")}
                        className={itemClass("settings")}
                    >
                        <SettingOutlined /> Settings
                    </p>
                </li>
            )}
        </ul>
    );
};

export default NavLinks;
