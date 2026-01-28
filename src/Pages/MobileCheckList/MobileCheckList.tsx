
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import AppHearder from "../../Component/AppHeader";

interface WorkOrderItem {
  orderId: string;
  checkListMasterId: number;
  checked: string;
  codeDescription: string;
  textDescription: string;
}

const MobileCheckList = () => {
  const [data, setData] = useState<WorkOrderItem[]>([
    {
      orderId: "WO-001",
      checkListMasterId: 1,
      checked: "",
      codeDescription: "",
      textDescription: "",
    },
    {
      orderId: "WO-002",
      checkListMasterId: 2,
      checked: "",
      codeDescription: "",
      textDescription: "",
    },
  ]);

  const handleChange = (index: number, field: keyof WorkOrderItem, value: string) => {
    const newData = [...data];

    if (field === "checkListMasterId") {
      newData[index].checkListMasterId = parseInt(value);
    } else {
      newData[index][field] = value as string;
    }

    // ถ้าเลือก Failed → ล้างค่าและ disabled
    if (field === "checked" && value === "Failed") {
      newData[index].codeDescription = "";
      newData[index].textDescription = "";
    }

    setData(newData);
  };

  const handleSaveOrder = async (item: WorkOrderItem) => {
    const payload = { workOrderCheckingList: [item] };
    console.log("Saving Order:", payload);

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert(`Order ${item.orderId} saved successfully`);
      } else {
        alert("Failed to save order");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving order");
    }
  };

  return (
    <>
      <AppHearder title="Mobile Check List" />
      <Box p={2} mt={8} marginBottom={8}>
        {data.map((item, index) => (
          <Card key={index} sx={{ mb: 2, backgroundColor: "#F0F8FF", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: "#6A5ACD" }}>
                Order ID: {item.orderId}
              </Typography>

              <Select
                value={item.checked}
                onChange={(e) => handleChange(index, "checked", e.target.value)}
                displayEmpty
                fullWidth
                sx={{ mt: 2 }}
              >
                <MenuItem value="">Select Status</MenuItem>
                <MenuItem value="Pass">Pass</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
              </Select>

              <TextField
                label="Code Description"
                value={item.codeDescription}
                onChange={(e) => handleChange(index, "codeDescription", e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
                disabled={item.checked === "Failed"}
              />

              <TextField
                label="Text Description"
                value={item.textDescription}
                onChange={(e) => handleChange(index, "textDescription", e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
                disabled={item.checked === "Failed"}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => handleSaveOrder(item)}
              >
                Save This Order
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
};

export default MobileCheckList;
