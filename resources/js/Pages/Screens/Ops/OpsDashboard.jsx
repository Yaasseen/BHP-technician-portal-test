import React, { useState } from "react";
import { Segmented } from "antd";
import DepartmentOpsPage from "./DepartmentOpsPage";
import TechnicianPerformancePage from "./TechnicianPerformancePage";
import PaymentsPage from "./PaymentsPage";

const TABS = [
    { label: "Outdoor", value: "outdoor" },
    { label: "Indoor", value: "indoor" },
    { label: "HHPT", value: "hhpt" },
    { label: "Technician Performance", value: "technician-performance" },
    { label: "Payments", value: "payments" },
];

const OpsDashboard = ({ user }) => {
    const [tab, setTab] = useState("outdoor");

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-4">
                <img src="/images/jmg-logo.png" alt="JMG Service Centre" className="h-14" />
                <div>
                    <p className="sm:text-2xl text-lg font-medium font-sans text-green-700">
                        {TABS.find((t) => t.value === tab)?.label} Jobs Overview
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Segmented options={TABS} value={tab} onChange={setTab} size="large" />
            </div>

            <div className="pt-2">
                {tab === "outdoor" && (
                    <DepartmentOpsPage endpoint="/ops-dashboard/outdoor" />
                )}
                {tab === "indoor" && (
                    <DepartmentOpsPage endpoint="/ops-dashboard/indoor" />
                )}
                {tab === "hhpt" && <DepartmentOpsPage endpoint="/ops-dashboard/hhpt" />}
                {tab === "technician-performance" && <TechnicianPerformancePage />}
                {tab === "payments" && <PaymentsPage />}
            </div>
        </div>
    );
};

export default OpsDashboard;
