import React from "react";
import {
    CarryOutOutlined,
    FlagOutlined,
    IdcardOutlined,
    MoreOutlined,
    UserAddOutlined,
} from "@ant-design/icons";
import { Button, Popover } from "antd";

function TaskCard({ team }) {
    const content = (
        <div>
            <Button type="text">Assign Task</Button>
            <br />
            <Button type="text">Mark Completed</Button>
        </div>
    );
    return (
        <div className="border rounded-none shadow-sm h-full w-full">
            <div className="bg-gray-100 rounded-t-lg border-b flex justify-between p-2">
                <p className="pl-2 font-semibold">{team.name}</p>
                <span className="flex items-center space-x-2 text-sm pr-2">
                    <p>{team.task}</p>
                    <IdcardOutlined />
                </span>
            </div>

            {team.teams.map((subTeam, index) => (
                <div key={index} className="p-3 border-b ">
                    <div className="flex justify-between">
                        <p className="text-sm text-gray-500 flex items-center mb-2">
                            {subTeam.region}
                        </p>
                        <div className="flex items-center space-x-2">
                            <CarryOutOutlined />
                            <p className="text-sm">{subTeam.task}</p>
                            <div
                                className={`flex items-center text-xs px-3 py-1 rounded-none space-x-2 border ${
                                    subTeam.taskStatus === "Free"
                                        ? "bg-red-50 border-red-400 text-red-600"
                                        : "bg-red-50 border-red-400 text-red-600"
                                }`}
                            >
                                <FlagOutlined />
                                <p>{subTeam.taskStatus}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2">
                        {subTeam.jobs.map((job, idx) => (
                            <div
                                key={idx}
                                className="border rounded-none p-2 mb-2 space-y-3"
                            >
                                <div className="flex items-center space-x-2 justify-between">
                                    <div className="flex items-center space-x-1">
                                        <p
                                            className={`w-2 h-2 rounded-none ${
                                                job.status === "Pending"
                                                    ? "bg-yellow-400"
                                                    : job.status === "Delayed"
                                                    ? "bg-red-400"
                                                    : job.status === "Completed"
                                                    ? "bg-red-400"
                                                    : "bg-blue-400"
                                            }`}
                                        />
                                        <p
                                            className={`text-sm ${
                                                job.status === "Pending"
                                                    ? "text-yellow-400"
                                                    : job.status === "Delayed"
                                                    ? "text-red-400"
                                                    : job.status === "Completed"
                                                    ? "text-red-500"
                                                    : "text-blue-400"
                                            }`}
                                        >
                                            {job.status}
                                        </p>
                                    </div>
                                    <Popover
                                        content={content}
                                        trigger={"click"}
                                    >
                                        <MoreOutlined />
                                    </Popover>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <UserAddOutlined className="text-gray-400" />
                                        <p className="text-gray-400">Job No:</p>
                                    </div>
                                    <p className="font-medium text-sm">
                                        {job.jobNo}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default TaskCard;
