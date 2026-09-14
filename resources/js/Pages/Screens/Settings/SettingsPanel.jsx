import React, { useEffect, useState } from "react";
import axios from "axios";
import { InputNumber, Button, Table, Select, message, Spin, Card } from "antd";
import { SaveOutlined, SyncOutlined } from "@ant-design/icons";

const PRIORITY_OPTIONS = [
    { label: "LOW", value: "LOW" },
    { label: "MEDIUM", value: "MEDIUM" },
    { label: "HIGH", value: "HIGH" },
];

const SettingsPanel = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cap, setCap] = useState(12);
    const [overdueDays, setOverdueDays] = useState(30);
    const [tiers, setTiers] = useState([]);
    const [syncingTeams, setSyncingTeams] = useState(false);

    const fetchSettings = () => {
        setLoading(true);
        axios
            .get("/app-settings")
            .then((res) => {
                const data = res.data.data;
                setCap(data.outdoor_daily_order_cap);
                setOverdueDays(data.overdue_days_threshold);
                setTiers(data.priority_tiers);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateTier = (index, field, value) => {
        setTiers((prev) =>
            prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier))
        );
    };

    const handleSave = () => {
        setSaving(true);
        axios
            .put("/app-settings", {
                outdoor_daily_order_cap: cap,
                overdue_days_threshold: overdueDays,
                priority_tiers: tiers,
            })
            .then((res) => {
                messageApi.success(res.data.message || "Settings saved.");
            })
            .catch((error) => {
                messageApi.error(
                    error.response?.data?.error || "Failed to save settings."
                );
            })
            .finally(() => setSaving(false));
    };

    const handleSyncTeams = () => {
        setSyncingTeams(true);
        axios
            .post("/allocated-teams/sync")
            .then((res) => {
                messageApi.success(res.data.message || "Teams synced.");
            })
            .catch((error) => {
                messageApi.error(
                    error.response?.data?.error || "Failed to sync teams from Business Central."
                );
            })
            .finally(() => setSyncingTeams(false));
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-3xl">
            {contextHolder}
            <div>
                <p className="sm:text-2xl text-lg font-medium font-sans">Settings</p>
                <p className="text-gray-500 sm:text-md text-xs font-light pt-1">
                    Business rules that used to be hardcoded, now configurable
                    without a deploy.
                </p>
            </div>

            <Card className="rounded-2xl shadow-sm" title="Business Central Sync">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Team List</p>
                        <p className="text-xs text-gray-500">
                            Cached from BC for up to 10 minutes. Sync now to pull the latest teams immediately.
                        </p>
                    </div>
                    <Button
                        icon={<SyncOutlined spin={syncingTeams} />}
                        loading={syncingTeams}
                        onClick={handleSyncTeams}
                    >
                        Sync Teams Now
                    </Button>
                </div>
            </Card>

            <Card className="rounded-2xl shadow-sm" title="Assignment & Overdue Rules">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            Outdoor Daily Order Cap
                        </p>
                        <InputNumber
                            min={1}
                            value={cap}
                            onChange={setCap}
                            addonAfter="orders / team / region / day"
                        />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            Overdue Threshold
                        </p>
                        <InputNumber
                            min={1}
                            value={overdueDays}
                            onChange={setOverdueDays}
                            addonAfter="days"
                        />
                    </div>
                </div>
            </Card>

            <Card className="rounded-2xl shadow-sm" title="Priority Escalation Tiers">
                <Table
                    rowKey={(_, index) => index}
                    dataSource={tiers}
                    pagination={false}
                    size="small"
                    scroll={{ x: 500 }}
                    columns={[
                        {
                            title: "Age (days)",
                            dataIndex: "max_days",
                            render: (value, _, index) =>
                                value === null ? (
                                    <span className="text-gray-500">
                                        {tiers[index - 1]?.max_days}+ days
                                    </span>
                                ) : (
                                    <InputNumber
                                        min={1}
                                        value={value}
                                        onChange={(v) => updateTier(index, "max_days", v)}
                                    />
                                ),
                        },
                        {
                            title: "Priority",
                            dataIndex: "priority",
                            render: (value, _, index) => (
                                <Select
                                    options={PRIORITY_OPTIONS}
                                    value={value}
                                    style={{ width: 140 }}
                                    onChange={(v) => updateTier(index, "priority", v)}
                                />
                            ),
                        },
                        {
                            title: "Weight",
                            dataIndex: "weight",
                            render: (value, _, index) => (
                                <InputNumber
                                    min={1}
                                    value={value}
                                    onChange={(v) => updateTier(index, "weight", v)}
                                />
                            ),
                        },
                    ]}
                />
            </Card>

            <div>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSave}
                >
                    Save Settings
                </Button>
            </div>
        </div>
    );
};

export default SettingsPanel;
