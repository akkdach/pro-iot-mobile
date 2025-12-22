// Login.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { msalConfig, loginRequest } from "../../authConfig";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    InputAdornment,
    IconButton,
    CircularProgress,
    Fade,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import callApi from '../../Services/callApi';
import Swal from 'sweetalert2';
import { AxiosResponse } from 'axios';

type FormData = {
    username: string;
    password: string;
};

interface LoginResponse {
    token: string;
}

const msalInstance = new PublicClientApplication(msalConfig);

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const result = await callApi.post('/Authen/token', data);
            if (result.data.dataResult.access_token) {
                await Swal.fire({
                    icon: 'success',
                    title: 'เข้าสู่ระบบสำเร็จ',
                    text: 'กำลังเข้าสู่หน้าหลัก...',
                    timer: 1500,
                    showConfirmButton: false,
                });

                localStorage.setItem('token', result.data.dataResult.access_token);
                const resultProfile = await callApi.get('/Mobile/profile');
                if (resultProfile.data?.dataResult) {
                    localStorage.setItem('profile', JSON.stringify(resultProfile.data?.dataResult));
                    window.location.replace('/');
                } else {
                    Swal.fire('Error', 'User not found.');
                }
            } else {
                Swal.fire('Error', 'Username Or Password Incorrect!');
            }
        } catch (error) {
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <Box
            sx={{
                height: '100vh',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(252, 70, 107, 0.3), transparent 50%)',
                    animation: 'pulse 8s ease-in-out infinite',
                },
                '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.8 },
                },
            }}
        >
            {/* Floating shapes for visual interest */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    top: '-100px',
                    right: '-100px',
                    animation: 'float 6s ease-in-out infinite',
                    '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(20px)' },
                    },
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    bottom: '-50px',
                    left: '-50px',
                    animation: 'float 8s ease-in-out infinite',
                }}
            />

            <Fade in timeout={800}>
                <Paper
                    elevation={24}
                    sx={{
                        padding: { xs: 3, sm: 5 },
                        width: '100%',
                        maxWidth: 440,
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        position: 'relative',
                        zIndex: 1,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                        },
                    }}
                >
                    {/* Logo/Brand Section */}
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <img
                            src="logo.png"
                            alt="Logo"
                            style={{
                                width: '180px',
                                height: '180px',
                                objectFit: 'contain'
                            }}
                        />
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 900,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: '#64748B', fontWeight: 500 }}
                        >
                            เข้าสู่ระบบเพื่อดำเนินการต่อ
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField
                            label="Username"
                            fullWidth
                            margin="normal"
                            {...register('username', {
                                required: 'กรุณากรอก Username',
                            })}
                            error={!!errors.username}
                            helperText={errors.username?.message}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: '#3b82f6' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                                    },
                                },
                            }}
                        />

                        <TextField
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            margin="normal"
                            {...register('password', {
                                required: 'กรุณากรอก Password',
                                minLength: {
                                    value: 6,
                                    message: 'Password ต้องมีอย่างน้อย 6 ตัวอักษร',
                                },
                            })}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: '#3b82f6' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                                    },
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isLoading}
                            sx={{
                                mt: 3,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
                                    transform: 'translateY(-2px)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                },
                                '&.Mui-disabled': {
                                    background: '#E2E8F0',
                                    color: '#94A3B8',
                                },
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                            ) : (
                                'เข้าสู่ระบบ'
                            )}
                        </Button>
                    </form>
                </Paper>
            </Fade>
        </Box>
    );
}
