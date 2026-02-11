import {
    Button,
    Descriptions,
    Form,
    Input,
    Select,
    Table,
    Spin,
    message,
    Modal,
    Tag,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import Webcam from "react-webcam";
import {
    UserOutlined,
    FileOutlined,
    HomeOutlined,
    CalendarOutlined,
    DollarOutlined,
    CameraOutlined,
} from "@ant-design/icons";
import axios from "axios";
import TextArea from "antd/es/input/TextArea";
import ReactSignatureCanvas from "react-signature-canvas";
import DetailCard from "../Components/common/DetailsCard";
import ServiceOrderActivities from "../Components/common/ServiceOrderActivities";
import SparePartForm from "../Components/common/SparePartForm";
import { LoadingOutlined } from "@ant-design/icons";

function ServiceDetails({ user, document_no, ScreenDashboard }) {
    const [uploadFile, setUploadFile] = useState("");
    const [cameraImage, setCameraImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showWebcam, setShowWebcam] = useState(false);
    const [imageShow, setImageShow] = useState();
    const [uploadImage, setUploadImage] = useState();
    const [signData, setSignData] = useState();
    const [taskCode, setTaskCode] = useState([]);
    const [serviceData, setServiceData] = useState({});
    const [modelOpen, setModelOpen] = useState(false);
    const [uploadTrigger, setUploadTrigger] = useState(false);
    const [reloadList, setReloadList] = useState(false);
    const [useFrontCamera, setUseFrontCamera] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();
    const [spareParts, setSpareParts] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [statusOptions, setStatusOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [callStatus, setCallStatus] = useState(false);

    const [data, setData] = useState([]);

    const webcamRef = React.useRef(null);
    const signRef = useRef();

    const handleClick = () => {
        setShowWebcam(true);
    };

    const handleReset = () => {
        setCameraImage(null);
        setShowWebcam(true);
    };
    const handleResetCam = () => {
        setCameraImage(null);
        setShowWebcam(false);
    };
    const handleSparePart = () => {
        setCallStatus(!callStatus);
    };

    const handleCloseWebCamp = () => {
        setShowWebcam((prev) => !prev);
    };
    const captureImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCameraImage(imageSrc);
    };
    const triggerReload = () => {
        setReloadList((prev) => !prev);
    };
    const videoConstraints = {
        facingMode: useFrontCamera ? "user" : { exact: "environment" },
    };

    const handleSubmitForm = (values) => {
        const formData = new FormData();
        formData.append("repair_status_code", values.repair_status_code);
        formData.append("description", values.description);

        // Ensure the correct value is used for service_order_status
        const serviceOrderStatusSelection = serviceData?.serviceOrderStatus;

        formData.append("service_order_status", serviceOrderStatusSelection);
        formData.append("status", values.service_order_status);
        formData.append("document_no", document_no);
        formData.append("signature", signData);

        // Only send the file if it exists

        if (cameraImage) {
            formData.append("image", cameraImage);
        }
        if (imageShow) {
            formData.append("image_file", imageShow);
        }

        setSubmitLoading(true);

        axios
            .post("/service-order-activities", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                const successMessage = response.data.message;
                messageApi.open({
                    type: "success",
                    content: successMessage,
                });
                form.resetFields();
                ClearSignature();
                setUploadTrigger(!uploadTrigger);
                handleResetCam();
                setSubmitLoading(false);
            })
            .catch((error) => {
                console.log("==> 1", error.response?.data?.error);
                console.log("==> 2", error.response?.data?.message);
                console.log("==> 3", error.response?.data);

                const errorMessage =
                    error.response?.data?.error || "An error occurred";
                messageApi.open({
                    type: "error",
                    content: errorMessage,
                });
            })
            .finally(() => {
                setCameraImage(null);
                setImageShow(null);
                setUploadImage();
                setCallStatus(!callStatus);
                setSubmitLoading(false);
            });
    };

    useEffect(() => {
        if (!document_no) return;
        //setLoading(true);
        setLoadingInfo(true);
        axios
            .get("/service-spare-parts", { params: { document_no } })
            .then((resp) => {
                console.log("Response:", resp.data);
                setData(resp.data.data || []);
            })
            .catch((err) => console.error("Error:", err));
    }, [document_no, callStatus]);

    useEffect(() => {
        const fetchList = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get("/spare-part-list");
                const parts = response.data.value.map((part) => ({
                    label: part.Description,
                    value: part.No,
                    description: part.Description,
                }));
                setSpareParts(parts);
            } catch (error) {
                console.error("Error fetching spare parts:", error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchList();
    }, [callStatus]);

    useEffect(() => {
        const serviceData = () => {
            axios.get("/repair-status-list").then((response) => {
                const TaskCode = Object.values(response.data).map(
                    (taskData) => ({
                        taskCode: taskData.Code,
                        taskDescription: taskData.Description,
                        serviceOrderStatus: taskData.Service_Order_Status,
                    })
                );
                setTaskCode(TaskCode);
            });
        };
        serviceData();
    }, [callStatus]);

    useEffect(() => {
        const ServiceDetailsData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `/service-orders/${document_no}`
                );

                const formattedData = {
                    customerNo: response.data.customer_no,
                    jobNo: response.data.document_no,
                    billToCustomerNo: response.data.warranty_type,
                    billToAddress: response.data.address,
                    shipToName: response.data.name,
                    orderDate: response.data.order_date,
                    postingDate: new Date(
                        response.data.created_at
                    ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    }),
                    paymentDiscountDate: new Date(
                        response.data.updated_at
                    ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    }),
                    genBusPosingGroup: response.data.repair_status_code,
                    name1: response.data.name,
                    name2: response.data.name,
                    address: response.data.address,
                    billToCountry: response.data.city,
                    serviceOrderType: response.data.description,
                    taskDescription: response.data.description,
                    taskCode: response.data.repair_status_code,
                    serviceOrderStatus: response.data.service_order_status,
                    line_no: response.data.line_no,
                    itemNo: response.data.item_no,
                    serviceItemNo: response.data.service_item_no,
                    serviceItemGroupCode: response.data.service_item_group_code,
                    status: response.data.status,
                };
                setServiceData(formattedData);
                form.setFieldsValue({
                    repair_status_code: response.data.repair_status_code,
                    service_order_status: response.data.status,
                });
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        };
        ServiceDetailsData();
    }, [document_no, callStatus]);

    useEffect(() => {
        setLoadingInfo(true);
        axios
            .get("/statuses")
            .then((resp) => {
                const options = resp.data.map((item) => ({
                    label: item.desc,
                    value: item.code,
                }));
                setStatusOptions(options);
            })
            .catch((err) => console.log("==>", err))
            .finally(() => {
                setLoadingInfo(false);
            });
    }, [callStatus]);

    useEffect(() => {
        axios
            .get("/location-list")
            .then((resp) => {
                const options = resp.data.map((item) => ({
                    label: item.Name,
                    value: item.Code,
                }));
                console.log("==>", options);

                setLocationOptions(options);
            })
            .catch((err) => console.log("==>", err));
    }, [callStatus]);

    const handleUpload = async (acceptedFiles) => {
        //const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB in bytes

        const file = acceptedFiles[0];

        const isValidImageType = (file) => {
            const validTypes = ["image/jpeg", "image/png", "image/jpg"];
            return validTypes.includes(file.type);
        };

        if (!isValidImageType(file)) {
            messageApi.open({
                type: "error",
                content: "Please upload a valid image file (jpeg, png, or jpg",
            });

            return;
        }

        // if (file.size > MAX_FILE_SIZE) {
        //     messageApi.open({
        //         type: "error",
        //         content:
        //             "File is too large. Please upload an image under 1 MB.",
        //     });
        //     return;
        // }

        setImageShow(file);
        const ImageUrl = URL.createObjectURL(file);
        setUploadImage(ImageUrl);
        console.log("==>", ImageUrl);

        console.log("==>", file);
    };

    const ClearSignature = () => {
        signRef.current.clear();
    };

    const handleSignature = () => {
        if (signRef.current) {
            const signature = signRef.current
                .getTrimmedCanvas()
                .toDataURL("image/png");
            setSignData(signature);
        }
    };

    const handleScreenContent = () => {
        ScreenDashboard();
    };
    const handleModelClose = () => {
        setModelOpen(false);
    };

    const OrderDetails = {
        customerNo: serviceData?.customerNo || "",
        jobNo: serviceData?.jobNo || "",
        billToCustomerNo: serviceData?.billToCustomerNo || "",
        billToAddress: serviceData?.billToAddress || "",
        shipToName: serviceData?.shipToName || "",
        orderDate: serviceData?.orderDate || "",
        postingDate: serviceData?.postingDate || "",
        paymentDiscountDate: serviceData?.paymentDiscountDate || "",
        genBusPosingGroup: serviceData?.genBusPosingGroup || "",
        name1: serviceData?.name1 || "",
        name2: serviceData?.name2 || "",
        address: serviceData?.address || "",
        billToCountry: serviceData?.billToCountry || "",
        serviceOrderType: serviceData?.serviceOrderType || "",
        line_no: serviceData?.line_no || "",
        itemNo: serviceData?.itemNo || "",
        serviceItemNo: serviceData?.serviceItemNo || "",
        serviceItemGroupCode: serviceData?.serviceItemGroupCode || "",
    };

    const descriptions = [
        {
            label: "Customer No:",
            value: OrderDetails.customerNo,
            icon: <UserOutlined />,
        },
        {
            label: "Job No:",
            value: OrderDetails.jobNo,
            icon: <FileOutlined />,
        },
        {
            label: "Bill to Customer No:",
            value: OrderDetails.billToCustomerNo,
            icon: <FileOutlined />,
        },
        {
            label: "Bill to Address:",
            value: OrderDetails.billToAddress,
            icon: <HomeOutlined />,
        },
        {
            label: "Ship to Name:",
            value: OrderDetails.shipToName,
            icon: <UserOutlined />,
        },
        {
            label: "Order Date:",
            value: OrderDetails.orderDate,
            icon: <CalendarOutlined />,
        },
        {
            label: "Posting Date:",
            value: OrderDetails.postingDate,
            icon: <CalendarOutlined />,
        },
        {
            label: "Payment Discount Date:",
            value: OrderDetails.paymentDiscountDate,
            icon: <DollarOutlined />,
        },
        {
            label: "Gen. Bus. Posing Group",
            value: OrderDetails.genBusPosingGroup,
            icon: <FileOutlined />,
        },
        { label: "Name1:", value: OrderDetails.name1, icon: <UserOutlined /> },
        { label: "Name2:", value: OrderDetails.name2, icon: <UserOutlined /> },
        {
            label: "Address:",
            value: OrderDetails.address,
            icon: <HomeOutlined />,
        },
        {
            label: "Bill-to Country/ Region Code:",
            value: OrderDetails.billToCountry,
            icon: <HomeOutlined />,
        },
        {
            label: "Service Order Type:",
            value: OrderDetails.serviceOrderType,
            icon: <FileOutlined />,
        },
    ];

    const dataSource = [
        {
            key: "1",
            sn: "1",
            documentNo: serviceData?.customerNo || "",
            lineNo: serviceData?.line_no || "",
            serviceItemNo: serviceData.serviceItemNo || "",
            serviceItemGroupCode: serviceData.serviceItemGroupCode || "",
            itemNo: serviceData.itemNo || "",
        },
    ];

    const columns = [
        {
            title: "SN.",
            dataIndex: "sn",
            key: "sn",
        },
        {
            title: "Document No",
            dataIndex: "documentNo",
            key: "documentNo",
        },
        {
            title: "Line No",
            dataIndex: "lineNo",
            key: "lineNo",
        },
        {
            title: "Service Item No",
            dataIndex: "serviceItemNo",
            key: "serviceItemNo",
        },
        {
            title: "Service Item Group Code",
            dataIndex: "serviceItemGroupCode",
            key: "serviceItemGroupCode",
        },
        {
            title: "Item No.",
            dataIndex: "itemNo",
            key: "itemNo",
        },
    ];

    const tableColumns = [
        { title: "Type", dataIndex: "Type", key: "type" },
        { title: "No", dataIndex: "No", key: "no" },
        { title: "Description", dataIndex: "Description", key: "description" },
        {
            title: "Location Code",
            dataIndex: "Location_Code",
            key: "location_code",
        },
        { title: "Quantity", dataIndex: "Quantity", key: "quantity" },
    ];

    const [form] = Form.useForm();

    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //             <Spin size="large" />
    //         </div>
    //     );
    // }

    console.log("Service==>", serviceData);

    return (
        <>
            {/* <button
                onClick={handleScreenContent}
                className="flex space-x-2 items-center mb-10"
            >
                <ArrowLeftOutlined />
                <p>Back to Dashboard</p>
            </button> */}

            <div className="space-y-6 pb-12">
                {contextHolder}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column: Overview */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-none border border-slate-100 overflow-hidden">
                            <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-100">
                                <h3 className="text-slate-900 font-black text-base flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-none bg-indigo-100 flex items-center justify-center">
                                        <FileOutlined className="text-indigo-600" />
                                    </div>
                                    <span className="tracking-tight">Task Overview</span>
                                </h3>
                            </div>
                            <div className="p-4">
                                <Descriptions column={1} size="small" className="minimal-descriptions">
                                    {descriptions.map((item, index) => (
                                        <Descriptions.Item
                                            key={index}
                                            label={
                                                <div className="flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-[0.12em]">
                                                    <span className="opacity-60">{item.icon}</span>
                                                    {item.label}
                                                </div>
                                            }
                                        >
                                            <span className="font-bold text-slate-700">{item.value || 'N/A'}</span>
                                        </Descriptions.Item>
                                    ))}
                                </Descriptions>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & Forms */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        {/* Task Item Details Table */}
                        <div className="app-card p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-indigo-500 rounded-none" />
                                    Device Details
                                </h3>
                                {user.Role !== "Read Only" && (
                                    <Button
                                        onClick={() => setModelOpen(true)}
                                        className="bg-indigo-500 text-white rounded-none font-black h-12 px-8 hover:bg-indigo-600 transition-all border-none text-sm group"
                                    >
                                        Request Spare Part
                                    </Button>
                                )}
                            </div>

                            <div className="overflow-x-auto rounded-none border border-gray-100">
                                <Table
                                    dataSource={dataSource}
                                    columns={columns}
                                    pagination={false}
                                    size="middle"
                                    className="modern-table"
                                />
                            </div>
                        </div>

                        {/* Spare Parts List */}
                        <div className="app-card p-6">
                            <h3 className="text-lg font-extrabold text-slate-900 mb-6 border-l-4 border-indigo-500 pl-4 h-6 flex items-center">
                                Service Spare Parts
                            </h3>
                            <div className="overflow-x-auto rounded-none border border-slate-100">
                                <Table
                                    columns={tableColumns}
                                    dataSource={data}
                                    pagination={false}
                                    scroll={{ y: 275 }}
                                    loading={loadingInfo}
                                    size="middle"
                                    className="modern-table"
                                />
                            </div>
                        </div>

                        {/* Activity Form */}
                        {user.Role !== "Read Only" && (
                            <div className="app-card p-6 md:p-8">
                                <h3 className="text-lg font-extrabold text-slate-900 mb-8 border-l-4 border-indigo-500 pl-4 h-6 flex items-center">
                                    Log Activity
                                </h3>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSubmitForm}
                                    className="modern-form"
                                    initialValues={{
                                        repair_status_code: serviceData?.taskCode,
                                        service_order_status: serviceData?.status,
                                    }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                        <Form.Item
                                            label={<span className="font-bold text-gray-700">BC Status</span>}
                                            name="repair_status_code"
                                        >
                                            <Select
                                                className="h-11 rounded-none"
                                                loading={loading}
                                                placeholder="Select BC Status"
                                                options={taskCode.map((task) => ({
                                                    label: task.taskDescription,
                                                    value: task.taskCode,
                                                }))}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span className="font-bold text-gray-700">Portal Status</span>}
                                            name="service_order_status"
                                        >
                                            <Select
                                                className="h-11 rounded-none"
                                                loading={loadingInfo}
                                                options={statusOptions.map((opt) => ({
                                                    label: `${opt.value} - ${opt.label}`,
                                                    value: opt.value,
                                                }))}
                                            />
                                        </Form.Item>
                                    </div>

                                    <Form.Item
                                        label={<span className="font-bold text-gray-700">Findings & Remarks</span>}
                                        name="description"
                                    >
                                        <Input.TextArea
                                            rows={4}
                                            className="rounded-none bg-gray-50 border-gray-200"
                                            placeholder="Enter your service findings and remarks..."
                                        />
                                    </Form.Item>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                        <Form.Item label={<span className="font-bold text-slate-700 italic">Work Evidence (Image)</span>}>
                                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-none p-6 flex flex-col items-center justify-center transition-all hover:bg-indigo-50 hover:border-indigo-300">
                                                {!showWebcam && !cameraImage && !imageShow && (
                                                    <div className="text-center group cursor-pointer" onClick={handleClick}>
                                                        <div className="w-16 h-16 bg-white rounded-none flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                                            <CameraOutlined className="text-2xl text-indigo-500" />
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-600">Take Photo or Upload</p>
                                                        <p className="text-[10px] text-slate-400 mt-1 uppercase">JPG, PNG up to 10MB</p>
                                                    </div>
                                                )}

                                                {showWebcam && !cameraImage && (
                                                    <div className="w-full flex flex-col items-center">
                                                        <div className="rounded-none overflow-hidden shadow-lg border-4 border-white mb-4">
                                                            <Webcam
                                                                audio={false}
                                                                screenshotFormat="image/jpeg"
                                                                ref={webcamRef}
                                                                videoConstraints={videoConstraints}
                                                                playsInline
                                                                className="w-full max-w-[320px]"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button onClick={captureImage} className="bg-indigo-600 text-white rounded-none h-9 font-bold border-none">Capture</Button>
                                                            <Button onClick={() => setUseFrontCamera(!useFrontCamera)} className="rounded-none h-9">Flip</Button>
                                                            <Button onClick={handleResetCam} className="rounded-none h-9">Cancel</Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {(cameraImage || imageShow) && (
                                                    <div className="relative group/preview">
                                                        <img
                                                            src={cameraImage || uploadImage}
                                                            className="w-40 h-40 object-cover rounded-none shadow-md border-4 border-white"
                                                            alt="Evidence"
                                                        />
                                                        <Button
                                                            onClick={handleReset}
                                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-none bg-red-500 text-white border-none flex items-center justify-center shadow-lg transform scale-0 group-hover/preview:scale-100 transition-transform"
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                )}

                                                {!showWebcam && !cameraImage && !imageShow && (
                                                    <Dropzone onDrop={handleUpload}>
                                                        {({ getRootProps, getInputProps }) => (
                                                            <div {...getRootProps()} className="mt-4 w-full">
                                                                <input {...getInputProps()} />
                                                                <Button ghost className="w-full border-indigo-200 text-indigo-500 rounded-none font-bold">Choose File</Button>
                                                            </div>
                                                        )}
                                                    </Dropzone>
                                                )}
                                            </div>
                                        </Form.Item>

                                        <Form.Item label={<span className="font-bold text-gray-700 italic">Customer Signature</span>}>
                                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-none p-4 transition-all hover:bg-gray-100 animate-in">
                                                <div className="bg-white rounded-none shadow-inner mb-3 overflow-hidden border border-gray-100 h-[150px]">
                                                    <ReactSignatureCanvas
                                                        ref={signRef}
                                                        penColor="black"
                                                        onEnd={handleSignature}
                                                        canvasProps={{
                                                            className: "w-full h-full cursor-crosshair",
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sign inside the box</span>
                                                    <Button size="small" type="link" onClick={ClearSignature} className="text-red-500 font-bold p-0">Clear</Button>
                                                </div>
                                            </div>
                                        </Form.Item>
                                    </div>

                                    <div className="flex justify-end pt-8">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none font-extrabold text-md shadow-xl shadow-indigo-200 transition-transform active:scale-95 border-none"
                                            loading={submitLoading}
                                        >
                                            {submitLoading ? "Updating Portal..." : "Submit Completed Activity"}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )}
                        <div className="mt-5 mb-10">
                            <ServiceOrderActivities
                                document_no={document_no}
                                uploadTrigger={uploadTrigger}
                                reloadList={modelOpen}
                            />
                        </div>
                        <div>
                            <Modal
                                open={modelOpen}
                                onCancel={handleModelClose}
                                footer={null}
                                centered
                            >
                                <SparePartForm
                                    serviceItemNo={
                                        dataSource[0]?.serviceItemNo
                                    }
                                    locationOptions={locationOptions}
                                    document_no={document_no}
                                    sparePartsData={spareParts}
                                    loadingState={loadingData}
                                    formResponse={() => handleModelClose()}
                                    reloadList={() => triggerReload()}
                                    handleSparePart={handleSparePart}
                                />
                            </Modal>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default ServiceDetails;
