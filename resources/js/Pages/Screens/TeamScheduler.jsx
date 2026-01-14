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
        const newTicketRequest = totalTickets === 12;

        return (
            <div
                className="mb-4 cursor-pointer bg-gray-200 rounded transition"
                onClick={() =>
                    toggleSchedule(day, team, data.region || "no-region")
                }
            >
                <div className="flex items-center justify-between bg-gray-200 p-2 rounded">
                    <div className="flex items-center gap-2 flex-1">
                        {isOpen ? <DownOutlined /> : <RightOutlined />}
                        <Text strong>{team}</Text>
                        <Text type="secondary">
                            {data.region || "No region assigned"}
                        </Text>
                    </div>
                    <Text className="text-gray-600">{data.count}</Text>
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
                                                className={`border border-gray-300 mb-2 rounded-lg p-2 mx-4 ${
                                                    isHighlighted
                                                        ? "bg-red-200"
                                                        : "bg-white"
                                                }`}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <List.Item.Meta
                                                    className="ml-4"
                                                    avatar={
                                                        <FileTextOutlined />
                                                    }
                                                    title={
                                                        <Text
                                                            onClick={() =>
                                                                handleShowService(
                                                                    ticket.document_no
                                                                )
                                                            }
                                                            strong
                                                            className="text-indigo-500 hover:underline"
                                                        >
                                                            {ticket.document_no ||
                                                                ""}
                                                        </Text>
                                                    }
                                                    description={
                                                        <div className="flex flex-col">
                                                            <div className="flex justify-between pr-2">
                                                                <Text strong>
                                                                    {ticket.customer_name ||
                                                                        ""}
                                                                </Text>
                                                                <Text strong>
                                                                    {dateFormat ||
                                                                        ""}
                                                                </Text>
                                                            </div>
                                                            <div className="gap-x-2 items-center">
                                                                <Text>
                                                                    {ticket.description ||
                                                                        "No Description"}
                                                                </Text>
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
            <div className="flex justify-end pb-4 items-center">
                {/* <button
                    onClick={handleScreen}
                    className="flex space-x-2 items-center mb-10"
                >
                    <ArrowLeftOutlined />
                    <p>Back to Dashboard</p>
                </button> */}
                {/* Weekly Select  */}
                <div className=" flex justify-end gap-x-4 items-center ">
                    <Popover
                        placement="top"
                        content={
                             <div className="w-screen max-w-xs sm:max-w-sm p-2">
                                <Select
                                    className="w-full mb-2"
                                    value={selectedMonth}
                                    onChange={handleMonthSelect}
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <Select.Option key={i} value={i}>
                                            {new Date(0, i).toLocaleString(
                                                "default",
                                                { month: "long" }
                                            )}
                                        </Select.Option>
                                    ))}
                                </Select>
                                {generateWeeks().map((week) => (
                                    <div
                                        key={week.value}
                                        className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                                        onClick={() =>
                                            handleWeekSelect(week.value)
                                        }
                                    >
                                        {week.label}
                                    </div>
                                ))}
                            </div>
                        }
                        trigger="click"
                        open={isPopoverOpen}
                        onOpenChange={setIsPopoverOpen}
                    >
                        <Button className="bg-gray-500 text-white ">
                            <CalendarOutlined /> Select Week
                        </Button>
                    </Popover>
                </div>
            </div>

            <div>
                 <div className="min-h-screen px-2 sm:px-4 lg:px-6 py-4 sm:py-6 bg-white rounded-2xl">
                    <div className="mb-4 flex justify-between gap-x-4 items-center">
                        {/* WeekOffset */}

                        <Button
                            onClick={() => {
                                setStartDate(null);
                                setWeekOffset((prev) => prev - 1);
                            }}
                            className=" bg-indigo-500 text-white"
                        >
                            Previous Week
                        </Button>

                        <Button
                            className="bg-indigo-500 text-white"
                            onClick={() => {
                                setStartDate(null);
                                setWeekOffset((prev) => prev + 1);
                            }}
                        >
                            Next Week
                        </Button>
                    </div>
                    <Card
 			className="[&_.ant-card-body]:px-2 sm:[&_.ant-card-body]:px-4 md:[&_.ant-card-body]:px-6 "
                        title={
                            <>
                                  <div className="flex flex-col sm:flex-row gap-x-2 sm:gap-x-3 gap-y-1 sm:gap-y-2 p-0  sm:p-2 ">
                                    <p>
                                        <CalendarOutlined /> Weekly Schedule
                                        Overview
                                    </p>

                                    <p>
                                        [{WeekStart} - {WeekEnd}]
                                    </p>
                                </div>
                            </>
                        }
                    >
                          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-4">
                            {days.map(({ day, date }) => (
                                <Card
                                    key={day}
                                    className="bg-gray-50 min-w-0"
                                    title={`${day} [${date}]`}
                                >
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

                                    <div className="mt-4 pt-3 border-t flex justify-between text-sm text-gray-600">
                                        <span>
                                            {scheduleData.schedule?.[day]
                                                ?.active_teams || 0}{" "}
                                            Active Teams
                                        </span>
                                        <span>
                                            {scheduleData.schedule?.[day]
                                                ?.slots_used || 0}{" "}
                                            Slots Used
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default TeamScheduler;
