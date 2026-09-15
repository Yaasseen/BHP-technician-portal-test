import React, { useEffect, useRef, useState } from "react";
import { Input, Button, Alert } from "antd";
import { ScanOutlined, CameraOutlined, CloseOutlined } from "@ant-design/icons";

/**
 * Reusable barcode-scan input. Supports:
 * - "keyboard": a focused text input that a USB/Bluetooth barcode scanner
 *   types into (scanners emulate a keyboard and send Enter at the end).
 * - "camera": phone/tablet camera decoding via @zxing/browser.
 * - "both": shows the keyboard input plus a button to toggle camera mode.
 */
const ScanInput = ({ onScan, mode = "both", autoFocus = true, placeholder = "Scan or type job number" }) => {
    const [value, setValue] = useState("");
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const lastScanRef = useRef({ code: null, at: 0 });
    const inputRef = useRef(null);

    const showKeyboard = mode === "keyboard" || mode === "both";
    const showCameraToggle = mode === "camera" || mode === "both";

    useEffect(() => {
        if (showKeyboard && autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showKeyboard, autoFocus]);

    const emitScan = (code) => {
        const trimmed = (code || "").trim();
        if (!trimmed) return;

        const now = Date.now();
        if (lastScanRef.current.code === trimmed && now - lastScanRef.current.at < 1500) {
            return;
        }
        lastScanRef.current = { code: trimmed, at: now };
        onScan(trimmed);
    };

    const handleKeyboardSubmit = () => {
        emitScan(value);
        setValue("");
    };

    const startCamera = async () => {
        setCameraError(null);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraError("Camera access is not available on this device/browser.");
            return;
        }

        setCameraOpen(true);

        try {
            const { BrowserMultiFormatReader } = await import("@zxing/browser");
            const reader = new BrowserMultiFormatReader();
            readerRef.current = reader;

            await reader.decodeFromVideoDevice(
                undefined,
                videoRef.current,
                (result) => {
                    if (result) {
                        emitScan(result.getText());
                    }
                }
            );
        } catch (err) {
            console.error("Failed to start camera scanner", err);
            setCameraError(
                err?.name === "NotAllowedError"
                    ? "Camera permission was denied."
                    : "Unable to start the camera scanner."
            );
        }
    };

    const stopCamera = () => {
        if (readerRef.current) {
            try {
                readerRef.current.reset();
            } catch (err) {
                // no-op: reader may already be stopped
            }
            readerRef.current = null;
        }
        setCameraOpen(false);
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className="w-full flex flex-col gap-2">
            {showKeyboard && (
                <div className="flex gap-2 w-full">
                    <Input
                        ref={inputRef}
                        size="large"
                        prefix={<ScanOutlined />}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onPressEnter={handleKeyboardSubmit}
                        className="flex-1"
                    />
                    <Button size="large" type="primary" onClick={handleKeyboardSubmit}>
                        Add
                    </Button>
                </div>
            )}

            {showCameraToggle && !cameraOpen && (
                <Button icon={<CameraOutlined />} onClick={startCamera} block>
                    Scan with Camera
                </Button>
            )}

            {cameraOpen && (
                <div className="relative w-full">
                    <video
                        ref={videoRef}
                        className="w-full rounded-lg bg-black"
                        style={{ maxHeight: 320, objectFit: "cover" }}
                        muted
                        playsInline
                    />
                    <Button
                        shape="circle"
                        icon={<CloseOutlined />}
                        className="absolute top-2 right-2"
                        onClick={stopCamera}
                    />
                </div>
            )}

            {cameraError && (
                <Alert type="error" showIcon message={cameraError} closable onClose={() => setCameraError(null)} />
            )}
        </div>
    );
};

export default ScanInput;
