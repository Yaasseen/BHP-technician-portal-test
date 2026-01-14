import React, { Children } from "react";
import { Layout, Menu } from "antd";

const { Sider, Content } = Layout;

const SideBar = ({ Children }) => {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={250} className="bg-gray-white text-black shadow-lg">
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["1"]}
                    className="h-full"
                >
                    <Menu.Item key="1">Dashboard</Menu.Item>
                    <Menu.Item key="2">Service Orders</Menu.Item>
                    <Menu.Item key="3">Technicians</Menu.Item>
                    <Menu.Item key="4">Settings</Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Content style={{ padding: "20px" }}>{Children}</Content>
            </Layout>
        </Layout>
    );
};

export default SideBar;
