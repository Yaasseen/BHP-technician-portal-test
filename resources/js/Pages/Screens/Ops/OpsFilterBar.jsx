import React, { useEffect, useState } from "react";
import axios from "axios";
import { DatePicker, Select, Input } from "antd";

const { RangePicker } = DatePicker;

const OpsFilterBar = ({ filters, onChange }) => {
    const [statusOptions, setStatusOptions] = useState([]);

    useEffect(() => {
        axios.get("/service-order-portal-status").then((res) => {
            setStatusOptions(
                (res.data || []).map((code) => ({ label: code, value: code }))
            );
        });
    }, []);

    return (
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="border rounded-md px-3 py-2">
                <p className="text-xs text-gray-400 mb-1">Date</p>
                <RangePicker
                    value={filters.dateRange}
                    onChange={(dateRange) => onChange({ ...filters, dateRange })}
                />
            </div>
            <div className="border rounded-md px-3 py-2 min-w-[220px]">
                <p className="text-xs text-gray-400 mb-1">status</p>
                <Select
                    mode="multiple"
                    allowClear
                    placeholder="All"
                    className="w-full"
                    variant="borderless"
                    options={statusOptions}
                    value={filters.status}
                    onChange={(status) => onChange({ ...filters, status })}
                />
            </div>
            <div className="border rounded-md px-3 py-2 min-w-[220px]">
                <p className="text-xs text-gray-400 mb-1">document_no</p>
                <Input
                    variant="borderless"
                    placeholder="All"
                    value={filters.search}
                    onChange={(e) => onChange({ ...filters, search: e.target.value })}
                />
            </div>
        </div>
    );
};

export default OpsFilterBar;
