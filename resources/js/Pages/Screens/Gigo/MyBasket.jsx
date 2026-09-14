import React, { useEffect, useState } from "react";
import axios from "axios";
import { List, Tag, Button, Spin, Empty, message } from "antd";
import { CheckCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import ScanInput from "../../Components/common/ScanInput";

const MyBasket = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [pending, setPending] = useState([]);
    const [acknowledged, setAcknowledged] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busyDocumentNo, setBusyDocumentNo] = useState(null);

    const load = () => {
        setLoading(true);
        axios
            .get("/gigo-my-basket")
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
            messageApi.success(res.data.message || "Receipt acknowledged.");
            load();
        } catch (error) {
            messageApi.error(
                error.response?.data?.error || "Failed to acknowledge receipt."
            );
        } finally {
            setBusyDocumentNo(null);
        }
    };

    const returnOrderToGigo = async (documentNo) => {
        setBusyDocumentNo(documentNo);
        try {
            const res = await axios.post("/gigo-movements/return-to-gigo", {
                document_no: documentNo,
            });
            messageApi.success(res.data.message || "Order returned to GIGO.");
            load();
        } catch (error) {
            messageApi.error(
                error.response?.data?.error || "Failed to return order to GIGO."
            );
        } finally {
            setBusyDocumentNo(null);
        }
    };

    const handleScan = (documentNo) => {
        if (pending.some((order) => order.document_no === documentNo)) {
            acknowledgeOrder(documentNo);
        } else if (acknowledged.some((order) => order.document_no === documentNo)) {
            returnOrderToGigo(documentNo);
        } else {
            messageApi.error("That job isn't in your basket.");
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
                <h3 className="font-semibold mb-2">Scan a Job</h3>
                <p className="text-xs text-gray-500 mb-2">
                    Scanning a pending item acknowledges receipt. Scanning an
                    acknowledged item returns it to GIGO.
                </p>
                <ScanInput mode="both" onScan={handleScan} />
            </div>

            <div>
                <h3 className="font-semibold mb-2">
                    Pending Acknowledgment ({pending.length})
                </h3>
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
                    Acknowledged ({acknowledged.length})
                </h3>
                {acknowledged.length === 0 ? (
                    <Empty description="No acknowledged items" />
                ) : (
                    <List
                        bordered
                        dataSource={acknowledged}
                        renderItem={(order) => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="return"
                                        size="small"
                                        icon={<RollbackOutlined />}
                                        loading={busyDocumentNo === order.document_no}
                                        onClick={() => returnOrderToGigo(order.document_no)}
                                    >
                                        Return to GIGO
                                    </Button>,
                                ]}
                            >
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

export default MyBasket;
