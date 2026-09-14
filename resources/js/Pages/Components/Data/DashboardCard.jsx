import React, { useState, useEffect } from "react";
import { Card, Progress, Statistic } from "antd";

const DashboardCard = ({
    title,
    count,
    progress,
    progressColor,
    trailColor,
}) => {
    const [progressWidth, setProgressWidth] = useState(50);

    const updateProgressWidth = () => {
        const width = window.innerWidth;
        if (width < 480) setProgressWidth(35);
        else if (width < 640) setProgressWidth(40);
        else if (width < 1024) setProgressWidth(50);
        else setProgressWidth(60);
    };

    useEffect(() => {
        updateProgressWidth();
        window.addEventListener("resize", updateProgressWidth);
        return () => window.removeEventListener("resize", updateProgressWidth);
    }, []);

    return (
        <div className="w-full">
            <Card className="p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
                    <Progress
                        type="circle"
                        percent={progress}
                        size={progressWidth}
                        strokeColor={progressColor}
                        trailColor={trailColor}
                        showInfo={false}
                        strokeWidth={20}
                    />

                    <div className="mt-3 sm:mt-0">
                        <p className="text-sm sm:text-md font-medium text-gray-700">
                            {title}
                        </p>
                        <Statistic
                            value={count}
                            className="text-base font-semibold"
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DashboardCard;
