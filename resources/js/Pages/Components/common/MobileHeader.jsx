import React from "react";
import { Avatar, Badge, Dropdown, Menu } from "antd";
import { UserOutlined, BellOutlined, LogoutOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const MobileHeader = ({ title, user, unreadCount, onNotificationClick, onLogout }) => {
    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            onLogout();
        }
    };

    const menuItems = [
        {
            key: '1',
            label: (
                <div className="py-1 px-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="font-black text-slate-900 truncate max-w-[150px]">
                        {user?.First_Name} {user?.Last_Name}
                    </p>
                </div>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: (
                <div className="flex items-center gap-2 py-1 px-2 text-red-600 font-bold">
                    <LogoutOutlined className="text-sm" />
                    <span>Log Out</span>
                </div>
            ),
        },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 h-16 flex items-center justify-between px-4 z-50 sm:hidden">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-none flex items-center justify-center shadow-lg shadow-indigo-200">
                    <span className="text-white font-bold text-xl italic">B</span>
                </div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    {title || "Technician"}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onNotificationClick}
                    className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    <BellOutlined className="text-xl" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-none flex items-center justify-center border-2 border-white">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <Dropdown
                    menu={{ items: menuItems, onClick: handleMenuClick }}
                    trigger={["click"]}
                    placement="bottomRight"
                    overlayClassName="sharp-dropdown"
                    className="cursor-pointer"
                >
                    <div className="p-0.5 border-2 border-slate-100 rounded-none">
                        <Avatar
                            size={32}
                            shape="square"
                            icon={<UserOutlined />}
                            className="bg-slate-200 rounded-none"
                        />
                    </div>
                </Dropdown>
            </div>
        </header>
    );
};

export default MobileHeader;
