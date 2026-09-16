import React from "react";
import { motion } from "framer-motion";
import {
    ClockCircleOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    UserOutlined,
    RightOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";

const ServiceOrderCardItem = ({ serviceOrder, className, statusDescription }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`app-card mb-4 flex flex-col gap-3 group cursor-pointer ${className}`}
        >
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="font-bold text-lg text-slate-900 group-hover:text-red-600 transition-colors">
                        {serviceOrder.document_no}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-none w-fit">
                        <ClockCircleOutlined />
                        {serviceOrder.schedule_date}
                    </div>
                    {statusDescription && (
                        <div className="bg-red-50/50 border border-red-100 p-3 rounded-none flex gap-3 items-start mt-2"> {/* Added mt-2 for spacing */}
                            <InfoCircleOutlined className="text-red-500 mt-0.5" />
                            <div className="space-y-0.5">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-red-400">Current Status</p>
                                <p className="text-sm font-semibold text-red-700 leading-tight">
                                    {statusDescription}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="text-slate-300 group-hover:text-red-600 transition-colors">
                    <RightOutlined className="text-lg" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TeamOutlined className="text-gray-400" />
                    <span>{serviceOrder.team}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <EnvironmentOutlined className="text-gray-400" />
                    <span>{serviceOrder.region}</span>
                </div>
            </div>

            <div className="pt-3 border-t border-gray-50 flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-none flex items-center justify-center">
                        <UserOutlined className="text-[10px] text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                        {serviceOrder.assigned_by}
                    </span>
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    {serviceOrder.assigned_time}
                </div>
            </div>
        </motion.div>
    );
};

export default ServiceOrderCardItem;