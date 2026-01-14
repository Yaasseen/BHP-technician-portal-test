import React from "react";
import {
    CarryOutOutlined,
    FlagOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";

function ViewCard({ name, taskNo, teams }) {
    const statusColors = {
        Confirmed: {
            text: "text-blue-500",
            border: "border-blue-400",
            bg: "bg-blue-50",
        },
        Pending: {
            text: "text-orange-500",
            border: "border-orange-400",
            bg: "bg-orange-50",
        },
        Free: {
            text: "text-green-500",
            border: "border-green-400",
            bg: "bg-green-50",
        },
    };

    return (
        <div className="border rounded-lg m-4">
            <div className="bg-gray-100  rounded-t-lg border-b flex justify-between p-2">
                <p className="pl-2">{name}</p>
                <span className="flex items-center space-x-2 text-sm pr-2">
                    <CarryOutOutlined />
                    <p>{`${taskNo} Total Task`}</p>
                </span>
            </div>

            <div className="">
                {teams.map((team, index) => {
                    const currentColors =
                        statusColors[team.bookingStatus] || {};
                    return (
                        <div
                            key={index}
                            className="flex justify-between items-center  border-b  p-4 hover:bg-gray-50"
                        >
                            <div>
                                <p className="text-lg ">{team.teamName}</p>
                            </div>
                            <div className="flex space-x-3">
                                <p className="text-gray-500">{team.region}</p>
                                <div
                                    className={`flex text-xs items-center px-3 py-1 rounded-md space-x-2 ${currentColors.text} ${currentColors.bg} ${currentColors.border} border`}
                                >
                                    <FlagOutlined />
                                    <p>{team.bookingStatus}</p>
                                </div>
                                <InfoCircleOutlined className="text-gray-500" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ViewCard;
