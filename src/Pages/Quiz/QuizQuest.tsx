import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Box, Card, CardContent, Typography, Button, Stack, Container, Chip, Grid, Dialog, DialogContent, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { useLocation, useNavigate } from 'react-router-dom';
import questionData from './question_1.json';
import { useUser } from '../../Context/userContext';
import callApi from '../../Services/callApi';
import Swal from 'sweetalert2';

interface Option {
    id: number;
    text: string;
}

interface Question {
    id: number;
    text: string;
    image?: string;
    options: Option[];
    correctId: number;
}

export default function QuizQuest() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();
    const { examData, title, startTime } = location.state || {};

    useEffect(() => {
        console.log("Current User:", user);
        console.log("User ID:", user?.id);
    }, [user]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [answers, setAnswers] = useState<any[]>([]);

    const questions: Question[] = examData || questionData;
    const currentQuestion: Question = questions[currentQuestionIndex];



    // ...

    // Submit Quiz Result
    const submitQuizResult = async (finalScore: number, finalAnswers: any[]) => {
        const endTime = moment().format('YYYY-MM-DDTHH:mm:ss');
        const start = moment(startTime); // Parse the passed startTime
        const end = moment(endTime);
        const durationSeconds = end.diff(start, 'seconds');

        const payload = {
            user_id: user?.id,
            employee_id: user?.employee_id,
            quiz_title: title || "Unknown Quiz",
            score: finalScore,
            total_score: questions.length,
            start_time: startTime,
            end_time: endTime,
            time_taken_seconds: durationSeconds,
            status: finalScore >= (questions.length * 0.7) ? "passed" : "failed",
            details: finalAnswers
        };

        console.log("SENDING TO BACKEND:", payload);

        try {
            const response = await callApi.post('/WorkOrderList/Quiz', payload);
            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกคะแนนสำเร็จ',
                    text: `คุณทำได้ ${finalScore} / ${questions.length} คะแนน`,
                    confirmButtonText: 'ตกลง'
                });
            }
        } catch (error) {
            console.error("Error submitting quiz:", error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถบันทึกคะแนนได้ กรุณาลองใหม่อีกครั้ง',
                confirmButtonText: 'ตกลง'
            });
        }
    };

    // Handle Option Click
    const handleOptionClick = (optionId: number) => {
        setSelectedOption(optionId);
    };

    // Handle Submit / Next
    const handleNext = () => {
        const isCorrect = selectedOption === currentQuestion.correctId;
        const currentScore = isCorrect ? score + 1 : score;

        // Record answer detail
        const answerDetail = {
            question_id: currentQuestion.id,
            question_text: currentQuestion.text,
            selected_option_id: selectedOption,
            is_correct: isCorrect
        };
        const updatedAnswers = [...answers, answerDetail];
        setAnswers(updatedAnswers);

        // Update score state
        if (isCorrect) {
            setScore((prev: number) => prev + 1);
        }

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            setSelectedOption(null);
        } else {
            setShowScore(true);
            submitQuizResult(currentScore, updatedAnswers);
        }
    };

    // Restart Quiz
    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setScore(0);
        setShowScore(false);
        setAnswers([]);
    };

    // Go back to Dashboard
    const handleBackToDashboard = () => {
        navigate('/DashboardQuiz');
    };

    if (showScore) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Card sx={{ borderRadius: 4, boxShadow: 3, p: 4 }}>
                    <CardContent>
                        <EmojiEventsIcon sx={{ fontSize: 80, color: 'gold', mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Quiz Completed!
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                            You scored {score} out of {questions.length}
                        </Typography>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleRestart}
                            sx={{ borderRadius: 3, px: 4, mr: 2 }}
                        >
                            ทำแบบทดสอบอีกครั้ง
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={handleBackToDashboard}
                            sx={{ borderRadius: 3, px: 4 }}
                        >
                            กลับหน้าหลัก
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4, pb: 15 }}>
            <Box sx={{ width: '100%', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">{title || "Quiz"}</Typography>
                <Chip
                    icon={<HelpOutlineIcon />}
                    label={`Question ${currentQuestionIndex + 1}/${questions.length}`}
                    color="primary"
                    variant="outlined"
                />
            </Box>

            <Card sx={{ width: '100%', borderRadius: 4, boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: currentQuestion.image ? 5 : 12 }}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                                คำถามที่ {currentQuestionIndex + 1}
                            </Typography>
                            <Typography variant="h5" component="div" sx={{ mb: 4, fontWeight: 'bold' }}>
                                {currentQuestion.text}
                            </Typography>

                            <Stack spacing={2}>
                                {currentQuestion.options.map((option: Option) => (
                                    <Button
                                        key={option.id}
                                        variant={selectedOption === option.id ? "contained" : "outlined"}
                                        color="primary"
                                        fullWidth
                                        onClick={() => handleOptionClick(option.id)}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            textAlign: 'left',
                                            py: 1.5,
                                            px: 2,
                                            borderRadius: 2,
                                            fontSize: '1rem',
                                            textTransform: 'none',
                                            transition: 'all 0.3s ease',
                                            borderWidth: selectedOption === option.id ? 0 : 1,
                                            bgcolor: selectedOption === option.id ? 'primary.main' : 'background.paper',
                                            color: selectedOption === option.id ? 'primary.contrastText' : 'text.primary',
                                            '&:hover': {
                                                bgcolor: selectedOption === option.id ? 'primary.dark' : 'action.hover',
                                                transform: 'translateY(-2px)',
                                                boxShadow: 1
                                            }
                                        }}
                                    >
                                        <Box component="span" sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            border: '2px solid',
                                            borderColor: selectedOption === option.id ? 'white' : 'divider',
                                            mr: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 'bold'
                                        }}>
                                            {String.fromCharCode(64 + option.id)}
                                        </Box>
                                        {option.text}
                                    </Button>
                                ))}
                            </Stack>
                        </Grid>

                        {currentQuestion.image && (
                            <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        '&:hover .zoom-icon': { opacity: 1 },
                                        '&:hover img': { filter: 'brightness(0.9)' }
                                    }}
                                    onClick={() => setOpenImageDialog(true)}
                                >
                                    <Box
                                        component="img"
                                        src={currentQuestion.image}
                                        alt="Question Image"
                                        sx={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '80vh',
                                            borderRadius: 3,
                                            boxShadow: 2,
                                            objectFit: 'contain',
                                            transition: 'filter 0.3s ease'
                                        }}
                                    />
                                    <Box
                                        className="zoom-icon"
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            bgcolor: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            borderRadius: '50%',
                                            p: 2,
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                            display: 'flex'
                                        }}
                                    >
                                        <ZoomInIcon fontSize="large" />
                                    </Box>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            <Dialog
                open={openImageDialog}
                onClose={() => setOpenImageDialog(false)}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'transparent',
                        boxShadow: 'none',
                        overflow: 'hidden'
                    }
                }}
            >
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }} onClick={() => setOpenImageDialog(false)}>
                    <IconButton
                        onClick={() => setOpenImageDialog(false)}
                        sx={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                            zIndex: 1
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box
                        component="img"
                        src={currentQuestion.image}
                        alt="Zoomed Question Image"
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: 2,
                            boxShadow: 5
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </Box>
            </Dialog>

            <Button
                variant="contained"
                size="large"
                disabled={selectedOption === null}
                onClick={handleNext}
                sx={{ mt: 3, px: 6, borderRadius: 3, textTransform: 'none', fontSize: 16 }}
            >
                {currentQuestionIndex === questions.length - 1 ? "ดูคะแนน" : "ข้อถัดไป"}
            </Button>
        </Container>
    );
}
