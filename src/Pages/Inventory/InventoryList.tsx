import React from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Fab,
    AppBar,
    Toolbar,
    IconButton,
    Container,
    Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";

type InventoryItem = {
    id: number;
    productName: string;
    count: number;
    location: string;
};

const mockInventory: InventoryItem[] = [
    { id: 1, productName: "Product A", count: 12, location: "Zone A1" },
    { id: 2, productName: "Product B", count: 7, location: "Zone B2" },
    { id: 3, productName: "Product C", count: 25, location: "Zone C3" },
    { id: 4, productName: "Product D", count: 3, location: "Zone D1" },
];

const InventoryList: React.FC = () => {
    return (
        <Box sx={{ height: "100vh", bgcolor: "#fff" }}>
            {/* Top Bar */}
            <AppBar position="static" color="default" elevation={1} sx={{ background: '#fff' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Inventory Count
                    </Typography>
                    <IconButton edge="end" color="inherit">
                        <MoreVertIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* List */}
            <Container sx={{ mt: 2 }}>
                <Paper variant="outlined">
                    <List>
                        {mockInventory.map((item) => (
                            <ListItem key={item.id} divider>
                                <ListItemText
                                    primary={item.productName}
                                    secondary={`Count: ${item.count} • ${item.location}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Container>

            {/* FAB Button */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    boxShadow: 3,
                }}
            >
                <AddIcon />
            </Fab>
        </Box>
    );
};

export default InventoryList;
