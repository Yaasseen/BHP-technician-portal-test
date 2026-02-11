import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Select, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";

const AssignRegion = ({ taskId, formResponse }) => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [taskCode, setTaskCode] = useState([]);
    const [technicianRegion, setTechniciansRegion] = useState([]);
    const [department, setDepartment] = useState([]);

    console.log("==>", department);
    // Get Technicians List
    useEffect(() => {
        const fetchTechnicians = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/region-list");
                const RegionData = Object.values(response.data).map(
                    (region) => ({
                        region: region,
                    })
                );
                setTechnicians(RegionData);
            } catch (error) {
                console.error("Error fetching technician list", error);
            }
            setLoading(false);
        };
        fetchTechnicians();
    }, []);

    useEffect(() => {
        const fetchDeptCode = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/allocated-teams");
                console.log("==>", response);

                if (Array.isArray(response.data)) {
                    const DeptCode = response.data.map((item) => item);
                    const Departments = [...new Set(DeptCode)];
                    setDepartment(Departments);
                } else {
                    console.error(
                        "Unexpected response structure:",
                        response.data
                    );
                }
            } catch (error) {
                console.error("Error fetching technician list", error);
            }
            setLoading(false);
        };
        fetchDeptCode();
    }, []);

    useEffect(() => {
        if (taskId) {
            form.setFieldsValue({
                document_no: taskId,
            });
        }
    }, [taskId]);

    const handleRegionChange = (region) => {
        const filtered = technicians.filter(
            (technicians) => technicians.region === region
        );
        setTechniciansRegion(filtered);
    };

    const handleSubmit = async (values) => {
        setSubmitLoading(true);
        try {
            const response = await axios.put(
                `/service-orders/department-region/${taskId}`,
                values
            );
            if (response?.data?.message) {
                const successMessage = response.data.message;
                messageApi.open({
                    type: "success",
                    content: successMessage,
                });

                form.resetFields();
                formResponse();
            }
        } catch (error) {
            const errorMessage = error.message;
            messageApi.open({
                type: "error",
                content: errorMessage,
            });
        }
        setSubmitLoading(false);
    };

    const [form] = Form.useForm();

    return (
        <div className="pt-5">
            {contextHolder}
            <div className="form-container sm:p-5 bg-white ">
                <h1 className="font-semibold text-xl pb-5 border-b">
                    Assign Region and Team
                </h1>
                <Form
                    form={form}
                    layout="vertical"
                    className="pt-5"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="document_no"
                        label="Document No"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the Document ID",
                            },
                        ]}
                    >
                        <Input disabled placeholder="Enter Document ID" />
                    </Form.Item>

                    <Form.Item
                        name="region"
                        label="Region"
                        rules={[
                            {
                                required: true,
                                message: "Please select Region/Department",
                            },
                        ]}
                    >
                        <Select
                            loading={loading}
                            placeholder="Select Region"
                            onChange={handleRegionChange}
                            options={
                                !loading
                                    ? Array.from(
                                        new Set(
                                            technicians.map(
                                                (tech) => tech.region
                                            )
                                        )
                                    ).map((region) => ({
                                        label: region,
                                        value: region,
                                    }))
                                    : []
                            }
                            notFoundContent={
                                loading ? (
                                    <div className="flex justify-center">
                                        <Spin size="small" />
                                    </div>
                                ) : (
                                    "No regions available"
                                )
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="department"
                        label="Team"
                        rules={[
                            {
                                required: true,
                                message: "Please select a Team",
                            },
                        ]}
                    >
                        <Select
                            loading={loading}
                            placeholder="Select Team"
                            options={
                                !loading
                                    ? department.map((dept, index) => ({
                                        key: index,
                                        label: dept[0],
                                        value: dept[0],
                                    }))
                                    : []
                            }
                            notFoundContent={
                                loading ? (
                                    <div className="flex justify-center">
                                        <Spin size="small" />
                                    </div>
                                ) : (
                                    "No teams available"
                                )
                            }
                        />
                    </Form.Item>

                    <div className="flex justify-end">
                        <Form.Item>
                            <Button type="text" onClick={formResponse}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="bg-indigo-600 border-none hover:bg-indigo-700 h-10 font-bold shadow-md shadow-indigo-100"
                            >
                                {submitLoading ? (
                                    <div className="px-3 py-2">
                                        <Spin
                                            indicator={
                                                <LoadingOutlined
                                                    spin
                                                    className="text-white"
                                                />
                                            }
                                        />
                                    </div>
                                ) : (
                                    "Save"
                                )}
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default AssignRegion;
