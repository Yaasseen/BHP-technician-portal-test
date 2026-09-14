import React from "react";
import NavLinks from "./NavLinks";

const Sidebar = ({ user, activeView, setActiveView }) => {
    return (
        <aside className="hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 z-40">
            <div className="px-5 py-5 border-b border-gray-100">
                <p className="text-xl font-bold text-red-500 tracking-tight">
                    TBH<span className="text-black"> Portal</span>
                </p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
                <NavLinks user={user} activeView={activeView} setActiveView={setActiveView} />
            </div>
        </aside>
    );
};

export default Sidebar;
