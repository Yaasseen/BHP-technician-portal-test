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
    ArrowLeftOutlined,
    PhoneOutlined,
    CheckCircleOutlined,
    SettingOutlined,
    UploadOutlined,
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
    const [statusConflict, setStatusConflict] = useState(null);
    const pendingFormDataRef = useRef(null);
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

    const compressImage = (base64Str, maxWidth = 1200, maxHeight = 1200, quality = 0.7) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
        });
    };

    const captureImage = async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            const compressed = await compressImage(imageSrc);
            setCameraImage(compressed);
        }
    };
    const triggerReload = () => {
        setReloadList((prev) => !prev);
    };
    const videoConstraints = {
        facingMode: useFrontCamera ? "user" : { exact: "environment" },
    };

    const submitActivity = (formData, forceOverride = false) => {
        if (forceOverride) {
            formData.set("force_override", "1");
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
                setStatusConflict(null);
                pendingFormDataRef.current = null;
                setCameraImage(null);
                setImageShow(null);
                setUploadImage();
                setCallStatus((prev) => !prev);
                setSubmitLoading(false);
            })
            .catch((error) => {
                console.log("==> 1", error.response?.data?.error);
                console.log("==> 2", error.response?.data?.message);
                console.log("==> 3", error.response?.data);

                if (error.response?.status === 409 && error.response?.data?.conflict) {
                    setStatusConflict({
                        portalStatus: error.response.data.portal_status,
                        bcStatus: error.response.data.bc_status,
                        submittedStatus: error.response.data.submitted_status,
                    });
                    setCallStatus((prev) => !prev);
                    setSubmitLoading(false);
                    return;
                }

                const errorMessage =
                    error.response?.data?.error || error.response?.data?.message || "An error occurred";
                messageApi.open({
                    type: "error",
                    content: errorMessage,
                    duration: 6,
                });
                if (error.response?.status === 409) {
                    setCallStatus((prev) => !prev);
                }
                setCameraImage(null);
                setImageShow(null);
                setUploadImage();
                setSubmitLoading(false);
            });
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

        pendingFormDataRef.current = formData;
        submitActivity(formData);
    };

    const handleSaveAnyway = () => {
        if (!pendingFormDataRef.current) return;
        submitActivity(pendingFormDataRef.current, true);
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

        const reader = new FileReader();
        reader.onload = async (e) => {
            const compressed = await compressImage(e.target.result);
            setCameraImage(compressed);
            setImageShow(null); // Clear file upload state to use compressed base64 instead
            setUploadImage(compressed);
            console.log("Compressed image size:", Math.round(compressed.length / 1024), "KB");
        };
        reader.readAsDataURL(file);
    };

    const ClearSignature = () => {
        signRef.current.clear();
    };

    const handleSignature = () => {
        if (signRef.current && !signRef.current.isEmpty()) {
            try {
                const signature = signRef.current
                    .getTrimmedCanvas()
                    .toDataURL("image/png");
                setSignData(signature);
            } catch (e) {
                // Fallback if trimmed canvas has 0 dimensions
                const signature = signRef.current
                    .getCanvas()
                    .toDataURL("image/png");
                setSignData(signature);
            }
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
            label: "Product Type:",
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center max-w-sm w-full text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center relative">
                        <Spin indicator={<LoadingOutlined className="text-3xl text-red-600" spin />} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-black text-slate-900 tracking-tight m-0">Syncing Service Details</h3>
                        <p className="text-xs font-semibold text-slate-500 m-0">Fetching live data directly from Business Central...</p>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
                        <div className="bg-gradient-to-r from-red-500 to-purple-600 h-full w-2/3 animate-pulse rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {contextHolder}

            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 px-5 pt-5 pb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-8 -mb-8 blur-xl"></div>

                <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <button
                            onClick={handleScreenContent}
                            className="mt-1 text-white text-xl bg-transparent border-0 p-0 cursor-pointer"
                        >
                            <ArrowLeftOutlined />
                        </button>
                        <div>
                            <h1 className="text-xl font-extrabold text-white leading-tight m-0">Service Details</h1>
                            <p className="text-white/70 text-xs font-semibold mt-0.5">Job #{serviceData?.jobNo || document_no}</p>
                        </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg mt-0.5">
                        <span className="text-white font-bold text-[10px] tracking-widest uppercase">
                            {serviceData?.status || "PENDING"}
                        </span>
                    </div>
                </div>
            </div>

            {/* All Content Container */}
            <div className="max-w-7xl mx-auto px-5 -mt-8 relative z-10 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column: Reference Info (Overview & Details) */}
                    {/* Left Column: Reference Info (Overview Only) */}
                    <div className="space-y-5 lg:col-span-1">
                        {/* Overview Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-5">
                            <h3 className="text-slate-900 font-bold text-lg mb-6 border-b border-slate-100 pb-4">Overview</h3>
                            <div className="space-y-5">
                                {descriptions.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 group">
                                        <div className="mt-1 text-slate-400 text-lg group-hover:text-red-600 transition-colors duration-300">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{item.label}</p>
                                            <p className="text-slate-900 font-bold text-sm leading-snug break-words">{item.value || "N/A"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details, Spare Parts, Form, History */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Details Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-slate-900 font-bold text-lg m-0">Details</h3>
                                {user.Role !== "Read Only" && (
                                    <Button
                                        onClick={() => setModelOpen(true)}
                                        className="bg-red-600 text-white font-bold h-9 px-4 rounded-lg border-none shadow-sm hover:bg-red-700 transition-colors"
                                    >
                                        Request SparePart
                                    </Button>
                                )}
                            </div>
                            <div className="overflow-x-auto border border-slate-100 rounded-lg">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">SN.</th>
                                            <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Document No</th>
                                            <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Line No</th>
                                            <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Service Item No</th>
                                            <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Group Code</th>
                                            <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Item No.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <tr>
                                            <td className="px-5 py-4 text-slate-500 font-bold text-xs">1</td>
                                            <td className="px-5 py-4 text-slate-700 font-bold text-xs whitespace-nowrap">{dataSource?.[0]?.documentNo || 'N/A'}</td>
                                            <td className="px-5 py-4 text-slate-700 font-bold text-xs whitespace-nowrap">{dataSource?.[0]?.lineNo || 'N/A'}</td>
                                            <td className="px-5 py-4 text-slate-700 font-bold text-xs whitespace-nowrap">{dataSource?.[0]?.serviceItemNo || 'N/A'}</td>
                                            <td className="px-5 py-4 text-slate-700 font-bold text-xs whitespace-nowrap">{dataSource?.[0]?.serviceItemGroupCode || ''}</td>
                                            <td className="px-5 py-4 text-slate-700 font-bold text-xs whitespace-nowrap">{dataSource?.[0]?.itemNo || 'N/A'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Service Spare Part Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-slate-900 font-bold text-lg mb-6">Service Spare Part</h3>

                            {loadingInfo ? (
                                <div className="flex justify-center py-8"><Spin /></div>
                            ) : data && data.length > 0 ? (
                                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                                                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">No</th>
                                                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Location Code</th>
                                                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.map((part, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-5 py-4 text-slate-700 font-bold text-xs whitespace-nowrap">{part.Type || 'N/A'}</td>
                                                    <td className="px-5 py-4 text-slate-700 font-bold text-xs whitespace-nowrap">{part.No || 'N/A'}</td>
                                                    <td className="px-5 py-4 text-slate-700 font-bold text-xs">{part.Description || `Part ${idx + 1}`}</td>
                                                    <td className="px-5 py-4 text-slate-700 font-bold text-xs whitespace-nowrap">{part.Location_Code || 'N/A'}</td>
                                                    <td className="px-5 py-4 text-slate-700 font-bold text-xs whitespace-nowrap">{part.Quantity || 0}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <FileOutlined className="text-3xl mb-2 opacity-50" />
                                    <p className="text-sm m-0">No data</p>
                                </div>
                            )}
                        </div>

                        {/* Log Activity Form */}
                        {user.Role !== "Read Only" ? (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSubmitForm}
                                    className="space-y-6"
                                    initialValues={{
                                        repair_status_code: serviceData?.taskCode,
                                        service_order_status: serviceData?.status,
                                    }}
                                >
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-slate-900 font-bold text-sm mb-2">Service Order Business Central Status</p>
                                            <Form.Item name="repair_status_code" className="mb-0">
                                                <Select
                                                    className="h-10 rounded-lg"
                                                    loading={loading}
                                                    placeholder="Select BC Status"
                                                    options={taskCode.map((task) => ({
                                                        label: task.taskDescription,
                                                        value: task.taskCode,
                                                    }))}
                                                />
                                            </Form.Item>
                                        </div>

                                        <div>
                                            <p className="text-slate-900 font-bold text-sm mb-2">Service Order Portal Status</p>
                                            <Form.Item name="service_order_status" className="mb-0">
                                                <Select
                                                    className="h-10 rounded-lg"
                                                    loading={loadingInfo}
                                                    placeholder="Select Portal Status"
                                                    options={statusOptions.map((opt) => ({
                                                        label: `${opt.value} - ${opt.label}`,
                                                        value: opt.value,
                                                    }))}
                                                />
                                            </Form.Item>
                                        </div>

                                        <div>
                                            <p className="text-slate-900 font-bold text-sm mb-2">Description</p>
                                            <Form.Item name="description" className="mb-0">
                                                <Input.TextArea
                                                    rows={3}
                                                    className="rounded-lg border-slate-200 focus:border-red-500 focus:shadow-red-100"
                                                    placeholder="Enter description..."
                                                />
                                            </Form.Item>
                                        </div>

                                        <div>
                                            <p className="text-slate-900 font-bold text-sm mb-2">Upload Image</p>
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center transition-colors hover:border-red-200">
                                                {!showWebcam && !cameraImage && !imageShow ? (
                                                    <div className="space-y-3">
                                                        <CameraOutlined className="text-3xl text-slate-300" />
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button type="text" onClick={handleClick} className="text-red-600 font-bold hover:bg-red-50 px-3 h-8">Capture</Button>
                                                            <span className="text-slate-400 text-xs">or</span>
                                                            <Dropzone onDrop={handleUpload}>
                                                                {({ getRootProps, getInputProps }) => (
                                                                    <div {...getRootProps()} className="inline-block cursor-pointer">
                                                                        <input {...getInputProps()} />
                                                                        <span className="text-red-600 font-bold hover:underline text-sm px-2">browse files</span>
                                                                    </div>
                                                                )}
                                                            </Dropzone>
                                                        </div>
                                                        <p className="text-xs text-slate-400 m-0">Supports: PNG, JPG</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center w-full">
                                                        {showWebcam && !cameraImage && (
                                                            <div className="w-full max-w-md mb-4">
                                                                <div className="rounded-lg overflow-hidden border-2 border-slate-200 mb-3 bg-black">
                                                                    <Webcam
                                                                        audio={false}
                                                                        screenshotFormat="image/jpeg"
                                                                        ref={webcamRef}
                                                                        videoConstraints={videoConstraints}
                                                                        className="w-full"
                                                                    />
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    <Button type="primary" onClick={captureImage} className="flex-1 bg-red-600 h-10 rounded-lg font-bold">Capture Photo</Button>
                                                                    <Button onClick={handleResetCam} className="flex-1 h-10 rounded-lg font-bold">Cancel</Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {(cameraImage || imageShow) && (
                                                            <div className="relative inline-block group">
                                                                <img
                                                                    src={cameraImage || uploadImage}
                                                                    className="h-48 w-auto object-cover rounded-lg shadow-sm border border-slate-200"
                                                                    alt="Evidence"
                                                                />
                                                                <Button
                                                                    onClick={handleReset}
                                                                    className="absolute -top-2 -right-2 rounded-full bg-white text-slate-500 border shadow-md h-7 w-7 flex items-center justify-center text-xs hover:text-red-500 hover:border-red-200"
                                                                >
                                                                    ✕
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-slate-900 font-bold text-sm m-0">Signature</p>
                                                <Button size="small" type="text" onClick={ClearSignature} className="text-slate-400 text-xs hover:text-red-500">Clear</Button>
                                            </div>
                                            <div className="bg-white rounded-xl border border-slate-200 h-[160px] relative overflow-hidden">
                                                <ReactSignatureCanvas
                                                    ref={signRef}
                                                    penColor="black"
                                                    onEnd={handleSignature}
                                                    canvasProps={{
                                                        className: "w-full h-full cursor-crosshair block",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-slate-50 mt-6">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm h-10 px-8 shadow-sm shadow-red-200 border-none transition-all flex items-center justify-center gap-2"
                                            loading={submitLoading}
                                            disabled={submitLoading}
                                        >
                                            {submitLoading ? "Syncing with Business Central..." : "Update"}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <p>Read Only Mode - Cannot log activity.</p>
                            </div>
                        )}

                        {/* History */}
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                            <h3 className="text-slate-900 font-bold text-sm mb-4 border-b border-slate-200 pb-2">History</h3>
                            <ServiceOrderActivities
                                document_no={document_no}
                                uploadTrigger={uploadTrigger}
                                reloadList={modelOpen}
                            />
                        </div>
                    </div>

                </div>
            </div>

            <Modal
                open={modelOpen}
                onCancel={handleModelClose}
                footer={null}
                centered
                className="modern-modal"
            >
                <SparePartForm
                    serviceItemNo={dataSource[0]?.serviceItemNo}
                    locationOptions={locationOptions}
                    document_no={document_no}
                    sparePartsData={spareParts}
                    loadingState={loadingData}
                    formResponse={() => handleModelClose()}
                    reloadList={() => triggerReload()}
                    handleSparePart={handleSparePart}
                />
            </Modal>

            <Modal
                open={!!statusConflict}
                title="Status has changed in Business Central"
                onCancel={() => setStatusConflict(null)}
                centered
                okText="Save Anyway"
                cancelText="Cancel"
                onOk={handleSaveAnyway}
                confirmLoading={submitLoading}
            >
                <p>
                    The repair status in Business Central has changed since this
                    page was loaded, so saving now would overwrite that change.
                </p>
                <Descriptions bordered size="small" column={1} className="mt-4">
                    <Descriptions.Item label="Portal status (when page loaded)">
                        {statusConflict?.portalStatus || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Current status in Business Central">
                        {statusConflict?.bcStatus || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status you're trying to save">
                        {statusConflict?.submittedStatus || "-"}
                    </Descriptions.Item>
                </Descriptions>
                <p className="mt-4 text-gray-500 text-sm">
                    "Save Anyway" will overwrite Business Central's status with
                    the one you selected. Cancel to keep Business Central's
                    current status instead.
                </p>
            </Modal>
        </div >
    );
}

export default ServiceDetails;
