import React, { useEffect, useState } from "react";
import {
    Card,
    Typography,
    List,
    Tag,
    Spin,
    Button,
    Popover,
    Select,
} from "antd";
import {
    CalendarOutlined,
    RightOutlined,
    DownOutlined,
    FileTextOutlined,
    ArrowLeftOutlined,
    CaretRightOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useSchedule } from "../../context/ScheduleContext";

const { Text } = Typography;

const TeamScheduler = ({
    user,
    handleScreen,
    setTicketInfo,
    screenContent,
}) => {
    const { weekOffset, setWeekOffset, startDate, setStartDate } =
        useSchedule();
    const [scheduleData, setScheduleData] = useState({});

    const [selectedSchedules, setSelectedSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const handleShowService = (document_no) => {
        screenContent(document_no);
    };

    useEffect(() => {
        const fetchWeekData = async () => {
            console.log("Fetching data with start_date:", startDate);
            console.log("Fetching data with weekOffset:", weekOffset);

            setIsLoading(true);
            try {
                let apiUrl = startDate
                    ? `/weekly-schedule-overview?week_start=${startDate}`
                    : `/weekly-schedule-overview?week_offset=${weekOffset}`;

                const response = await axios.get(apiUrl);
                setScheduleData(response.data);
            } catch (error) {
                console.error("Error fetching schedule data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWeekData();
    }, [weekOffset, startDate]);

    const generateWeeks = () => {
        const weeks = [];
        const year = new Date().getFullYear();
        const month = selectedMonth;
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        const formatDateForAPI = (date) => {
            return (
                date.getFullYear() +
                "/" +
                (date.getMonth() + 1).toString().padStart(2, "0") +
                "/" +
                date.getDate().toString().padStart(2, "0")
            );
        };

        const formatDateForUI = (date) => {
            return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        };

        // Start from the first Monday or previous Monday if month starts mid-week
        const firstWeekStart = new Date(startOfMonth);
        const dayOfWeek = firstWeekStart.getDay(); // 0 = Sun, 1 = Mon
        const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        firstWeekStart.setDate(firstWeekStart.getDate() + offset);

        let currentStart = new Date(firstWeekStart);

        let weekIndex = 1;
        while (currentStart <= endOfMonth) {
            const currentEnd = new Date(currentStart);
            currentEnd.setDate(currentEnd.getDate() + 6);

            // Only include weeks that overlap with the selected month
            if (
                currentStart.getMonth() === month ||
                currentEnd.getMonth() === month
            ) {
                weeks.push({
                    label: `Week ${weekIndex} [${formatDateForUI(
                        currentStart
                    )} - ${formatDateForUI(currentEnd)}]`,
                    value: formatDateForAPI(currentStart),
                });
                weekIndex++;
            }

            currentStart.setDate(currentStart.getDate() + 7);
        }

        return weeks;
    };

    const toggleSchedule = (day, team, region) => {
        const scheduleKey = `${day}-${team}-${region}`;
        setSelectedSchedules((prev) =>
            prev.includes(scheduleKey)
                ? prev.filter((key) => key !== scheduleKey)
                : [...prev, scheduleKey]
        );
    };

    const handleWeekSelect = (value) => {
        setStartDate(value);
        setIsPopoverOpen(false);
    };

    const handleMonthSelect = (value) => {
        setSelectedMonth(value);
        setStartDate(null);
    };

    const getWeekDays = () => {
        if (!scheduleData.week_start) return [];

        const start = new Date(scheduleData.week_start);
        const days = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);

            days.push({
                day: date.toLocaleDateString("en-US", { weekday: "long" }),
                date: formatDate(date),
            });
        }
        return days;
    };

    const formatDate = (date) => {
        return date.toLocaleDateString("en-GB");
    };

    const days = getWeekDays();

    const TeamSchedule = ({
        day,
        team,
        date,
        setTicketData,
        data = { tickets: [], count: "0/12" },
    }) => {
        const isOpen = selectedSchedules.includes(
            `${day}-${team}-${data.region || "no-region"}`
        );
        const totalTickets = parseInt(data.count.split("/")[0], 10);
        const maxTickets = parseInt(data.count.split("/")[1] || "12", 10);
        const utilization = (totalTickets / maxTickets) * 100;

        let statusColor = "bg-gray-100";
        if (utilization >= 100) statusColor = "bg-red-50 border-red-200 border";
        else if (utilization >= 75) statusColor = "bg-orange-50 border-orange-200 border";
        else if (utilization > 0) statusColor = "bg-emerald-50 border-emerald-200 border";

        return (
            <div
                className={`mb-4 cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md ${statusColor} ${isOpen ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                onClick={() => toggleSchedule(day, team, data.region || "no-region")}
            >
                <div className="flex items-center justify-between p-3">
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {isOpen ? <DownOutlined className="text-xs text-emerald-500" /> : <RightOutlined className="text-xs text-slate-400" />}
                            <span className="font-bold text-slate-900 truncate">{team}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-5">
                            {data.region || "No region"}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`text-xs font-extrabold px-2 py-1 rounded-full ${utilization >= 100 ? 'bg-red-500 text-white' :
                            utilization >= 75 ? 'bg-orange-500 text-white' :
                                utilization > 0 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                            {data.count}
                        </span>
                    </div>
                </div>
                {isOpen && (
                    <div
                        style={{
                            marginTop: 16,
                            maxHeight: 300,
                            overflowY: "auto",
                            marginLeft: 4,
                            marginRight: 4,
                        }}
                    >
                        {isLoading ? (
                            <Spin className="text-center" />
                        ) : data.tickets.length > 0 ? (
                            <>
                                <List
                                    dataSource={data.tickets}
                                    renderItem={(ticket, index) => {
                                        const isHighlighted =
                                            totalTickets > 8 && index >= 8;
                                        const dateFormat = new Date(
                                            ticket.schedule_date
                                        ).toLocaleDateString("en-GB");

                                        return (
                                            <List.Item
                                                className={`mb-3 rounded-xl p-3 mx-2 transition-all hover:translate-x-1 ${isHighlighted ? "bg-red-50 border-red-100 shadow-sm" : "bg-white border-gray-100 shadow-sm"
                                                    } border shadow-sm`}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                            <FileTextOutlined className="text-lg" />
                                                        </div>
                                                    }
                                                    title={
                                                        <div className="flex justify-between items-start">
                                                            <span
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleShowService(ticket.document_no);
                                                                }}
                                                                className="font-extrabold text-emerald-600 hover:text-emerald-800 transition-colors"
                                                            >
                                                                {ticket.document_no}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dateFormat}</span>
                                                        </div>
                                                    }
                                                    description={
                                                        <div className="mt-1">
                                                            <div className="text-sm font-bold text-gray-800">
                                                                {ticket.customer_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                                {ticket.description || "No Description"}
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        );
                                    }}
                                />

                                {!newTicketRequest &&
                                    user.Role !== "Technician" && (
                                        <div className="mx-auto my-4 w-[90%]">
                                            <Button
                                                disabled={(() => {
                                                    const [day, month, year] =
                                                        date
                                                            .replace(
                                                                /\[|\]/g,
                                                                ""
                                                            )
                                                            .split("/");
                                                    const selectedDate =
                                                        new Date(
                                                            `${year}-${month}-${day}`
                                                        );
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    selectedDate.setHours(
                                                        0,
                                                        0,
                                                        0,
                                                        0
                                                    );

                                                    return selectedDate < today;
                                                })()}
                                                type="dashed"
                                                className="w-full bg-gray-200 p-2"
                                                onClick={() =>
                                                    setTicketData({
                                                        day,
                                                        date,
                                                        team,
                                                        count: data.count
                                                            ? data.count.split(
                                                                "/"
                                                            )[0]
                                                            : "",
                                                        region:
                                                            data.region ||
                                                            "No region assigned",
                                                    })
                                                }
                                            >
                                                <PlusOutlined />
                                                Add New Ticket
                                            </Button>
                                        </div>
                                    )}
                            </>
                        ) : (
                            <div className="mx-auto my-4 w-[90%]">
                                <Button
                                    disabled={(() => {
                                        if (user?.Role === "Technician")
                                            return true;

                                        const [day, month, year] = date
                                            .replace(/\[|\]/g, "")
                                            .split("/");
                                        const selectedDate = new Date(
                                            `${year}-${month}-${day}`
                                        );
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        selectedDate.setHours(0, 0, 0, 0);

                                        return selectedDate < today;
                                    })()}
                                    type="dashed"
                                    className="w-full bg-gray-200 p-2"
                                    onClick={() =>
                                        setTicketData({
                                            day,
                                            date,
                                            team,
                                            count: data.count
                                                ? data.count.split("/")[0]
                                                : "",
                                            region:
                                                data.region ||
                                                "No region assigned",
                                        })
                                    }
                                >
                                    <PlusOutlined />
                                    Add New Ticket
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const WeekStart = new Date(scheduleData.week_start).toLocaleDateString(
        "en-GB"
    );
    const WeekEnd = new Date(scheduleData.week_end).toLocaleDateString("en-GB");

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                        <CalendarOutlined className="text-white text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Weekly Schedule</h2>
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">
                            {WeekStart} — {WeekEnd}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex flex-1 sm:flex-none p-1 bg-gray-100 rounded-xl gap-1">
                        <Button
                            onClick={() => {
                                setStartDate(null);
                                setWeekOffset((prev) => prev - 1);
                            }}
                            className="flex-1 sm:flex-none h-9 border-none bg-transparent hover:bg-white hover:text-emerald-600 font-bold transition-all rounded-lg shadow-none"
                        >
                            Prev
                        </Button>
                        <Button
                            onClick={() => {
                                setStartDate(null);
                                setWeekOffset(0);
                            }}
                            className={`flex-1 sm:flex-none h-9 border-none font-bold transition-all rounded-lg shadow-sm ${weekOffset === 0 ? 'bg-white text-emerald-600 shadow-sm' : 'bg-transparent text-slate-500'}`}
                        >
                            Current
                        </Button>
                        <Button
                            onClick={() => {
                                setStartDate(null);
                                setWeekOffset((prev) => prev + 1);
                            }}
                            className="flex-1 sm:flex-none h-9 border-none bg-transparent hover:bg-white hover:text-emerald-600 font-bold transition-all rounded-lg shadow-none"
                        >
                            Next
                        </Button>
                    </div>

                    <Popover
                        placement="bottomRight"
                        arrow={false}
                        content={
                            <div className="p-3 w-[280px]">
                                <div className="mb-3">
                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Jump to Month</span>
                                    <Select
                                        className="w-full modern-select"
                                        size="middle"
                                        value={selectedMonth}
                                        onChange={handleMonthSelect}
                                        options={Array.from({ length: 12 }, (_, i) => ({
                                            label: new Date(0, i).toLocaleString("default", { month: "long" }),
                                            value: i,
                                        }))}
                                    />
                                </div>
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Select Week</span>
                                <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1">
                                    {generateWeeks().map((week) => (
                                        <div
                                            key={week.value}
                                            className="group cursor-pointer p-3 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100 flex items-center justify-between"
                                            onClick={() => handleWeekSelect(week.value)}
                                        >
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600">{week.label}</span>
                                            <CaretRightOutlined className="text-xs text-slate-300 group-hover:text-emerald-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                        trigger="click"
                        open={isPopoverOpen}
                        onOpenChange={setIsPopoverOpen}
                    >
                        <Button className="h-10 px-6 rounded-xl border-slate-200 hover:border-emerald-400 hover:text-emerald-600 font-bold transition-all flex items-center gap-2">
                            <CalendarOutlined />
                            <span>Select Week</span>
                        </Button>
                    </Popover>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {days.map(({ day, date }) => (
                    <div key={day} className="app-card overflow-hidden">
                        <div className="bg-white px-5 py-4 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h4 className="text-lg font-extrabold text-slate-900 leading-none">{day}</h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">{date}</span>
                            </div>
                            <Tag color="emerald" className="m-0 rounded-lg border-none font-extrabold text-xs px-2 py-0.5">
                                {scheduleData.schedule?.[day]?.slots_used || 0} Slots
                            </Tag>
                        </div>
                        <div className="p-4 bg-gray-50/30">
                            {scheduleData.schedule &&
                                scheduleData.schedule[day] &&
                                Object.keys(scheduleData.schedule[day])
                                    .filter(
                                        (team) =>
                                            team !== "active_teams" &&
                                            team !== "slots_used"
                                    )
                                    .map((team) => {
                                        const teamData =
                                            scheduleData.schedule[day][
                                            team
                                            ];

                                        return (
                                            <TeamSchedule
                                                key={team}
                                                day={day}
                                                team={teamData.team}
                                                date={date}
                                                data={teamData}
                                                setTicketData={
                                                    setTicketInfo
                                                }
                                            />
                                        );
                                    })}

                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                    {scheduleData.schedule?.[day]?.active_teams || 0} Teams Active
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default TeamScheduler;
