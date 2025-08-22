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
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import QrCode2Icon from '@mui/icons-material/QrCode2';
import BatteryIndicator from "../../Component/BatteryIndicator";
import WifiIndicator from "../../Component/WifiIndicator";
import InvenHeader from "./Header";
import QRScanner from "../../Component/QRScanner";

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
  const [openScanner, setOpenScanner] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [invenInfo, setInvenInfo] = useState<{ deviceNo: string; orderId: string } | null>(null);


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

  const handleInputChange = async (e: any) => {
    const { name, value } = e.target
    var newData: any = { ...invenInfo, [name]: value }
    setInvenInfo(newData);
  };

  return (
    <>
      <InvenHeader title="New Inventory Counting" />
      <Box sx={{ p: 2, marginTop: 7, marginBottom: 6, backgroundColor: '#f8f8f8ff' }}>
        {/* <Container sx={{ py: 2 }}> */}

        {/* Search + Barcode */}
        {/* <TextField
            fullWidth
            placeholder="Search or Scan barcode..."
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <QrCode2Icon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          /> */}

        <Box sx={{ display: 'flex', justifyContent: 'center', }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or Scan Barcode..."
            sx={{
              height: 50,
              fontWeight: 500,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              width: '100%',
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                '& fieldset': {
                  borderColor: '#ddd',
                },
              },
              '& input': {
                padding: '12px 14px',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon/>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" size="small" onClick={() => setOpenScanner(true)}>
                    <QrCode2Icon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {openScanner && (
          <QRScanner
            open={openScanner}
            onClose={() => setOpenScanner(false)}
            onScan={(value) => {
              setOrderId(value);
              handleInputChange({ target: { name: 'orderId', value } });
            }}
          />
        )}

        {/* Product List */}
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                mb: 2,
                border: '1px solid #ddd',
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                backgroundColor: '#fff',
              }}
            >
              {/* รูปภาพด้านซ้าย */}
              <Box sx={{ width: 64, height: 64, mr: 2 }}>
                <img
                  src={`/images/${item.id}.jpg`} // เปลี่ยน path ตามจริง
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
              </Box>

              {/* เนื้อหา */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {item.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, alignItems: 'center' }}>
                  {/* คอลัมที่ 1 */}
                  <ListItem key={item.id} sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="body2" color="#000000">
                      {item.systemQty} in stock
                    </Typography>
                    <Typography variant="body2" color="#000000">
                      Order
                    </Typography>
                  </Box>
                  </ListItem>

                  {/* คอลัมที่ 2 */}
                  <TextField
                    type="number"
                    size="small"
                    label="Counted"
                    value={item.countedQty}
                    onChange={(e) =>{
                      const value = e.target.value;
                      handleQtyChange(item.id, value === '' ? 0 : parseInt(value));
                    }}
                    sx={{ width: 120 }}
                  />
                </Box>
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
            No product found.
          </Box>
        )}


        {/* </Container> */}
      </Box>
    </>
  );
};

export default NewInventoryCount;
