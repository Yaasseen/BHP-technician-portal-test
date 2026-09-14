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
import { statusColor } from "../../../utils/opsStatusColors";

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

const StackedBarCard = ({ title, data, series, groupKey }) => (
    <div className="bg-white rounded-2xl shadow-sm p-4 border">
        <p className="font-semibold text-sm mb-3">{title}</p>
        {data.length === 0 ? (
            <Empty description="No data" />
        ) : (
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={groupKey}
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={70}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {series.map((s) => (
                        <Bar key={s} dataKey={s} stackId="stack" fill={statusColor(s)} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        )}
    </div>
);

const TechnicianPerformancePage = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState({ dateRange: null, status: [], search: "" });
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        const params = { page };
        if (filters.dateRange) {
            params.start = filters.dateRange[0].format("YYYY-MM-DD");
            params.end = filters.dateRange[1].format("YYYY-MM-DD");
        }
        if (filters.status?.length) params.status = filters.status;
        if (filters.search) params.search = filters.search;

        axios
            .get("/ops-dashboard/technician-performance", { params })
            .then((res) => setSummary(res.data))
            .finally(() => setLoading(false));
    }, [filters, page]);

    if (loading && !summary) {
        return (
            <div className="flex justify-center py-16">
                <Spin size="large" />
            </div>
        );
    }

    const byTechnician = pivot(summary?.by_technician || [], "technician_name", "status");
    const byAllocationDate = pivot(summary?.by_allocation_date || [], "allocation_date", "status");

    return (
        <div className="flex flex-col gap-4">
            <OpsFilterBar filters={filters} onChange={setFilters} />

            <StackedBarCard
                title="Allocation Status per day (by technician)"
                data={byTechnician.data}
                series={byTechnician.series}
                groupKey="technician_name"
            />

            <StackedBarCard
                title="Allocation Status per day (by allocation date)"
                data={byAllocationDate.data}
                series={byAllocationDate.series}
                groupKey="allocation_date"
            />

            <div className="bg-white rounded-2xl shadow-sm p-4 border">
                <p className="font-semibold text-sm mb-3">List of Jobs</p>
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
                        { title: "Allocation Date", dataIndex: "allocation_date" },
                        {
                            title: "Status",
                            dataIndex: "status",
                            render: (v) => (v ? <Tag color={statusColor(v)}>{v}</Tag> : ""),
                        },
                        { title: "Technician Name", dataIndex: "technician_name" },
                    ]}
                />
            </div>
        </div>
    );
};

export default TechnicianPerformancePage;
