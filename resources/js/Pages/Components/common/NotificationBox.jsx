

import React, { useState, useEffect } from "react";
import NotificationLog from "./NotificationLog";
import axios from "axios";

const NotificationBox = ({ notifications, unreadCount, onClose }) => {
    const [notificationsState, setNotifications] = useState(notifications);
    const [unreadCountState, setUnreadCount] = useState(unreadCount);

    useEffect(() => {
        setNotifications(notifications);
        setUnreadCount(unreadCount);
    }, [notifications, unreadCount]);

    const fetchUnreadCount = () => {
        axios
            .get("/notifications")
            .then((response) => {
                if (response.data && response.data.success) {
                    setUnreadCount(response.data.notification_count);
                }
            })
            .catch((error) => console.error("Error fetching count:", error));
    };

    const handleMarkAsRead = (id) => {
        axios
            .put(`/notifications/${id}/mark-read`)
            .then(() => {
                setNotifications((prev) =>
                    prev.filter((notification) => notification.id !== id)
                );
                fetchUnreadCount();
            })
            .catch((error) => console.error("Error in read:", error));
    };

    const handleMarkAllRead = () => {
        axios
            .put("/notifications/mark-all-read")
            .then(() => {
                setNotifications([]);
                fetchUnreadCount();
            })
            .catch((error) =>
                console.error("Error marking all as read:", error)
            );
    };

    return (
        <div>
            <NotificationLog
                notifications={notificationsState}
                unreadCount={unreadCountState}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllRead={handleMarkAllRead}
                onClose={onClose}
            />
        </div>
    );
};

export default NotificationBox;
