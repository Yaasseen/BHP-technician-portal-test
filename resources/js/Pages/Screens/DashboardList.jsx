import React from "react";

function DashboardList({ user, activeView }) {
    return (
        <>
            <div className="bg-white rounded-t-xl">
                <div>
                    <header className="pb-5">
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
                    </header>
                </div>
            </div>
        </>
    );
}

export default DashboardList;
