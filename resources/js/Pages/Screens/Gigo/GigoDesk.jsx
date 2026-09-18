import React, { useEffect, useState } from "react";
import axios from "axios";
import { List, Tag, Button, Spin, Empty, message } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const GigoDesk = ({ user }) => {
    const isGigoDesk = user?.Role === "Team Leader" || user?.Role === "Admin";
    const [messageApi, contextHolder] = message.useMessage();
    const [pending, setPending] = useState([]);
    const [acknowledged, setAcknowledged] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busyDocumentNo, setBusyDocumentNo] = useState(null);

    const load = () => {
        setLoading(true);
        axios
            .get("/gigo-desk")
            .then((res) => {
                setPending(res.data.pending || []);
                setAcknowledged(res.data.acknowledged || []);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const acknowledgeOrder = async (documentNo) => {
        setBusyDocumentNo(documentNo);
        try {
            const res = await axios.post("/gigo-movements/acknowledge", {
                document_no: documentNo,
            });
            messageApi.success(res.data.message || "Return acknowledged.");
            load();
        } catch (error) {
            messageApi.error(
                error.response?.data?.error || "Failed to acknowledge return."
            );
        } finally {
            setBusyDocumentNo(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spin />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            {contextHolder}

            <div>
                <h3 className="font-semibold mb-2">
                    {isGigoDesk ? "Pending Acknowledgment" : "Ready for Collection"} ({pending.length})
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                    {isGigoDesk
                        ? "Jobs sitting at GIGO that haven't been confirmed yet - either newly assigned intake or a technician's return."
                        : "Jobs GIGO has finished and sent to Dispatch, waiting for you to collect and hand to the customer."}
                </p>
                {pending.length === 0 ? (
                    <Empty description="Nothing pending" />
                ) : (
                    <List
                        bordered
                        dataSource={pending}
                        renderItem={(order) => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="ack"
                                        type="primary"
                                        size="small"
                                        icon={<CheckCircleOutlined />}
                                        loading={busyDocumentNo === order.document_no}
                                        onClick={() => acknowledgeOrder(order.document_no)}
                                    >
                                        Acknowledge
                                    </Button>,
                                ]}
                            >
                                <div>
                                    <Tag color="orange">{order.document_no}</Tag>
                                    <span>{order.name}</span>
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </div>

            <div>
                <h3 className="font-semibold mb-2">
                    Recently Confirmed ({acknowledged.length})
                </h3>
                {acknowledged.length === 0 ? (
                    <Empty description="Nothing confirmed yet" />
                ) : (
                    <List
                        bordered
                        dataSource={acknowledged.slice(0, 20)}
                        renderItem={(order) => (
                            <List.Item>
                                <div>
                                    <Tag color="green">{order.document_no}</Tag>
                                    <span>{order.name}</span>
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default GigoDesk;
