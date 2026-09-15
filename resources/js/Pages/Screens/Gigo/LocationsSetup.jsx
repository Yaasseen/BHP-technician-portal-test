import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, Switch, Select, Tag, message } from "antd";
import { PlusOutlined, UserAddOutlined } from "@ant-design/icons";

const LocationsSetup = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();

    const [technicians, setTechnicians] = useState([]);
    const [technicianModalOpen, setTechnicianModalOpen] = useState(false);
    const [selectedTechnicianIds, setSelectedTechnicianIds] = useState([]);
    const [assigning, setAssigning] = useState(false);

    const fetchLocations = () => {
        setLoading(true);
        axios
            .get("/gigo-locations?include=technician_basket")
            .then((res) => setLocations(res.data.data || []))
            .finally(() => setLoading(false));
    };

    const fetchTechnicians = () => {
        axios
            .get("/technician-list")
            .then((res) => {
                const list = Object.values(res.data || {});
                setTechnicians(list);
            })
            .catch(() => {
                messageApi.error("Failed to load technician list.");
            });
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

    const openTechnicianModal = () => {
        setSelectedTechnicianIds([]);
        fetchTechnicians();
        setTechnicianModalOpen(true);
    };

    const existingBasketTechnicianIds = new Set(
        locations
            .filter((loc) => loc.type === "technician_basket")
            .map((loc) => loc.technician_id)
    );

    const handleAssignBaskets = async () => {
        if (selectedTechnicianIds.length === 0) {
            messageApi.error("Select at least one technician.");
            return;
        }

        setAssigning(true);
        try {
            const res = await axios.post("/gigo-locations/technician-baskets", {
                technician_ids: selectedTechnicianIds,
            });
            messageApi.success(res.data.message || "Baskets created.");
            setTechnicianModalOpen(false);
            fetchLocations();
        } catch (error) {
            messageApi.error(
                error.response?.data?.error || "Failed to create technician baskets."
            );
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {contextHolder}
            <div className="flex justify-end gap-2">
                <Button icon={<UserAddOutlined />} onClick={openTechnicianModal}>
                    Assign to Technician
                </Button>
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
                        title: "Type",
                        dataIndex: "type",
                        render: (type) =>
                            type === "technician_basket" ? (
                                <Tag color="blue">Technician Basket</Tag>
                            ) : (
                                <Tag>Static</Tag>
                            ),
                    },
                    {
                        title: "Active",
                        dataIndex: "is_active",
                        render: (value, record) =>
                            record.type === "technician_basket" ? (
                                <Tag color="green">Active</Tag>
                            ) : (
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

            <Modal
                open={technicianModalOpen}
                title="Assign Baskets to Technicians"
                onCancel={() => setTechnicianModalOpen(false)}
                footer={null}
                centered
            >
                <p className="text-gray-500 text-sm mb-3">
                    Pick technicians from the BC technician list. A basket is
                    created automatically for each one you select (existing
                    baskets are left as-is).
                </p>
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Select technicians"
                    value={selectedTechnicianIds}
                    onChange={setSelectedTechnicianIds}
                    optionFilterProp="label"
                    options={technicians.map((tech) => ({
                        value: tech.ID,
                        label: `${tech.ID} : ${tech.First_Name || ""} ${tech.Last_Name || ""}`.trim(),
                        disabled: existingBasketTechnicianIds.has(tech.ID),
                    }))}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setTechnicianModalOpen(false)}>Cancel</Button>
                    <Button type="primary" loading={assigning} onClick={handleAssignBaskets}>
                        Create Baskets
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default LocationsSetup;
