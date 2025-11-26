import { AddBoxOutlined, Book, CarRental, ChatBubbleRounded, ChatRounded, CleanHands, CleanHandsOutlined, CleaningServicesSharp, Dashboard, GifBox, GradeOutlined, Inventory, Map, MedicalInformation, NearMe, Person, PlayCircleFilled, ProductionQuantityLimits, Report, Security, SecuritySharp, Store, StoreSharp } from "@mui/icons-material";
import { Box, Grid, Paper, styled } from "@mui/material";
import { Link } from "react-router-dom";
import Header from "./Header";
import { useUser } from "../../Context/userContext";
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ConstructionIcon from '@mui/icons-material/Construction';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import HomeWorkIcon from '@mui/icons-material/HomeWork';


export default function Home() {

    const { user } = useUser();

    return (
        <Box sx={{ p: 2, marginTop: 1, marginBottom: 8 }}>
            <Header />
            <Grid container spacing={2} sx={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                <Grid size={50}>
                </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ flex: 1, flexDirection: 'row', justifyContent: 'center', marginTop: 2 }}>
                <Grid size={12} sx={{width:'100%'}}>
                    <Link to={'StandardTimeDashboard'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, justifyContent: 'left', width: '95%', padding: '10px 0px 10px 0px',margin:'auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '10px'}}>
                            <Dashboard sx={{ marginLeft: '10px', fontSize: 32, color: '#003264' }} />
                            <span style={{ marginLeft: '12px', color: '#333' }}>Dashboard</span>
                        </Box>
                    </Link>
                    <Link to={'/checkin'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, justifyContent: 'left', width: '95%', padding: '10px 0px 10px 0px',margin:'auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '10px'}}>
                            <Map sx={{ marginLeft: '10px', fontSize: 32, color: '#003264' }} />
                            <span style={{ marginLeft: '12px', color: '#333' }}>Check in-out</span>
                        </Box>
                    </Link>

                    <Link to={'/List'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, justifyContent: 'left', width: '95%', padding: '10px 0px 10px 0px',margin:'auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '10px' }}>
                            <DeviceThermostatIcon sx={{ marginLeft: '10px', fontSize: 32, color: '#003264' }} />
                            <span style={{ marginLeft: '12px', color: '#333' }}>IoT Service</span>
                        </Box>
                    </Link>

                    <Link to={'/InventoryList'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, justifyContent: 'left', width: '95%', padding: '10px 0px 10px 0px',margin:'auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '10px' }}>
                            <Inventory sx={{ marginLeft: '10px', fontSize: 32, color: '#003264' }} />
                            <span style={{ marginLeft: '12px', color: '#333' }}>Inventory Counting</span>
                        </Box>
                    </Link>

                    <Link to={'/MyDocument'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, justifyContent: 'left', width: '95%', padding: '10px 0px 10px 0px',margin:'auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '10px' }}>
                            <UploadFileIcon sx={{ marginLeft: '10px', fontSize: 32, color: '#003264' }} />
                            <span style={{ marginLeft: '12px', color: '#333' }}>My Document</span>
                        </Box>
                    </Link>

                    <Link to={'/EquipmentDashboard'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, justifyContent: 'left', width: '95%', padding: '10px 0px 10px 0px',margin:'auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '10px' }}>
                            <ConstructionIcon sx={{ marginLeft: '10px', fontSize: 32, color: '#003264' }} />
                            <span style={{ marginLeft: '12px', color: '#333' }}>Equipment</span>
                        </Box>
                    </Link>

                    <Link to={'/Chat'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, justifyContent: 'left', width: '95%', padding: '10px 0px 10px 0px',margin:'auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '10px' }}>
                            <QuestionAnswerRoundedIcon sx={{ marginLeft: '10px', fontSize: 32, color: '#003264' }} />
                            <span style={{ marginLeft: '12px', color: '#333' }}>Chat</span>
                        </Box>
                    </Link>

                    <Link to={'/SetupAndRefurbish'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, justifyContent: 'left', width: '95%', padding: '10px 0px 10px 0px',margin:'auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '10px' }}>
                            <HomeWorkIcon sx={{ marginLeft: '10px', fontSize: 32, color: '#003264' }} />
                            <span style={{ marginLeft: '12px', color: '#333' }}>Station</span>
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