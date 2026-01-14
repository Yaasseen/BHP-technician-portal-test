import React from "react";

const DetailCard = ({
    name,
    date,
    time,
    status,
    description,
    statusDescription,
    className,
    url,
}) => {
    return (
        <div
            className={`p-4 border border-gray-200 rounded-lg mb-4 flex justify-between items-start ${className}`}
        >
            <div className="flex-1">
                <div className="flex justify-between mb-3">
                    <div className="flex space-x-4 items-center">
                        <p className="font-semibold text-lg">{name}</p>
                        <div className="flex space-x-2">
                            <p className="text-gray-600">{date}</p>
                            <p className="text-gray-600">{time}</p>
                        </div>
                    </div>
                </div>
                {statusDescription && (
                    <div className="mb-3">
                        <p
                            className={`text-sm flex items-center font-medium ${
                                statusDescription && "text-gray-700"
                            }`}
                        >
                            <p className="pr-2">Status :</p>
                            {statusDescription}
                        </p>
                    </div>
                )}

                <div>
                    <p className="text-gray-700">{description}</p>
                </div>
            </div>

            {url === null ? (
                <div></div>
            ) : (
                <div className="ml-4">
                    <img
                        src={url}
                        alt="Detail"
                        className="w-[200px]  object-cover border rounded-lg"
                    />
                </div>
            )}
        </div>
    );
};

export default DetailCard;
