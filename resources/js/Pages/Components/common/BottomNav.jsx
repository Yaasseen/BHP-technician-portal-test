import React from "react";
import {
    HomeOutlined,
    CalendarOutlined,
    UnorderedListOutlined,
    UserOutlined,
    ScanOutlined,
    MoreOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const MORE_VIEWS = ["teamandregion", "gigo", "ageing", "ops", "settings"];

const BottomNav = ({ activeView, setActiveView, user, onMoreClick }) => {
    const showMore = user?.Role !== "Technician";

    const navItems = [
        { key: "list", label: "Tasks", icon: <UnorderedListOutlined /> },
        { key: "weekly", label: "Schedule", icon: <CalendarOutlined /> },
        { key: "mybasket", label: "My Basket", icon: <ScanOutlined /> },
        ...(showMore ? [{ key: "more", label: "More", icon: <MoreOutlined /> }] : []),
        { key: "profile", label: "Profile", icon: <UserOutlined /> },
    ];

    const handleClick = (item) => {
        if (item.key === "more") {
            onMoreClick?.();
            return;
        }
        setActiveView(item.key);
    };

    const isActive = (item) =>
        item.key === "more" ? MORE_VIEWS.includes(activeView) : activeView === item.key;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 safe-area-bottom z-50 sm:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => handleClick(item)}
                        className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${isActive(item) ? "text-red-600" : "text-slate-400"
                            }`}
                    >
                        <span className="text-xl mb-1">{item.icon}</span>
                        <span className="text-[10px] font-medium leading-none uppercase tracking-wider">
                            {item.label}
                        </span>
                        {isActive(item) && (
                            <motion.div
                                layoutId="activeNav"
                                className="absolute -top-px left-1/2 -translate-x-1/2 w-12 h-0.5 bg-red-600 rounded-none"
                            />
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
