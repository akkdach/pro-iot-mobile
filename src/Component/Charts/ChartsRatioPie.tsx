
import * as React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Card, styled, Typography, useMediaQuery } from "@mui/material";
import { useDrawingArea } from "@mui/x-charts";

interface WorkRatioProps {
    onTime: number;
    overTime: number;
    title?: string;
}

const ChartsRatioPie: React.FC<WorkRatioProps> = ({ onTime, overTime, title = 'Ratio' }) => {
    const isMobile = useMediaQuery("(max-width:600px)");

    const data = [
        { id: 0, value: onTime, label: "On Time", color: "#AED581" },
        { id: 1, value: overTime, label: "Over Time", color: "#FFAB91" },
    ];

    const total = onTime + overTime;
    const centerLabel = `${((onTime / total) * 100).toFixed(1)}%`;

    const chartSize = isMobile ? 200 : 250;

    const StyledText = styled('text')(({ theme }) => ({
        fill: theme.palette.text.primary,
        textAnchor: 'middle',
        dominantBaseline: 'central',
        fontSize: 20,
        textWrap:'wrap'
    }));

    function PieCenterLabel({ children }: { children: React.ReactNode }) {
        const { width, height, left, top } = useDrawingArea();
        return (
            <StyledText x={left + width / 2} y={top + height / 2}>
                {children}
            </StyledText>
        );
    }
    return (
        <Card
            sx={{
                width: "100%",
                maxWidth: isMobile ? "90%" : 360,
                margin: "auto",
                padding: 2,
                borderRadius: 3,
                boxShadow: 3,
                textAlign: "center",
            }}
        >
            <Typography variant="h6" mb={2}>
                {''}
            </Typography>
            <Box sx={{ position: "relative", width: chartSize, height: chartSize, margin: "auto" }}>
                <PieChart
                    series={[
                        {
                            data,
                            innerRadius: chartSize / 2.5,
                            outerRadius: chartSize / 2,
                            paddingAngle: 2,
                        },
                    ]}
                    width={chartSize}
                    height={chartSize}
                >

                    <PieCenterLabel>{title}</PieCenterLabel>
                </ PieChart >
                {/* Center Label */}
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: isMobile ? "16px" : "18px",
                        fontWeight: "bold",
                        color: "#555",
                    }}
                >
                    {/* {centerLabel} */}
                </Box>
            </Box>
            <Box mt={2}>
                <Typography variant="body2" color="#93be61ff">
                    On Time: {onTime} / Job
                </Typography>
                <Typography variant="body2" color="#b96c55ff">
                    Over Time: {overTime} / Job
                </Typography>
            </Box>
        </Card>
    );
};

export default ChartsRatioPie;
