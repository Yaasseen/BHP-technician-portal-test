import React from "react";
import { motion } from "framer-motion";
import { ClockCircleOutlined, CalendarOutlined, InfoCircleOutlined } from "@ant-design/icons";

const DetailCard = ({
    name,
    date,
    time,
    status,
    description,
    statusDescription,
    className,
    url,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`app-card overflow-hidden ${className}`}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                        <p className="font-bold text-xl text-gray-900 tracking-tight">{name}</p>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-none">
                                <CalendarOutlined className="text-gray-400" />
                                {date}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-none">
                                <ClockCircleOutlined className="text-gray-400" />
                                {time}
                            </div>
                        </div>
                    </div>

                    {statusDescription && (
                        <div className="bg-red-50/50 border border-red-100 p-3 rounded-none flex gap-3 items-start">
                            <InfoCircleOutlined className="text-red-500 mt-0.5" />
                            <div className="space-y-0.5">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-red-400">Current Status</p>
                                <p className="text-sm font-semibold text-red-700 leading-tight">
                                    {statusDescription}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="prose prose-sm text-gray-600 leading-relaxed font-medium">
                        {description}
                    </div>
                </div>

                {url && (
                    <div className="w-full sm:w-auto flex-shrink-0">
                        <motion.img
                            whileHover={{ scale: 1.05 }}
                            src={url}
                            alt="Detail"
                            className="w-full sm:w-48 h-32 sm:h-32 object-cover rounded-none shadow-lg shadow-gray-200 border border-gray-100"
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DetailCard;

