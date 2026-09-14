// Exact colors extracted from the source Power BI report's per-status
// dataPoint overrides (all standard antd palette values).
export const STATUS_COLORS = {
    COMPLETED: "#52C41A",
    INPROGRESS: "#FF4D4F",
    "TECH-ASSN": "#F86A6B",
    "RESCH-COMP": "#FAAD14",
    "RESCH-UNAVAI": "#FAC252",
};

export const statusColor = (status) => STATUS_COLORS[status] || "#8c8c8c";

// The pbix's region series colors were stale/mismatched leftover
// formatting rather than real overrides - this is a reasonable
// qualitative palette for the known region set.
export const REGION_COLORS = {
    Central: "#118DFF",
    East: "#12239E",
    North: "#D64550",
    NorthEast: "#744EC2",
    South: "#E044A7",
    SouthWest: "#6B007B",
    West: "#D9B300",
};

export const regionColor = (region) => REGION_COLORS[region] || "#8c8c8c";
