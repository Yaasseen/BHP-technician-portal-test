import React, { useEffect, useState } from "react";
import {
    Button,
    DatePicker,
    Form,
    Input,
    message,
    TimePicker,
    Spin,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

function ScheduledTask({ taskId, formResponse, selectedOrders }) {
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [dateDisabled, setDateDisabled] = useState(false);
    const [form] = Form.useForm();

    const fetchScheduledTask = async (taskId) => {
        try {
            setLoading(true);
            const response = await axios.get(`/service-orders/${taskId}`);
            const { schedule_date, schedule_time } = response.data;

            if (schedule_date) {
                form.setFieldsValue({
                    schedule_date: dayjs(schedule_date),
                    schedule_time: schedule_time
                        ? dayjs(schedule_time, "HH:mm")
                        : null,
                });
                setDateDisabled(true);
            } else {
                setDateDisabled(false);
            }
        } catch (error) {
            console.error("Error fetching task details:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (taskId) {
            form.resetFields();
            form.setFieldsValue({ document_no: taskId });
            fetchScheduledTask(taskId);
        }
    }, [taskId]);

    const handleSubmit = async (values) => {
        const formattedValues = {
            ...values,
            schedule_date: values.schedule_date
                ? values.schedule_date.format("YYYY-MM-DD")
                : null,
            
        };
        setSubmitLoading(true);
        try {
            const response = await axios.put(
                `/service-orders/schedule/${taskId}`,
                formattedValues
            );
            messageApi.success(response.data.message);
            formResponse();
        } catch (error) {
            messageApi.error(error.message || "An error occurred");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <>
            {contextHolder}
            <div className="pt-5">
                <div className="form-container sm:p-5 bg-white">
                    <h1 className="font-semibold text-xl pb-5 border-b">
                        Scheduled Visit
                    </h1>
                    <Form
                        form={form}
                        layout="vertical"
                        className="p-5"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            name="document_no"
                            label="Document No"
                            rules={[
                                {
                                    required: true,
                                    message: "Document No is required!",
                                },
                            ]}
                        >
                            <Input disabled placeholder="Enter Document ID" />
                        </Form.Item>
                        <Form.Item
                            name="schedule_date"
                            label="Date"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a date!",
                                },
                            ]}
                        >
                            <DatePicker className="w-full" disabled={loading} />
                        </Form.Item>

                        {/* <Form.Item
                            name="schedule_time"
                            label="Time"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a time!",
                                },
                            ]}
                        >
                            <TimePicker className="w-full" format={"HH:mm"} />
                        </Form.Item> */}
                        <div className="flex justify-end">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="bg-indigo-500 flex items-center justify-center"
                            >
                                {submitLoading ? (
                                    <div className="px-5 py-1">
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
                                    "Schedule"
                                )}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </>
    );
}

export default ScheduledTask;
