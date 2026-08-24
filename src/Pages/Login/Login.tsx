// Login.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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

// Service Management API — verify Microsoft Entra idToken ฝั่ง server แล้วออก
// BevPro-compatible token (ใช้กับ /Mobile/profile ได้เหมือน token ปกติ)
const SM_API =
    process.env.REACT_APP_SM_API_BASE_URL ||
    'https://servicemanagement-eqg3bkfec8f5asg3.southeastasia-01.azurewebsites.net/api/v1';



export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // Microsoft Entra SSO: idToken ที่ verify แล้วแต่ email ยังไม่ผูกกับ user ในระบบ
    const [linkIdToken, setLinkIdToken] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    // .NET ตอบ 400 เปล่าทั้ง "รหัสผิด" และ "ถูกระงับ" — ถาม SM เพื่อเลือกข้อความ error
    const passwordFailMessage = async (username: string, fallback: string): Promise<string> => {
        try {
            const res = await fetch(`${SM_API}/auth/blocked-check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            const json = await res.json();
            if (json?.Blocked === true) return 'บัญชีนี้ถูกระงับการใช้งานโดยผู้ดูแลระบบ กรุณาติดต่อ Admin';
        } catch { /* ignore */ }
        return fallback;
    };

    // เก็บ token + ดึง profile แล้วเข้าหน้าหลัก (ใช้ร่วมทั้ง login ปกติและ SSO)
    const completeLogin = async (accessToken: string) => {
        localStorage.setItem('token', accessToken);
        localStorage.removeItem('sso_logout');
        const resultProfile = await callApi.get('/Mobile/profile');
        if (resultProfile.data?.dataResult) {
            localStorage.setItem('profile', JSON.stringify(resultProfile.data?.dataResult));
            window.location.replace('/');
        } else {
            localStorage.removeItem('token');
            Swal.fire('Error', 'User not found.');
        }
    };

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            // link mode: ผูกบัญชี Microsoft ครั้งแรก — ยืนยัน username/password หนึ่งครั้ง
            if (linkIdToken) {
                const res = await fetch(`${SM_API}/auth/azure-link`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken: linkIdToken, app: 'iot-mobile', ...data }),
                });
                const linkData = await res.json().catch(() => null);
                if (linkData?.IsSuccess && linkData?.DataResult?.token) {
                    await completeLogin(linkData.DataResult.token);
                } else {
                    Swal.fire('Error', linkData?.Message || 'ผูกบัญชี Microsoft ไม่สำเร็จ');
                }
                return;
            }

            const result = await callApi.post('/Authen/token', data);
            if (result.data?.dataResult?.access_token) {
                // login audit — แจ้ง Service Management (fire-and-forget, keepalive กันโดน cancel ตอน redirect)
                fetch(`${SM_API}/auth/login-log`, {
                    method: 'POST',
                    keepalive: true,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${result.data.dataResult.access_token}`,
                    },
                    body: JSON.stringify({ provider: 'password', app: 'iot-mobile' }),
                }).catch(() => { /* ไม่กระทบ login */ });
                await Swal.fire({
                    icon: 'success',
                    title: 'เข้าสู่ระบบสำเร็จ',
                    text: 'กำลังเข้าสู่หน้าหลัก...',
                    timer: 1500,
                    showConfirmButton: false,
                });
                await completeLogin(result.data.dataResult.access_token);
            } else {
                Swal.fire('Error', await passwordFailMessage(data.username, result.data?.message || 'Username Or Password Incorrect!'));
            }
        } catch (error) {
            Swal.fire('Error', await passwordFailMessage(data.username, 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'));
        } finally {
            setIsLoading(false);
        }
    };

    // ── Microsoft Entra ID SSO (ผ่าน Service Management azure-login) ──
    // explicit: เข้าโหมดผูก + เด้ง error ได้เฉพาะตอนผู้ใช้กดปุ่ม Microsoft เอง
    // auto ssoSilent (explicit=false) → ไม่เด้งโหมดผูก/ไม่เด้ง error แค่แสดงหน้า login ปกติ
    const processEntraIdToken = async (idToken: string, explicit: boolean): Promise<void> => {
        setIsLoading(true);
        try {
            const res = await fetch(`${SM_API}/auth/azure-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken, app: 'iot-mobile' }),
            });
            const data = await res.json().catch(() => null);
            if (data?.IsSuccess && data?.DataResult?.token) {
                await completeLogin(data.DataResult.token);
                return;
            }
            if (data?.RequireLink) {
                if (!explicit) return; // silent: ไม่เข้าโหมดผูก
                setLinkIdToken(idToken);
                Swal.fire({
                    icon: 'info',
                    title: 'ผูกบัญชี Microsoft',
                    text: data?.Message || 'กรุณายืนยัน Username และ Password หนึ่งครั้งเพื่อผูกบัญชี Microsoft',
                });
                return;
            }
            if (explicit) Swal.fire('Error', data?.Message || 'Microsoft login ไม่สำเร็จ');
        } catch (error) {
            if (explicit) Swal.fire('Error', 'Microsoft login ไม่สำเร็จ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicrosoftLogin = async () => {
        localStorage.removeItem('sso_logout'); // ตั้งใจ login ใหม่ — ปลดล็อก auto SSO
        setIsLoading(true);
        const { loginWithMicrosoft } = await import('../../Services/msal');
        await loginWithMicrosoft(); // full page redirect
    };

    useEffect(() => {
        // รับผล MSAL redirect + auto SSO จาก Microsoft session เดิม
        (async () => {
            try {
                const { handleMsalRedirect, acquireSsoSilent } = await import('../../Services/msal');
                const redirectResult = await handleMsalRedirect();
                if (redirectResult?.idToken) {
                    await processEntraIdToken(redirectResult.idToken, true); // explicit: มาจากปุ่ม Microsoft
                    return;
                }
                // เพิ่งกด logout มา — ไม่ auto login กลับ (flag ล้างเมื่อ login สำเร็จ/กดปุ่ม MS เอง)
                if (localStorage.getItem('sso_logout') !== '1') {
                    const silent = await acquireSsoSilent();
                    if (silent?.idToken) await processEntraIdToken(silent.idToken, false); // auto silent
                }
            } catch {
                // MSAL ล้มเหลว = แสดงหน้า login ปกติ
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                            ) : linkIdToken ? (
                                'ยืนยันและผูกบัญชี Microsoft'
                            ) : (
                                'เข้าสู่ระบบ'
                            )}
                        </Button>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2 }}>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: '#E2E8F0' }} />
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>หรือ</Typography>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: '#E2E8F0' }} />
                        </Box>

                        <Button
                            fullWidth
                            variant="outlined"
                            disabled={isLoading}
                            onClick={handleMicrosoftLogin}
                            sx={{
                                py: 1.4,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                color: '#334155',
                                borderColor: '#CBD5E1',
                                display: 'flex',
                                gap: 1.2,
                                '&:hover': { borderColor: '#94A3B8', bgcolor: 'rgba(148,163,184,0.08)' },
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true">
                                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                            </svg>
                            Sign in with Microsoft
                        </Button>
                    </form>
                </Paper>
            </Fade>
        </Box>
    );
}
