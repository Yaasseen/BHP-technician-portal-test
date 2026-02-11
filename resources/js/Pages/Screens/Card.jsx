import React, { useEffect, useState } from "react";
import DashboardCard from "../Components/Data/DashboardCard";
import axios from "axios";
import { Spin } from "antd";

export default function Card({ refreshCard }) {
    const [taskData, setTaskData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = () => {
            setLoading(true);
            axios
                .get("/task-statastics")
                .then((response) => {
                    console.log("==>", response.data);
                    setTaskData(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching task statistics:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        };
        setLoading(false);
        fetchData();
    }, [refreshCard]);

    if (loading || !taskData) {
        return (
            <div className="flex justify-center items-center pt-10 ">
                <Spin size="small" />
            </div>
        );
    }

    const data = [
        {
            title: "Total Tasks",
            count: taskData.total_tasks,
            progress: (taskData.total_tasks / taskData.total_tasks) * 100,
            progressColor: "#faad14",
            trailColor: "#FFF7E6",
            trendBgColor: "red",
        },
        {
            title: "Completed Tasks",
            count: taskData.completed_tasks,
            progress: (taskData.completed_tasks / taskData.total_tasks) * 100,
            progressColor: "#52c41a",
            trailColor: "#D9F7BE",
            trendBgColor: "red",
        },
        {
            title: "Active Tasks",
            count: taskData.active_tasks,
            progress: (taskData.active_tasks / taskData.total_tasks) * 100,
            progressColor: "#ff4d4f",
            trailColor: "#FFCCC7",
            trendBgColor: "green",
        },
        {
            title: "Reschedule Tasks",
            count: taskData.reschedule_tasks,
            progress: (taskData.reschedule_tasks / taskData.total_tasks) * 100,
            progressColor: "#faad14",
            trailColor: "#FFF7E6",
            trendBgColor: "green",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
            {data.map((item, index) => (
                <DashboardCard
                    key={index}
                    title={item.title}
                    count={item.count}
                    progress={item.progress}
                    progressColor={item.progressColor}
                    trailColor={item.trailColor}
                    trend={item.trend}
                    trendColor={item.trendBgColor}
                    trendDirection={item.trendDirection}
                    trendText={item.trendText}
                    trendBgColor={item.trendBgColor}
                />
            ))}
        </div>
    );
}

