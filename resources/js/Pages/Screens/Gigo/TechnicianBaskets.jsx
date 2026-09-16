import React, { useEffect, useState } from "react";
import axios from "axios";
import { List, Card, Empty, Spin } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import LocationContents from "./LocationContents";

const TechnicianBaskets = () => {
    const [baskets, setBaskets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        axios
            .get("/gigo-locations?include=technician_basket")
            .then((res) => {
                const all = res.data.data || [];
                setBaskets(all.filter((loc) => loc.type === "technician_basket"));
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spin />
            </div>
        );
    }

    if (baskets.length === 0) {
        return <Empty description="No technician baskets yet — assign a technician to a job first." />;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:w-1/3">
                <List
                    bordered
                    dataSource={baskets}
                    renderItem={(basket) => (
                        <List.Item
                            className={`cursor-pointer ${
                                selected === basket.id ? "bg-red-50" : ""
                            }`}
                            onClick={() => setSelected(basket.id)}
                        >
                            <InboxOutlined className="mr-2" />
                            {basket.name}
                        </List.Item>
                    )}
                />
            </div>
            <div className="flex-1">
                {selected ? (
                    <LocationContents locationId={selected} />
                ) : (
                    <Card>
                        <Empty description="Select a technician basket to view its jobs" />
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TechnicianBaskets;
