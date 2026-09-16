import React from "react";
import { motion } from "framer-motion";
import {
    CalendarOutlined,
    UserOutlined,
    MoreOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    RightOutlined
} from "@ant-design/icons";
import { Checkbox, Tag, Popover } from "antd";

const TaskListItem = ({
    task,
    onViewDetails,
    isSelected,
    onSelect,
    actions
}) => {
    const getStatusTheme = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return { color: '#10b981', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-500' };
            case 'pending': return { color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-500' };
            case 'cancelled': return { color: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-500' };
            default: return { color: '#475569', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-500' };
        }
    };

    const statusTheme = getStatusTheme(task.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl p-4 mb-3 shadow-sm border border-slate-100 relative overflow-hidden group ${isSelected ? 'ring-2 ring-red-50 bg-red-50/10' : ''}`}
        >
            {/* Left Border Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusTheme.bg.replace('bg-', 'bg-') || 'bg-slate-200'}`}></div>

            <div className="pl-3">
                {/* Header: Checkbox, ID, Status, Actions */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={isSelected}
                            onChange={(e) => onSelect(e.target.checked)}
                            className="custom-checkbox scale-90"
                        />
                        <span className="font-extrabold text-slate-700 text-xs tracking-tight">{task.document_no}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${statusTheme.bg} ${statusTheme.text} border ${statusTheme.border} border-opacity-30`}>
                            {task.status || 'Active'}
                        </span>
                        <Popover
                            content={actions}
                            trigger="click"
                            placement="bottomRight"
                            arrow={false}
                        >
                            <button className="text-slate-300 hover:text-red-600 transition-colors p-1">
                                <MoreOutlined />
                            </button>
                        </Popover>
                    </div>
                </div>

                {/* Company Name */}
                <h3 className="font-bold text-slate-900 text-sm leading-snug mb-4 pr-2">
                    {task.name}
                </h3>

                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {/* Date */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <CalendarOutlined className="text-[10px]" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Date</span>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{task.order_date}</span>
                    </div>

                    {/* Schedule */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <ClockCircleOutlined className="text-[10px]" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Scheduled</span>
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate">
                            {task.schedule_date ? task.schedule_date.split(' ')[0] : 'Not set'}
                        </span>
                    </div>

                    {/* Technician */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <UserOutlined className="text-[10px]" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Tech</span>
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate">
                            {task.technician_name ? task.technician_name.split(' ')[0] : 'Unassigned'}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded">
                        {task.service_order_type}
                    </span>
                    <button
                        onClick={() => onViewDetails(task.document_no)}
                        className="text-red-600 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        Details <RightOutlined className="text-[10px]" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default TaskListItem;
