import React, { useEffect, useState } from "react";
import { Card, Table, Button, Typography, Spin, message, Input } from "antd";
import axios from "axios";
import moment from "moment";
import { LoadingOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;

const ServiceOrderSelection = ({
    day,
    schedule_date,
    department,
    region,
    modelClose,
    selectedOrder,
    handleClose,
    count,
}) => {
    const [serviceOrders, setServiceOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [buttonLoading, setButtonLoading] = useState(false);
    const [outdoorOrder, setOutdoorOrder] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const maxSelectable = 12 - count;

    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });

    console.log("==>", schedule_date);

    useEffect(() => {
        setSearchText("");
    }, [modelClose]);

    const [filter, setFilter] = useState({
        scheduled: false,
        not_scheduled: false,
        period: "all",
    });

    useEffect(() => {
        const fetchOutdoorServiceOrders = async () => {
            setLoading(true);
            try {
                const response = await axios.post("/outdoor-service-orders", {
                    tableParams: { pagination: tableParams.pagination },
                    searchText,
                    filter,
                });

                if (response.data && response.data.serviceOrders) {
                    const { data, current_page, per_page, total } =
                        response.data.serviceOrders;

                    setServiceOrders(data);
                    setTableParams((prev) => ({
                        ...prev,
                        pagination: {
                            current: current_page,
                            pageSize: per_page,
                            total,
                        },
                    }));
                }
            } catch (error) {
                messageApi.error("Error fetching outdoor service orders.");
                console.error(
                    "API Error:",
                    error.response ? error.response.data : error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOutdoorServiceOrders();
    }, [
        tableParams.pagination.current,
        tableParams.pagination.pageSize,
        filter.scheduled,
        filter.not_scheduled,
        filter.period,
        searchText,
        outdoorOrder,
    ]);

    const handleTableChange = (pagination) => {
        setTableParams((prev) => ({
            ...prev,
            pagination: {
                ...prev.pagination,
                current: pagination.current,
            },
        }));
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setTableParams((prev) => ({
            ...prev,
            pagination: {
                ...prev.pagination,
                current: 1,
            },
        }));
    };

    const handleSelectionChange = (selectedRowKeys) => {
        if (selectedRowKeys.length > maxSelectable) {
            messageApi.warning(
                `You can only select up to ${maxSelectable} service orders.`
            );
            return;
        }
        setSelectedOrders(selectedRowKeys);
    };

    const handleConfirm = async () => {
        const formattedDate = moment(schedule_date, [
            "DD/MM/YYYY",
            "YYYY/MM/DD",
        ]).format("YYYY/MM/DD");

        if (selectedOrders.length === 0) {
            messageApi.warning("Please select at least one service order.");
            return;
        }
        try {
            setButtonLoading(true);
            await axios.post(
                "/service-orders/assign-outdoor-department-region",
                {
                    schedule_date: formattedDate,
                    region: region.replace(/\s/g, ""),
                    department,
                    day,
                    selectedOrders,
                }
            );
            messageApi.success("Service orders assigned successfully!");
            setOutdoorOrder(!outdoorOrder);
            setSelectedOrders([]);
            modelClose();
            selectedOrder();
            setSearchText("");
        } catch (error) {
            if (error.response?.data?.error) {
                messageApi.error(error.response.data.error);
            } else {
                messageApi.error(
                    "Error assigning service orders. Please try again."
                );
            }
            console.error("Error submitting service orders:", error);
        }
        setButtonLoading(false);
    };

    const columns = [
        {
            title: "Document No",
            dataIndex: "document_no",
            key: "document_no",
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Order Date",
            dataIndex: "order_date",
            key: "order_date",
            responsive: ["sm"],
            render: (text) => moment(text).format("YYYY-MM-DD"),
        },
        {
            title: "Service Order Status",
            dataIndex: "service_order_status",
            key: "service_order_status",
            responsive: ["sm"],
        },
        {
            title: "Schedule Status",
            dataIndex: "schedule_date",
            ket: "schedule_date",
            responsive: ["sm"],
        },
    ];

    return (
        <>
            {contextHolder}
            <div className="mx-auto mb-4 mt-4">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <Search
                            placeholder="Search by Name or Document No"
                            allowClear
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-1/2"
                        //disabled={loading}
                        />
                        <span className="text-gray-600">
                            Selected: {count} / 12
                        </span>
                    </div>

                    <Table
                        size="middle"
                        scroll={{ y: "70vh" }}
                        loading={loading}
                        rowSelection={{
                            type: "checkbox",
                            selectedRowKeys: selectedOrders,
                            onChange: handleSelectionChange,
                        }}
                        columns={columns}
                        dataSource={serviceOrders}
                        rowKey="document_no"
                        pagination={tableParams.pagination}
                        onChange={handleTableChange}
                    />

                    <div className="flex justify-end mt-2 space-x-4">
                        <Button type="text" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 text-white hover:bg-red-700 border-none h-10 font-bold px-6 shadow-md shadow-red-100"
                            onClick={handleConfirm}
                            disabled={selectedOrders.length === 0}
                        >
                            {buttonLoading ? (
                                <Spin
                                    indicator={
                                        <LoadingOutlined
                                            spin
                                            className="text-white"
                                        />
                                    }
                                />
                            ) : (
                                <p>Confirm Scheduling</p>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </>
    );
};

export default ServiceOrderSelection;
