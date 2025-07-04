import React, { useState } from "react";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import BatteryIndicator from "../../Component/BatteryIndicator";
import WifiIndicator from "../../Component/WifiIndicator";

type Product = {
  id: string;
  name: string;
  systemQty: number;
  countedQty: number;
};

const mockProducts: Product[] = [
  { id: "P001", name: "Product A", systemQty: 10, countedQty: 0 },
  { id: "P002", name: "Product B", systemQty: 5, countedQty: 0 },
  { id: "P003", name: "Product C", systemQty: 15, countedQty: 0 },
];

const NewInventoryCount: React.FC = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>(mockProducts);

  const handleQtyChange = (id: string, value: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, countedQty: value } : p
      )
    );
  };

  const filtered = products.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ height: "100vh", bgcolor: "#fff" }}>
      <Container sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom>
          New Inventory Count
        </Typography>

        {/* Search + Barcode */}
        <TextField
          fullWidth
          placeholder="Search or scan barcode..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <QrCodeScannerIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Product List */}
        <Paper variant="outlined">
          <List>
            {filtered.map((item) => (
              <ListItem key={item.id} divider sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                <ListItemText
                  primary={`${item.id} - ${item.name}`}
                  secondary={`System: ${item.systemQty}`}
                />
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  label="Counted Qty"
                  value={item.countedQty}
                  onChange={(e) =>
                    handleQtyChange(item.id, parseInt(e.target.value || "0"))
                  }
                  sx={{ mt: 1 }}
                />
                <BatteryIndicator level={50} />
                <WifiIndicator strength={3} isConnected={true}  />
              </ListItem>
            ))}
            {filtered.length === 0 && (
              <Box sx={{ p: 2, textAlign: "center", color: "gray" }}>
                No product found.
              </Box>
            )}
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default NewInventoryCount;
