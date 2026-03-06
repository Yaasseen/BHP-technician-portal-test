import React, { useEffect, useState } from "react";
import axios from "axios";
import DetailCard from "./DetailsCard";
import moment from "moment";
import { Spin } from "antd";
import ServiceOrderCardItem from "./ServiceOrderCardItem";

const ServiceOrderActivities = ({ document_no, uploadTrigger, reloadList }) => {
    const [serviceOrders, setServiceOrders] = useState([]);
    const [spareParts, setSpareParts] = useState([]);
    const [teamRegionData, setTeamRegionData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [taskCodes, setTaskCodes] = useState([]);

    useEffect(() => {
        const serviceData = async () => {
            try {
                const response = await axios.get("/repair-status-list");
                const TaskCode = response.data.map((taskData) => ({
                    taskCode: taskData.Code,
                    taskDescription: taskData.Description,
                }));
                setTaskCodes(TaskCode);
            } catch (error) {
                console.error("Error fetching repair status list:", error);
            }
        };
        serviceData();
    }, []);

    useEffect(() => {
        const fetchTeamRegionActivity = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    "/team-region-activity/single",
                    {
                        params: { document_no },
                    }
                );

                console.log("API Response:", response.data); // Log response structure
                setTeamRegionData(
                    response.data?.activity ? [response.data.activity] : []
                );
            } catch (error) {
                console.error("Error fetching team-region activity:", error);
            }
            setLoading(false);
        };

        fetchTeamRegionActivity();
    }, [document_no]);

    useEffect(() => {
        const fetchSparePartActivity = async () => {
            try {
                setLoading(true);
                const response = await axios.get("/spare-part-activity", {
                    params: { document_no },
                });
                setSpareParts(response.data?.data || []);
            } catch (error) {
                console.error("Error fetching spare part activity:", error);
            }
            setLoading(false);
        };

        fetchSparePartActivity();
    }, [document_no, reloadList]);

    useEffect(() => {
        const fetchServiceOrderDetails = async () => {
            try {
                setLoading(true);
                const resp = await axios.get(`/service-order-activities/`, {
                    params: { document_no },
                });
                const data = resp.data?.data || [];
                setServiceOrders(
                    data.map((item) => ({
                        name: item.created_by || "N/A",
                        date: item.date || "N/A",
                        time: item.time || " ",
                        status: item.repair_status_code || "N/A",
                        url: item.image_url,
                        description: item.description || "No Description",
                    }))
                );
            } catch (error) {
                console.error("Failed to fetch service order details:", error);
            }
            setLoading(false);
        };

        fetchServiceOrderDetails();
    }, [document_no, uploadTrigger]);

    if (loading) {
        return (
            <div className="flex justify-center items-center">
                <Spin size="small" />
            </div>
        );
    }

    const TaskDescription = (status) => {
        const matchTask = taskCodes.find((task) => task.taskCode === status);
        return matchTask
            ? matchTask.taskDescription
            : "No Description Available";
    };

    return (
        <div className="overflow-y-auto max-h-[500px] space-y-4">
            {/* Team-Region Activity Data */}

            {/* Service Order Activities */}
            {serviceOrders.length > 0 ? (
                serviceOrders.map((order, index) => (
                    <DetailCard
                        key={`service-${index}`}
                        name={order.name}
                        date={moment(order.date, "YYYY-MM-DD").format(
                            "DD/MM/YYYY"
                        )}
                        time={order.time}
                        status={order.status}
                        description={order.description}
                        url={order.url}
                        statusDescription={TaskDescription(order.status)}
                        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                    />
                ))
            ) : (
                <p>There are no service order activities available.</p>
            )}

            {/* Spare Part Activities */}
            {spareParts.length > 0 ? (
                spareParts.map((part, index) => (
                    <DetailCard
                        key={`spare-${index}`}
                        name={part.requested_by || "Unknown"}
                        date={
                            part.requested_date
                                ? moment(
                                    part.requested_date,
                                    "YYYY-MM-DD"
                                ).format("DD/MM/YYYY")
                                : "N/A"
                        }
                        time={part.requested_time || " "}
                        description={
                            <>
                                Spare part <strong>{part.spare_part_no}</strong>{" "}
                                ({part.description}) has been requested for
                                document number{" "}
                                <strong>{part.document_no}</strong>. Quantity:{" "}
                                {part.quantity}.
                            </>
                        }
                        url={null}
                        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                    />
                ))
            ) : (
                <p>There are no spare part activities available.</p>
            )}

            {teamRegionData.length > 0 ? (
                teamRegionData.map((order, index) => (
                    <ServiceOrderCardItem
                        key={`team-region-${index}`}
                        serviceOrder={{
                            ...order,
                            date: moment(order.date, "YYYY-MM-DD").format(
                                "DD/MM/YYYY"
                            ),
                        }}
                        statusDescription={TaskDescription(order.status)}
                        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                    />
                ))
            ) : (
                <p>There are no assignment activities available.</p>
            )}
        </div>
    );
};

export default ServiceOrderActivities;
