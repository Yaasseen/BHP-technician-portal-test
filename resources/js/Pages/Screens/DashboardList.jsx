import { Button } from "antd";
import {
    UnorderedListOutlined,
    CalendarOutlined,
    TeamOutlined,
    ScanOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";

function DashboardList({
    user,
    ShowList,
    HideShowList,
    ShowTeamRegion,
    ShowGigo,
    activeView,
}) {
    console.log("==>", activeView);

    return (
        <>
            <div className="bg-white rounded-t-xl">
                <div>
                      <header className="pb-5 sm:flex sm:justify-between flex-wrap gap-4 items-center">
                        {activeView === "list" && (
                            <div>
                                <p className="sm:text-3xl text-md font-medium font-sans">
                                    Welcome back, {user.First_Name}
                                </p>
                                <p className="sm:text-xl text-sm font-medium font-sans">
                                    {user.Role}
                                </p>
                                <p className="text-gray-500 sm:text-md text-xs font-light pt-4">
                                    Your current tasks summary and activity.
                                </p>
                            </div>
                        )}

                          <div
                            className={`flex gap-2 flex-wrap sm:flex-nowrap mt-2 lg:mt-4 sm:mt-0 ${
                                activeView !== "list"
                                    ? "justify-start sm:justify-end  w-full"
                                    : ""
                            }`}
                        >
                            <div className="sm:m-0 mb-1 flex justify-end">
                                <Button
                                    icon={<UnorderedListOutlined />}
                                    onClick={ShowList}
                                    className={`${
                                        activeView === "list"
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white text-black border-indigo-600"
                                    }`}
                                >
                                    List
                                </Button>
                            </div>
                            <div className="sm:m-0 mb-1 flex justify-end">
                                <Button
                                    icon={<CalendarOutlined />}
                                    onClick={HideShowList}
                                    className={`${
                                        activeView === "weekly"
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white text-black border-indigo-600"
                                    }`}
                                >
                                    Weekly View
                                </Button>
                            </div>
                            <div className="sm:m-0 mb-1 flex justify-end">
                                {user.Role !== "Technician" && (
                                    <Button
                                        icon={<TeamOutlined />}
                                        onClick={ShowTeamRegion}
                                        className={`${
                                            activeView === "teamandregion"
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white text-black border-indigo-600"
                                        }`}
                                    >
                                        Team and Region
                                    </Button>
                                )}
                            </div>
                            <div className="sm:m-0 mb-1 flex justify-end">
                                {user.Role !== "Technician" && (
                                    <Button
                                        icon={<ScanOutlined />}
                                        onClick={ShowGigo}
                                        className={`${
                                            activeView === "gigo"
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white text-black border-indigo-600"
                                        }`}
                                    >
                                        GIGO
                                    </Button>
                                )}
                            </div>
                        </div>
                    </header>
                </div>
            </div>
        </>
    );
}

export default DashboardList;
