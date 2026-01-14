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
} from "antd";
import React, { use, useEffect, useRef, useState } from "react";
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
import { label } from "motion/react-client";

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

            <div className="">
                {contextHolder}
                <div className="bg-white rounded-xl">
                    <div className="border-b border-gray-200 pt-10 w-full pb-5">
                        <p className="text-lg pl-10">Service Details</p>
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                        <div className="sm:col-span-4 p-5 col-span-12">
                            <Descriptions bordered column={1} title="Overview">
                                {descriptions.map((item, index) => (
                                    <Descriptions.Item
                                        key={index}
                                        label={
                                            <>
                                                <span
                                                    style={{ marginRight: 8 }}
                                                >
                                                    {item.icon}
                                                </span>
                                                {item.label}
                                            </>
                                        }
                                    >
                                        {item.value}
                                    </Descriptions.Item>
                                ))}
                            </Descriptions>
                        </div>

                        <div className="col-span-12 sm:col-span-8  sm:pr-6  pr-3 sm:pl-0 pl-3 pt-4">
                            <div className="flex justify-between items-center">
                                <div className="text-md font-semibold mb-4">
                                    Details
                                </div>
                                {user.Role !== "Read Only" && (
                                    <div>
                                        <Button
                                            onClick={() => setModelOpen(true)}
                                            className="bg-indigo-500 text-white mb-4"
                                        >
                                            Request SparePart
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="mb-5 mt-2 w-full overflow-x-auto">
                                <Table
                                    dataSource={dataSource}
                                    columns={columns}
                                    bordered
                                    className="text-sm"
                                    pagination={false}
                                />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-md font-semibold mb-4">
                                    Service Spare Part
                                </div>
                                 <div className="mb-5 mt-2 w-full overflow-x-auto">
                                    <Table
                                        columns={tableColumns}
                                        dataSource={data}
                                        bordered
                                        className="text-sm"
                                        pagination={false}
                                        scroll={{ y: 275 }}
                                        loading={loadingInfo}
                                    />
                                </div>
                            </div>

                            {user.Role !== "Read Only" && (
                                <div className=" p-0 sm:p-4 lg:p-10 border rounded-xl">
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        className="p-4"
                                        onFinish={handleSubmitForm}
                                        initialValues={{
                                            repair_status_code:
                                                serviceData?.taskCode,
                                            service_order_status:
                                                serviceData?.status,
                                        }}
                                    >
                                        {/* Repair Status Code Field */}
                                        <Form.Item
                                            label="Service Order Business Central Status"
                                            name="repair_status_code"
                                            initialValue={serviceData?.taskCode}
                                        >
                                            <Select
                                                loading={loading}
                                                onChange={(value) => {
                                                    const selectedTask =
                                                        taskCode.find(
                                                            (task) =>
                                                                task.taskCode ===
                                                                value
                                                        );
                                                  
                                                }}
                                                placeholder="Select Status Code"
                                                options={taskCode.map(
                                                    (taskCode) => ({
                                                        label: taskCode.taskDescription,
                                                        value: taskCode.taskCode,
                                                    })
                                                )}
                                            />
                                        </Form.Item>

                                        {/* Service Order Status Field */}
                                        <Form.Item
                                            label="Service Order Portal Status"
                                            name="service_order_status"
                                            initialValue={serviceData?.status}
                                        >
                                            <Select
                                                loading={loadingInfo}
                                                options={statusOptions.map(
                                                    (option) => ({
                                                        label: `${option.value} - ${option.label}`,
                                                        value: option.value,
                                                    })
                                                )}
                                                value={serviceData?.status}
                                                notFoundContent={
                                                    loadingInfo ? (
                                                        <div className="flex justify-center ">
                                                            <Spin size="small" />
                                                        </div>
                                                    ) : (
                                                        "No spare parts available"
                                                    )
                                                }
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Description"
                                            name="description"
                                        >
                                            <Input.TextArea placeholder="Enter description here" />
                                        </Form.Item>

                                        <Form.Item label="Upload Image">
                                            <div className="border rounded-lg p-5 flex flex-col items-center justify-center">
                                                <span className="border rounded-lg p-2">
                                                    <div
                                                        onClick={handleClick}
                                                        className="flex cursor-pointer"
                                                    >
                                                        {!showWebcam && (
                                                            <CameraOutlined
                                                                style={{
                                                                    fontSize:
                                                                        "30px",
                                                                }}
                                                            />
                                                        )}
                                                        {showWebcam &&
                                                            !cameraImage &&
                                                            !imageShow && (
                                                                // <WebcamCapture
                                                                //     setCameraImage={
                                                                //         setCameraImage
                                                                //     }
                                                                //     showCloseWebCam={
                                                                //         handleCloseWebCamp
                                                                //     }
                                                                // />
                                                                <div className="p-4">
                                                                    <Webcam
                                                                        audio={
                                                                            false
                                                                        }
                                                                        height={
                                                                            720
                                                                        }
                                                                        screenshotFormat="image/jpeg"
                                                                        width={
                                                                            1280
                                                                        }
                                                                        ref={
                                                                            webcamRef
                                                                        }
                                                                        videoConstraints={
                                                                            videoConstraints
                                                                        }
                                                                        playsInline={
                                                                            true
                                                                        }
                                                                        style={{
                                                                            maxWidth:
                                                                                "300px",
                                                                            maxHeight:
                                                                                "300px",
                                                                        }}
                                                                    />
                                                                    <div className="pt-2 space-x-2">
                                                                        <Button
                                                                            onClick={
                                                                                captureImage
                                                                            }
                                                                        >
                                                                            Capture
                                                                            photo
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() =>
                                                                                setUseFrontCamera(
                                                                                    (
                                                                                        prev
                                                                                    ) =>
                                                                                        !prev
                                                                                )
                                                                            }
                                                                        >
                                                                            Switch
                                                                            Camera
                                                                        </Button>
                                                                        {/* <Button
                                                                        onClick={
                                                                            handleCloseWebCamp
                                                                        }
                                                                    >
                                                                        Close
                                                                    </Button> */}
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                    <div>
                                                        {cameraImage && (
                                                            <div className="mt-4 p-4 items-center">
                                                                <p className="text-sm pb-2">
                                                                    Captured
                                                                    Image:
                                                                </p>
                                                                <img
                                                                    src={
                                                                        cameraImage
                                                                    }
                                                                    alt="Captured"
                                                                    style={{
                                                                        maxWidth:
                                                                            "100px",
                                                                        maxHeight:
                                                                            "100px",
                                                                    }}
                                                                />
                                                                <div className="pt-2 flex space-x-4">
                                                                    <Button
                                                                        onClick={
                                                                            handleReset
                                                                        }
                                                                        type="default"
                                                                    >
                                                                        Retake
                                                                        Picture
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </span>
                                                {!cameraImage && (
                                                    <div className="flex">
                                                        <Dropzone
                                                            onDrop={
                                                                handleUpload
                                                            }
                                                        >
                                                            {({
                                                                getRootProps,
                                                                getInputProps,
                                                            }) => (
                                                                <section>
                                                                    <div
                                                                        {...getRootProps()}
                                                                        className="cursor-pointer text-center py-4 "
                                                                    >
                                                                        <input
                                                                            {...getInputProps()}
                                                                        />

                                                                        <p className="text-sm mt-2 text-gray-600">
                                                                            <span className="text-sm mt-2 text-indigo-500">
                                                                                Capture
                                                                                to
                                                                                Upload
                                                                            </span>
                                                                            , or
                                                                            click
                                                                            to
                                                                            select
                                                                            files
                                                                        </p>
                                                                        <p className="text-sm mt-2 text-gray-600 pl-2">
                                                                            PNG
                                                                            or
                                                                            JPG
                                                                        </p>
                                                                    </div>
                                                                </section>
                                                            )}
                                                        </Dropzone>
                                                    </div>
                                                )}

                                                <div>
                                                    {uploadFile.length > 0 &&
                                                        !cameraImage && (
                                                            <div>
                                                                <p className="mt-4 text-sm">
                                                                    Uploaded
                                                                    File:
                                                                </p>
                                                                <ul className="list-disc list-inside text-sm">
                                                                    {uploadFile.map(
                                                                        (
                                                                            file,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                            >
                                                                                {
                                                                                    file.name
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    {uploadImage &&
                                                        !cameraImage && (
                                                            <div className="pt-2">
                                                                <img
                                                                    src={
                                                                        uploadImage
                                                                    }
                                                                    alt="Preview"
                                                                    style={{
                                                                        maxWidth:
                                                                            "300px",
                                                                        maxHeight:
                                                                            "300px",
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        </Form.Item>

                                        <Form.Item label="Signature">
                                            <div className="bg-white  lg:w-[550px] w-11/12 ">
                                                <div className="border rounded-lg m-2">
                                                    <ReactSignatureCanvas
                                                        ref={signRef}
                                                        penColor="black"
                                                        onEnd={handleSignature}
                                                        canvasProps={{
                                                            className:
                                                                "signature-canvas w-full sm:w-[400px] sm:h-[200px] h-[200px]",
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        onClick={ClearSignature}
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                            </div>
                                        </Form.Item>

                                        <div className="flex justify-end">
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                className="bg-indigo-500"
                                            >
                                                {submitLoading ? (
                                                    <div className="px-6 py-2">
                                                        <Spin
                                                            indicator={
                                                                <LoadingOutlined
                                                                    spin
                                                                    className="text-white"
                                                                />
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    "Update"
                                                )}
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
            </div>
        </>
    );
}

export default ServiceDetails;
