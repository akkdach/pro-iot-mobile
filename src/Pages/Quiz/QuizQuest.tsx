import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack, Container, Chip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import questionData from './question_1.json';


export default function QuizQuest() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);

    const questions = questionData;
    const currentQuestion = questions[currentQuestionIndex];

    // Handle Option Click
    const handleOptionClick = (optionId: number) => {
        setSelectedOption(optionId);
    };

    // Handle Submit / Next
    const handleNext = () => {
        // Check answer
        if (selectedOption === currentQuestion.correctId) {
            setScore(prev => prev + 1);
        }

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            setSelectedOption(null);
        } else {
            setShowScore(true);
        }
    };

    // Restart Quiz
    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setScore(0);
        setShowScore(false);
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
                            sx={{ borderRadius: 3, px: 4 }}
                        >
                            ทำแบบทดสอบอีกครั้ง
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4, pb: 15 }}>
            <Box sx={{ width: '100%', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">Workstation Quiz</Typography>
                <Chip
                    icon={<HelpOutlineIcon />}
                    label={`Question ${currentQuestionIndex + 1}/${questions.length}`}
                    color="primary"
                    variant="outlined"
                />
            </Box>

            <Card sx={{ width: '100%', borderRadius: 4, boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                        คำถามที่ {currentQuestionIndex + 1}
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ mb: 4, fontWeight: 'bold' }}>
                        {currentQuestion.text}
                    </Typography>

                    {currentQuestion.image && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                            <Box
                                component="img"
                                src={currentQuestion.image}
                                alt="Question Image"
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: 250,
                                    borderRadius: 3,
                                    boxShadow: 2,
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>
                    )}

                    <Stack spacing={2}>
                        {currentQuestion.options.map((option) => (
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
                </CardContent>
            </Card>

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
