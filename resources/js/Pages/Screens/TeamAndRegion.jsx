import React, { useEffect, useState } from "react";
import {
    Card,
    Table,
    Checkbox,
    Button,
    Typography,
    Spin,
    Modal,
    message,
} from "antd";
import { CalendarOutlined, TeamOutlined, GlobalOutlined, CheckCircleFilled, PlusCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import ServiceOrderSelection from "./ServiceOrderSelection";
import "../../../css/Components/TeamAndRegion.css";

const { Title } = Typography;

const TeamRegionConfig = ({
    showList,
    ticketData,
    returnWeekView,
    locationState,
}) => {
    const [dates, setDates] = useState([]);
    const [teams, setTeams] = useState([]);
    const [regions, setRegions] = useState([]);
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingScreen, setLoadingScreen] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCheckbox, setSelectedCheckbox] = useState(null);
    const [countScheduled, setCountScheduled] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [weeklyScheduleModal, setWeeklyScheduleModal] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [load, setLoad] = useState(false);

    useEffect(() => {
        if (!showList) setLoadingScreen(true);
    }, [showList]);

    // Critical ticket handling logic
    useEffect(() => {
        setSelectedTicket(ticketData);

        if (selectedTicket && config && Object.keys(config).length > 0) {
            console.log("Opening modal");

            setSelectedCheckbox({
                date: selectedTicket.date,
                team: selectedTicket.team,
                region: selectedTicket.region,
                day: moment(selectedTicket.date).format("dddd"),
                count: selectedTicket.count,
            });

            setModalVisible(true);
        }
    }, [ticketData, config]);

    useEffect(() => {
        const fetchTeamSchedule = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    "/team-schedules-configuration"
                );
                const teamSchedules = response.data;

                if (!teamSchedules || Object.keys(teamSchedules).length === 0) {
                    messageApi.error("Empty or invalid API response.");
                    setLoading(false);
                    return;
                }

                // Process dates directly
                const dates = Object.keys(teamSchedules).sort();
                setDates(dates);

                // Extract unique teams and regions
                const extractedRegions = new Set();
                const uniqueTeams = new Set();

                dates.forEach((date) => {
                    Object.entries(teamSchedules[date]).forEach(
                        ([team, teamData]) => {
                            if (teamData.Active) {
                                uniqueTeams.add(team);

                                Object.keys(teamData).forEach((key) => {
                                    if (key.startsWith("R_") && teamData[key]) {
                                        extractedRegions.add(
                                            key.replace("R_", "")
                                        );
                                    }
                                });
                            }
                        }
                    );
                });

                setTeams([...uniqueTeams]);
                setRegions([...extractedRegions]);

                // Build config keyed by date
                const newConfig = {};
                dates.forEach((date) => {
                    newConfig[date] = {
                        teamRegions: {},
                        dayName: moment(date).format("dddd"),
                    };

                    Object.entries(teamSchedules[date]).forEach(
                        ([team, teamData]) => {
                            if (!teamData.Active) return;

                            newConfig[date].teamRegions[team] = {};
                            [...extractedRegions].forEach((region) => {
                                const regionKey = `R_${region}`;
                                newConfig[date].teamRegions[team][region] = {
                                    enabled: teamData[regionKey] === true,
                                    selected: false,
                                };
                            });
                        }
                    );
                });

                setConfig(newConfig);
            } catch (error) {
                console.error("Error fetching team schedules:", error);
                if (error.response && error.response.status === 403) {
                    messageApi.open({
                        type: "warning",
                        content: "You do not have permission to view team schedules.",
                    });
                } else {
                    messageApi.error("Error fetching team schedules.");
                }
            } finally {
                setLoading(false);
                setLoadingScreen(false);
            }
        };

        fetchTeamSchedule();
    }, [load, modalVisible, messageApi]);

    useEffect(() => {
        const fetchCount = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    "/outdoor-service-orders/count-scheduled"
                );
                console.log("Scheduled Count Data:", response.data);
                setCountScheduled(response.data);
            } catch (error) {
                console.error("Error fetching scheduled count:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCount();
    }, [load, modalVisible]);

    const toggleRegion = (date, team, region) => {
        if (!config[date]?.teamRegions) return;

        const countEntry = countScheduled.find(
            (entry) =>
                entry.schedule_date === date &&
                entry.department === team &&
                entry.region === region
        );

        setSelectedCheckbox({
            date,
            team,
            region,
            day: moment(date).format("dddd"),
            count: countEntry ? countEntry.count : 0,
        });

        setModalVisible(true);
    };

    const confirmRegionSelection = () => {
        setLoad(true);
        if (!ticketData) {
            if (!selectedCheckbox) return;

            const { date, team, region } = selectedCheckbox;

            setConfig((prev) => ({
                ...prev,
                [date]: {
                    ...prev[date],
                    teamRegions: {
                        ...prev[date].teamRegions,
                        [team]: {
                            ...prev[date].teamRegions[team],
                            [region]: {
                                ...prev[date].teamRegions[team][region],
                                selected:
                                    !prev[date].teamRegions[team][region]
                                        .selected,
                            },
                        },
                    },
                },
            }));
            setModalVisible(false);
        }

        if (ticketData) {
            returnWeekView();
            setModalVisible(false);
        }
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedTicket(null);
    };

    const toggleWeeklyScheduleModal = () => {
        setWeeklyScheduleModal(!weeklyScheduleModal);
    };

    if (loadingScreen) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            {contextHolder}
            <div className="space-y-8 pb-10">
                {contextHolder}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={returnWeekView}
                            className="w-10 h-10 rounded-none bg-white border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                        >
                            <ArrowLeftOutlined className="text-lg" />
                        </Button>
                        <div className="w-12 h-12 rounded-none bg-red-600 flex items-center justify-center shadow-lg shadow-red-100">
                            <CalendarOutlined className="text-white text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">Configuration</h2>
                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                <TeamOutlined className="text-[10px]" /> Team & Region Scheduling
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    {dates.map((date) => (
                        <div key={date} className="app-card overflow-hidden">
                            <div className="bg-white px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-none bg-red-50 flex items-center justify-center text-red-500">
                                        <CalendarOutlined />
                                    </div>
                                    <div>
                                        <span className="text-lg font-extrabold text-gray-900 leading-none">{config[date]?.dayName}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-1">{moment(date).format("DD MMMM YYYY")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-0 overflow-x-auto">
                                <Table
                                    loading={loading}
                                    dataSource={[...teams].map((team) => ({
                                        key: team,
                                        team,
                                    }))}
                                    pagination={false}
                                    className="modern-table"
                                    rowClassName="hover:bg-gray-50/50 transition-colors"
                                >
                                    <Table.Column
                                        title={<span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 p-2">Team Name</span>}
                                        dataIndex="team"
                                        key="team"
                                        render={(text) => (
                                            <div className="flex items-center gap-2 py-2 px-4">
                                                <div className="w-8 h-8 rounded-none bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs ring-2 ring-white">
                                                    {text.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-800">{text}</span>
                                            </div>
                                        )}
                                    />

                                    {[...regions].map((region) => (
                                        <Table.Column
                                            title={<span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 p-2">{region}</span>}
                                            key={region}
                                            render={(_, record) => {
                                                const regionData = config[date]?.teamRegions?.[record.team]?.[region] || {};
                                                const countEntry = countScheduled.find(entry => entry.schedule_date === date && entry.department === record.team && entry.region === region);
                                                const count = countEntry?.count || 0;
                                                const isFull = count >= 12;

                                                return (
                                                    <div
                                                        className={`group relative flex items-center justify-center p-3 transition-all cursor-pointer min-h-[60px] ${isFull ? 'bg-red-50/30' : 'hover:bg-red-50/30'}`}
                                                        onClick={() => !isFull && toggleRegion(date, record.team, region)}
                                                    >
                                                        {(regionData.enabled || count > 0) ? (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <div className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${count > 0 ? (isFull ? 'bg-red-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm') : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm'
                                                                    }`}>
                                                                    {count > 0 ? (
                                                                        <span className="text-xs font-black">{count}</span>
                                                                    ) : (
                                                                        <PlusCircleOutlined className="text-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    )}
                                                                </div>
                                                                {count >= 9 && !isFull && (
                                                                    <span className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter">Near Cap</span>
                                                                )}
                                                                {isFull && (
                                                                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">Full Capacity</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <PlusCircleOutlined className="text-lg text-slate-200 opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100" />
                                                        )}
                                                    </div>
                                                );
                                            }}
                                        />
                                    ))}
                                </Table>
                            </div>
                        </div>
                    ))}
                </div>

                <Modal
                    width={window.innerWidth < 768 ? "95%" : "800px"}
                    title={null}
                    open={modalVisible}
                    onCancel={handleModalClose}
                    footer={null}
                    centered
                    closable={false}
                    className="modern-modal"
                >
                    {selectedCheckbox && (
                        <div className="p-1">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-none bg-red-50 flex items-center justify-center text-red-600">
                                        <PlusCircleOutlined className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-extrabold text-gray-900 leading-none">Schedule Task</h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedCheckbox.day}, {selectedCheckbox.date}</span>
                                            <span className="w-1 h-1 rounded-none bg-gray-300"></span>
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{selectedCheckbox.team}</span>
                                            <span className="w-1 h-1 rounded-none bg-gray-300"></span>
                                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{selectedCheckbox.region}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleModalClose}
                                    className="w-8 h-8 rounded-none hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
                                >
                                    <PlusCircleOutlined className="rotate-45" />
                                </button>
                            </div>

                            <div className="bg-red-50/50 rounded-none p-4 mb-6 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-none bg-red-500"></div>
                                    <span className="text-sm font-bold text-red-700">Team Utilization</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-extrabold text-red-900">{selectedCheckbox.count}/12 Slots Used</span>
                                        <div className="w-32 h-1.5 bg-red-100 rounded-none mt-1 overflow-hidden">
                                            <div
                                                className="h-full bg-red-500 rounded-none transition-all duration-500"
                                                style={{ width: `${(selectedCheckbox.count / 12) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-[65vh] overflow-y-auto pr-1">
                                <ServiceOrderSelection
                                    day={selectedCheckbox.day}
                                    schedule_date={selectedCheckbox.date}
                                    department={selectedCheckbox.team}
                                    region={selectedCheckbox.region}
                                    count={selectedCheckbox.count}
                                    modelClose={handleModalClose}
                                    selectedOrder={() => confirmRegionSelection()}
                                    handleClose={handleModalClose}
                                    locationState={locationState}
                                />
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </>
    );
};

export default TeamRegionConfig;
