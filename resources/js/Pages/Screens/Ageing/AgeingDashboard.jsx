import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spin, Table, Empty } from "antd";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import DashboardCard from "../../Components/Data/DashboardCard";

const BUCKETS = ["0-3 days", "4-7 days", "8-14 days", "15-30 days", "31+ days"];
const BUCKET_COLORS = {
    "0-3 days": "#52c41a",
    "4-7 days": "#faad14",
    "8-14 days": "#fa8c16",
    "15-30 days": "#f5222d",
    "31+ days": "#820014",
};

const pivotByBucket = (rows, groupKey) => {
    const grouped = {};
    rows.forEach((row) => {
        const key = row[groupKey] || "Unknown";
        if (!grouped[key]) {
            grouped[key] = { [groupKey]: key };
            BUCKETS.forEach((b) => (grouped[key][b] = 0));
        }
        grouped[key][row.bucket] = Number(row.count);
    });
    return Object.values(grouped);
};

const AgeingDashboard = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        axios
            .get("/ageing-summary")
            .then((res) => setSummary(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Spin size="large" />
            </div>
        );
    }

    if (!summary) {
        return <Empty description="Unable to load ageing data" />;
    }

    const byStatusData = pivotByBucket(summary.by_status, "repair_status_code");
    const unassignedData = pivotByBucket(
        summary.unassigned.map((r) => ({ ...r, group: "Unassigned" })),
        "group"
    );

    const statusTableRows = Object.values(
        summary.by_status.reduce((acc, row) => {
            const key = row.repair_status_code || "Unknown";
            if (!acc[key]) {
                acc[key] = { repair_status_code: key, count: 0 };
            }
            acc[key].count += Number(row.count);
            return acc;
        }, {})
    ).sort((a, b) => b.count - a.count);

    return (
        <div className="flex flex-col gap-6 w-full">
            <div>
                <p className="sm:text-2xl text-lg font-medium font-sans">
                    Ageing Dashboard
                </p>
                <p className="text-gray-500 sm:text-md text-xs font-light pt-1">
                    Open jobs grouped by repair status and how long they've
                    been open.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DashboardCard
                    title="Total Open Jobs"
                    count={summary.total_open}
                    progress={100}
                    progressColor="#4f46e5"
                    trailColor="#e0e7ff"
                />
                <DashboardCard
                    title="Total Unassigned"
                    count={summary.total_unassigned}
                    progress={
                        summary.total_open
                            ? Math.round(
                                  (summary.total_unassigned /
                                      summary.total_open) *
                                      100
                              )
                            : 0
                    }
                    progressColor="#fa8c16"
                    trailColor="#fff7e6"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="font-semibold text-base mb-4">
                    Jobs by Repair Status &amp; Age
                </p>
                {byStatusData.length === 0 ? (
                    <Empty description="No open jobs" />
                ) : (
                    <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={byStatusData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="repair_status_code"
                                interval={0}
                                angle={-30}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            {BUCKETS.map((bucket) => (
                                <Bar
                                    key={bucket}
                                    dataKey={bucket}
                                    stackId="age"
                                    fill={BUCKET_COLORS[bucket]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="font-semibold text-base mb-4">
                    Unassigned Jobs by Age
                </p>
                {summary.total_unassigned === 0 ? (
                    <Empty description="No unassigned jobs" />
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={unassignedData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis type="category" dataKey="group" width={90} />
                            <Tooltip />
                            <Legend />
                            {BUCKETS.map((bucket) => (
                                <Bar
                                    key={bucket}
                                    dataKey={bucket}
                                    stackId="age"
                                    fill={BUCKET_COLORS[bucket]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="font-semibold text-base mb-4">
                    Totals by Repair Status
                </p>
                <Table
                    rowKey="repair_status_code"
                    dataSource={statusTableRows}
                    size="small"
                    pagination={false}
                    scroll={{ y: 300 }}
                    columns={[
                        {
                            title: "Repair Status",
                            dataIndex: "repair_status_code",
                        },
                        { title: "Total Jobs", dataIndex: "count", width: 120 },
                    ]}
                />
            </div>
        </div>
    );
};

export default AgeingDashboard;
