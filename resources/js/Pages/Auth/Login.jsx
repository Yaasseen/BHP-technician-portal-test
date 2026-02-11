import React, { useEffect, useState } from "react";
import { LoadingOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Spin } from "antd";
import { motion } from "framer-motion";
import axios from "axios";

const Login = ({ onLoggedIn }) => {
    const [buttonEnabled, setButtonEnable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onValuesChange = (_, values) => {
        const { username, password } = values;
        setButtonEnable(!!(username && password));
    };

    const onFinish = (values) => {
        setLoading(true);
        axios
            .post("/login", values)
            .then(() => {
                onLoggedIn();
            })
            .catch((error) => {
                const fieldErrors = Object.keys(error.response?.data || {}).map(
                    (field) => ({
                        name: field,
                        errors: [error.response.data[field]],
                    })
                );
                setLoading(false);
                if (fieldErrors.length > 0) {
                    form.setFields(fieldErrors);
                } else {
                    form.setFields([{ name: 'username', errors: ['Invalid credentials'] }]);
                }
            });
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="app-card shadow-xl shadow-emerald-100 p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200 mb-4">
                            <span className="text-white font-bold text-3xl">B</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Welcome Back
                        </h2>
                        <p className="text-gray-500 font-medium">
                            Log in to your technician account
                        </p>
                    </div>

                    <Form
                        layout="vertical"
                        onFinish={onFinish}
                        onValuesChange={onValuesChange}
                        form={form}
                        className="space-y-4"
                        requiredMark={false}
                    >
                        <Form.Item
                            label={<span className="text-xs font-bold uppercase tracking-wider text-slate-400">User ID</span>}
                            name="username"
                            rules={[{ required: true, message: "Please enter your User ID" }]}
                        >
                            <Input
                                prefix={<MailOutlined className="text-emerald-400 mr-2" />}
                                placeholder="Enter your username"
                                size="large"
                                className="rounded-xl border-gray-200 h-12"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</span>}
                            name="password"
                            rules={[{ required: true, message: "Please enter your password" }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-emerald-400 mr-2" />}
                                placeholder="Enter your password"
                                size="large"
                                className="rounded-xl border-gray-200 h-12"
                            />
                        </Form.Item>

                        <div className="pt-4">
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                className={`w-full h-12 rounded-xl font-bold transition-all duration-300 border-none ${buttonEnabled
                                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                                    : "bg-slate-100 text-slate-400"
                                    }`}
                                disabled={!buttonEnabled || loading}
                            >
                                {loading ? (
                                    <Spin indicator={<LoadingOutlined spin className="text-white" />} />
                                ) : (
                                    "Log In"
                                )}
                            </Button>
                        </div>
                    </Form>
                </div>

                <p className="text-center mt-8 text-sm text-gray-400 font-medium">
                    &copy; 2026 The BandHouse. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;

