import React, { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Button, Form, Input, Spin } from "antd";
import "../../../css/Auth/Login.css";
import { MailOutlined } from "@ant-design/icons";

import axios from "axios";

const Login = ({ onLoggedIn }) => {
    const [buttonEnabled, setButtonEnable] = useState(true);
    const [loading, setLoading] = useState();
    const [form] = Form.useForm();
    const [clientReady, setClientReady] = useState(false);

    const onValuesChange = (_, values) => {
        const { username, password } = values;
        if (username && password) {
            setButtonEnable(false);
        } else {
            setButtonEnable(true);
        }
    };

    useEffect(() => {
        setClientReady(true);
    }, []);

    const onFinish = (values) => {
        setLoading(true);
        axios
            .post("/login", values)
            .then((res) => {
                onLoggedIn();
            })
            .catch((error) => {
                const fieldErrors = Object.keys(error.response.data).map(
                    (field) => ({
                        name: field,
                        errors: [error.response.data[field]],
                    })
                );
                setLoading(false);
                form.setFields(fieldErrors);

                console.log("======>", error);
            });
        console.log("Finish:", values);
    };
    console.log("======>", loading);
    return (
        <div className="min-h-screen flex justify-center items-center  ">
            <div className="w-[350px] sm:w-[400px] bg-white rounded-lg shadow-lg">
                <div className="mb-6 text-center p-6 border-b border-gray-300">
                    <p className="text-xs font-semibold text-gray-700">
                        The BandHouse
                    </p>
                    <p className="text-xl font-semibold mt-6">
                        Log in to your account
                    </p>
                    <p className="text-gray-500 mt-1 font-light">
                        Welcome back! Please enter your details.
                    </p>
                </div>
                <div className="space-y-1">
                    <Form
                        layout="vertical"
                        onFinish={onFinish}
                        onValuesChange={onValuesChange}
                        form={form}
                    >
                        <div className="px-6">
                            <Form.Item
                                label="User ID"
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your User ID!",
                                    },
                                ]}
                            >
                                <Input
                                    prefix={
                                        <MailOutlined className="text-gray-400 pr-1" />
                                    }
                                    placeholder="Enter your Username or ID"
                                    size="large"
                                />
                            </Form.Item>
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your password!",
                                    },
                                ]}
                            >
                                <Input.Password
                                    placeholder="Enter your password"
                                    size="large"
                                />
                            </Form.Item>
                        </div>
                        <div className="border-t border-gray-300 pb-6"></div>
                        <div className="px-6">
                            <Form.Item>
                                <Button
                                    type="primary"
                                    size="large"
                                    htmlType="submit"
                                    className="w-full"
                                    disabled={buttonEnabled}
                                    style={{
                                        backgroundColor: buttonEnabled
                                            ? "#E5E7EB"
                                            : "#6363AE",
                                        borderColor: buttonEnabled
                                            ? "#E5E7EB"
                                            : "#6363AE",
                                        color: buttonEnabled
                                            ? "#000000"
                                            : "#FFFFFF",
                                    }}
                                >
                                    {loading ? (
                                        <Spin
                                            indicator={
                                                <LoadingOutlined
                                                    spin
                                                    className="text-white"
                                                />
                                            }
                                        />
                                    ) : (
                                        "Login"
                                    )}
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};
export default Login;
