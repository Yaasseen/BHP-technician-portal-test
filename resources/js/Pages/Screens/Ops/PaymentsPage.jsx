import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Spin, Input } from "antd";
import { statusColor } from "../../../utils/opsStatusColors";

const PaymentsPage = () => {
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        const params = { page };
        if (search) params.search = search;

        axios
            .get("/ops-dashboard/payments", { params })
            .then((res) => setJobs(res.data.jobs))
            .finally(() => setLoading(false));
    }, [search, page]);

    return (
        <div className="flex flex-col gap-4">
            <p className="text-gray-500 text-sm">
                Jobs scheduled today whose latest activity mentions "payment".
            </p>

            <div className="border rounded-md px-3 py-2 max-w-xs">
                <p className="text-xs text-gray-400 mb-1">document_no</p>
                <Input
                    variant="borderless"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 border">
                {loading && !jobs ? (
                    <div className="flex justify-center py-16">
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        rowKey="document_no"
                        size="small"
                        scroll={{ x: true }}
                        dataSource={jobs?.data || []}
                        pagination={{
                            current: jobs?.current_page || 1,
                            pageSize: jobs?.per_page || 10,
                            total: jobs?.total || 0,
                            onChange: setPage,
                        }}
                        columns={[
                            { title: "Document No", dataIndex: "document_no" },
                            { title: "Name", dataIndex: "name" },
                            { title: "Scheduled Date", dataIndex: "schedule_date" },
                            { title: "Region", dataIndex: "region" },
                            {
                                title: "Status",
                                dataIndex: "status",
                                render: (v) => (v ? <Tag color={statusColor(v)}>{v}</Tag> : ""),
                            },
                            { title: "Technician Name", dataIndex: "technician_name" },
                        ]}
                    />
                )}
            </div>
        </div>
    );
};

export default PaymentsPage;
