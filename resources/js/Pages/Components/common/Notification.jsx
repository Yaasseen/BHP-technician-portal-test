import React, { useState } from "react";
import { Dropdown, Badge, Menu } from "antd";
import { BellOutlined } from "@ant-design/icons";

const NotificationBell = ({ count }) => {
    const notificationsCount = count || "";
    const [notifications, setNotifications] = useState([
        { key: 1, message: "New task assigned" },
        { key: 2, message: "Server downtime scheduled" },
        { key: 3, message: "New comment on your post" },
        { key: 4, message: "User feedback received" },
        { key: 5, message: "System update completed" },
    ]);

    const menu = <div>{ }</div>;

    return (
        <div className="flex items-center gap-4">
            <div className="cursor-pointer rounded-full border border-gray-400 p-2 relative">
                <Dropdown
                    dropdownRender={() => menu}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <BellOutlined className="text-2xl" />
                </Dropdown>
                {notificationsCount > 0 && (
                    <Badge
                        count={notificationsCount}
                        className="absolute -top-2 -right-2"
                    />
                )}
            </div>
        </div>
    );
};

export default NotificationBell;
