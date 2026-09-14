import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Spin, Empty } from "antd";
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
import OpsFilterBar from "./OpsFilterBar";
import { statusColor, regionColor } from "../../../utils/opsStatusColors";

const pivot = (rows, groupKey, seriesKey) => {
    const grouped = {};
    const seriesSet = new Set();
    rows.forEach((row) => {
        const key = row[groupKey] || "Unknown";
        const series = row[seriesKey] || "Unknown";
        seriesSet.add(series);
        if (!grouped[key]) grouped[key] = { [groupKey]: key };
        grouped[key][series] = Number(row.count);
    });
    return { data: Object.values(grouped), series: Array.from(seriesSet) };
};

const StackedBarCard = ({ title, data, series, groupKey, colorFn, angle }) => (
    <div className="bg-white rounded-2xl shadow-sm p-4 border">
        <p className="font-semibold text-sm mb-3">{title}</p>
        {data.length === 0 ? (
            <Empty description="No data" />
        ) : (
            <ResponsiveContainer width="100%" height={270}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={groupKey}
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={angle ? -30 : 0}
                        textAnchor={angle ? "end" : "middle"}
                        height={angle ? 70 : 30}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {series.map((s) => (
                        <Bar key={s} dataKey={s} stackId="stack" fill={colorFn(s)} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        )}
    </div>
);

const DepartmentOpsPage = ({ endpoint }) => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState({ dateRange: null, status: [], search: "" });
    const [page, setPage] = useState(1);

    const fetchData = () => {
        setLoading(true);
        const params = { page };
        if (filters.dateRange) {
            params.start = filters.dateRange[0].format("YYYY-MM-DD");
            params.end = filters.dateRange[1].format("YYYY-MM-DD");
        }
        if (filters.status?.length) params.status = filters.status;
        if (filters.search) params.search = filters.search;

        axios
            .get(endpoint, { params })
            .then((res) => setSummary(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, [endpoint, filters, page]);

    if (loading && !summary) {
        return (
            <div className="flex justify-center py-16">
                <Spin size="large" />
            </div>
        );
    }

    const byDay = pivot(summary?.by_day || [], "schedule_date", "status");
    const byTechnician = pivot(summary?.by_technician || [], "technician_name", "status");
    const byRegion = pivot(summary?.by_region || [], "schedule_date", "region");

    return (
        <div className="flex flex-col gap-4">
            <OpsFilterBar filters={filters} onChange={setFilters} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <StackedBarCard
                    title="Allocation status per day"
                    data={byDay.data}
                    series={byDay.series}
                    groupKey="schedule_date"
                    colorFn={statusColor}
                    angle
                />

                <div className="bg-white rounded-2xl shadow-sm p-4 border">
                    <p className="font-semibold text-sm mb-3">List of jobs</p>
                    <Table
                        rowKey="document_no"
                        size="small"
                        scroll={{ x: true }}
                        dataSource={summary?.jobs?.data || []}
                        pagination={{
                            current: summary?.jobs?.current_page || 1,
                            pageSize: summary?.jobs?.per_page || 10,
                            total: summary?.jobs?.total || 0,
                            onChange: setPage,
                        }}
                        columns={[
                            { title: "Document No", dataIndex: "document_no" },
                            { title: "Scheduled Date", dataIndex: "schedule_date" },
                            {
                                title: "Status",
                                dataIndex: "status",
                                render: (v) => (v ? <Tag color={statusColor(v)}>{v}</Tag> : ""),
                            },
                            { title: "Technician Name", dataIndex: "technician_name" },
                        ]}
                    />
                </div>

                <StackedBarCard
                    title="Allocation status per technician"
                    data={byTechnician.data}
                    series={byTechnician.series}
                    groupKey="technician_name"
                    colorFn={statusColor}
                    angle
                />

                <StackedBarCard
                    title="Jobs scheduled per date and region"
                    data={byRegion.data}
                    series={byRegion.series}
                    groupKey="schedule_date"
                    colorFn={regionColor}
                    angle
                />
            </div>
        </div>
    );
};

export default DepartmentOpsPage;
