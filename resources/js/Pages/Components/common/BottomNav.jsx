import React from "react";
import {
    HomeOutlined,
    CalendarOutlined,
    UnorderedListOutlined,
    UserOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";

const BottomNav = ({ activeView, setActiveView }) => {
    const navItems = [
        { key: "list", label: "Tasks", icon: <UnorderedListOutlined /> },
        { key: "weekly", label: "Schedule", icon: <CalendarOutlined /> },
        { key: "profile", label: "Profile", icon: <UserOutlined /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 safe-area-bottom z-50 sm:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setActiveView(item.key)}
                        className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${activeView === item.key ? "text-emerald-600" : "text-slate-400"
                            }`}
                    >
                        <span className="text-xl mb-1">{item.icon}</span>
                        <span className="text-[10px] font-medium leading-none uppercase tracking-wider">
                            {item.label}
                        </span>
                        {activeView === item.key && (
                            <motion.div
                                layoutId="activeNav"
                                className="absolute -top-px left-1/2 -translate-x-1/2 w-12 h-0.5 bg-emerald-600 rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
