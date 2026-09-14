import React, { useState, useEffect } from "react";
import { Dropdown, Menu, Avatar, Drawer, Spin } from "antd";
import {
    ArrowLeftOutlined,
    MenuOutlined,
    UserOutlined,
    UnorderedListOutlined,
    CalendarOutlined,
    TeamOutlined,
    ScanOutlined,
} from "@ant-design/icons";
import NotificationBell from "./Notification";
import MenuItem from "antd/es/menu/MenuItem";
import axios from "axios";
import { motion } from "framer-motion";
import NotificationBox from "./NotificationBox";
import { useSchedule } from "../../../context/ScheduleContext";

const Header = ({
    userLogout,
    user,
    handleView,
    handleHome,
    handleListView,
    activeView,
    setActiveView,
}) => {
    const [openSidebar, setOpenSidebar] = useState(false);
    const [openNotification, setOpenNotification] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { setWeekOffset, setStartDate, setTicketInfo } = useSchedule();

    const showSidebar = () => setOpenSidebar(true);
    const closeSidebar = () => setOpenSidebar(false);

    const [homeClicked, setHomeClicked] = useState(false);

    const navigateTo = (view) => {
        setActiveView(view);
        if (view === "weekly") {
            setTicketInfo(null);
            setWeekOffset(0);
            setStartDate(null);
        }
        closeSidebar();
    };

    console.log("=", activeView);

    const ListView = () => {
        handleLitView();
    };
    const handleLogout = () => {
        setLoading(true);
        axios
            .post("/logout")
            .then(() => {
                userLogout();
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleViewScreen = () => {
        setActiveView("list");
        setHomeClicked((prev) => !prev);
    };

    useEffect(() => {
        setOpenSidebar(false);
    }, [handleView, handleHome]);

    const handleNotificationOpen = () => setOpenNotification(true);
    const handleNotificationClose = () => setOpenNotification(false);

    useEffect(() => {
        const fetchNotifications = () => {
            axios
                .get(`/notifications`)
                .then((response) => {
                    if (response.data && response.data.success) {
                        const mappedNotifications = response.data.data.map(
                            (item) => ({
                                id: item.id,
                                title: item.title,
                                name: `${item.sender_details.First_Name} ${item.sender_details.Last_Name}`,
                                user: item.sender_id,
                                message: item.message,
                                time: new Date(
                                    item.created_at
                                ).toLocaleDateString(),
                                type: item.notification_type,
                                isRead: item.read_status === "read",
                            })
                        );
                        setNotifications(mappedNotifications);
                        setUnreadCount(response.data.notification_count);
                    } else {
                        console.error("Error", response);
                    }
                })
                .catch((error) => console.error("Error", error));
        };

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 30000);
        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75 z-50">
                <Spin size="large" />
            </div>
        );
    }

    const menuItems = [
        {
            key: '1',
            label: (
                <p className="font-semibold">
                    {user.First_Name} {user.Last_Name}
                </p>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: (
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left"
                    disabled={loading}
                >
                    Log Out
                </button>
            ),
        },
    ];

    return (
        <div className="sticky">
            <header className="top-0 flex justify-between items-center px-4 sm:px-12 py-3 bg-white shadow-sm border-b border-gray-300">
                <div className="flex gap-x-10 items-center">
                    <div className="flex items-center rounded-full border border-gray-400 p-3">
                        <MenuOutlined
                            className="text-xl cursor-pointer"
                            onClick={showSidebar}
                        />
                    </div>

                    <div className="flex items-center justify-center  ">
                        {activeView !== "list" && (
                            <button
                                onClick={handleViewScreen}
                                className="flex space-x-2 items-center "
                            >
                                <ArrowLeftOutlined />

                                <p>Back to Dashboard</p>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div onClick={handleNotificationOpen}>
                        <NotificationBell count={unreadCount} />
                    </div>

                    <Dropdown
                        menu={{ items: menuItems }}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <Avatar
                            size={46}
                            className="cursor-pointer"
                            icon={<UserOutlined />}
                        />
                    </Dropdown>
                </div>
            </header>
            <Drawer
                placement="left"
                width={280}
                onClose={closeSidebar}
                open={openSidebar}
            >
                <ul className="space-y-2">
                    <li className="text-lg">
                        <p
                            onClick={() => {
                                handleViewScreen();
                                closeSidebar();
                            }}
                            className="block px-4 py-2 text-black hover:bg-gray-200 hover:text-indigo-600 rounded transition duration-300 cursor-pointer"
                        >
                            Home
                        </p>
                    </li>
                    <li>
                        <p
                            onClick={() => navigateTo("list")}
                            className={`flex items-center gap-2 px-4 py-2 rounded transition duration-300 cursor-pointer ${
                                activeView === "list"
                                    ? "bg-indigo-50 text-indigo-600 font-medium"
                                    : "text-black hover:bg-gray-200 hover:text-indigo-600"
                            }`}
                        >
                            <UnorderedListOutlined /> List
                        </p>
                    </li>
                    <li>
                        <p
                            onClick={() => navigateTo("weekly")}
                            className={`flex items-center gap-2 px-4 py-2 rounded transition duration-300 cursor-pointer ${
                                activeView === "weekly"
                                    ? "bg-indigo-50 text-indigo-600 font-medium"
                                    : "text-black hover:bg-gray-200 hover:text-indigo-600"
                            }`}
                        >
                            <CalendarOutlined /> Weekly View
                        </p>
                    </li>
                    {user.Role !== "Technician" && (
                        <li>
                            <p
                                onClick={() => navigateTo("teamandregion")}
                                className={`flex items-center gap-2 px-4 py-2 rounded transition duration-300 cursor-pointer ${
                                    activeView === "teamandregion"
                                        ? "bg-indigo-50 text-indigo-600 font-medium"
                                        : "text-black hover:bg-gray-200 hover:text-indigo-600"
                                }`}
                            >
                                <TeamOutlined /> Team and Region
                            </p>
                        </li>
                    )}
                    {user.Role !== "Technician" && (
                        <li>
                            <p
                                onClick={() => navigateTo("gigo")}
                                className={`flex items-center gap-2 px-4 py-2 rounded transition duration-300 cursor-pointer ${
                                    activeView === "gigo"
                                        ? "bg-indigo-50 text-indigo-600 font-medium"
                                        : "text-black hover:bg-gray-200 hover:text-indigo-600"
                                }`}
                            >
                                <ScanOutlined /> GIGO
                            </p>
                        </li>
                    )}
                </ul>
            </Drawer>
            <div className="fixed top-20 right-1  sm:top-20 sm:right-10 ">
                {openNotification && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ ease: "easeOut", duration: 0.5 }}
                        layout
                    >
                        <NotificationBox
                            notifications={notifications}
                            unreadCount={unreadCount}
                            onClose={handleNotificationClose}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Header;
