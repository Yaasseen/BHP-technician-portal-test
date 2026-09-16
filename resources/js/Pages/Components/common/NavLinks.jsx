import React from "react";
import {
    UnorderedListOutlined,
    CalendarOutlined,
    TeamOutlined,
    ScanOutlined,
    BarChartOutlined,
    SettingOutlined,
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
        `flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-bold transition-all ${activeView === view
            ? "bg-red-50 text-red-600 border-l-4 border-red-600"
            : "text-slate-600 border-l-4 border-transparent hover:bg-slate-50 hover:text-red-600"
        }`;

    const items = [
        { key: "list", label: "List", icon: <UnorderedListOutlined />, show: true },
        { key: "weekly", label: "Weekly View", icon: <CalendarOutlined />, show: true },
        { key: "teamandregion", label: "Team and Region", icon: <TeamOutlined />, show: user.Role !== "Technician" },
        { key: "mybasket", label: "My Basket", icon: <ScanOutlined />, show: true },
        { key: "gigo", label: "GIGO", icon: <ScanOutlined />, show: user.Role === "Team Leader" },
        { key: "ageing", label: "Ageing", icon: <BarChartOutlined />, show: user.Role === "Team Leader" },
        { key: "ops", label: "OPS Dashboard", icon: <BarChartOutlined />, show: user.Role === "Team Leader" },
        { key: "settings", label: "Settings", icon: <SettingOutlined />, show: user.Role === "Admin" },
    ];

    return (
        <ul className="space-y-1">
            {items.filter((item) => item.show).map((item) => (
                <li key={item.key}>
                    <button
                        onClick={() => navigateTo(item.key)}
                        className={`w-full text-left ${itemClass(item.key)}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default NavLinks;
