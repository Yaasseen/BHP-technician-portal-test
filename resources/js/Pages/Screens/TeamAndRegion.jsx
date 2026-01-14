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
import { CalendarOutlined } from "@ant-design/icons";
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
                messageApi.error("Error fetching team schedules.");
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
            <div className="mx-auto mb-4">
                <Card>
                   <div className="flex flex-col items-center mb-4 border-b-2 border-gray-300 pb-4">
                        <p className="text-center text-lg md:text-xl  font-semibold flex items-center">
                            <CalendarOutlined className="mr-2 sm:mr-4" />
                            Scheduling Team and Region
                        </p>
                    </div>

                    {dates.map((date) => (
                        <div key={date} style={{ marginBottom: 24 }}>
                            <Title level={5}>
                                {config[date]?.dayName} (
                                {moment(date).format("DD/MM/YYYY")})
                            </Title>

                            <Table
                                scroll={{ x: 400 }}
                                loading={loading}
                                dataSource={[...teams].map((team) => ({
                                    key: team,
                                    team,
                                }))}
                                pagination={false}
                                bordered
                                style={{ padding: 0 }}
                            >
                                <Table.Column
                                    title="Team"
                                    dataIndex="team"
                                    key="team"
                                    className="p-5"
                                />

                                {[...regions].map((region) => (
                                    <Table.Column
                                        title={region}
                                        key={region}
                                        className="no-padding-cell"
                                        render={(_, record) => {
                                            const regionData =
                                                config[date]?.teamRegions?.[
                                                    record.team
                                                ]?.[region] || {};
                                            const countEntry =
                                                countScheduled.find(
                                                    (entry) =>
                                                        entry.schedule_date ===
                                                            date &&
                                                        entry.department ===
                                                            record.team &&
                                                        entry.region === region
                                                );

                                            return (
                                                <div
                                                    className={`flex items-center w-full h-full p-2 ${
                                                        countEntry?.count >= 9
                                                            ? "bg-[#FFCCC7] text-white"
                                                            : ""
                                                    }`}
                                                >
                                                    {regionData.enabled ||
                                                    countEntry?.count ? (
                                                        <>
                                                            <Checkbox
                                                                className="custom-checkbox"
                                                                checked={
                                                                    regionData.selected
                                                                }
                                                                onChange={() =>
                                                                    toggleRegion(
                                                                        date,
                                                                        record.team,
                                                                        region
                                                                    )
                                                                }
                                                                disabled={
                                                                    countEntry?.count >=
                                                                    12
                                                                }
                                                            />

                                                            {countEntry?.count >
                                                                0 && (
                                                                <span className="ml-2 text-gray-600">
                                                                    {
                                                                        countEntry.count
                                                                    }
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : null}
                                                </div>
                                            );
                                        }}
                                    />
                                ))}
                            </Table>
                        </div>
                    ))}
                </Card>

                <Modal
                    width={window.innerWidth < 768 ? "90%" : "50%"}
                    title="Scheduling: Team and region"
                    open={modalVisible}
                    onCancel={handleModalClose}
                    footer={null}
                    bodyStyle={{ overflow: "hidden" }}
                >
                    {selectedCheckbox && (
                        <div>
                            <div className="flex flex-col gap-2 border p-2 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="font-semibold mr-4">
                                        {selectedCheckbox.day}
                                    </span>
                                    <span className="font-semibold">
                                        {selectedCheckbox.date}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold">
                                        Team:{" "}
                                    </span>
                                    <span>{selectedCheckbox.team}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">
                                        Region:{" "}
                                    </span>
                                    <span>{selectedCheckbox.region}</span>
                                </div>
                            </div>
                            <div className="overflow-auto max-h-[60vh]">
                                <ServiceOrderSelection
                                    day={selectedCheckbox.day}
                                    schedule_date={selectedCheckbox.date}
                                    department={selectedCheckbox.team}
                                    region={selectedCheckbox.region}
                                    count={selectedCheckbox.count}
                                    modelClose={handleModalClose}
                                    selectedOrder={() =>
                                        confirmRegionSelection()
                                    }
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
