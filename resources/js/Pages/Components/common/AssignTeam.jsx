import React, { useEffect, useState } from "react";
import { Button, DatePicker, Form, Input, message, Select, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import useMessage from "antd/es/message/useMessage";

const AssignTeam = ({ taskId, formResponse, selectedOrders, taskStatus }) => {
    const [technicians, setTechnicians] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [taskCode, setTaskCode] = useState([]);
    const [technicianRegion, setTechniciansRegion] = useState([]);

    console.log("==>", selectedOrders);

    // Get Technicians List
    useEffect(() => {
        const fetchTechnicians = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/technician-list");
                console.log("==>", response);

                const technicianData = Object.values(response.data).map(
                    (technician) => ({
                        id: technician.ID,
                        name: `${technician.First_Name} ${technician.Last_Name}`,
                        region: technician.Technician_Dept,
                    })
                );
                setTechnicians(technicianData);
            } catch (error) {
                console.error("Error fetching technician list", error);
            }
            setLoading(false);
        };
        fetchTechnicians();
    }, []);

    useEffect(() => {
        form.setFieldsValue({
            allocation_date: dayjs(),
        });
    }, [form]);

    useEffect(() => {
        if (taskId) {
            form.setFieldsValue({
                document_no: taskId,
            });
        }
    }, [taskId]);

    const handleSubmit = async (values) => {
        const selectedTechnician = technicians.find(
            (tech) => tech.id === values.technician_id
        );

        const BulkOrderData = {
            technician_id: values.technician_id,
            technician_name: selectedTechnician ? selectedTechnician.name : "",
            document_nos: selectedOrders,
        };

        const data = {
            ...values,
            technician_id: values.technician_id,
            technician_name: selectedTechnician ? selectedTechnician.name : "",
            allocation_date: values.allocation_date
                ? values.allocation_date.format("YYYY-MM-DD")
                : null,
        };

        try {
            setSubmitLoading(true);
            let response;

            if (selectedOrders?.length > 0) {
                console.log("Making bulk assignment API call:", BulkOrderData);
                response = await axios.put(
                    `/assign-technician-bulk`,
                    BulkOrderData
                );
            } else if (taskId) {
                console.log("Making single assignment API call:", data);
                response = await axios.put(
                    `/service-orders/assign-technician/${taskId}`,
                    data
                );
            } else {
                console.error("No valid request to send!");
                return;
            }

            if (response?.data?.message) {
                messageApi.open({
                    type: "success",
                    content: response.data.message,
                });
                taskStatus();
                form.resetFields();
                formResponse();
            }
        } catch (error) {
            console.error("API Request Failed:", error);
            messageApi.open({
                type: "error",
                content: error.response?.data?.message || error.message,
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    const [form] = Form.useForm();

    return (
        <div className="pt-5">
            {contextHolder}
            <div className="form-container sm:p-5 bg-white ">
                <h2 className="font-extrabold text-xl pb-5 border-b border-slate-100 text-slate-900 border-l-4 border-indigo-500 pl-4 h-8 flex items-center">
                    Assign Team
                </h2>
                <Form
                    form={form}
                    layout="vertical"
                    className="pt-5"
                    onFinish={handleSubmit}
                    initialValues={{
                        allocation_date: dayjs(),
                    }}
                >
                    {selectedOrders?.length > 0 ? (
                        <div>
                            <Form.Item
                                name="technician_id"
                                label="Technician ID"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a Technician",
                                    },
                                ]}
                            >
                                <Select
                                    loading={loading}
                                    placeholder="Select Technician"
                                    options={
                                        !loading
                                            ? technicians.map((technician) => ({
                                                label: `${technician.id} : ${technician.name}`,
                                                value: technician.id,
                                            }))
                                            : []
                                    }
                                    notFoundContent={
                                        loading ? (
                                            <div className="flex justify-center">
                                                <Spin size="small" />
                                            </div>
                                        ) : (
                                            "No technicians available"
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
                                        className="bg-indigo-600 border-none hover:bg-indigo-700 h-10 font-bold shadow-md shadow-indigo-100 px-6"
                                    >
                                        {submitLoading ? (
                                            <div className="px-4 py-2">
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
                                            "Update"
                                        )}
                                    </Button>
                                </Form.Item>
                            </div>
                        </div>
                    ) : (
                        <div>
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
                                <Input
                                    disabled
                                    placeholder="Enter Document ID"
                                />
                            </Form.Item>
                            <Form.Item
                                name="allocation_date"
                                label="Scheduling Date"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a date!",
                                    },
                                ]}
                            >
                                <DatePicker
                                    className="w-full"
                                    disabled={loading}
                                    defaultValue={dayjs()}
                                    format="YYYY-MM-DD"
                                />
                            </Form.Item>

                            <Form.Item
                                name="technician_id"
                                label="Technician ID"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a Technician",
                                    },
                                ]}
                            >
                                <Select
                                    loading={loading}
                                    placeholder="Select Technician"
                                    options={
                                        !loading
                                            ? technicians.map((technician) => ({
                                                label: `${technician.id} : ${technician.name}`,
                                                value: technician.id,
                                            }))
                                            : []
                                    }
                                    notFoundContent={
                                        loading ? (
                                            <div className="flex justify-center">
                                                <Spin size="small" />
                                            </div>
                                        ) : (
                                            "No technicians available"
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
                                        className="bg-indigo-600 border-none hover:bg-indigo-700 h-10 font-bold shadow-md shadow-indigo-100 px-6"
                                    >
                                        {submitLoading ? (
                                            <div className="px-4 py-2">
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
                                            "Update"
                                        )}
                                    </Button>
                                </Form.Item>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </div>
    );
};

export default AssignTeam;
