import React, { useState } from "react";
import { Segmented } from "antd";
import ScanSingle from "./ScanSingle";
import ScanBulk from "./ScanBulk";
import TechnicianBaskets from "./TechnicianBaskets";
import MovementHistory from "./MovementHistory";
import LocationsSetup from "./LocationsSetup";

const TABS = [
    { label: "Scan (Single)", value: "single" },
    { label: "Scan (Bulk)", value: "bulk" },
    { label: "Technician Baskets", value: "baskets" },
    { label: "History", value: "history" },
    { label: "Locations Setup", value: "locations" },
];

const GigoDashboard = ({ user }) => {
    const [tab, setTab] = useState("single");

    return (
        <div className="flex flex-col gap-4 w-full">
            <div>
                <p className="sm:text-2xl text-lg font-medium font-sans">GIGO Location Tracking</p>
                <p className="text-gray-500 sm:text-md text-xs font-light pt-1">
                    Scan jobs to track where items are and who has custody of them.
                </p>
            </div>

            <div className="overflow-x-auto">
                <Segmented
                    options={TABS}
                    value={tab}
                    onChange={setTab}
                    size="large"
                />
            </div>

            <div className="pt-2">
                {tab === "single" && <ScanSingle />}
                {tab === "bulk" && <ScanBulk />}
                {tab === "baskets" && <TechnicianBaskets />}
                {tab === "history" && <MovementHistory />}
                {tab === "locations" && <LocationsSetup />}
            </div>
        </div>
    );
};

export default GigoDashboard;
