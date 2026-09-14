import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table,
    Button,
    Input,
    Radio,
    Divider,
    Popover,
    Modal,
    Checkbox,
    Pagination,
    DatePicker,
    Select,
    Tag,
    Empty,
    Badge,
    message,
} from "antd";
import {
    SearchOutlined,
    MoreOutlined,
    CalendarOutlined,
    FilterOutlined,
    DownloadOutlined,
} from "@ant-design/icons";

import AssignTeam from "../common/AssignTeam";
import ScheduledTask from "../common/ScheduledTask";
import AssignRegion from "../common/AssignRegion";
import { title } from "motion/react-client";
import { set } from "date-fns";
import SiderDrawer from "../common/SideDrawer";
import { exportToExcel } from "../../../utils/exportToExcel";

const TaskTable = ({ user, screenContent, RefreshStatistics }) => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });

    const [isAssignTeamVisible, setIsAssignTeamVisible] = useState(false);
    const [isAssignDeptVisible, setIsAssignDeptVisible] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [scheduledModal, setScheduledModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [scheduledDate, setScheduleDate] = useState(null);
    const [isScheduled, setIsScheduled] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [appliedSearchText, setAppliedSearchText] = useState("");
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [taskCode, setTaskCode] = useState([]);
    const [brandCode, setBrandCode] = useState([]);
    const [teamList, setTeamList] = useState([]);
    const [portalStatus, setPortalStatus] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [specificDate, setSpecificDate] = useState(null);
    const [siderOpen, setSiderOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [filter, setFilter] = useState({
        scheduled: false,
        not_scheduled: false,
        period: "all",
        start: null,
        end: null,
        specific_date: null,
        repair_status_code: null,
        brand_code: null,
        team: null,
        status: null,
    });

    const [appliedFilter, setAppliedFilter] = useState({
        scheduled: false,
        not_scheduled: false,
        period: "all",
        start: null,
        end: null,
        specific_date: null,
        repair_status_code: null,
        brand_code: null,
        team: null,
        status: null,
    });

    const fetchData = () => {
        setLoading(true);
        axios
            .post("/service-orders", {
                tableParams,
                searchText: appliedSearchText,
                filter: appliedFilter,
            })
            .then((results) => {
                setData(results.data.serviceOrders.data);
                setTableParams((prev) => ({
                    ...prev,
                    pagination: {
                        ...prev.pagination,
                        current: results.data.serviceOrders.current_page,
                        pageSize: results.data.serviceOrders.per_page,
                        total: results.data.serviceOrders.total,
                    },
                }));
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                messageApi.open({
                    type: "error",
                    content: "Failed to fetch data. Please try again.",
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

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
    }, []);

    // Brand Code List
    useEffect(() => {
        const BrandCodeData = () => {
            axios.get("/brand-code").then((response) => {
                const brandData = response.data;
                setBrandCode(brandData);
            });
        };
        BrandCodeData();
    }, []);

    //Team List
    useEffect(() => {
        const TeamListData = () => {
            axios.get("/allocated-teams").then((response) => {
                const teamData = response.data;
                setTeamList(teamData);
            });
        };
        TeamListData();
    }, []);

    // Service Order portal status

    useEffect(() => {
        const PortalStatusData = () => {
            axios.get("/service-order-portal-status").then((response) => {
                const rawStatuses = response.data;
                const transformedStatuses = rawStatuses.map((status) => ({
                    label: status,
                    value: status,
                }));
                setPortalStatus(transformedStatuses);
            });
        };
        PortalStatusData();
    }, []);

    useEffect(fetchData, [
        tableParams.pagination?.current,
        tableParams.pagination?.pageSize,
        appliedFilter,
        appliedSearchText,
        scheduledModal,
        isAssignDeptVisible,
        isAssignTeamVisible,
    ]);

    const clearFilter = () => {
        // Clear selected filters
        setFilter({
            scheduled: false,
            not_scheduled: false,
            period: "all",
            start: null,
            end: null,
            specific_date: null,
            repair_status_code: null,
            brand_code: null,
            team: null,
            portal_status: null,
        });

        // Clear applied filters too
        setAppliedFilter({
            scheduled: false,
            not_scheduled: false,
            period: "all",
            start: null,
            end: null,
            specific_date: null,
            repair_status_code: null,
            brand_code: null,
            team: null,
            portal_status: null,
        });

        setFromDate(null);
        setToDate(null);
        setSpecificDate(null);

        setSearchText("");
        setAppliedSearchText("");

        setTableParams((prev) => ({
            ...prev,
            pagination: {
                current: 1,
                pageSize: 10,
            },
        }));

        setSiderOpen(false);
    };

    const applyFilter = () => {
        setAppliedFilter({ ...filter });

        setAppliedSearchText(searchText);

        setTableParams((prev) => ({
            ...prev,
            pagination: {
                current: 1,
                pageSize: 10,
            },
        }));

        setSiderOpen(false);
    };

    useEffect(() => {
        RefreshStatistics();
    }, [isAssignDeptVisible]);

    const handleSearch = (value) => {
        setTableParams({
            ...tableParams,
            pagination: {
                current: 1,
                pageSize: 10,
            },
        });
        setSearchText(value);
        setAppliedSearchText(value);
    };

    const handlePeriodFilterChange = (e) => {
        setFilter({
            ...filter,
            period: e.target.value,
        });
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
        });
        console.log("==>", Pagination);

        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    };

    const handleDateChange = (date, type) => {
        if (type === "from") {
            setFromDate(date);
            setFilter((prev) => ({
                ...prev,
                start: date ? date.format("YYYY-MM-DD") : null,
            }));
        } else if (type === "to") {
            setToDate(date);
            setFilter((prev) => ({
                ...prev,
                end: date ? date.format("YYYY-MM-DD") : null,
            }));
        } else if (type === "single") {
            setFromDate(null);
            setToDate(null);
            setSpecificDate(date);
            setFilter((prev) => ({
                ...prev,
                start: null,
                end: null,
                specific_date: date ? date.format("YYYY-MM-DD") : null,
            }));
        }
    };

    const handleRepairStatusChange = (value) => {
        setFilter((prev) => ({
            ...prev,
            repair_status_code: value,
        }));
    };

    const handlePortalStatusChange = (value) => {
        setFilter((prev) => ({
            ...prev,
            portal_status: value,
        }));
    };

    const handleBrandCodeChange = (value) => {
        setFilter((prev) => ({
            ...prev,
            brand_code: value,
        }));
    };

    const handleTeamChange = (value) => {
        setFilter((prev) => ({
            ...prev,
            team: value,
        }));
    };

    const handleAssignTeamOpen = (document_no) => {
        setSelectedTaskId(document_no);
        setIsAssignTeamVisible(true);
        setIsPopoverOpen(false);
    };

    const handleAssignRegionOpen = (document_no) => {
        setSelectedTaskId(document_no);
        setIsAssignDeptVisible(true);
        setIsPopoverOpen(false);
    };

    const handleBulkOrderAssign = () => {
        setIsAssignDeptVisible(true);
        setIsPopoverOpen(false);
    };
    const handleScheduledModalOpen = (document_no) => {
        setSelectedTaskId(document_no);
        setScheduledModal(true);
        setIsPopoverOpen(false);
    };

    const handleAssignTeamClose = () => {
        setIsAssignTeamVisible(false);
        setSelectedTaskId(null);
    };
    const handleAssignRegionClose = () => {
        setIsAssignDeptVisible(false);
        setSelectedTaskId(null);
    };
    const handleScheduledModalClose = () => {
        setScheduledModal(false);
    };
    const handleShowService = (document_no) => {
        screenContent(document_no);
    };

    const handleSelectionChange = (selectedRowKeys) => {
        setSelectedOrders(selectedRowKeys);
    };

    const statusColor = (value) => {
        if (!value) return "default";
        const v = value.toUpperCase();
        if (v.includes("CANCEL")) return "red";
        if (v.includes("FINISH") || v.includes("COMPLETE")) return "green";
        if (v.includes("TECH-ASSN") || v.includes("ASSN")) return "purple";
        if (v.startsWith("ASGND")) return "blue";
        if (v.startsWith("RECD")) return "cyan";
        if (v === "PENDING") return "default";
        return "geekblue";
    };

    const activeFilterCount = [
        appliedFilter.scheduled,
        appliedFilter.not_scheduled,
        appliedFilter.period && appliedFilter.period !== "all",
        appliedFilter.repair_status_code,
        appliedFilter.brand_code,
        appliedFilter.team,
        appliedFilter.portal_status,
        appliedFilter.start,
        appliedFilter.end,
        appliedFilter.specific_date,
    ].filter(Boolean).length;

    const exportColumns = [
        { header: "Document No", key: "document_no" },
        { header: "Order Date", key: "order_date" },
        { header: "Customer Name", key: "name" },
        { header: "Service Type", key: "service_order_type" },
        { header: "Service Repair Status", key: "repair_status_code" },
        { header: "Service Order Status", key: "status" },
        { header: "Brand and Device", key: "brand_code" },
        { header: "Allocated Team", key: "department" },
        { header: "Technician Name", key: "technician_name" },
        { header: "Scheduled Date", key: "schedule_date" },
    ];

    const handleExport = () => {
        setExporting(true);
        axios
            .post("/service-orders", {
                tableParams,
                searchText: appliedSearchText,
                filter: appliedFilter,
                export: true,
            })
            .then((results) => {
                const rows = results.data.serviceOrders || [];
                if (rows.length === 0) {
                    messageApi.open({
                        type: "info",
                        content: "No service orders match the current filters.",
                    });
                    return;
                }
                exportToExcel("service-orders", exportColumns, rows);
            })
            .catch((error) => {
                console.error("Error exporting data:", error);
                messageApi.open({
                    type: "error",
                    content: "Failed to export service orders.",
                });
            })
            .finally(() => setExporting(false));
    };

    const columns = [
        {
            title: "Document No",
            dataIndex: "document_no",
            key: "document_no",
            responsive: ["sm"],
            render: (text, record) => (
                <span
                    className=" text-indigo-500 hover:underline"
                    onClick={() => handleShowService(record.document_no)}
                >
                    {text}
                </span>
            ),
        },
        {
            title: "Order Date",
            dataIndex: "order_date",
            key: "order_date",
        },
        {
            title: "Customer Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Service Type",
            dataIndex: "service_order_type",
            key: "service_order_type",
        },
        {
            title: "Service repair status",
            dataIndex: "repair_status_code",
            key: "repair_status_code",
            render: (value) =>
                value ? <Tag color={statusColor(value)}>{value}</Tag> : "",
        },
        {
            title: "Service Order Status",
            dataIndex: "status",
            key: "status",
            render: (value) =>
                value ? <Tag color={statusColor(value)}>{value}</Tag> : "",
        },
        {
            title: "Brand and device",
            dataIndex: "brand_code",
            key: "brand_code",
        },
        {
            title: "Allocated Team",
            dataIndex: "department",
            key: "department",
            responsive: ["sm"],
        },

        {
            title: "Technician Name",
            dataIndex: "technician_name",
            key: "technician_id",
        },
        {
            title: "Scheduled",
            key: "schedule",
            render: (_, record) => {
                if (!record.schedule_date) return "";

                const date = new Date(record.schedule_date);
                const formattedDate = `${String(date.getDate()).padStart(
                    2,
                    "0"
                )}/${String(date.getMonth() + 1).padStart(
                    2,
                    "0"
                )}/${date.getFullYear()}`;

                return formattedDate;
            },
            responsive: ["sm"],
        },

        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 70,
            render: (_, record) => (
                <div>
                    <Popover
                        placement="leftTop"
                        arrow={false}
                        trigger="click"
                        content={content(record)}
                        open={isPopoverOpen === record.document_no}
                        onOpenChange={(visible) =>
                            setIsPopoverOpen(
                                visible ? record.document_no : null
                            )
                        }
                    >
                        <Button
                            type="text"
                            icon={<MoreOutlined className="text-black text-lg" />}
                        />
                    </Popover>
                </div>
            ),
        },
    ];

    const content = (record) => {
        const elements = [];
        if (user.Role === "Admin") {
            if (record.service_order_type == "OUTDOOR") {
                elements.push(
                    <>
                        <Button
                            key="assign-region-department"
                            type="link"
                            onClick={() =>
                                handleAssignTeamOpen(record.document_no)
                            }
                        >
                            Assign Region & Team
                        </Button>
                        <br />
                        <Button
                            key="assign-team"
                            type="link"
                            onClick={() =>
                                handleAssignRegionOpen(record.document_no)
                            }
                        >
                            Assign Technician
                        </Button>
                        {/* <br />
                        <Button
                            key="scheduled"
                            type="link"
                            onClick={() =>
                                handleScheduledModalOpen(record.document_no)
                            }
                        >
                            Scheduled
                        </Button> */}
                        <br />
                        <Button
                            key="view-details"
                            type="link"
                            onClick={() =>
                                handleShowService(record.document_no)
                            }
                        >
                            View Details
                        </Button>
                    </>
                );
            } else {
                elements.push(
                    <>
                        <Button
                            key="view-details"
                            type="link"
                            onClick={() =>
                                handleShowService(record.document_no)
                            }
                        >
                            View Details
                        </Button>
                    </>
                );
            }
        } else if (user.Role === "Team Leader") {
            if (record.service_order_type == "OUTDOOR") {
                elements.push(
                    <>
                        <Button
                            key="assign-team"
                            type="link"
                            onClick={() =>
                                handleAssignRegionOpen(record.document_no)
                            }
                        >
                            Assign Technician
                        </Button>
                        {/* <br />
                        <Button
                            key="scheduled"
                            type="link"
                            onClick={() =>
                                handleScheduledModalOpen(record.document_no)
                            }
                        >
                            Scheduled
                        </Button> */}
                        <br />
                        <Button
                            key="view-details"
                            type="link"
                            onClick={() =>
                                handleShowService(record.document_no)
                            }
                        >
                            View Details
                        </Button>
                    </>
                );
            } else {
                elements.push(
                    <>
                        <Button
                            key="assign-team"
                            type="link"
                            onClick={() =>
                                handleAssignRegionOpen(record.document_no)
                            }
                        >
                            Assign Technician
                        </Button>
                        <br />
                        <Button
                            key="view-details"
                            type="link"
                            onClick={() =>
                                handleShowService(record.document_no)
                            }
                        >
                            View Details
                        </Button>
                    </>
                );
            }
        } else if (user.Role === "CSC") {
            if (record.service_order_type == "OUTDOOR") {
                elements.push(
                    <>
                        <Button
                            key="assign-region-department"
                            type="link"
                            onClick={() =>
                                handleAssignTeamOpen(record.document_no)
                            }
                        >
                            Assign Region & Team
                        </Button>
                        <br />
                        <Button
                            key="assign-team"
                            type="link"
                            onClick={() =>
                                handleAssignRegionOpen(record.document_no)
                            }
                        >
                            Assign Technician
                        </Button>
                        {/* <br />
                        <Button
                            key="scheduled"
                            type="link"
                            onClick={() =>
                                handleScheduledModalOpen(record.document_no)
                            }
                        >
                            Scheduled
                        </Button> */}
                        <br />
                        <Button
                            key="view-details"
                            type="link"
                            onClick={() =>
                                handleShowService(record.document_no)
                            }
                        >
                            View Details
                        </Button>
                    </>
                );
            } else {
                elements.push(
                    <>
                        <Button
                            key="assign-team"
                            type="link"
                            onClick={() =>
                                handleAssignRegionOpen(record.document_no)
                            }
                        >
                            Assign Technician
                        </Button>
                        <br />
                        <Button
                            key="view-details"
                            type="link"
                            onClick={() =>
                                handleShowService(record.document_no)
                            }
                        >
                            View Details
                        </Button>
                    </>
                );
            }
        } else if (user.Role === "Technician" || user.Role === "Read Only") {
            elements.push(
                <Button
                    key="view-details"
                    type="link"
                    onClick={() => handleShowService(record.document_no)}
                >
                    View Details
                </Button>
            );
        }
        return (
            <div className="space-y-1 w-full items-center">
                {elements.map((element, index) => (
                    <React.Fragment key={index}>
                        {element}
                        <br />
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="">
            {contextHolder}
            <div className="  bg-white rounded-b-xl ">
                <div>
                    <div className="flex flex-wrap gap-4 mb-5 mt-5 justify-between sm:justify-start">
                        <div className="flex w-full justify-between items-center">
                           <div className="w-[60%] sm:w-[25%]">
                                <Input
                                    className="w-full px-3 sm:py-2 rounded-md border border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Search"
                                    value={searchText}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    prefix={<SearchOutlined />}
                                />
                            </div>
                            <Badge count={activeFilterCount} size="small">
                                <Button
                                    className="bg-indigo-500 text-white"
                                    onClick={() => setSiderOpen(true)}
                                >
                                    <FilterOutlined className="mr-1" />
                                    Filter
                                </Button>
                            </Badge>
                        </div>
                    </div>
                </div>

                <Divider />

                <div className="flex flex-wrap gap-2 justify-between items-center">
                    <p className="font-semibold text-lg pb-4 pt-3">
                        List of Tasks
                    </p>
                    <div className="flex gap-2">
                        <Button
                            icon={<DownloadOutlined />}
                            loading={exporting}
                            onClick={handleExport}
                        >
                            Export to Excel
                        </Button>
                        <Button
                            disabled={selectedOrders?.length === 0}
                            className="bg-indigo-500 text-white"
                            onClick={handleBulkOrderAssign}
                        >
                            Bulk Assignment
                        </Button>
                    </div>
                </div>

                <div className="border rounded-md  border-gray-200 h-1/2">
                    <Table
                        size="middle"
                        scroll={{ x: 1100 }}
                      className="bg-white rounded-md whitespace-nowrap lg:whitespace-normal text-sm"
                        columns={columns}
                        rowKey={(record) => record.document_no}
                        dataSource={data}
                        locale={{
                            emptyText: (
                                <Empty description="No service orders match your filters" />
                            ),
                        }}
                        pagination={tableParams.pagination}
                        loading={loading}
                        onChange={handleTableChange}
                        rowSelection={{
                            type: "checkbox",
                            selectedRowKeys: selectedOrders,
                            onChange: handleSelectionChange,
                        }}
                    />
                </div>
            </div>
            {/* Modal */}
            <div>
                <div>
                    <Modal
                        open={isAssignTeamVisible}
                        onCancel={handleAssignTeamClose}
                        footer={null}
                        centered
                    >
                        <AssignRegion
                            taskId={selectedTaskId}
                            formResponse={handleAssignTeamClose}
                        />
                    </Modal>
                </div>
                <div>
                    <Modal
                        open={isAssignDeptVisible}
                        onCancel={handleAssignRegionClose}
                        footer={null}
                        centered
                    >
                        <AssignTeam
                            taskId={selectedTaskId}
                            selectedOrders={selectedOrders}
                            formResponse={handleAssignRegionClose}
                            taskStatus={() => setSelectedOrders([])}
                        />
                    </Modal>
                </div>
                <div>
                    <Modal
                        open={scheduledModal}
                        onCancel={handleScheduledModalClose}
                        footer={null}
                        centered
                    >
                        <ScheduledTask
                            taskId={selectedTaskId}
                            formResponse={handleScheduledModalClose}
                        />
                    </Modal>
                </div>
            </div>
            <div>
                <SiderDrawer
                    show={siderOpen}
                    onClose={() => setSiderOpen(false)}
                    onSaveButtonClick={applyFilter}
                    onClearButtonClick={clearFilter}
                    heading={"Filter"}
                    saveButton={"Apply Filter"}
                    clearButton={"Clear Filter"}
                    body={
                        <div className="flex flex-col gap-y-8 mt-4 px-2">
                            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold -mb-4">
                                Schedule
                            </p>
                            {/* Period Selection */}
                            <div className="w-full">
                                <label className="text-sm font-medium  text-gray-700">
                                    Period
                                </label>

                                <Radio.Group
                                    className="w-full flex flex-col sm:flex-row space-y-2 sm:space-y-0 mt-2"
                                    onChange={handlePeriodFilterChange}
                                    value={filter.period}
                                >
                                    <Radio.Button
                                        value="24h"
                                        className="w-full sm:w-1/4 sm:rounded-l-md bg-gray-50 text-center text-xs py-2"
                                    >
                                        24 hours
                                    </Radio.Button>
                                    <Radio.Button
                                        value="7d"
                                        className="w-full sm:w-1/4 rounded-none bg-gray-50 text-center text-xs py-2"
                                    >
                                        7 days
                                    </Radio.Button>
                                    <Radio.Button
                                        value="30d"
                                        className="w-full sm:w-1/4 rounded-none bg-gray-50 text-center text-xs py-2"
                                    >
                                        30 days
                                    </Radio.Button>
                                    <Radio.Button
                                        value="12m"
                                        className="w-full sm:w-1/4 sm:rounded-r-md bg-gray-50 text-center text-xs py-2"
                                    >
                                        12 months
                                    </Radio.Button>
                                </Radio.Group>
                            </div>

                            {/* Status Checkboxes */}
                            <div className="w-full">
                                <label className="text-sm font-medium  text-gray-700">
                                    Scheduled Status
                                </label>
                                <div className="flex items-center gap-8 mt-2">
                                    <Checkbox
                                        checked={filter.scheduled}
                                        onChange={() =>
                                            setFilter({
                                                ...filter,
                                                scheduled: !filter.scheduled,
                                                not_scheduled: false,
                                            })
                                        }
                                        className="text-sm text-gray-700"
                                    >
                                        Scheduled
                                    </Checkbox>
                                    <Checkbox
                                        checked={filter.not_scheduled}
                                        onChange={() =>
                                            setFilter({
                                                ...filter,
                                                scheduled: false,
                                                not_scheduled:
                                                    !filter.not_scheduled,
                                            })
                                        }
                                        className="text-sm text-gray-700"
                                    >
                                        Not Scheduled
                                    </Checkbox>
                                </div>
                            </div>

                            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold -mb-4">
                                Status &amp; Brand
                            </p>
                            {/* Brand Code */}
                            <div className="w-full ">
                                <label className="text-sm font-medium  text-gray-700">
                                    Brand and Device Description
                                </label>

                                <Select
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.label
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    className="w-full mt-2"
                                    loading={loading}
                                    onChange={handleBrandCodeChange}
                                    placeholder="Select Brand Code"
                                    options={brandCode.map((brand) => ({
                                        label: brand,
                                        value: brand,
                                    }))}
                                    value={filter.brand_code}
                                    allowClear
                                    size="middle"
                                />
                            </div>

                            {/* Repair Status Code */}
                            <div className="w-full">
                                <label className="text-sm font-medium text-gray-700">
                                    Repair Status
                                </label>
                                <Select
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.label
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    className="w-full mt-2"
                                    loading={loading}
                                    onChange={handleRepairStatusChange}
                                    placeholder="Select Status Code"
                                    options={taskCode.map((taskCode) => ({
                                        label: taskCode.taskDescription,
                                        value: taskCode.taskCode,
                                    }))}
                                    value={filter.repair_status_code}
                                    allowClear
                                    size="middle"
                                />
                            </div>
                            {/* Service Status Code */}
                            <div className="w-full">
                                <label className="text-sm font-medium text-gray-700">
                                    Order Status
                                </label>
                                <Select
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.label
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    className="w-full mt-2"
                                    loading={loading}
                                    onChange={handlePortalStatusChange}
                                    placeholder="Select Status Code"
                                    options={portalStatus}
                                    value={filter.portal_status}
                                    allowClear
                                    size="middle"
                                />
                            </div>

                            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold -mb-4">
                                Team
                            </p>
                            {/* Team List */}
                            <div className="w-full">
                                <label className="text-sm font-medium  text-gray-700">
                                    Team
                                </label>
                                <Select
                                    className="w-full mt-2"
                                    loading={loading}
                                    onChange={handleTeamChange}
                                    placeholder="Select Team"
                                    options={teamList.map((team) => ({
                                        label: team,
                                        value: team,
                                    }))}
                                    value={filter.team}
                                    allowClear
                                    size="middle"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="w-full">
                                <label className="text-sm font-medium  text-gray-700">
                                    Scheduled Date Range
                                </label>
                                <div className="w-full flex items-center gap-x-3 mt-2">
                                    <DatePicker
                                        placeholder="From"
                                        value={fromDate}
                                        onChange={(date) =>
                                            handleDateChange(date, "from")
                                        }
                                        className="w-1/2"
                                        size="middle"
                                    />
                                    <DatePicker
                                        placeholder="To"
                                        value={toDate}
                                        onChange={(date) =>
                                            handleDateChange(date, "to")
                                        }
                                        className="w-1/2"
                                        size="middle"
                                    />
                                </div>
                            </div>

                            {/* Specific Date */}
                            <div className="w-full mb-4  text-gray-700">
                                <label className="text-sm font-medium  text-gray-700">
                                    Scheduled Date
                                </label>
                                <DatePicker
                                    className="w-full mt-2"
                                    placeholder="Select Specific Date"
                                    value={specificDate}
                                    onChange={(date) =>
                                        handleDateChange(date, "single")
                                    }
                                    size="middle"
                                />
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default TaskTable;
