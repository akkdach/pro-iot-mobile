import React, { useState } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function SparePart({count, setCount} : any) {
  const [value, setValue] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === "") {
      setCount(0);
      return;
    }
    const num = Number(v);
    if (!isNaN(num) && num >= 0) {
      setCount(num);
    }
  };

  const handleIncrease = () => setCount((prev: number) => prev + 1);
  const handleDecrease = () =>
    setCount((prev: number) => (prev > 0 ? prev - 1 : 0));

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
        value={count}
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
