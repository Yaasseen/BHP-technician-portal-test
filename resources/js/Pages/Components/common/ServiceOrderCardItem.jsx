import React from "react";

const ServiceOrderCardItem = ({ serviceOrder, className }) => {
    return (
        <div
            className={`p-4 border border-gray-300 rounded-lg shadow-sm ${className} flex justify-between items-start mb-4`}
        >
            <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-lg text-Black">
                        {serviceOrder.document_no}
                    </p>
                    <span className="text-sm text-gray-500">
                        {serviceOrder.schedule_date}
                    </span>
                </div>

                <p className="text-gray-700 font-medium">
                    <span className="text-gray-500">Team: </span>
                    {serviceOrder.team}
                </p>

                <p className="text-gray-700 font-medium">
                    <span className="text-gray-500">Region: </span>
                    {serviceOrder.region}
                </p>

                <p className="text-gray-700 font-medium">
                    <span className="text-gray-500">
                        Assigned Date and Time :{" "}
                    </span>
                    {serviceOrder.assigned_date}
                    {""} {serviceOrder.assigned_time}
                </p>

                <p className="text-gray-700 font-medium">
                    <span className="text-gray-500">Assigned By: </span>
                    {serviceOrder.assigned_by}
                </p>
            </div>
        </div>
    );
};

export default ServiceOrderCardItem;
