import React, { useState } from 'react';
import moment from 'moment';
import { Box, Card, CardContent, Typography, Button, Container, Grid, Dialog, DialogContent, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AppHearder from '../../Component/AppHeader';
import questionData1 from './question_1.json';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CertificateDocument from './Certificate';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import HistoryIcon from '@mui/icons-material/History';

import { useUser } from '../../Context/userContext';
import callApi from '../../Services/callApi';
import Swal from 'sweetalert2';

export default function DashboardQuiz() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [openHistory, setOpenHistory] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await callApi.get(`/WorkOrderList/QuizHistory`);
            console.log("History API Response:", response.data);
            if (response.data && response.data.dataResult && Array.isArray(response.data.dataResult)) {
                setHistoryData(response.data.dataResult);
            } else {
                console.warn("API response format error or empty:", response.data);
                setHistoryData([]);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'ไม่สามารถโหลดประวัติการสอบได้'
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch history when dialog opens
    React.useEffect(() => {
        if (openHistory && user?.id) {
            fetchHistory();
        }
    }, [openHistory, user]);

    // Mock data for quizzes
    const quizzes = [
        {
            id: 1,
            title: "Refurbish Quiz",
            description: "แบบทดสอบความรู้เกี่ยวกับ Refurbish System และขั้นตอนการทำงาน",
            route: "/QuizQuest",
            examData: questionData1
        }
        // Add more quizzes here in the future
    ];



    const handleStartQuiz = (quiz: any) => {
        Swal.fire({
            title: 'ยืนยันการเริ่มทำแบบทดสอบ',
            text: `คุณต้องการเริ่มทำแบบทดสอบ "${quiz.title}" ใช่หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่, เริ่มเลย!',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                // Generate Thai Time (UTC+7) manually or use a library if preferable, 
                // but since user specifically asked for "Thai Time Zone", 
                // typically backend expects ISO string with offset or shifted time.
                // Using moment to explicit format.
                const thaiTime = moment().format('YYYY-MM-DDTHH:mm:ss'); // Local time format

                navigate(quiz.route, {
                    state: {
                        examData: quiz.examData,
                        title: quiz.title,
                        startTime: thaiTime // Send local time string
                    }
                });
            }
        });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <AppHearder title="Dashboard Quiz" />
            <Box sx={{ mb: 4, mt: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Quiz Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        เลือกทำแบบทดสอบที่คุณต้องการ
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={() => setOpenHistory(true)}
                    sx={{ borderRadius: 2 }}
                >
                    ประวัติการสอบ
                </Button>
            </Box>

            <Grid container spacing={3}>
                {quizzes.map((quiz) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={quiz.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 4,
                                boxShadow: 3,
                                transition: '0.3s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6
                                }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 4 }}>
                                <Box sx={{
                                    p: 2,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.light',
                                    color: 'primary.main',
                                    mb: 3
                                }}>
                                    <AssignmentIcon sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography variant="h5" component="div" fontWeight="bold" gutterBottom>
                                    {quiz.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    {quiz.description}
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={() => handleStartQuiz(quiz)}
                                    sx={{ mt: 'auto', borderRadius: 3 }}
                                >
                                    เริ่มทำแบบทดสอบ
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Dialog
                open={openHistory}
                onClose={() => setOpenHistory(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <Typography variant="h6" fontWeight="bold">ประวัติการสอบของฉัน</Typography>
                    <IconButton onClick={() => setOpenHistory(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <DialogContent>
                    <List>
                        {loading ? (
                            <Typography sx={{ p: 2, textAlign: 'center' }}>Loading...</Typography>
                        ) : historyData.length === 0 ? (
                            <Typography sx={{ p: 2, textAlign: 'center' }}>ไม่พบประวัติการสอบ</Typography>
                        ) : (
                            historyData.map((item: any) => (
                                <ListItem key={item.submissionId} sx={{ bgcolor: 'background.paper', mb: 2, borderRadius: 2, boxShadow: 1 }}>
                                    <ListItemText
                                        primary={item.quizTitle}
                                        secondary={`Score: ${item.score}/${item.totalScore} • Date: ${moment(item.examDate).format('DD/MM/YYYY HH:mm')} • Status: ${item.status}`}
                                        primaryTypographyProps={{ fontWeight: 'bold' }}
                                        secondaryTypographyProps={{
                                            component: 'span',
                                            style: { color: item.status === 'passed' ? 'green' : 'red' }
                                        }}
                                    />
                                    <ListItemSecondaryAction>
                                        {item.status === 'passed' && (
                                            <PDFDownloadLink
                                                document={
                                                    <CertificateDocument
                                                        userName={user?.fullname || user?.username || "User"}
                                                        courseName={item.quizTitle}
                                                        score={item.score}
                                                        totalScore={item.totalScore}
                                                        date={item.examDate}
                                                    />
                                                }
                                                fileName={`certificate_${item.submissionId}.pdf`}
                                            >
                                                {({ blob, url, loading, error }) => (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        color="success"
                                                        startIcon={<GetAppIcon />}
                                                        disabled={loading}
                                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                                    >
                                                        {loading ? 'Generating...' : 'Certificate'}
                                                    </Button>
                                                )}
                                            </PDFDownloadLink>
                                        )}
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        )}
                    </List>
                </DialogContent>
            </Dialog>
        </Container>
    );
}
