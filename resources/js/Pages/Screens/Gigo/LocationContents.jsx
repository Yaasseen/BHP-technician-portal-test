import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Empty, Spin, Button, Tag } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { exportToExcel } from "../../../utils/exportToExcel";

const exportColumns = [
    { header: "Document No", key: "document_no" },
    { header: "Customer", key: "name" },
    { header: "Repair Status", key: "repair_status_code" },
    { header: "Technician", key: "technician_name" },
];

const LocationContents = ({ locationId, screenContent }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!locationId) return;
        setLoading(true);
        axios
            .get(`/gigo-locations/${locationId}/contents`)
            .then((res) => setOrders(res.data.data || []))
            .finally(() => setLoading(false));
    }, [locationId]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spin />
            </div>
        );
    }

    if (orders.length === 0) {
        return <Empty description="No jobs at this location" />;
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-end">
                <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() =>
                        exportToExcel("gigo-location", exportColumns, orders)
                    }
                >
                    Export to Excel
                </Button>
            </div>
            <Table
                rowKey="document_no"
                dataSource={orders}
                scroll={{ x: true }}
                size="small"
                columns={[
                    {
                        title: "Document No",
                        dataIndex: "document_no",
                        render: (text) =>
                            screenContent ? (
                                <a
                                    onClick={() => screenContent(text)}
                                    className="font-bold text-red-600 hover:text-red-700"
                                >
                                    {text}
                                </a>
                            ) : (
                                text
                            ),
                    },
                    { title: "Customer", dataIndex: "name" },
                    { title: "Repair Status", dataIndex: "repair_status_code" },
                    { title: "Technician", dataIndex: "technician_name" },
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
                ]}
            />
        </div>
    );
};

export default LocationContents;
