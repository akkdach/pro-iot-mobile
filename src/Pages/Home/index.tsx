import { AddBoxOutlined, Book, CarRental, ChatBubbleRounded, ChatRounded, CleanHands, CleanHandsOutlined, CleaningServicesSharp, GifBox, GradeOutlined, Inventory, Map, MedicalInformation, NearMe, Person, PlayCircleFilled, ProductionQuantityLimits, Report, Security, SecuritySharp, Store, StoreSharp } from "@mui/icons-material";
import { Box, Grid, Paper, styled } from "@mui/material";
import { Link } from "react-router-dom";
import Header from "./Header";
import { useUser } from "../../Context/userContext";
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';


export default function Home() {

    const { user } = useUser();

    return (
        <Box sx={{ flexGrow: 1, padding: 1, marginTop: '65px' }}>
            <Header />
            <Grid container spacing={2} sx={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                <Grid size={12}>
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ flex: 1, flexDirection: 'row', justifyContent: 'center', marginTop: 2 }}>
                <Grid size={12} sx={{width:'100%'}}>
                    <Link to={'/checkin'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, justifyContent: 'left', width: '95%', padding: '10px 0px 10px 0px',margin:'auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '10px'}}>
                            <Map sx={{ marginLeft: '10px', fontSize: 32, color: '#003264' }} />
                            <span style={{ marginLeft: '12px', color: '#333' }}>Check in-out</span>
                        </Box>
                    </Link>

                    <Link to={'/List'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, justifyContent: 'left', width: '95%', padding: '10px 0px 10px 0px',margin:'auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '10px' }}>
                            <DeviceThermostatIcon sx={{ marginLeft: '10px', fontSize: 32, color: '#003264' }} />
                            <span style={{ marginLeft: '12px', color: '#333' }}>IOT Service</span>
                        </Box>
                    </Link>

                    <Link to={'/InventoryList'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, justifyContent: 'left', width: '95%', padding: '10px 0px 10px 0px',margin:'auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '10px' }}>
                            <Inventory sx={{ marginLeft: '10px', fontSize: 32, color: '#003264' }} />
                            <span style={{ marginLeft: '12px', color: '#333' }}>Inventory Count</span>
                        </Box>
                    </Link>
                </Grid>
            </Grid>
        </Box>
    );
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    height: 65,
    width: 70,
    fontSize: 14,
    margin: 'auto',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: (theme.vars ?? theme).palette.text.secondary,
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));