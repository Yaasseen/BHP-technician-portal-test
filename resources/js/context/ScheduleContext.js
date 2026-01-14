import { createContext, useContext, useState } from "react";

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
    const [weekOffset, setWeekOffset] = useState(0);
    const [startDate, setStartDate] = useState(null);

    return (
        <ScheduleContext.Provider
            value={{ weekOffset, setWeekOffset, startDate, setStartDate }}
        >
            {children}
        </ScheduleContext.Provider>
    );
};

export const useSchedule = () => useContext(ScheduleContext);
