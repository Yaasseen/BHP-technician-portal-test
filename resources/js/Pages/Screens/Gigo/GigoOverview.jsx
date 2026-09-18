import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Table, Input, Tag, Spin, Empty, Segmented } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import moment from "moment";

const GigoOverview = ({ screenContent }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [scope, setScope] = useState("all");

    const load = () => {
        setLoading(true);
        axios
            .get("/gigo-overview")
            .then((res) => setOrders(res.data.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        return orders.filter((order) => {
            if (scope === "desk" && order.location_type === "technician_basket") return false;
            if (scope === "technicians" && order.location_type !== "technician_basket") return false;

            if (!search.trim()) return true;
            const needle = search.trim().toLowerCase();
            return (
                order.document_no?.toLowerCase().includes(needle) ||
                order.name?.toLowerCase().includes(needle) ||
                order.gigo_location_name?.toLowerCase().includes(needle)
            );
        });
    }, [orders, search, scope]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spin />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <Input
                    placeholder="Search document no, customer, or location"
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                    className="max-w-sm"
                />
                <Segmented
                    value={scope}
                    onChange={setScope}
                    options={[
                        { label: `All (${orders.length})`, value: "all" },
                        {
                            label: `At GIGO/Desks (${orders.filter((o) => o.location_type !== "technician_basket").length})`,
                            value: "desk",
                        },
                        {
                            label: `With Technicians (${orders.filter((o) => o.location_type === "technician_basket").length})`,
                            value: "technicians",
                        },
                    ]}
                />
            </div>

            {filtered.length === 0 ? (
                <Empty description="No jobs currently tracked in GIGO" />
            ) : (
                <Table
                    rowKey="document_no"
                    dataSource={filtered}
                    size="small"
                    pagination={{ pageSize: 20 }}
                    scroll={{ x: true }}
                    columns={[
                        {
                            title: "Document No",
                            dataIndex: "document_no",
                            render: (text) => (
                                <a
                                    onClick={() => screenContent?.(text)}
                                    className="font-bold text-red-600 hover:text-red-700"
                                >
                                    {text}
                                </a>
                            ),
                        },
                        { title: "Customer", dataIndex: "name", ellipsis: true },
                        {
                            title: "Currently With",
                            dataIndex: "gigo_location_name",
                            render: (text, record) =>
                                record.location_type === "technician_basket" ? (
                                    <Tag color="blue">{text}</Tag>
                                ) : (
                                    <Tag color="red">{text}</Tag>
                                ),
                        },
                        {
                            title: "Status",
                            dataIndex: "gigo_pending_ack",
                            render: (pending) =>
                                pending ? (
                                    <Tag color="orange">Pending Ack</Tag>
                                ) : (
                                    <Tag color="green">Confirmed</Tag>
                                ),
                        },
                        { title: "Repair Status", dataIndex: "repair_status_code" },
                        {
                            title: "Since",
                            dataIndex: "gigo_location_updated_at",
                            render: (text) => (text ? moment(text).format("DD MMM, HH:mm") : "-"),
                        },
                    ]}
                />
            )}
        </div>
    );
};

export default GigoOverview;
