import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const NotificationLog = ({
    notifications = [],
    onMarkAsRead,
    onMarkAllRead,
    unreadCount,
    onClose,
}) => {
    return (
        <div className="sm:w-[450px] w-full max-w-sm bg-white rounded-xl shadow-lg pb-2 mb-4">
            <div className="flex justify-between items-center p-4 border-b space-x-5">
                <div className="flex items-center space-x-2">
                    <span className="border rounded-full p-3 bg-blue-600" />
                    <p className="text-base sm:text-lg font-semibold">
                        Notifications
                    </p>
                    <p className="text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {unreadCount}
                    </p>
                </div>
                <button onClick={onClose} className="text-gray-500">
                    <CloseOutlined />
                </button>
            </div>

            <div className="mx-4 max-h-96 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                    <AnimatePresence>
                        {notifications.map((notification) => (
                            <motion.li
                                key={notification.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="group p-4 hover:bg-gray-50 items-start"
                            >
                                <div className="w-full">
                                    <p className="text-sm sm:text-base font-medium text-gray-900 flex justify-between">
                                        <p> {notification.name}</p>
                                        <p>{notification.time}</p>
                                    </p>
                                </div>
                                <div className="w-full">
                                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                                        {notification.message}
                                    </p>
                                    <button
                                        className="ml-auto  flex justify-center items-center sm:mt-0 mt-2 sm:group-hover:opacity-100 sm:opacity-0 font-medium border rounded-full text-xs sm:text-sm sm:p-2 p-1 border-blue-600 hover:bg-blue-100 transition-opacity"
                                        onClick={() =>
                                            onMarkAsRead(notification.id)
                                        }
                                    >
                                        <CheckOutlined className="text-blue-600" />
                                    </button>
                                </div>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            </div>

            {notifications.length > 0 && (
                <div className="border-t flex justify-end ">
                    <button
                        onClick={onMarkAllRead}
                        className="text-blue-600 m-4 text-sm flex items-center"
                    >
                        <CheckOutlined className="text-blue-600 mr-1" />
                        Mark All Read
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationLog;
