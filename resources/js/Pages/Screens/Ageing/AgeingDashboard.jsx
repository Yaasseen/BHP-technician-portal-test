import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spin, Table, Empty, Modal, Tag } from "antd";
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LabelList,
    ResponsiveContainer,
} from "recharts";
import moment from "moment";
import DashboardCard from "../../Components/Data/DashboardCard";

const BUCKET_COLORS = {
    "0 - 7": "#bbf7d0",
    "8 - 14": "#86efac",
    "15 - 21": "#fca5a5",
    "22 - 30": "#f87171",
    "31 - 60": "#ef4444",
    "> 60": "#b91c1c",
};

const STATUS_PALETTE = [
    "#94a3b8",
    "#fbbf24",
    "#f59e0b",
    "#f97316",
    "#dc2626",
    "#16a34a",
    "#0ea5e9",
    "#8b5cf6",
    "#ec4899",
    "#64748b",
];

const AgeingDashboard = ({ user, screenContent }) => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);

    const [drilldown, setDrilldown] = useState(null);
    const [drilldownLoading, setDrilldownLoading] = useState(false);
    const [drilldownOrders, setDrilldownOrders] = useState([]);

    useEffect(() => {
        axios
            .get("/ageing-summary")
            .then((res) => setSummary(res.data))
            .finally(() => setLoading(false));
    }, []);

    const openDrilldown = ({ title, params }) => {
        setDrilldown({ title });
        setDrilldownLoading(true);
        axios
            .get("/ageing-orders", { params })
            .then((res) => setDrilldownOrders(res.data.orders || []))
            .catch(() => setDrilldownOrders([]))
            .finally(() => setDrilldownLoading(false));
    };

    const closeDrilldown = () => {
        setDrilldown(null);
        setDrilldownOrders([]);
    };

    const handleOrderClick = (documentNo) => {
        if (!screenContent) return;
        closeDrilldown();
        screenContent(documentNo);
    };

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

    const statusOverviewRow = summary.status_overview.reduce(
        (acc, row) => {
            acc[row.status] = row.count;
            return acc;
        },
        { name: "All Jobs" }
    );

    const renderAgeingChart = (title, data, dateField) => (
        <div className="app-card p-4 sm:p-6">
            <p className="font-extrabold text-sm text-slate-800 uppercase tracking-widest mb-4">
                {title}
            </p>
            {data.every((d) => d.count === 0) ? (
                <Empty description="No open jobs" />
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="bucket"
                            tick={{ fontSize: 12, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis hide allowDecimals={false} />
                        <Tooltip
                            cursor={{ fill: "rgba(220,38,38,0.05)" }}
                            formatter={(value) => [value, "Jobs"]}
                        />
                        <Bar
                            dataKey="count"
                            radius={[4, 4, 0, 0]}
                            cursor="pointer"
                            onClick={(entry) =>
                                openDrilldown({
                                    title: `${title} — ${entry.bucket} days`,
                                    params: { bucket: entry.bucket, date_field: dateField },
                                })
                            }
                        >
                            <LabelList
                                dataKey="count"
                                position="top"
                                style={{ fontWeight: 800, fontSize: 13, fill: "#1e293b" }}
                            />
                            {data.map((entry) => (
                                <Cell key={entry.bucket} fill={BUCKET_COLORS[entry.bucket]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mt-1">
                Ageing Bucket (Days)
            </p>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 w-full">
            <div>
                <p className="sm:text-2xl text-lg font-black font-sans text-slate-900 tracking-tight">
                    Ageing Dashboard
                </p>
                <p className="text-gray-500 sm:text-sm text-xs font-medium pt-1">
                    Open jobs grouped by age. Click any bar to see the related order numbers.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <DashboardCard title="Total Open Jobs" count={summary.total_open} />
                <DashboardCard title="Average Age" count={`${summary.average_age}d`} />
                <DashboardCard title="Total Unassigned" count={summary.total_unassigned} />
                <DashboardCard
                    title="Data As At"
                    count={moment(summary.data_as_at).format("DD MMM, HH:mm")}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderAgeingChart(
                    "Order Date — Ageing of Jobs",
                    summary.order_date_ageing,
                    "order_date"
                )}
                {renderAgeingChart(
                    "Last Modified — Ageing of Jobs",
                    summary.last_modified_ageing,
                    "updated_at"
                )}
            </div>

            <div className="app-card p-4 sm:p-6">
                <p className="font-extrabold text-sm text-slate-800 uppercase tracking-widest mb-4">
                    Overview of Jobs by Status
                </p>
                {summary.status_overview.length === 0 ? (
                    <Empty description="No open jobs" />
                ) : (
                    <ResponsiveContainer width="100%" height={110}>
                        <BarChart
                            data={[statusOverviewRow]}
                            layout="vertical"
                            margin={{ top: 8, bottom: 8 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" hide />
                            <Tooltip cursor={{ fill: "rgba(220,38,38,0.05)" }} />
                            {summary.status_overview.map((row, idx) => (
                                <Bar
                                    key={row.status}
                                    dataKey={row.status}
                                    stackId="status"
                                    fill={STATUS_PALETTE[idx % STATUS_PALETTE.length]}
                                    cursor="pointer"
                                    onClick={() =>
                                        openDrilldown({
                                            title: `Status — ${row.status}`,
                                            params: { status: row.status },
                                        })
                                    }
                                >
                                    <LabelList
                                        dataKey={row.status}
                                        position="center"
                                        formatter={(value) => (value > 0 ? value : "")}
                                        style={{ fontWeight: 800, fontSize: 12, fill: "#fff" }}
                                    />
                                </Bar>
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
                <div className="flex flex-wrap gap-3 mt-3">
                    {summary.status_overview.map((row, idx) => (
                        <div key={row.status} className="flex items-center gap-1.5">
                            <span
                                className="w-2.5 h-2.5 inline-block"
                                style={{ backgroundColor: STATUS_PALETTE[idx % STATUS_PALETTE.length] }}
                            ></span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                {row.status} ({row.count})
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                title={drilldown?.title}
                open={!!drilldown}
                onCancel={closeDrilldown}
                footer={null}
                width={800}
            >
                {drilldownLoading ? (
                    <div className="flex justify-center py-10">
                        <Spin />
                    </div>
                ) : (
                    <Table
                        rowKey="document_no"
                        dataSource={drilldownOrders}
                        size="small"
                        pagination={{ pageSize: 10 }}
                        columns={[
                            {
                                title: "Document No",
                                dataIndex: "document_no",
                                render: (text) => (
                                    <a
                                        onClick={() => handleOrderClick(text)}
                                        className="font-bold text-red-600 hover:text-red-700"
                                    >
                                        {text}
                                    </a>
                                ),
                            },
                            { title: "Customer", dataIndex: "name", ellipsis: true },
                            {
                                title: "Status",
                                dataIndex: "repair_status_code",
                                render: (text) => <Tag color="red">{text || "Unknown"}</Tag>,
                            },
                            {
                                title: "Order Date",
                                dataIndex: "order_date",
                                render: (text) => (text ? moment(text).format("DD MMM YYYY") : "-"),
                            },
                            { title: "Age (days)", dataIndex: "age_days", width: 100 },
                        ]}
                    />
                )}
            </Modal>
        </div>
    );
};

export default AgeingDashboard;
