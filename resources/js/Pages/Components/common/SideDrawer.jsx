// Custom Drawer Component
import { useEffect } from "react";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

export default function SiderDrawer({
    show,
    onClose,
    heading,
    onSaveButtonClick,
    onClearButtonClick,
    saveButton,
    clearButton,
    body,
    onClickHeading,
    headingBody,
}) {
    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [show]);

    return (
        <div
            className={`fixed inset-0 h-screen w-full bg-slate-900/40 backdrop-blur-sm transition-all duration-300 z-[999] ${show ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            onClick={onClose}
        >
            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 w-[85%] sm:w-[450px] bg-white h-full shadow-2xl transition-transform duration-300 ease-out flex flex-col ${show ? "translate-x-0" : "translate-x-full"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">{heading || "Filters"}</h2>
                        {headingBody && (
                            <p
                                className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1 cursor-pointer hover:text-red-700 transition-colors"
                                onClick={onClickHeading}
                            >
                                {headingBody}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all rounded-none"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <CloseOutlined className="text-lg" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
                    {body}
                </div>

                {/* Footer */}
                {(onSaveButtonClick || onClearButtonClick) && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex gap-3">
                        {onClearButtonClick && (
                            <Button
                                className="flex-1 h-12 bg-white border border-slate-200 text-slate-600 font-bold hover:border-slate-300 hover:text-slate-800 rounded-none shadow-sm"
                                onClick={onClearButtonClick}
                            >
                                {clearButton || "Clear"}
                            </Button>
                        )}

                        {onSaveButtonClick && (
                            <Button
                                type="primary"
                                className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold border-none rounded-none shadow-md shadow-red-100"
                                onClick={onSaveButtonClick}
                            >
                                {saveButton || "Apply"}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
