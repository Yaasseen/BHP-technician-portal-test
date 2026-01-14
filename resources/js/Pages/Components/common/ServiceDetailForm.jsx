import { Form, Select } from "antd";
import FormItem from "antd/es/form/FormItem";
import TextArea from "antd/es/input/TextArea";
import React from "react";
import Webcam from "react-webcam";

function ServiceDetailForm() {
    const [uploadFile, setUploadFile] = useState("");
    const [cameraImage, setCameraImage] = useState(null);
    return (
        <div>
            <div>
                <Form>
                    <Form.Item label="Service Status" name="serviceStatus">
                        <Select></Select>
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <TextArea rows={4} placeholder="Description" />
                    </Form.Item>
                    <Form.Item>
                        <span className="border rounded-lg p-2">
                            <button onClick={handleClick}>
                                {!showWebcam && (
                                    <CameraOutlined
                                        style={{ fontSize: "30px" }}
                                    />
                                )}
                                {showWebcam && !cameraImage && (
                                    <WebcamCapture
                                        setCameraImage={setCameraImage}
                                    />
                                )}
                                {cameraImage && (
                                    <div className="mt-4">
                                        <div>
                                            <p className="text-sm pb-2">
                                                Captured Image:
                                            </p>
                                            <img
                                                src={cameraImage}
                                                alt="Captured"
                                                style={{
                                                    maxWidth: "300px",
                                                    maxHeight: "300px",
                                                }}
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <Button onClick={handleReset}>
                                                Click Picture again
                                            </Button>
                                            <Button
                                                className="ml-4"
                                                onClick={() => {
                                                    setUploadFile(cameraImage);
                                                    setShowWebcam(false);
                                                }}
                                            >
                                                Upload Image
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </button>
                        </span>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

const WebcamCapture = ({ setCameraImage }) => {
    const webcamRef = React.useRef(null);

    const captureImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCameraImage(imageSrc);
    };

    return (
        <div>
            <Webcam
                audio={false}
                height={720}
                screenshotFormat="image/jpeg"
                width={1280}
                ref={webcamRef}
                style={{
                    maxWidth: "300px",
                    maxHeight: "300px",
                }}
            />
            <div className="pt-2 space-x-2">
                <Button onClick={captureImage}>Capture photo</Button>
                <Button>Close</Button>
            </div>
        </div>
    );
};
export default ServiceDetailForm;
