import { Button, Form, Select, InputNumber, Spin, message, Input } from "antd";
import React, { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";

function SparePartForm({
    document_no,
    formResponse,
    reloadList,
    sparePartsData,
    loadingState,
    locationOptions,
    handleSparePart,
    serviceItemNo,
}) {
    const [form] = Form.useForm();
    const [spareParts, setSpareParts] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState("");

    const handleUpload = (values) => {
        const selectedPart = spareParts.find(
            (part) => part.value === values.spare_part_no
        );

        const consumerMapping = {
            0: " ",
            1: "B2B",
            2: "B&D",
            3: "Panasonic",
            4: "Retail",
            5: "Samsung",
            6: "Ext Supplier",
            7: "Individual Customer",
        };
        const consumerLabel = consumerMapping[values.consumer_code] || "N/A";

        const data = {
            ...values,
            document_no,
            description: selectedPart?.description || "N/A",
            consumer: consumerLabel,
            service_item_no: serviceItemNo,
        };

        setSubmitLoading(true);
        axios
            .post("/spare-part-request", data)
            .then((response) => {
                messageApi.open({
                    type: "success",
                    content: response?.data?.message,
                });
                form.resetFields();
                setSelectedDescription("");
                formResponse();
                setSubmitLoading(false);
                handleSparePart();
            })
            .catch((error) => {
                console.error("API Error:", error);
                const errorMessage =
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Something went wrong. Please try again.";
                messageApi.open({
                    type: "error",
                    content: errorMessage,
                });

                setSubmitLoading(false);
                handleSparePart();
            });

        reloadList();
    };

    useEffect(() => {
        const formattedParts = sparePartsData.map((part) => ({
            ...part,
            label: `${part.value} - ${part.description}`,
        }));
        setSpareParts(formattedParts);
        setLoading(loadingState);
    }, [sparePartsData, loadingState]);

    const handleCancel = () => {
        form.resetFields();
        formResponse();
    };

    return (
        <div className="p-4">
            {contextHolder}
            <Form
                form={form}
                onFinish={handleUpload}
                layout="vertical"
                className="space-y-4"
            >
                <Form.Item
                    label="Spare Part List"
                    name="spare_part_no"
                    rules={[
                        {
                            required: true,
                            message: "Please select a location code",
                        },
                    ]}
                >
                    <Select
                        showSearch
                        options={spareParts}
                        loading={loading}
                        placeholder="Select a spare part"
                        onChange={(value) => {
                            const selectedPart = spareParts.find(
                                (part) => part.value === value
                            );
                            setSelectedDescription(
                                selectedPart?.description || ""
                            );
                        }}
                        filterOption={(input, option) =>
                            option?.label
                                ?.toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        notFoundContent={
                            loading ? (
                                <div className="flex justify-center ">
                                    <Spin size="small" />
                                </div>
                            ) : (
                                "No spare parts available"
                            )
                        }
                    />
                </Form.Item>

                {/* Selected Description Field */}
                <Form.Item label="Selected Description">
                    <Input value={selectedDescription} disabled readOnly />
                </Form.Item>

                <Form.Item label="Service Item No">
                    <Input defaultValue={serviceItemNo} disabled readOnly />
                </Form.Item>

                <Form.Item
                    label="location code"
                    name="location_code"
                    rules={[
                        {
                            required: true,
                            message: "Please select the location code ",
                        },
                    ]}
                >
                    <Select
                        showSearch
                        //options={spareParts}
                        loading={loading}
                        options={locationOptions}
                        placeholder="Select location code"
                    />
                </Form.Item>
                <Form.Item
                    label="Consumer Code"
                    name="consumer_code"
                    rules={[
                        {
                            required: true,
                            message: "Please select the Business Type",
                        },
                    ]}
                >
                    <Select placeholder="Select Consumer Code">
                        <Select.Option value={0}>" "</Select.Option>
                        <Select.Option value={1}>B2B</Select.Option>
                        <Select.Option value={2}>B&D</Select.Option>
                        <Select.Option value={3}>Panasonic</Select.Option>
                        <Select.Option value={4}>Retail</Select.Option>
                        <Select.Option value={5}>Samsung</Select.Option>
                        <Select.Option value={6}>Ext Supplier</Select.Option>
                        <Select.Option value={7}>
                            Individual Customer
                        </Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Quantity"
                    name="quantity"
                    rules={[
                        {
                            required: true,
                            message: "Please enter the quantity",
                        },
                        {
                            type: "number",
                            min: 1,
                            message: "Quantity must be at least 1",
                        },
                    ]}
                >
                    <InputNumber placeholder="Quantity" min={1} />
                </Form.Item>
                <div className="flex justify-end space-x-2">
                    <Button type="text" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        disabled={submitLoading}
                        htmlType="submit"
                        className="bg-emerald-600 text-white hover:bg-emerald-700 border-none h-10 font-bold px-6 shadow-md shadow-emerald-100"
                    >
                        {submitLoading ? (
                            <div className=" px-7 py-1">
                                <Spin indicator={<LoadingOutlined spin className="text-white" />} />
                            </div>
                        ) : (
                            "Submit request"
                        )}
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default SparePartForm;
