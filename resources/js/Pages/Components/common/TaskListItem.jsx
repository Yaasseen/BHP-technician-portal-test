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
            case 'completed': return { color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-500' };
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
            className={`app-card relative mb-4 p-5 overflow-hidden border-l-4 ${statusTheme.border} ${isSelected ? 'bg-emerald-50/10' : ''
                }`}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4">
                    <div className="pt-1.5">
                        <Checkbox
                            checked={isSelected}
                            onChange={(e) => onSelect(e.target.checked)}
                            className="custom-checkbox"
                        />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {task.document_no}
                            </span>
                            <Tag color={statusTheme.color} className="text-[9px] uppercase font-black border-none rounded-full px-2.5 py-0">
                                {task.status || 'Active'}
                            </Tag>
                        </div>
                        <h3 className="font-bold text-slate-900 leading-tight text-base group-hover:text-emerald-600 transition-colors truncate">
                            {task.name}
                        </h3>
                    </div>
                </div>

                <Popover
                    content={actions}
                    trigger="click"
                    placement="bottomRight"
                    arrow={false}
                >
                    <button
                        className="p-2 -mr-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 rounded-lg transition-all"
                    >
                        <MoreOutlined className="text-xl" />
                    </button>
                </Popover>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="flex items-center gap-3 text-slate-500 group/item">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover/item:bg-emerald-50 transition-colors">
                        <CalendarOutlined className="text-slate-400 group-hover/item:text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none mb-0.5">Order Date</p>
                        <span className="text-xs font-bold text-slate-700">{task.order_date}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-slate-500 group/item">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover/item:bg-emerald-50 transition-colors">
                        <ClockCircleOutlined className="text-slate-400 group-hover/item:text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none mb-0.5">Scheduled</p>
                        <span className="text-xs font-bold text-slate-700 truncate">{task.schedule_date || 'Not set'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-slate-500 col-span-2 group/item">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover/item:bg-emerald-50 transition-colors">
                        <UserOutlined className="text-slate-400 group-hover/item:text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none mb-0.5">Technician</p>
                        <span className="text-xs font-bold text-slate-700 truncate">
                            {task.technician_name || 'Unassigned'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5 min-w-0">
                    <span className="text-[9px] font-bold px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200 uppercase tracking-wider truncate max-w-[100px]">
                        {task.service_order_type}
                    </span>
                    {task.department && (
                        <span className="text-[9px] font-bold px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200 uppercase tracking-wider truncate max-w-[100px]">
                            {task.department}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => onViewDetails(task.document_no)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-all group/btn active:scale-95 shadow-sm"
                >
                    Details
                    <div className="w-4 h-4 rounded-full bg-slate-200/50 flex items-center justify-center group-hover/btn:bg-white/20 transition-colors">
                        <RightOutlined className="text-[8px]" />
                    </div>
                </button>
            </div>
        </motion.div>
    );
};

export default TaskListItem;
