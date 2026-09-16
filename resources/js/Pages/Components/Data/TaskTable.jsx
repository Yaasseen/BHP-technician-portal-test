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
    FloatButton,
    Spin,
    Tag,
    message,
} from "antd";
import {
    SearchOutlined,
    MoreOutlined,
    CalendarOutlined,
    CalendarTwoTone,
    CalendarFilled,
    FilterOutlined,
    UserOutlined,
    DownloadOutlined,
} from "@ant-design/icons";

import AssignTeam from "../common/AssignTeam";
import ScheduledTask from "../common/ScheduledTask";
import AssignRegion from "../common/AssignRegion";
import { title } from "motion/react-client";
import { set } from "date-fns";
import SiderDrawer from "../common/SideDrawer";
import { exportToExcel } from "../../../utils/exportToExcel";

import TaskListItem from "../common/TaskListItem";

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
        show_posted: false,
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
        show_posted: false,
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
                message.error("Failed to fetch data. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

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
                    message.info("No service orders match the current filters.");
                    return;
                }
                exportToExcel("service-orders", exportColumns, rows);
            })
            .catch((error) => {
                console.error("Error exporting data:", error);
                message.error("Failed to export service orders.");
            })
            .finally(() => setExporting(false));
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
            show_posted: false,
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
            show_posted: false,
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

    const columns = [
        {
            title: "Document No",
            dataIndex: "document_no",
            key: "document_no",
            width: "10%",
            render: (text, record) => (
                <span
                    className="font-bold text-red-600 hover:text-red-800 cursor-pointer transition-colors text-xs"
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
            width: "9%",
            render: (text) => <span className="text-gray-600 font-medium text-xs">{text}</span>
        },
        {
            title: "Customer Name",
            dataIndex: "name",
            key: "name",
            width: "14%",
            render: (text) => <span className="font-semibold text-gray-800 text-xs">{text}</span>
        },
        {
            title: "Service Type",
            dataIndex: "service_order_type",
            key: "service_order_type",
            width: "9%",
            render: (type) => (
                <Tag className="rounded-none px-2 border-none bg-gray-100 text-gray-700 font-bold text-[9px] uppercase">
                    {type}
                </Tag>
            )
        },
        {
            title: "Status",
            dataIndex: "repair_status_code",
            key: "repair_status_code",
            width: "10%",
            render: (status) => {
                let color = 'default';
                if (status?.includes('RECD')) color = 'blue';
                if (status?.includes('ASGND')) color = 'cyan';
                if (status?.includes('COMP')) color = 'indigo';

                return (
                    <Tag color={color} className="rounded-none px-2 font-extrabold text-[9px] uppercase">
                        {status}
                    </Tag>
                );
            }
        },
        {
            title: "Order Status",
            dataIndex: "status",
            key: "status",
            width: "9%",
            render: (status) => (
                <Tag
                    className={`rounded-none px-2 border-none font-bold text-[9px] uppercase ${status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                        }`}
                >
                    {status}
                </Tag>
            )
        },
        {
            title: "Device",
            dataIndex: "brand_code",
            key: "brand_code",
            width: "8%",
            render: (text) => <span className="text-gray-500 italic text-[11px]">{text}</span>
        },
        {
            title: "Team",
            dataIndex: "department",
            key: "department",
            width: "7%",
            render: (text) => <span className="font-medium text-gray-600 text-xs">{text}</span>
        },
        {
            title: "Technician",
            dataIndex: "technician_name",
            key: "technician_id",
            width: "12%",
            render: (text) => (
                <span className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-none bg-slate-100 flex items-center justify-center shrink-0">
                        <UserOutlined className="text-[9px] text-slate-400" />
                    </div>
                    <span className="text-slate-700 font-medium text-xs truncate max-w-[95px]">{text || 'Unassigned'}</span>
                </span>
            )
        },
        {
            title: "Scheduled",
            key: "schedule",
            width: "8%",
            render: (_, record) => {
                if (!record.schedule_date) return <span className="text-gray-300">-</span>;

                const date = new Date(record.schedule_date);
                const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

                return <span className="text-red-600 font-bold text-[11px]">{formattedDate}</span>;
            },
        },
        {
            title: "",
            key: "actions",
            width: "4%",
            render: (_, record) => (
                <Popover
                    placement="leftTop"
                    arrow={false}
                    trigger="click"
                    content={content(record)}
                    open={isPopoverOpen === record.document_no}
                    onOpenChange={(visible) => setIsPopoverOpen(visible ? record.document_no : null)}
                >
                    <button className="flex items-center justify-center w-8 h-8 rounded-none hover:bg-gray-100 text-gray-400 transition-colors">
                        <MoreOutlined className="text-lg" />
                    </button>
                </Popover>
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

    const hasActiveFilters = Object.keys(filter).some(key => {
        if (key === 'period') return filter[key] !== 'all';
        if (key === 'scheduled' || key === 'not_scheduled' || key === 'show_posted') return filter[key] === true;
        return filter[key] !== null;
    });

    return (
        <div className="space-y-2 sm:space-y-6">
            <div className="bg-slate-50/50 p-1 sm:p-6 rounded-none border border-slate-100">
                {/* Mobile Search & Filters */}
                <div className="sm:hidden mb-6 space-y-4 px-1">
                    <Input
                        placeholder="Search by job number, company..."
                        prefix={<SearchOutlined className="text-slate-400 text-lg" />}
                        className="bg-white border border-slate-200 rounded-none h-12 px-5 text-sm font-medium shadow-sm focus:border-red-500"
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                    />

                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <button
                                onClick={() => setSiderOpen(true)}
                                className={`min-w-[48px] h-12 border rounded-none flex items-center justify-center shadow-sm active:bg-slate-50 transition-all ${hasActiveFilters
                                    ? 'bg-red-50 border-red-200 text-red-600'
                                    : 'bg-white border-slate-200 text-slate-500'
                                    }`}
                            >
                                <FilterOutlined className="text-lg" />
                            </button>
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            )}
                        </div>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilter}
                                className="h-12 px-4 bg-white border border-red-100 text-red-500 font-bold rounded-none text-xs uppercase tracking-wider hover:bg-red-50 transition-colors"
                            >
                                Clear
                            </button>
                        )}

                        <Button
                            disabled={selectedOrders?.length === 0}
                            className={`h-12 px-5 rounded-none border-none font-black text-xs uppercase tracking-wider transition-all ${selectedOrders?.length > 0
                                ? 'bg-red-500 text-white shadow-md shadow-red-100'
                                : 'bg-slate-100 text-slate-300'
                                }`}
                            onClick={handleBulkOrderAssign}
                        >
                            Bulk Assign
                        </Button>


                    </div>
                </div>

                <div className="hidden sm:flex flex-row gap-4 justify-between items-center mb-8">
                    <div className="w-full sm:w-1/3">
                        <Input
                            placeholder="Type to search..."
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                            prefix={<SearchOutlined className="text-slate-400 mr-2" />}
                            className="bg-white border-none rounded-none h-12 px-5 text-sm font-medium shadow-sm shadow-slate-100/50 hover:bg-white focus:bg-white transition-all"
                        />
                    </div>

                    <div className="hidden sm:flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-3 h-12 px-8 rounded-none border font-bold transition-all shadow-sm ${hasActiveFilters
                                ? 'border-red-200 bg-red-50 text-red-600'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600'
                                }`}
                            onClick={() => setSiderOpen(true)}
                        >
                            <FilterOutlined />
                            <span>Filters</span>
                            {hasActiveFilters && (
                                <span className="ml-1 w-2 h-2 rounded-full bg-red-500"></span>
                            )}
                        </Button>

                        {hasActiveFilters && (
                            <Button
                                className="flex-1 sm:flex-none h-12 px-6 rounded-none font-bold text-red-500 border border-red-100 bg-red-50/50 hover:bg-red-50 hover:border-red-200 transition-all"
                                onClick={clearFilter}
                            >
                                Clear
                            </Button>
                        )}

                        <Button
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-12 px-6 rounded-none border border-slate-200 bg-white text-slate-600 font-bold hover:border-red-300 hover:text-red-600 transition-all shadow-sm"
                            icon={<DownloadOutlined />}
                            loading={exporting}
                            onClick={handleExport}
                        >
                            Export to Excel
                        </Button>

                        <Button
                            disabled={selectedOrders?.length === 0}
                            className={`flex-1 sm:flex-none h-12 px-8 rounded-none font-black transition-all border-none ${selectedOrders?.length > 0
                                ? 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-100'
                                : 'bg-slate-100 text-slate-300'
                                }`}
                            onClick={handleBulkOrderAssign}
                        >
                            Bulk Assignment
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 sm:mb-6 px-2">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            Orders
                        </h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Manage and track service tasks
                        </p>
                    </div>
                    {selectedOrders.length > 0 && (
                        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-none border border-red-100">
                            <span className="w-2 h-2 rounded-none bg-red-500 animate-pulse" />
                            <span className="text-xs font-black text-red-700 uppercase tracking-wider">
                                {selectedOrders.length} selected
                            </span>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-none border border-slate-100 overflow-hidden">
                    {/* Desktop View: Table */}
                    <div className="hidden md:block">
                        <Table
                            size="small"
                            tableLayout="fixed"
                            className="bg-white whitespace-normal text-xs"
                            columns={columns}
                            rowKey={(record) => record.document_no}
                            dataSource={data}
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

                    {/* Mobile View: Cards */}
                    <div className="md:hidden p-0 sm:p-4 space-y-2 sm:space-y-4">
                        {loading && !data ? (
                            <div className="flex justify-center p-8">
                                <Spin />
                            </div>
                        ) : (
                            <>
                                {data?.map((task) => (
                                    <TaskListItem
                                        key={task.document_no}
                                        task={task}
                                        isSelected={selectedOrders.includes(task.document_no)}
                                        onSelect={(checked) => {
                                            const newSelection = checked
                                                ? [...selectedOrders, task.document_no]
                                                : selectedOrders.filter(id => id !== task.document_no);
                                            handleSelectionChange(newSelection);
                                        }}
                                        onViewDetails={() => handleShowService(task.document_no)}
                                        actions={content(task)}
                                    />
                                ))}

                                <div className="flex justify-center pt-8 pb-4">
                                    <Pagination
                                        {...tableParams.pagination}
                                        onChange={(page, pageSize) => {
                                            handleTableChange({ current: page, pageSize });
                                        }}
                                        size="small"
                                        simple
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Mobile Bulk Assignment Sticky Bar */}
            {selectedOrders.length > 0 && (
                <div className="fixed bottom-20 left-0 right-0 z-40 sm:hidden px-4 pb-2">
                    <div className="bg-red-600 rounded-xl shadow-2xl shadow-red-300/50 p-3 flex items-center justify-between gap-3 border border-red-500">
                        <div className="flex items-center gap-2 text-white">
                            <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm font-black">
                                {selectedOrders.length}
                            </span>
                            <span className="text-xs font-bold tracking-wide">Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="small"
                                className="h-9 px-4 rounded-lg border-0 text-white bg-orange-500 hover:bg-orange-600 font-bold text-xs shadow-md"
                                onClick={() => handleSelectionChange([])}
                            >
                                Clear
                            </Button>
                            <Button
                                type="primary"
                                size="small"
                                className="h-9 px-5 rounded-lg bg-white text-red-700 border-0 font-black text-xs shadow-lg hover:bg-red-50"
                                onClick={handleBulkOrderAssign}
                            >
                                Assign Team
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
                        <div className="flex flex-col gap-y-8 mt-2">
                            {/* Period Selection */}
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                                    Time Period
                                </label>

                                <Radio.Group
                                    className="w-full grid grid-cols-4 gap-0"
                                    onChange={handlePeriodFilterChange}
                                    value={filter.period}
                                    buttonStyle="solid"
                                >
                                    {['24h', '7d', '30d', '12m'].map((period) => (
                                        <Radio.Button
                                            key={period}
                                            value={period}
                                            className={`text-center flex items-center justify-center h-10 text-xs font-bold border-slate-200 transition-all ${filter.period === period ? '!bg-red-600 !border-red-600 !text-white z-10' : 'bg-slate-50 text-slate-500 hover:text-red-600'
                                                }`}
                                        >
                                            {period === '24h' ? '24H' : period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '1 Year'}
                                        </Radio.Button>
                                    ))}
                                </Radio.Group>
                            </div>

                            {/* Status Checkboxes */}
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                                    Schedule Status
                                </label>
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex-1 border p-3 cursor-pointer transition-all flex items-center gap-3 ${filter.scheduled ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:border-red-200'}`}
                                        onClick={() => setFilter({ ...filter, scheduled: !filter.scheduled, not_scheduled: false })}
                                    >
                                        <Checkbox checked={filter.scheduled} className="custom-checkbox pointer-events-none" />
                                        <span className={`text-sm font-bold ${filter.scheduled ? 'text-red-700' : 'text-slate-600'}`}>Scheduled</span>
                                    </div>

                                    <div
                                        className={`flex-1 border p-3 cursor-pointer transition-all flex items-center gap-3 ${filter.not_scheduled ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:border-red-200'}`}
                                        onClick={() => setFilter({ ...filter, not_scheduled: !filter.not_scheduled, scheduled: false })}
                                    >
                                        <Checkbox checked={filter.not_scheduled} className="custom-checkbox pointer-events-none" />
                                        <span className={`text-sm font-bold ${filter.not_scheduled ? 'text-red-700' : 'text-slate-600'}`}>Unscheduled</span>
                                    </div>
                                </div>
                            </div>

                            {/* Posted Orders */}
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                                    Posted Orders
                                </label>
                                <div
                                    className={`border p-3 cursor-pointer transition-all flex items-center gap-3 ${filter.show_posted ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:border-red-200'}`}
                                    onClick={() => setFilter({ ...filter, show_posted: !filter.show_posted })}
                                >
                                    <Checkbox checked={filter.show_posted} className="custom-checkbox pointer-events-none" />
                                    <span className={`text-sm font-bold ${filter.show_posted ? 'text-red-700' : 'text-slate-600'}`}>
                                        Show orders already posted in Business Central
                                    </span>
                                </div>
                            </div>

                            {/* Brand Code */}
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                    Brand & Device
                                </label>
                                <Select
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().includes(input.toLowerCase())
                                    }
                                    className="w-full"
                                    loading={loading}
                                    onChange={handleBrandCodeChange}
                                    placeholder="Search brands..."
                                    options={brandCode.map((brand) => ({
                                        label: brand,
                                        value: brand,
                                    }))}
                                    value={filter.brand_code}
                                    allowClear
                                    size="large"
                                    suffixIcon={<SearchOutlined className="text-slate-400" />}
                                />
                            </div>

                            {/* Repair Status Code */}
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                    Repair Status
                                </label>
                                <Select
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().includes(input.toLowerCase())
                                    }
                                    className="w-full"
                                    loading={loading}
                                    onChange={handleRepairStatusChange}
                                    placeholder="Select status..."
                                    options={taskCode.map((taskCode) => ({
                                        label: taskCode.taskDescription,
                                        value: taskCode.taskCode,
                                    }))}
                                    value={filter.repair_status_code}
                                    allowClear
                                    size="large"
                                />
                            </div>

                            {/* Service Status Code */}
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                    Order Status
                                </label>
                                <Select
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().includes(input.toLowerCase())
                                    }
                                    className="w-full"
                                    loading={loading}
                                    onChange={handlePortalStatusChange}
                                    placeholder="Select order status..."
                                    options={portalStatus}
                                    value={filter.portal_status}
                                    allowClear
                                    size="large"
                                />
                            </div>

                            {/* Team List */}
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                    Assigned Team
                                </label>
                                <Select
                                    className="w-full"
                                    loading={loading}
                                    onChange={handleTeamChange}
                                    placeholder="Select team..."
                                    options={teamList.map((team) => ({
                                        label: team,
                                        value: team,
                                    }))}
                                    value={filter.team}
                                    allowClear
                                    size="large"
                                    suffixIcon={<UserOutlined className="text-slate-400" />}
                                />
                            </div>

                            {/* Date Range */}
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                    Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <DatePicker
                                        placeholder="Start Date"
                                        value={fromDate}
                                        onChange={(date) => handleDateChange(date, "from")}
                                        className="w-full"
                                        size="large"
                                        format="DD/MM/YYYY"
                                    />
                                    <DatePicker
                                        placeholder="End Date"
                                        value={toDate}
                                        onChange={(date) => handleDateChange(date, "to")}
                                        className="w-full"
                                        size="large"
                                        format="DD/MM/YYYY"
                                    />
                                </div>
                            </div>

                            {/* Specific Date */}
                            <div className="w-full">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                    Specific Date
                                </label>
                                <DatePicker
                                    className="w-full"
                                    placeholder="Select a specific date"
                                    value={specificDate}
                                    onChange={(date) => handleDateChange(date, "single")}
                                    size="large"
                                    format="DD/MM/YYYY"
                                />
                            </div>
                        </div>
                    }
                />
            </div>
            <div>
                {!siderOpen && (
                    <FloatButton
                        style={{ backgroundColor: "#dc2626", color: "white" }}
                        icon={<FilterOutlined className="hover:text-white" />}
                        onClick={() => setSiderOpen(true)}
                    />
                )}
            </div>
        </div>
    );
};

export default TaskTable;
