import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import { Box, Tab,} from '@mui/material';
import React, {  useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import AppHearder from '../../Component/AppHeader';
import DeviceAction from './ActionDevices';
import StatPort1 from './StatPort1';
import StatPort2 from './StatPort2';

const ActionPages = () => {
    // const { orderNo_ForGetDetail } = useParams();
    // const [action, setAction] = useState<any>([]);
    const [value, setValue] = React.useState('1');


    const handleChange = (event: any, newValue: React.SetStateAction<string>) => {
        setValue(newValue);
    };

    return (
        <>
            <AppHearder title="Device Control" />
            <Box p={2} mt={6} mb={6}>

                {/* <Paper
                sx={{
                  maxWidth: '1400px',
                  margin: '20px auto',
                  padding: '24px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 0 16px rgba(0, 0, 0, 0.1)',
                }}> */}
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', justifyContent: 'center' }}>
                            <TabList
                                onChange={handleChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                aria-label="scrollable auto tabs example"
                                sx={{
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontSize: 16,
                                        borderRadius: '12px 12px 0 0',
                                        minHeight: 48,
                                        px: 3,
                                    },
                                    '& .Mui-selected': {
                                        color: '#1976d2',
                                        backgroundColor: '#e3f2fd',
                                    },
                                    '& .MuiTabs-indicator': {
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: '#82D0F6',
                                    },
                                }}
                            >
                                <Tab label="Control" value="1" />
                                <Tab label="Port 1" value="2" />
                                <Tab label="Port 2" value="3" />
                            </TabList>
                        </Box>

                        <TabPanel value="1" sx={{ px: 0, mt:2 }}>
                            <DeviceAction />
                        </TabPanel>
                        <TabPanel value="2" sx={{ px: 0 }}>
                            <StatPort1 />
                        </TabPanel>
                        <TabPanel value="3" sx={{ px: 0 }}>
                            <StatPort2 />
                        </TabPanel>

                    </TabContext>
                </Box>
                {/* </Paper> */}

            </Box>
        </>
    )

}
export default ActionPages;