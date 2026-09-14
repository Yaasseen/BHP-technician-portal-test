import React, { useEffect, useState } from "react";
import axios from "axios";
import { Select, Button, message, Tag, Descriptions } from "antd";
import ScanInput from "../../Components/common/ScanInput";

const ScanSingle = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [locations, setLocations] = useState([]);
    const [locationId, setLocationId] = useState(null);
    const [scannedOrder, setScannedOrder] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        axios.get("/gigo-locations?include=technician_basket").then((res) => {
            setLocations(res.data.data || []);
        });
    }, []);

    const handleScan = (documentNo) => {
        setScannedOrder({ document_no: documentNo });
    };

    const handleConfirm = async () => {
        if (!scannedOrder || !locationId) {
            messageApi.error("Scan a job and select a location first.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await axios.post("/gigo-movements/scan", {
                document_no: scannedOrder.document_no,
                location_id: locationId,
            });
            messageApi.success(res.data.message || "Moved successfully.");
            setScannedOrder(null);
        } catch (error) {
            messageApi.error(
                error.response?.data?.error || "Failed to move service order."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 max-w-xl">
            {contextHolder}
            <ScanInput mode="both" onScan={handleScan} />

            {scannedOrder && (
                <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Scanned Job">
                        <Tag color="blue">{scannedOrder.document_no}</Tag>
                    </Descriptions.Item>
                </Descriptions>
            )}

            <Select
                size="large"
                placeholder="Select target location"
                options={locations.map((loc) => ({
                    label: loc.name,
                    value: loc.id,
                }))}
                value={locationId}
                onChange={setLocationId}
            />

            <Button
                type="primary"
                size="large"
                loading={submitting}
                disabled={!scannedOrder || !locationId}
                onClick={handleConfirm}
            >
                Confirm Move
            </Button>
        </div>
    );
};

export default ScanSingle;
