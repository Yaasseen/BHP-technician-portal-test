import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Empty, Spin } from "antd";

const LocationContents = ({ locationId }) => {
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
        <Table
            rowKey="document_no"
            dataSource={orders}
            scroll={{ x: true }}
            size="small"
            columns={[
                { title: "Document No", dataIndex: "document_no" },
                { title: "Customer", dataIndex: "name" },
                { title: "Repair Status", dataIndex: "repair_status_code" },
                { title: "Technician", dataIndex: "technician_name" },
            ]}
        />
    );
};

export default LocationContents;
