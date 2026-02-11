import moment from 'moment';
import { Box, Card, CardContent, Typography, Button, Container, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AppHearder from '../../Component/AppHeader';
import questionData1 from './question_1.json';

import Swal from 'sweetalert2';

export default function DashboardQuiz() {
    const navigate = useNavigate();

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
            <Box sx={{ mb: 4, mt: 9 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Quiz Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    เลือกทำแบบทดสอบที่คุณต้องการ
                </Typography>
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
        </Container>
    );
}
