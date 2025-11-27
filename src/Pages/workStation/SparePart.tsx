import React, { useState } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function QuantityInput() {
  const [value, setValue] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === "") {
      setValue(0);
      return;
    }
    const num = Number(v);
    if (!isNaN(num) && num >= 0) {
      setValue(num);
    }
  };

  const handleIncrease = () => setValue((prev) => prev + 1);
  const handleDecrease = () =>
    setValue((prev) => (prev > 0 ? prev - 1 : 0));

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <IconButton
        onClick={handleDecrease}
        size="small"
        sx={{ border: "1px solid #ddd" }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>

      <TextField
        type="number"
        value={value}
        onChange={handleChange}
        sx={{ width: 90 }}
        size="small"
        inputProps={{ min: 0 }}
      />

      <IconButton
        onClick={handleIncrease}
        size="small"
        sx={{ border: "1px solid #ddd" }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
