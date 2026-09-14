import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, Switch, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const LocationsSetup = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchLocations = () => {
        setLoading(true);
        axios
            .get("/gigo-locations")
            .then((res) => setLocations(res.data.data || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleCreate = async (values) => {
        try {
            const res = await axios.post("/gigo-locations", values);
            messageApi.success(res.data.message || "Location created.");
            setModalOpen(false);
            form.resetFields();
            fetchLocations();
        } catch (error) {
            messageApi.error(
                error.response?.data?.error ||
                    Object.values(error.response?.data?.errors || {})[0]?.[0] ||
                    "Failed to create location."
            );
        }
    };

    const handleToggleActive = async (location, isActive) => {
        try {
            await axios.put(`/gigo-locations/${location.id}`, {
                is_active: isActive,
            });
            messageApi.success("Location updated.");
            fetchLocations();
        } catch (error) {
            messageApi.error(error.response?.data?.error || "Failed to update location.");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {contextHolder}
            <div className="flex justify-end">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                >
                    Add Location
                </Button>
            </div>

            <Table
                rowKey="id"
                loading={loading}
                dataSource={locations}
                scroll={{ x: true }}
                columns={[
                    { title: "Name", dataIndex: "name" },
                    { title: "Code", dataIndex: "code" },
                    {
                        title: "Active",
                        dataIndex: "is_active",
                        render: (value, record) => (
                            <Switch
                                checked={value}
                                onChange={(checked) => handleToggleActive(record, checked)}
                            />
                        ),
                    },
                ]}
            />

            <Modal
                open={modalOpen}
                title="Add Location"
                onCancel={() => setModalOpen(false)}
                footer={null}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item
                        name="name"
                        label="Location Name"
                        rules={[{ required: true, message: "Please enter a name" }]}
                    >
                        <Input placeholder="e.g. Outdoor Van 3" />
                    </Form.Item>
                    <Form.Item
                        name="code"
                        label="Code"
                        rules={[
                            { required: true, message: "Please enter a short code" },
                            { pattern: /^[A-Za-z0-9_-]+$/, message: "Letters, numbers, - and _ only" },
                        ]}
                    >
                        <Input placeholder="e.g. VAN3" />
                    </Form.Item>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default LocationsSetup;
