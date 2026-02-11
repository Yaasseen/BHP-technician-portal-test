import React from "react";
import { Avatar, Badge } from "antd";
import { UserOutlined, BellOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const MobileHeader = ({ title, user, unreadCount, onNotificationClick }) => {
    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4 z-50 sm:hidden">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <span className="text-white font-bold text-xl">B</span>
                </div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    {title || "Technician"}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onNotificationClick}
                    className="relative p-2 text-slate-500 hover:text-emerald-600 transition-colors"
                >
                    <BellOutlined className="text-xl" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <div className="p-0.5 border-2 border-slate-100 rounded-full">
                    <Avatar
                        size={32}
                        icon={<UserOutlined />}
                        className="bg-slate-200"
                    />
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;
