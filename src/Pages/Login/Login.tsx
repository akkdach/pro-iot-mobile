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

// benign errorCode = "ไม่มี MS session ให้ auto login" ตามปกติ → แสดงฟอร์ม login เงียบ ๆ ได้
// error อื่น (บัญชีถูกระงับ, 500, HTML error page) เป็นของจริง ต้องโชว์เสมอ ไม่ว่ามาจาก hub หรือกดปุ่มเอง
const BENIGN_SSO_ERRORS = ['interaction_required', 'login_required', 'consent_required'];
const isBenignSsoError = (code: string): boolean =>
    BENIGN_SSO_ERRORS.some((b) => code.includes(b));

// ข้อความหลักบน overlay เต็มจอระหว่าง Microsoft sign-in — แยก auto (จาก hub/prompt=none)
// กับกดปุ่มเอง เพื่อให้คนที่ถูกพามาจาก Portal รู้ว่าระบบกำลังพาเข้า ไม่ใช่หน้าค้าง
const SSO_AUTO_MSG = 'กำลังเข้าสู่ระบบอัตโนมัติด้วยบัญชี Microsoft…';
const SSO_MANUAL_MSG = 'กำลังเชื่อมต่อ Microsoft…';



export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // Microsoft Entra SSO: idToken ที่ verify แล้วแต่ email ยังไม่ผูกกับ user ในระบบ
    const [linkIdToken, setLinkIdToken] = useState<string | null>(null);
    // เหตุผลที่ auto sign-in ไม่สำเร็จ — แสดงใต้ปุ่ม Microsoft ให้ดูได้โดยไม่ต้องเปิด DevTools
    const [ssoNote, setSsoNote] = useState<string | null>(null);
    // ข้อความหลักของ overlay เต็มจอ — null = flow ที่ไม่ใช่ Microsoft (เช่น password) ไม่ต้องมี overlay
    const [ssoOverlayText, setSsoOverlayText] = useState<string | null>(null);
    // overlay เกาะกับ isLoading ตัวเดิม — ทุกทางที่ปิด loading อยู่แล้วจะพับ overlay ให้เอง ไม่มี state ค้างแยกต่างหาก
    const showSsoOverlay = isLoading && ssoOverlayText !== null;

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
        setSsoOverlayText(null); // submit ฟอร์มใช้ spinner บนปุ่มพอ — กันข้อความ MS รอบก่อนค้างแล้วโผล่คลุมฟอร์ม
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
        // ระหว่างแลก idToken เป็น token ระบบ ผู้ใช้ต้องเห็นว่ากำลังพาเข้า ไม่ใช่ฟอร์มเปล่า
        setSsoOverlayText(explicit ? SSO_MANUAL_MSG : SSO_AUTO_MSG);
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
                if (!explicit) {
                    // silent: ยังไม่เข้าโหมดผูก แต่ต้องบอกว่าทำไม auto sign-in ถึงพาเข้าไม่ได้
                    // ไม่งั้น (บัญชียังไม่ผูก) หน้าจอเงียบสนิทจนแยกไม่ออกจาก "ระบบพัง"
                    setSsoNote('บัญชี Microsoft นี้ยังไม่ได้ผูก — กด Sign in with Microsoft เพื่อผูกครั้งแรก');
                    return; // silent: ไม่เข้าโหมดผูก
                }
                setLinkIdToken(idToken);
                Swal.fire({
                    icon: 'info',
                    title: 'ผูกบัญชี Microsoft',
                    text: data?.Message || 'กรุณายืนยัน Username และ Password หนึ่งครั้งเพื่อผูกบัญชี Microsoft',
                });
                return;
            }
            // non-success ที่ไม่ใช่ RequireLink = error จริงเสมอ (token เสีย/บัญชีถูกระงับ/500/HTML)
            // explicit → Swal ให้เห็นชัด, silent → ใส่ note ไม่ให้เงียบหาย
            const failMsg = data?.Message || 'Microsoft login ไม่สำเร็จ';
            if (explicit) Swal.fire('Error', failMsg);
            else setSsoNote(failMsg);
        } catch (error) {
            const code = (error as { errorCode?: string; message?: string })?.errorCode
                || (error as { message?: string })?.message || String(error);
            // explicit โชว์เสมอ; silent โชว์เฉพาะ error จริง (ข้าม benign ที่แปลว่าไม่มี session เฉย ๆ)
            if (explicit) Swal.fire('Error', 'Microsoft login ไม่สำเร็จ');
            else if (!isBenignSsoError(code)) setSsoNote(`Microsoft login ไม่สำเร็จ: ${code}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicrosoftLogin = async () => {
        localStorage.removeItem('sso_logout'); // ตั้งใจ login ใหม่ — ปลดล็อก auto SSO
        localStorage.removeItem('forced_logout_at'); // ตั้งใจ login เอง — ปลด circuit breaker จาก 401
        sessionStorage.removeItem('sso_np_pending'); // กดปุ่มเอง — รอบหน้าไม่ใช่ auto redirect
        setIsLoading(true);
        setSsoOverlayText(SSO_MANUAL_MSG); // คลุมจอช่วง init MSAL จนหลุดไปหน้า Microsoft
        try {
            const { loginWithMicrosoft } = await import('../../Services/msal');
            await loginWithMicrosoft(); // full page redirect
        } catch (e) {
            // MSAL init/redirect ล้ม → ถ้าไม่ปลด loading ปุ่มจะค้างหมุนถาวร + ต้องบอก error ให้เห็น
            setIsLoading(false);
            const code = (e as { errorCode?: string; message?: string })?.errorCode
                || (e as { message?: string })?.message || String(e);
            setSsoNote(`เริ่ม Microsoft login ไม่สำเร็จ: ${code}`);
        }
    };

    useEffect(() => {
        // หน้านี้ถูกโหลดใน hidden iframe ของ ssoSilent ด้วย (redirectUri = /login ซึ่ง route '*'
        // ก็เรนเดอร์หน้านี้) — ในกรอบนั้นห้ามทำ SSO/redirect ซ้อน ปล่อยให้หน้าแม่รับผลเอง
        if (window.self !== window.top) return;
        // เปิดจาก Portal → hub=1 + login_hint (email). param อาจอยู่ใน query ตรง ๆ
        const _sp = new URLSearchParams(window.location.search);
        const _hub = _sp.get('hub');
        if (_hub === '1') {
            sessionStorage.setItem('sso_hub', '1');
            // เปิดจาก Portal ทั้งที่ยัง login SM อยู่ = เจตนาเข้าระบบ → ปลดล็อก flag จาก Sign Out เดิม
            // ไม่ปลดตรงนี้ คนที่เข้าด้วย Microsoft อย่างเดียวจะติด flag ค้างถาวรตั้งแต่กด Sign Out ครั้งแรก
            if (_sp.get('logout') !== '1') localStorage.removeItem('sso_logout');
        }
        const _hint = _sp.get('login_hint');
        if (_hint) sessionStorage.setItem('sso_hint', _hint);
        const ssoHint = _hint || sessionStorage.getItem('sso_hint') || undefined;
        // sso_hub ต้องอ่านจาก sessionStorage ด้วย เพราะ prompt=none เด้งกลับมาที่ /login โดยไม่มี query เดิม
        const fromHub = _hub === '1' || sessionStorage.getItem('sso_hub') === '1';
        // รอบนี้กลับมาจาก prompt=none redirect (อัตโนมัติ) ไม่ใช่ผู้ใช้กดปุ่ม Microsoft เอง
        const wasAutoRedirect = sessionStorage.getItem('sso_np_pending') === '1';
        // มาจาก hub หรือกำลังรับผล prompt=none = auto sign-in กำลังจะวิ่ง → คลุมจอตั้งแต่ต้น
        // ไม่ให้เห็นฟอร์มเปล่าก่อนแล้วค่อยเด้ง (ทุกทางออกข้างล่างปิด loading หรือ navigate เสมอ)
        if (fromHub || wasAutoRedirect) {
            setSsoOverlayText(SSO_AUTO_MSG);
            setIsLoading(true);
        }
        // รับผล MSAL redirect + auto SSO จาก Microsoft session เดิม
        (async () => {
            try {
                const { handleMsalRedirect, acquireSsoSilent, ssoRedirectSilent, getLastSsoError } = await import('../../Services/msal');
                const redirectResult = await handleMsalRedirect();
                if (redirectResult?.idToken) {
                    sessionStorage.removeItem('sso_np_pending');
                    // มาแบบ auto (prompt=none) → explicit=false: บัญชีที่ยังไม่ผูกจะได้เห็นฟอร์ม login ปกติ
                    // ไม่ใช่โหมดผูกบัญชีที่ผู้ใช้ไม่ได้ร้องขอ
                    await processEntraIdToken(redirectResult.idToken, !wasAutoRedirect);
                    return;
                }
                // เพิ่งกด logout มา — ไม่ auto login กลับ (flag ล้างเมื่อ login สำเร็จ/กดปุ่ม MS เอง/เปิดจาก Portal)
                const ssoBlocked = localStorage.getItem('sso_logout') === '1';
                // circuit breaker: เพิ่งโดน 401 เตะออก (forced logout) ภายใน 10 วิ → อย่าเพิ่ง auto-SSO
                // ไม่งั้นจะดึง token ใหม่แล้วโดน 401 ซ้ำทันทีเป็นวงวน
                const forcedAt = Number(localStorage.getItem('forced_logout_at') || 0);
                const recentlyForced = forcedAt > 0 && Date.now() - forcedAt < 10_000;
                // เคยกด Sign Out (หรือถูกตัด session) → auto SSO ถูกปิดไว้ ต้องบอกว่าปิดอยู่
                // ไม่งั้นหน้าจอเงียบสนิทจนแยกไม่ออกจาก "ระบบพัง" และไม่รู้ว่าต้องกดปุ่มเอง
                if (ssoBlocked) setSsoNote('ปิด auto sign-in ไว้ตั้งแต่ออกจากระบบครั้งล่าสุด — กด "Sign in with Microsoft" เพื่อเข้าใหม่');
                else if (recentlyForced) setSsoNote('เพิ่งออกจากระบบเพราะเซสชันหมดอายุ — กด "Sign in with Microsoft" เพื่อเข้าใหม่');
                // overlay อาจเปิดไว้ตั้งแต่ต้น effect — ทางที่ไม่ลอง SSO ต่อต้องปิดเอง ไม่งั้นคลุมจอถาวร
                if (ssoBlocked || recentlyForced) setIsLoading(false);
                if (!ssoBlocked && !recentlyForced) {
                    // ssoSilent วิ่งผ่าน hidden iframe ใช้เวลาหลายวินาที — ระหว่างนั้นต้องมีอะไรบอก
                    // ไม่งั้นหน้าจอว่างเปล่าแยกไม่ออกจาก "auto sign-in ไม่ทำงาน" (ข้อความจะถูกทับด้วยผลจริงทีหลัง)
                    if (fromHub) setSsoNote(SSO_AUTO_MSG);
                    const silent = await acquireSsoSilent(ssoHint);
                    if (silent?.idToken) {
                        await processEntraIdToken(silent.idToken, false); // auto silent
                        return;
                    }
                    // silent iframe ไม่ผ่าน (เบราว์เซอร์บล็อก third-party cookie ของ login.microsoftonline.com)
                    // แต่เปิดมาจาก Portal = แทบแน่ว่ามี MS session อยู่ → ลอง full-page redirect prompt=none
                    // กันวนซ้ำด้วย "เวลา" ไม่ใช่ one-shot ต่อแท็บ — refresh แล้วต้องลองใหม่ได้
                    // (redirect loop จริงเกิดภายในไม่กี่วินาที ส่วนคนกดเทสซ้ำห่างกันเกินนั้นเสมอ)
                    const lastTry = Number(sessionStorage.getItem('sso_np_at') || 0);
                    if (fromHub && ssoHint && (!lastTry || Date.now() - lastTry > 60_000)) {
                        sessionStorage.setItem('sso_np_at', String(Date.now()));
                        sessionStorage.setItem('sso_np_pending', '1'); // บอกรอบหน้าว่าเป็น auto ไม่ใช่กดปุ่มเอง
                        setIsLoading(true);
                        await ssoRedirectSilent(ssoHint);
                        return;
                    }
                    // silent ไม่ผ่านและไม่ได้ redirect ต่อ — ปิด overlay คืนฟอร์มพร้อมเหตุผลด้านล่าง
                    setIsLoading(false);
                    if (fromHub) setSsoNote(`Auto sign-in ไม่สำเร็จ: ${getLastSsoError() || 'ไม่พบ Microsoft session'}`);
                }
            } catch (e) {
                // prompt=none ที่ไม่มี session จะเด้งกลับมาเป็น interaction_required ตรงนี้ → แสดงฟอร์มปกติ
                sessionStorage.removeItem('sso_np_pending');
                setIsLoading(false);
                const code = (e as { errorCode?: string; message?: string })?.errorCode
                    || (e as { message?: string })?.message || String(e);
                // benign = ไม่มี MS session ตามปกติ → เงียบได้ถ้าไม่ได้มาจาก hub
                // error จริง (บัญชีถูกระงับ/500/HTML) ต้องโชว์เสมอ ไม่ว่ามาจาก hub หรือไม่
                if (fromHub || !isBenignSsoError(code)) setSsoNote(`Auto sign-in ไม่สำเร็จ: ${code}`);
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

            {/* overlay เต็มจอระหว่าง Microsoft sign-in — คนที่ถูกพามาจาก hub เห็นว่าระบบกำลังทำงาน
                ไม่ใช่ฟอร์มเปล่า; เกาะ isLoading เดิมจึงหายเองทุกครั้งที่ flow จบ (สำเร็จ→navigate, ล้ม→ฟอร์ม+เหตุผล) */}
            {showSsoOverlay && (
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 3000,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        px: 3,
                        textAlign: 'center',
                        bgcolor: 'rgba(10, 15, 26, 0.93)',
                    }}
                >
                    <CircularProgress size={48} sx={{ color: '#3b82f6' }} />
                    <Typography sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                        {ssoOverlayText}
                    </Typography>
                    {/* สถานะรายขั้นตัวเดิม (ssoNote) ต้องยังอ่านได้ระหว่าง overlay คลุมจอ — ซ่อนเฉพาะตอนซ้ำกับบรรทัดหลัก */}
                    {ssoNote && ssoNote !== ssoOverlayText && (
                        <Typography variant="caption" sx={{ color: '#94A3B8', wordBreak: 'break-word' }}>
                            {ssoNote}
                        </Typography>
                    )}
                </Box>
            )}

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

                        {ssoNote && (
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    mt: 1.2,
                                    textAlign: 'center',
                                    color: '#94A3B8',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {ssoNote}
                            </Typography>
                        )}
                    </form>
                </Paper>
            </Fade>
        </Box>
    );
}
