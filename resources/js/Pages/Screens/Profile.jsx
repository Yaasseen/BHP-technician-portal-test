import React from "react";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    BellOutlined,
    LogoutOutlined,
    RightOutlined,
    EditOutlined,
    GlobalOutlined
} from "@ant-design/icons";
import { Avatar, Tag, Button, Switch } from "antd";
import { motion } from "framer-motion";

const Profile = ({ user, onLogout }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const SettingItem = ({ icon, title, description, action, type = "link" }) => (
        <motion.div
            variants={itemVariants}
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all group"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                    {icon}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-none">{title}</h4>
                    {description && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{description}</p>}
                </div>
            </div>
            <div>
                {type === "switch" ? (
                    <Switch size="small" defaultChecked className="bg-slate-200" />
                ) : (
                    <Button type="text" className="text-slate-300 group-hover:text-emerald-500">
                        <RightOutlined />
                    </Button>
                )}
            </div>
        </motion.div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto space-y-8 pb-10"
        >
            {/* Profile Header Card */}
            <motion.div variants={itemVariants} className="app-card overflow-hidden group/header">
                <div className="bg-slate-800 h-28 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 opacity-90"></div>
                    <div className="absolute top-0 right-0 p-4">
                        <GlobalOutlined className="text-white/10 text-6xl rotate-12" />
                    </div>
                    <div className="absolute -bottom-12 left-8">
                        <div className="relative">
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                className="ring-8 ring-white shadow-2xl bg-slate-100 text-slate-400"
                            />
                            <div className="absolute bottom-2 right-2">
                                <Button
                                    shape="circle"
                                    size="middle"
                                    icon={<EditOutlined />}
                                    className="shadow-xl border-none bg-white text-emerald-600 flex items-center justify-center hover:scale-110 transition-transform"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-16 pb-8 px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{user?.Name || "User Name"}</h2>
                            <div className="flex items-center gap-2 mt-3">
                                <Tag color="emerald" className="m-0 rounded-lg border-none font-bold text-[10px] px-2 py-0.5 uppercase tracking-widest">
                                    {user?.Role || "Technician"}
                                </Tag>
                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <GlobalOutlined className="text-[10px]" /> BH-Technician
                                </span>
                            </div>
                        </div>
                        <Button type="primary" className="btn-primary flex items-center gap-2">
                            <EditOutlined /> Edit Profile
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                <MailOutlined />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">Email Address</p>
                                <p className="text-sm font-bold text-slate-700 mt-1 truncate">{user?.email || "user@example.com"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                <PhoneOutlined />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">Phone Number</p>
                                <p className="text-sm font-bold text-slate-700 mt-1">{user?.phone || "+230 123 4567"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Account Settings */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight px-1 mb-4 flex items-center gap-2">
                        <SafetyCertificateOutlined className="text-emerald-500" />
                        Account & Security
                    </h3>
                    <div className="space-y-3">
                        <SettingItem
                            icon={<SafetyCertificateOutlined />}
                            title="Password & Security"
                            description="Change your password and manage security"
                        />
                        <SettingItem
                            icon={<BellOutlined />}
                            title="Push Notifications"
                            description="Manage how you receive alerts"
                            type="switch"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight px-1 mb-4">Other Settings</h3>
                    <div className="space-y-3">
                        <SettingItem
                            icon={<GlobalOutlined />}
                            title="Language"
                            description="English (United Kingdom)"
                        />
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center justify-between p-4 bg-red-50/30 rounded-2xl border border-red-50 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                            onClick={() => onLogout()}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <LogoutOutlined />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-red-600 leading-none">Logout</h4>
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-1.5">Sign out from your account</p>
                                </div>
                            </div>
                            <RightOutlined className="text-red-200" />
                        </motion.div>
                    </div>
                </div>
            </div>

            <motion.p variants={itemVariants} className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mt-10">
                Technician Portal v2.4.0
            </motion.p>
        </motion.div>
    );
};

export default Profile;
