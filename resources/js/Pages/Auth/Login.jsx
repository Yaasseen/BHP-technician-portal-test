import React, { useEffect, useState } from "react";
import { LoadingOutlined, UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Form, Input, Spin, Checkbox } from "antd";
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
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">
            {/* Left Column: Brand & Visuals (Desktop only) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-50 flex-col items-center justify-center p-20 relative overflow-hidden border-r border-slate-100">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px]"></div>

                <div className="relative z-10 space-y-12 max-w-[480px]">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 rounded-none">
                            <span className="text-white font-black text-3xl italic">B</span>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">The Brand House</h1>
                            <p className="text-sm font-bold text-indigo-600 uppercase tracking-[0.3em]">Technician Portal</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-5xl font-bold text-slate-800 tracking-tighter leading-[1.1]">
                            Can't wait to show you what's new.
                        </h2>
                        <p className="text-xl text-slate-500 font-medium">
                            Sign in and see for yourself!
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
                {/* Mobile Branding (Visible only on small screens) */}
                <div className="lg:hidden text-center mb-12 space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 shadow-lg shadow-indigo-100 rounded-none">
                        <span className="text-white font-black text-2xl italic">B</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">The Brand House</h2>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">Technician Portal</p>
                    </div>
                </div>

                <div className="w-full max-w-[380px] space-y-10">
                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">Log in</h3>
                        <p className="text-slate-400 text-sm font-medium">Please enter your account details</p>
                    </div>

                    <Form
                        layout="vertical"
                        onFinish={onFinish}
                        onValuesChange={onValuesChange}
                        form={form}
                        className="space-y-8"
                        requiredMark={false}
                    >
                        <div className="space-y-6">
                            <Form.Item
                                name="username"
                                label={<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Username</span>}
                                rules={[{ required: true, message: "Username is required" }]}
                                className="mb-0 custom-label-spacing"
                            >
                                <Input
                                    placeholder="Username"
                                    prefix={<UserOutlined className="text-slate-300 mr-2" />}
                                    size="large"
                                    className="h-[52px] w-full rounded-none bg-white border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:shadow-none px-4 text-sm font-medium transition-all"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</span>}
                                rules={[{ required: true, message: "Password is required" }]}
                                className="mb-0 custom-label-spacing"
                            >
                                <Input.Password
                                    placeholder="Password"
                                    prefix={<LockOutlined className="text-slate-300 mr-2" />}
                                    visibilityToggle={{
                                        iconRender: (visible) => (visible ? <EyeOutlined className="text-slate-300" /> : <EyeInvisibleOutlined className="text-slate-300" />),
                                    }}
                                    size="large"
                                    className="h-[52px] w-full rounded-none bg-white border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:shadow-none px-4 text-sm font-medium transition-all"
                                />
                            </Form.Item>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <Checkbox className="modern-checkbox">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remember me</span>
                            </Checkbox>
                            <span className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer uppercase tracking-wider">Forgot password?</span>
                        </div>

                        <div className="space-y-6">
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                className={`w-full h-[52px] rounded-none font-bold text-sm uppercase tracking-widest transition-all duration-300 border-none flex items-center justify-center gap-2 ${buttonEnabled
                                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-50"
                                    : "bg-slate-100 text-slate-300 shadow-none hover:bg-slate-100"
                                    }`}
                                disabled={!buttonEnabled || loading}
                            >
                                {loading ? (
                                    <Spin indicator={<LoadingOutlined spin className="text-white" />} />
                                ) : (
                                    <>Login <span className="text-lg leading-none mb-0.5">›</span></>
                                )}
                            </Button>

                            <p className="text-center text-[11px] font-bold text-slate-400">
                                Forgot your password? <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer">Reset now</span>
                            </p>
                        </div>
                    </Form>
                </div>

                <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                        &copy; 2026 The Brand House. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
