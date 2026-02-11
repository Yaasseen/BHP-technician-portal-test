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
} from "antd";
import {
    SearchOutlined,
    MoreOutlined,
    CalendarOutlined,
    CalendarTwoTone,
    CalendarFilled,
    FilterOutlined,
    UserOutlined,
} from "@ant-design/icons";

import AssignTeam from "../common/AssignTeam";
import ScheduledTask from "../common/ScheduledTask";
import AssignRegion from "../common/AssignRegion";
import { title } from "motion/react-client";
import { set } from "date-fns";
import SiderDrawer from "../common/SideDrawer";

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

    const columns = [
        {
            title: "Document No",
            dataIndex: "document_no",
            key: "document_no",
            fixed: 'left',
            width: 140,
            render: (text, record) => (
                <span
                    className="font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer transition-colors"
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
            width: 120,
            render: (text) => <span className="text-gray-600 font-medium">{text}</span>
        },
        {
            title: "Customer Name",
            dataIndex: "name",
            key: "name",
            width: 200,
            render: (text) => <span className="font-semibold text-gray-800">{text}</span>
        },
        {
            title: "Service Type",
            dataIndex: "service_order_type",
            key: "service_order_type",
            width: 130,
            render: (type) => (
                <Tag className="rounded-full px-3 border-none bg-gray-100 text-gray-700 font-bold text-[10px] uppercase">
                    {type}
                </Tag>
            )
        },
        {
            title: "Status",
            dataIndex: "repair_status_code",
            key: "repair_status_code",
            width: 150,
            render: (status) => {
                let color = 'default';
                if (status?.includes('RECD')) color = 'blue';
                if (status?.includes('ASGND')) color = 'cyan';
                if (status?.includes('COMP')) color = 'emerald';

                return (
                    <Tag color={color} className="rounded-full px-3 font-extrabold text-[10px] uppercase">
                        {status}
                    </Tag>
                );
            }
        },
        {
            title: "Order Status",
            dataIndex: "status",
            key: "status",
            width: 130,
            render: (status) => (
                <Tag
                    className={`rounded-full px-3 border-none font-bold text-[10px] uppercase ${status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
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
            width: 150,
            render: (text) => <span className="text-gray-500 italic text-xs">{text}</span>
        },
        {
            title: "Team",
            dataIndex: "department",
            key: "department",
            width: 150,
            render: (text) => <span className="font-medium text-gray-600">{text}</span>
        },
        {
            title: "Technician",
            dataIndex: "technician_name",
            key: "technician_id",
            width: 180,
            render: (text) => (
                <span className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                        <UserOutlined className="text-[10px] text-slate-400" />
                    </div>
                    <span className="text-slate-700 font-medium truncate max-w-[140px]">{text || 'Unassigned'}</span>
                </span>
            )
        },
        {
            title: "Scheduled",
            key: "schedule",
            width: 120,
            render: (_, record) => {
                if (!record.schedule_date) return <span className="text-gray-300">-</span>;

                const date = new Date(record.schedule_date);
                const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

                return <span className="text-emerald-600 font-bold text-xs">{formattedDate}</span>;
            },
        },
        {
            title: "",
            key: "actions",
            fixed: 'right',
            width: 50,
            render: (_, record) => (
                <Popover
                    placement="leftTop"
                    arrow={false}
                    trigger="click"
                    content={content(record)}
                    open={isPopoverOpen === record.document_no}
                    onOpenChange={(visible) => setIsPopoverOpen(visible ? record.document_no : null)}
                >
                    <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
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

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                    <div className="w-full sm:w-1/3 relative group">
                        <Input
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-100 rounded-xl hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                            placeholder="Search tasks, documents, names..."
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                            prefix={<SearchOutlined className="text-slate-400 group-hover:text-emerald-500 transition-colors" />}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-6 rounded-xl border-slate-200 hover:border-emerald-400 hover:text-emerald-600 font-bold transition-all"
                            onClick={() => setSiderOpen(true)}
                        >
                            <FilterOutlined />
                            <span>Filter</span>
                        </Button>

                        <Button
                            disabled={selectedOrders?.length === 0}
                            className={`flex-1 sm:flex-none h-10 px-6 rounded-xl font-bold transition-all border-none ${selectedOrders?.length > 0
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200'
                                : 'bg-slate-100 text-slate-400 border-none'
                                }`}
                            onClick={handleBulkOrderAssign}
                        >
                            Bulk Assignment
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 border-l-4 border-emerald-500 pl-4 h-8">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        List of Tasks
                    </h2>
                    {selectedOrders.length > 0 && (
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full animate-pulse">
                            {selectedOrders.length} selected
                        </span>
                    )}
                </div>

                <div className="border rounded-2xl border-gray-100 overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
                    {/* Desktop View: Table */}
                    <div className="hidden md:block">
                        <Table
                            size="middle"
                            scroll={{ x: 400 }}
                            className="bg-white whitespace-nowrap lg:whitespace-normal text-sm"
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
                    <div className="md:hidden p-4 space-y-4">
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
                        <div className="flex flex-col gap-y-6 mt-4 px-2">
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
            <div>
                {!siderOpen && (
                    <FloatButton
                        //className="bg-emerald-600 text-white"
                        style={{ backgroundColor: "#3F51B5", color: "white" }}
                        icon={<FilterOutlined className="hover:text-white" />}
                        onClick={() => setSiderOpen(true)}
                    />
                )}
            </div>
        </div>
    );
};

export default TaskTable;
