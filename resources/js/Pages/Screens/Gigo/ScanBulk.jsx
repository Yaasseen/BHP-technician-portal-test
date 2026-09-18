import React, { useEffect, useState } from "react";
import axios from "axios";
import { Select, Button, message, Tag } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import ScanInput from "../../Components/common/ScanInput";

const ScanBulk = ({ user }) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [locations, setLocations] = useState([]);
    const [locationId, setLocationId] = useState(null);
    const [scannedCodes, setScannedCodes] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // CSC handles GIGO intake/returns but can't hand a job straight to a
    // technician from here - that stays a Team Leader-only action.
    const canTargetTechnicians = user?.Role !== "CSC";

    useEffect(() => {
        axios.get("/gigo-locations?include=technician_basket").then((res) => {
            const data = res.data.data || [];
            setLocations(
                canTargetTechnicians
                    ? data
                    : data.filter((loc) => loc.type !== "technician_basket")
            );
        });
    }, [canTargetTechnicians]);

    const handleScan = (documentNo) => {
        setScannedCodes((prev) =>
            prev.includes(documentNo) ? prev : [...prev, documentNo]
        );
    };

    const removeCode = (code) => {
        setScannedCodes((prev) => prev.filter((c) => c !== code));
    };

    const handleConfirm = async () => {
        if (scannedCodes.length === 0 || !locationId) {
            messageApi.error("Scan at least one job and select a location.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await axios.post("/gigo-movements/scan-bulk", {
                document_nos: scannedCodes,
                location_id: locationId,
            });
            messageApi.success(res.data.message || "Moved successfully.");
            setScannedCodes([]);
        } catch (error) {
            messageApi.error(
                error.response?.data?.error || "Failed to move service orders."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 max-w-xl">
            {contextHolder}
            <ScanInput mode="both" onScan={handleScan} placeholder="Scan job numbers one by one" />

            {scannedCodes.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
                    {scannedCodes.map((code) => (
                        <Tag
                            key={code}
                            closable
                            closeIcon={<CloseCircleOutlined />}
                            onClose={() => removeCode(code)}
                            color="blue"
                        >
                            {code}
                        </Tag>
                    ))}
                </div>
            )}

            <Select
                size="large"
                placeholder="Select target location for all scanned jobs"
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
                disabled={scannedCodes.length === 0 || !locationId}
                onClick={handleConfirm}
            >
                Move {scannedCodes.length || ""} Job(s)
            </Button>
        </div>
    );
};

export default ScanBulk;
