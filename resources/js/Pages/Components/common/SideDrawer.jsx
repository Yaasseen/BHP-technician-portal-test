import { useEffect } from "react";
import { Button } from "antd";

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
            className={`fixed inset-0 h-screen w-full bg-black bg-opacity-50 transition-opacity duration-300 z-[999] ${
                show ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onClick={onClose}
        >
            <div className="">
                <button
                    type="button"
                    className={`absolute top-1/2 -translate-y-1/2 transition-transform duration-300 ${
                        show ? "right-[31%]" : "-right-10"
                    } w-14 h-14 rounded-full bg-gray-800 text-white text-lg flex items-center justify-center`}
                    aria-label="Close"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            {/* Sidebar */}
             <div
                className={`fixed top-0 right-0 w-[98%] sm:w-[60%] lg:w-[30%] bg-white h-[90vh] sm:h-screen overflow-y-auto shadow-lg transition-transform duration-300 ${
                    show ? "translate-x-0" : "translate-x-full"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col  w-full">
                    {heading && (
                        <div className="flex-1 flex items-center justify-between p-4  border-b">
                            <p className="text-lg font-semibold  ">{heading}</p>
                            <p onClickHeading={onClickHeading}>{headingBody}</p>
                        </div>
                    )}

                    <div className="px-4 py-2 max-h-[90%] overflow-y-auto">
                        {body}
                    </div>

                    {/* Footer */}
                    <div className="w-full text-center">
                        {onSaveButtonClick && (
                            <div
                                style={{
                                    boxShadow:
                                        "0 -4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                                className="w-full px-4 py-3 border-t border-gray-300 flex justify-between gap-1"
                            >
                                <Button
                                    className="w-1/2"
                                    onClick={onClearButtonClick}
                                >
                                    {clearButton}
                                </Button>

                                <Button
                                    className="w-1/2 bg-indigo-500 text-white"
                                    onClick={onSaveButtonClick}
                                >
                                    {saveButton}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
