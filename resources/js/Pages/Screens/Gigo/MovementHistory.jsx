import React, { useState } from "react";
import axios from "axios";
import { Input, Button, Timeline, Empty, message, Spin } from "antd";

const MovementHistory = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [documentNo, setDocumentNo] = useState("");
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchHistory = async () => {
        if (!documentNo.trim()) return;
        setLoading(true);
        try {
            const res = await axios.get(`/gigo-movements/history/${documentNo.trim()}`);
            setHistory(res.data.data || []);
        } catch (error) {
            messageApi.error(
                error.response?.data?.error || "Failed to load history."
            );
            setHistory(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 max-w-xl">
            {contextHolder}
            <div className="flex gap-2">
                <Input
                    size="large"
                    placeholder="Enter or scan a job number"
                    value={documentNo}
                    onChange={(e) => setDocumentNo(e.target.value)}
                    onPressEnter={fetchHistory}
                />
                <Button size="large" type="primary" onClick={fetchHistory}>
                    Search
                </Button>
            </div>

            {loading && (
                <div className="flex justify-center py-8">
                    <Spin />
                </div>
            )}

            {!loading && history && history.length === 0 && (
                <Empty description="No movement history for this job yet." />
            )}

            {!loading && history && history.length > 0 && (
                <Timeline
                    items={history.map((movement) => ({
                        children: (
                            <div>
                                <p className="font-medium">
                                    {movement.from_location_name || "—"} →{" "}
                                    {movement.to_location_name}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {movement.move_type} · by{" "}
                                    {movement.moved_by_name || "System"} ·{" "}
                                    {movement.created_at}
                                </p>
                            </div>
                        ),
                    }))}
                />
            )}
        </div>
    );
};

export default MovementHistory;
