import React, { useState } from "react";
import { Segmented } from "antd";
import ScanSingle from "./ScanSingle";
import ScanBulk from "./ScanBulk";
import TechnicianBaskets from "./TechnicianBaskets";
import GigoDesk from "./GigoDesk";
import GigoOverview from "./GigoOverview";
import MovementHistory from "./MovementHistory";
import LocationsSetup from "./LocationsSetup";

const GigoDashboard = ({ user, screenContent }) => {
    const isGigoDesk = user.Role === "Team Leader" || user.Role === "Admin";
    const [tab, setTab] = useState("single");

    const tabs = [
        { label: "Scan (Single)", value: "single", show: true },
        { label: "Scan (Bulk)", value: "bulk", show: true },
        { label: isGigoDesk ? "GIGO Desk" : "Dispatch", value: "desk", show: true },
        { label: "Overview", value: "overview", show: isGigoDesk },
        { label: "Technician Baskets", value: "baskets", show: true },
        { label: "History", value: "history", show: true },
        { label: "Locations Setup", value: "locations", show: isGigoDesk },
    ].filter((item) => item.show);

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
                    options={tabs}
                    value={tab}
                    onChange={setTab}
                    size="large"
                />
            </div>

            <div className="pt-2">
                {tab === "single" && <ScanSingle user={user} />}
                {tab === "bulk" && <ScanBulk user={user} />}
                {tab === "desk" && <GigoDesk user={user} screenContent={screenContent} />}
                {tab === "overview" && isGigoDesk && <GigoOverview screenContent={screenContent} />}
                {tab === "baskets" && <TechnicianBaskets screenContent={screenContent} />}
                {tab === "history" && <MovementHistory />}
                {tab === "locations" && isGigoDesk && <LocationsSetup />}
            </div>
        </div>
    );
};

export default GigoDashboard;
