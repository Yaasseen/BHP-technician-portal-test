import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import axios from "axios";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

function ServiceOrderCalendar({ screenContent }) {
    const [events, setEvents] = useState([]);

    const fetchEvents = (startDate, endDate) => {
        axios
            .get("/service-orders", {
                params: {
                    start: startDate,
                    end: endDate,
                },
            })
            .then((response) => {
                const formattedEvents = response.data.serviceOrders.map(
                    (serviceOrder) => ({
                        title: serviceOrder.description,
                        start: new Date(serviceOrder.created_at),
                        end: new Date(serviceOrder.created_at),
                        allDay: false,
                        document_no: serviceOrder.document_no,
                    })
                );
                setEvents(formattedEvents);
            })
            .catch((error) => console.error("Error fetching events:", error));
    };

    const handleNavigate = (date) => {
        console.log("Handle event");
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        fetchEvents(start, end);
    };

    const handleSelectEvent = (event) => {
        console.log("Document Number:", event.document_no);

        screenContent(event.document_no);
    };

    useEffect(() => {
        const today = new Date();
        handleNavigate(today);
    }, []);

    return (
        <div className="bg-white p-5 px-5 rounded-none border">
            <div style={{ height: "500px", margin: "20px" }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    onNavigate={handleNavigate}
                    onView={(view) => console.log(`Current view: ${view}`)}
                    onSelectEvent={handleSelectEvent}
                    views={{
                        day: true,
                        week: true,
                        month: true,
                    }}
                />
            </div>
        </div>
    );
}

export default ServiceOrderCalendar;
