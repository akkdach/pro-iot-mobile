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

// Service Management API â€” verify Microsoft Entra idToken à¸à¸±à¹ˆà¸‡ server à¹à¸¥à¹‰à¸§à¸­à¸­à¸
// BevPro-compatible token (à¹ƒà¸Šà¹‰à¸à¸±à¸š /Mobile/profile à¹„à¸”à¹‰à¹€à¸«à¸¡à¸·à¸­à¸™ token à¸›à¸à¸•à¸´)
const SM_API =
    process.env.REACT_APP_SM_API_BASE_URL ||
    'https://bevprogateway.southeastasia.cloudapp.azure.com/svc/api/v1';

// benign errorCode = "à¹„à¸¡à¹ˆà¸¡à¸µ MS session à¹ƒà¸«à¹‰ auto login" à¸•à¸²à¸¡à¸›à¸à¸•à¸´ â†’ à¹à¸ªà¸”à¸‡à¸Ÿà¸­à¸£à¹Œà¸¡ login à¹€à¸‡à¸µà¸¢à¸š à¹† à¹„à¸”à¹‰
// error à¸­à¸·à¹ˆà¸™ (à¸šà¸±à¸à¸Šà¸µà¸–à¸¹à¸à¸£à¸°à¸‡à¸±à¸š, 500, HTML error page) à¹€à¸›à¹‡à¸™à¸‚à¸­à¸‡à¸ˆà¸£à¸´à¸‡ à¸•à¹‰à¸­à¸‡à¹‚à¸Šà¸§à¹Œà¹€à¸ªà¸¡à¸­ à¹„à¸¡à¹ˆà¸§à¹ˆà¸²à¸¡à¸²à¸ˆà¸²à¸ hub à¸«à¸£à¸·à¸­à¸à¸”à¸›à¸¸à¹ˆà¸¡à¹€à¸­à¸‡
const BENIGN_SSO_ERRORS = ['interaction_required', 'login_required', 'consent_required'];
const isBenignSsoError = (code: string): boolean =>
    BENIGN_SSO_ERRORS.some((b) => code.includes(b));

// à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸«à¸¥à¸±à¸à¸šà¸™ overlay à¹€à¸•à¹‡à¸¡à¸ˆà¸­à¸£à¸°à¸«à¸§à¹ˆà¸²à¸‡ Microsoft sign-in â€” à¹à¸¢à¸ auto (à¸ˆà¸²à¸ hub/prompt=none)
// à¸à¸±à¸šà¸à¸”à¸›à¸¸à¹ˆà¸¡à¹€à¸­à¸‡ à¹€à¸žà¸·à¹ˆà¸­à¹ƒà¸«à¹‰à¸„à¸™à¸—à¸µà¹ˆà¸–à¸¹à¸à¸žà¸²à¸¡à¸²à¸ˆà¸²à¸ Portal à¸£à¸¹à¹‰à¸§à¹ˆà¸²à¸£à¸°à¸šà¸šà¸à¸³à¸¥à¸±à¸‡à¸žà¸²à¹€à¸‚à¹‰à¸² à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆà¸«à¸™à¹‰à¸²à¸„à¹‰à¸²à¸‡
const SSO_AUTO_MSG = 'à¸à¸³à¸¥à¸±à¸‡à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´à¸”à¹‰à¸§à¸¢à¸šà¸±à¸à¸Šà¸µ Microsoftâ€¦';
const SSO_MANUAL_MSG = 'à¸à¸³à¸¥à¸±à¸‡à¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸•à¹ˆà¸­ Microsoftâ€¦';



export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // Microsoft Entra SSO: idToken à¸—à¸µà¹ˆ verify à¹à¸¥à¹‰à¸§à¹à¸•à¹ˆ email à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸œà¸¹à¸à¸à¸±à¸š user à¹ƒà¸™à¸£à¸°à¸šà¸š
    const [linkIdToken, setLinkIdToken] = useState<string | null>(null);
    // à¹€à¸«à¸•à¸¸à¸œà¸¥à¸—à¸µà¹ˆ auto sign-in à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ â€” à¹à¸ªà¸”à¸‡à¹ƒà¸•à¹‰à¸›à¸¸à¹ˆà¸¡ Microsoft à¹ƒà¸«à¹‰à¸”à¸¹à¹„à¸”à¹‰à¹‚à¸”à¸¢à¹„à¸¡à¹ˆà¸•à¹‰à¸­à¸‡à¹€à¸›à¸´à¸” DevTools
    const [ssoNote, setSsoNote] = useState<string | null>(null);
    // à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸«à¸¥à¸±à¸à¸‚à¸­à¸‡ overlay à¹€à¸•à¹‡à¸¡à¸ˆà¸­ â€” null = flow à¸—à¸µà¹ˆà¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆ Microsoft (à¹€à¸Šà¹ˆà¸™ password) à¹„à¸¡à¹ˆà¸•à¹‰à¸­à¸‡à¸¡à¸µ overlay
    const [ssoOverlayText, setSsoOverlayText] = useState<string | null>(null);
    // overlay à¹€à¸à¸²à¸°à¸à¸±à¸š isLoading à¸•à¸±à¸§à¹€à¸”à¸´à¸¡ â€” à¸—à¸¸à¸à¸—à¸²à¸‡à¸—à¸µà¹ˆà¸›à¸´à¸” loading à¸­à¸¢à¸¹à¹ˆà¹à¸¥à¹‰à¸§à¸ˆà¸°à¸žà¸±à¸š overlay à¹ƒà¸«à¹‰à¹€à¸­à¸‡ à¹„à¸¡à¹ˆà¸¡à¸µ state à¸„à¹‰à¸²à¸‡à¹à¸¢à¸à¸•à¹ˆà¸²à¸‡à¸«à¸²à¸
    const showSsoOverlay = isLoading && ssoOverlayText !== null;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    // .NET à¸•à¸­à¸š 400 à¹€à¸›à¸¥à¹ˆà¸²à¸—à¸±à¹‰à¸‡ "à¸£à¸«à¸±à¸ªà¸œà¸´à¸”" à¹à¸¥à¸° "à¸–à¸¹à¸à¸£à¸°à¸‡à¸±à¸š" â€” à¸–à¸²à¸¡ SM à¹€à¸žà¸·à¹ˆà¸­à¹€à¸¥à¸·à¸­à¸à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡ error
    const passwordFailMessage = async (username: string, fallback: string): Promise<string> => {
        try {
            const res = await fetch(`${SM_API}/auth/blocked-check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            const json = await res.json();
            if (json?.Blocked === true) return 'à¸šà¸±à¸à¸Šà¸µà¸™à¸µà¹‰à¸–à¸¹à¸à¸£à¸°à¸‡à¸±à¸šà¸à¸²à¸£à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¹‚à¸”à¸¢à¸œà¸¹à¹‰à¸”à¸¹à¹à¸¥à¸£à¸°à¸šà¸š à¸à¸£à¸¸à¸“à¸²à¸•à¸´à¸”à¸•à¹ˆà¸­ Admin';
        } catch { /* ignore */ }
        return fallback;
    };

    // à¹€à¸à¹‡à¸š token + à¸”à¸¶à¸‡ profile à¹à¸¥à¹‰à¸§à¹€à¸‚à¹‰à¸²à¸«à¸™à¹‰à¸²à¸«à¸¥à¸±à¸ (à¹ƒà¸Šà¹‰à¸£à¹ˆà¸§à¸¡à¸—à¸±à¹‰à¸‡ login à¸›à¸à¸•à¸´à¹à¸¥à¸° SSO)
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
        setSsoOverlayText(null); // submit à¸Ÿà¸­à¸£à¹Œà¸¡à¹ƒà¸Šà¹‰ spinner à¸šà¸™à¸›à¸¸à¹ˆà¸¡à¸žà¸­ â€” à¸à¸±à¸™à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡ MS à¸£à¸­à¸šà¸à¹ˆà¸­à¸™à¸„à¹‰à¸²à¸‡à¹à¸¥à¹‰à¸§à¹‚à¸œà¸¥à¹ˆà¸„à¸¥à¸¸à¸¡à¸Ÿà¸­à¸£à¹Œà¸¡
        try {
            // link mode: à¸œà¸¹à¸à¸šà¸±à¸à¸Šà¸µ Microsoft à¸„à¸£à¸±à¹‰à¸‡à¹à¸£à¸ â€” à¸¢à¸·à¸™à¸¢à¸±à¸™ username/password à¸«à¸™à¸¶à¹ˆà¸‡à¸„à¸£à¸±à¹‰à¸‡
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
                    Swal.fire('Error', linkData?.Message || 'à¸œà¸¹à¸à¸šà¸±à¸à¸Šà¸µ Microsoft à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ');
                }
                return;
            }

            const result = await callApi.post('/Authen/token', data);
            if (result.data?.dataResult?.access_token) {
                // login audit â€” à¹à¸ˆà¹‰à¸‡ Service Management (fire-and-forget, keepalive à¸à¸±à¸™à¹‚à¸”à¸™ cancel à¸•à¸­à¸™ redirect)
                fetch(`${SM_API}/auth/login-log`, {
                    method: 'POST',
                    keepalive: true,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${result.data.dataResult.access_token}`,
                    },
                    body: JSON.stringify({ provider: 'password', app: 'iot-mobile' }),
                }).catch(() => { /* à¹„à¸¡à¹ˆà¸à¸£à¸°à¸—à¸š login */ });
                await Swal.fire({
                    icon: 'success',
                    title: 'à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¸ªà¸³à¹€à¸£à¹‡à¸ˆ',
                    text: 'à¸à¸³à¸¥à¸±à¸‡à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸«à¸™à¹‰à¸²à¸«à¸¥à¸±à¸...',
                    timer: 1500,
                    showConfirmButton: false,
                });
                await completeLogin(result.data.dataResult.access_token);
            } else {
                Swal.fire('Error', await passwordFailMessage(data.username, result.data?.message || 'Username Or Password Incorrect!'));
            }
        } catch (error) {
            Swal.fire('Error', await passwordFailMessage(data.username, 'à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”à¹ƒà¸™à¸à¸²à¸£à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š'));
        } finally {
            setIsLoading(false);
        }
    };

    // â”€â”€ Microsoft Entra ID SSO (à¸œà¹ˆà¸²à¸™ Service Management azure-login) â”€â”€
    // explicit: à¹€à¸‚à¹‰à¸²à¹‚à¸«à¸¡à¸”à¸œà¸¹à¸ + à¹€à¸”à¹‰à¸‡ error à¹„à¸”à¹‰à¹€à¸‰à¸žà¸²à¸°à¸•à¸­à¸™à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸à¸”à¸›à¸¸à¹ˆà¸¡ Microsoft à¹€à¸­à¸‡
    // auto ssoSilent (explicit=false) â†’ à¹„à¸¡à¹ˆà¹€à¸”à¹‰à¸‡à¹‚à¸«à¸¡à¸”à¸œà¸¹à¸/à¹„à¸¡à¹ˆà¹€à¸”à¹‰à¸‡ error à¹à¸„à¹ˆà¹à¸ªà¸”à¸‡à¸«à¸™à¹‰à¸² login à¸›à¸à¸•à¸´
    const processEntraIdToken = async (idToken: string, explicit: boolean): Promise<void> => {
        setIsLoading(true);
        // à¸£à¸°à¸«à¸§à¹ˆà¸²à¸‡à¹à¸¥à¸ idToken à¹€à¸›à¹‡à¸™ token à¸£à¸°à¸šà¸š à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸•à¹‰à¸­à¸‡à¹€à¸«à¹‡à¸™à¸§à¹ˆà¸²à¸à¸³à¸¥à¸±à¸‡à¸žà¸²à¹€à¸‚à¹‰à¸² à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆà¸Ÿà¸­à¸£à¹Œà¸¡à¹€à¸›à¸¥à¹ˆà¸²
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
                    // silent: à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¹€à¸‚à¹‰à¸²à¹‚à¸«à¸¡à¸”à¸œà¸¹à¸ à¹à¸•à¹ˆà¸•à¹‰à¸­à¸‡à¸šà¸­à¸à¸§à¹ˆà¸²à¸—à¸³à¹„à¸¡ auto sign-in à¸–à¸¶à¸‡à¸žà¸²à¹€à¸‚à¹‰à¸²à¹„à¸¡à¹ˆà¹„à¸”à¹‰
                    // à¹„à¸¡à¹ˆà¸‡à¸±à¹‰à¸™ (à¸šà¸±à¸à¸Šà¸µà¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸œà¸¹à¸) à¸«à¸™à¹‰à¸²à¸ˆà¸­à¹€à¸‡à¸µà¸¢à¸šà¸ªà¸™à¸´à¸—à¸ˆà¸™à¹à¸¢à¸à¹„à¸¡à¹ˆà¸­à¸­à¸à¸ˆà¸²à¸ "à¸£à¸°à¸šà¸šà¸žà¸±à¸‡"
                    setSsoNote('à¸šà¸±à¸à¸Šà¸µ Microsoft à¸™à¸µà¹‰à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¹„à¸”à¹‰à¸œà¸¹à¸ â€” à¸à¸” Sign in with Microsoft à¹€à¸žà¸·à¹ˆà¸­à¸œà¸¹à¸à¸„à¸£à¸±à¹‰à¸‡à¹à¸£à¸');
                    return; // silent: à¹„à¸¡à¹ˆà¹€à¸‚à¹‰à¸²à¹‚à¸«à¸¡à¸”à¸œà¸¹à¸
                }
                setLinkIdToken(idToken);
                Swal.fire({
                    icon: 'info',
                    title: 'à¸œà¸¹à¸à¸šà¸±à¸à¸Šà¸µ Microsoft',
                    text: data?.Message || 'à¸à¸£à¸¸à¸“à¸²à¸¢à¸·à¸™à¸¢à¸±à¸™ Username à¹à¸¥à¸° Password à¸«à¸™à¸¶à¹ˆà¸‡à¸„à¸£à¸±à¹‰à¸‡à¹€à¸žà¸·à¹ˆà¸­à¸œà¸¹à¸à¸šà¸±à¸à¸Šà¸µ Microsoft',
                });
                return;
            }
            // non-success à¸—à¸µà¹ˆà¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆ RequireLink = error à¸ˆà¸£à¸´à¸‡à¹€à¸ªà¸¡à¸­ (token à¹€à¸ªà¸µà¸¢/à¸šà¸±à¸à¸Šà¸µà¸–à¸¹à¸à¸£à¸°à¸‡à¸±à¸š/500/HTML)
            // explicit â†’ Swal à¹ƒà¸«à¹‰à¹€à¸«à¹‡à¸™à¸Šà¸±à¸”, silent â†’ à¹ƒà¸ªà¹ˆ note à¹„à¸¡à¹ˆà¹ƒà¸«à¹‰à¹€à¸‡à¸µà¸¢à¸šà¸«à¸²à¸¢
            const failMsg = data?.Message || 'Microsoft login à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ';
            if (explicit) Swal.fire('Error', failMsg);
            else setSsoNote(failMsg);
        } catch (error) {
            const code = (error as { errorCode?: string; message?: string })?.errorCode
                || (error as { message?: string })?.message || String(error);
            // explicit à¹‚à¸Šà¸§à¹Œà¹€à¸ªà¸¡à¸­; silent à¹‚à¸Šà¸§à¹Œà¹€à¸‰à¸žà¸²à¸° error à¸ˆà¸£à¸´à¸‡ (à¸‚à¹‰à¸²à¸¡ benign à¸—à¸µà¹ˆà¹à¸›à¸¥à¸§à¹ˆà¸²à¹„à¸¡à¹ˆà¸¡à¸µ session à¹€à¸‰à¸¢ à¹†)
            if (explicit) Swal.fire('Error', 'Microsoft login à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ');
            else if (!isBenignSsoError(code)) setSsoNote(`Microsoft login à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ: ${code}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicrosoftLogin = async () => {
        localStorage.removeItem('sso_logout'); // à¸•à¸±à¹‰à¸‡à¹ƒà¸ˆ login à¹ƒà¸«à¸¡à¹ˆ â€” à¸›à¸¥à¸”à¸¥à¹‡à¸­à¸ auto SSO
        localStorage.removeItem('forced_logout_at'); // à¸•à¸±à¹‰à¸‡à¹ƒà¸ˆ login à¹€à¸­à¸‡ â€” à¸›à¸¥à¸” circuit breaker à¸ˆà¸²à¸ 401
        sessionStorage.removeItem('sso_np_pending'); // à¸à¸”à¸›à¸¸à¹ˆà¸¡à¹€à¸­à¸‡ â€” à¸£à¸­à¸šà¸«à¸™à¹‰à¸²à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆ auto redirect
        setIsLoading(true);
        setSsoOverlayText(SSO_MANUAL_MSG); // à¸„à¸¥à¸¸à¸¡à¸ˆà¸­à¸Šà¹ˆà¸§à¸‡ init MSAL à¸ˆà¸™à¸«à¸¥à¸¸à¸”à¹„à¸›à¸«à¸™à¹‰à¸² Microsoft
        try {
            const { loginWithMicrosoft } = await import('../../Services/msal');
            await loginWithMicrosoft(); // full page redirect
        } catch (e) {
            // MSAL init/redirect à¸¥à¹‰à¸¡ â†’ à¸–à¹‰à¸²à¹„à¸¡à¹ˆà¸›à¸¥à¸” loading à¸›à¸¸à¹ˆà¸¡à¸ˆà¸°à¸„à¹‰à¸²à¸‡à¸«à¸¡à¸¸à¸™à¸–à¸²à¸§à¸£ + à¸•à¹‰à¸­à¸‡à¸šà¸­à¸ error à¹ƒà¸«à¹‰à¹€à¸«à¹‡à¸™
            setIsLoading(false);
            const code = (e as { errorCode?: string; message?: string })?.errorCode
                || (e as { message?: string })?.message || String(e);
            setSsoNote(`à¹€à¸£à¸´à¹ˆà¸¡ Microsoft login à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ: ${code}`);
        }
    };

    useEffect(() => {
        // à¸«à¸™à¹‰à¸²à¸™à¸µà¹‰à¸–à¸¹à¸à¹‚à¸«à¸¥à¸”à¹ƒà¸™ hidden iframe à¸‚à¸­à¸‡ ssoSilent à¸”à¹‰à¸§à¸¢ (redirectUri = /login à¸‹à¸¶à¹ˆà¸‡ route '*'
        // à¸à¹‡à¹€à¸£à¸™à¹€à¸”à¸­à¸£à¹Œà¸«à¸™à¹‰à¸²à¸™à¸µà¹‰) â€” à¹ƒà¸™à¸à¸£à¸­à¸šà¸™à¸±à¹‰à¸™à¸«à¹‰à¸²à¸¡à¸—à¸³ SSO/redirect à¸‹à¹‰à¸­à¸™ à¸›à¸¥à¹ˆà¸­à¸¢à¹ƒà¸«à¹‰à¸«à¸™à¹‰à¸²à¹à¸¡à¹ˆà¸£à¸±à¸šà¸œà¸¥à¹€à¸­à¸‡
        if (window.self !== window.top) return;
        // à¹€à¸›à¸´à¸”à¸ˆà¸²à¸ Portal â†’ hub=1 + login_hint (email). param à¸­à¸²à¸ˆà¸­à¸¢à¸¹à¹ˆà¹ƒà¸™ query à¸•à¸£à¸‡ à¹†
        const _sp = new URLSearchParams(window.location.search);
        const _hub = _sp.get('hub');
        if (_hub === '1') {
            sessionStorage.setItem('sso_hub', '1');
            // à¹€à¸›à¸´à¸”à¸ˆà¸²à¸ Portal à¸—à¸±à¹‰à¸‡à¸—à¸µà¹ˆà¸¢à¸±à¸‡ login SM à¸­à¸¢à¸¹à¹ˆ = à¹€à¸ˆà¸•à¸™à¸²à¹€à¸‚à¹‰à¸²à¸£à¸°à¸šà¸š â†’ à¸›à¸¥à¸”à¸¥à¹‡à¸­à¸ flag à¸ˆà¸²à¸ Sign Out à¹€à¸”à¸´à¸¡
            // à¹„à¸¡à¹ˆà¸›à¸¥à¸”à¸•à¸£à¸‡à¸™à¸µà¹‰ à¸„à¸™à¸—à¸µà¹ˆà¹€à¸‚à¹‰à¸²à¸”à¹‰à¸§à¸¢ Microsoft à¸­à¸¢à¹ˆà¸²à¸‡à¹€à¸”à¸µà¸¢à¸§à¸ˆà¸°à¸•à¸´à¸” flag à¸„à¹‰à¸²à¸‡à¸–à¸²à¸§à¸£à¸•à¸±à¹‰à¸‡à¹à¸•à¹ˆà¸à¸” Sign Out à¸„à¸£à¸±à¹‰à¸‡à¹à¸£à¸
            if (_sp.get('logout') !== '1') localStorage.removeItem('sso_logout');
        }
        const _hint = _sp.get('login_hint');
        if (_hint) sessionStorage.setItem('sso_hint', _hint);
        const ssoHint = _hint || sessionStorage.getItem('sso_hint') || undefined;
        // sso_hub à¸•à¹‰à¸­à¸‡à¸­à¹ˆà¸²à¸™à¸ˆà¸²à¸ sessionStorage à¸”à¹‰à¸§à¸¢ à¹€à¸žà¸£à¸²à¸° prompt=none à¹€à¸”à¹‰à¸‡à¸à¸¥à¸±à¸šà¸¡à¸²à¸—à¸µà¹ˆ /login à¹‚à¸”à¸¢à¹„à¸¡à¹ˆà¸¡à¸µ query à¹€à¸”à¸´à¸¡
        const fromHub = _hub === '1' || sessionStorage.getItem('sso_hub') === '1';
        // à¸£à¸­à¸šà¸™à¸µà¹‰à¸à¸¥à¸±à¸šà¸¡à¸²à¸ˆà¸²à¸ prompt=none redirect (à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´) à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸à¸”à¸›à¸¸à¹ˆà¸¡ Microsoft à¹€à¸­à¸‡
        const wasAutoRedirect = sessionStorage.getItem('sso_np_pending') === '1';
        // à¸¡à¸²à¸ˆà¸²à¸ hub à¸«à¸£à¸·à¸­à¸à¸³à¸¥à¸±à¸‡à¸£à¸±à¸šà¸œà¸¥ prompt=none = auto sign-in à¸à¸³à¸¥à¸±à¸‡à¸ˆà¸°à¸§à¸´à¹ˆà¸‡ â†’ à¸„à¸¥à¸¸à¸¡à¸ˆà¸­à¸•à¸±à¹‰à¸‡à¹à¸•à¹ˆà¸•à¹‰à¸™
        // à¹„à¸¡à¹ˆà¹ƒà¸«à¹‰à¹€à¸«à¹‡à¸™à¸Ÿà¸­à¸£à¹Œà¸¡à¹€à¸›à¸¥à¹ˆà¸²à¸à¹ˆà¸­à¸™à¹à¸¥à¹‰à¸§à¸„à¹ˆà¸­à¸¢à¹€à¸”à¹‰à¸‡ (à¸—à¸¸à¸à¸—à¸²à¸‡à¸­à¸­à¸à¸‚à¹‰à¸²à¸‡à¸¥à¹ˆà¸²à¸‡à¸›à¸´à¸” loading à¸«à¸£à¸·à¸­ navigate à¹€à¸ªà¸¡à¸­)
        if (fromHub || wasAutoRedirect) {
            setSsoOverlayText(SSO_AUTO_MSG);
            setIsLoading(true);
        }
        // à¸£à¸±à¸šà¸œà¸¥ MSAL redirect + auto SSO à¸ˆà¸²à¸ Microsoft session à¹€à¸”à¸´à¸¡
        (async () => {
            try {
                const { handleMsalRedirect, acquireSsoSilent, ssoRedirectSilent, getLastSsoError } = await import('../../Services/msal');
                const redirectResult = await handleMsalRedirect();
                if (redirectResult?.idToken) {
                    sessionStorage.removeItem('sso_np_pending');
                    // à¸¡à¸²à¹à¸šà¸š auto (prompt=none) â†’ explicit=false: à¸šà¸±à¸à¸Šà¸µà¸—à¸µà¹ˆà¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸œà¸¹à¸à¸ˆà¸°à¹„à¸”à¹‰à¹€à¸«à¹‡à¸™à¸Ÿà¸­à¸£à¹Œà¸¡ login à¸›à¸à¸•à¸´
                    // à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆà¹‚à¸«à¸¡à¸”à¸œà¸¹à¸à¸šà¸±à¸à¸Šà¸µà¸—à¸µà¹ˆà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¹„à¸¡à¹ˆà¹„à¸”à¹‰à¸£à¹‰à¸­à¸‡à¸‚à¸­
                    await processEntraIdToken(redirectResult.idToken, !wasAutoRedirect);
                    return;
                }
                // à¹€à¸žà¸´à¹ˆà¸‡à¸à¸” logout à¸¡à¸² â€” à¹„à¸¡à¹ˆ auto login à¸à¸¥à¸±à¸š (flag à¸¥à¹‰à¸²à¸‡à¹€à¸¡à¸·à¹ˆà¸­ login à¸ªà¸³à¹€à¸£à¹‡à¸ˆ/à¸à¸”à¸›à¸¸à¹ˆà¸¡ MS à¹€à¸­à¸‡/à¹€à¸›à¸´à¸”à¸ˆà¸²à¸ Portal)
                const ssoBlocked = localStorage.getItem('sso_logout') === '1';
                // circuit breaker: à¹€à¸žà¸´à¹ˆà¸‡à¹‚à¸”à¸™ 401 à¹€à¸•à¸°à¸­à¸­à¸ (forced logout) à¸ à¸²à¸¢à¹ƒà¸™ 10 à¸§à¸´ â†’ à¸­à¸¢à¹ˆà¸²à¹€à¸žà¸´à¹ˆà¸‡ auto-SSO
                // à¹„à¸¡à¹ˆà¸‡à¸±à¹‰à¸™à¸ˆà¸°à¸”à¸¶à¸‡ token à¹ƒà¸«à¸¡à¹ˆà¹à¸¥à¹‰à¸§à¹‚à¸”à¸™ 401 à¸‹à¹‰à¸³à¸—à¸±à¸™à¸—à¸µà¹€à¸›à¹‡à¸™à¸§à¸‡à¸§à¸™
                const forcedAt = Number(localStorage.getItem('forced_logout_at') || 0);
                const recentlyForced = forcedAt > 0 && Date.now() - forcedAt < 10_000;
                // à¹€à¸„à¸¢à¸à¸” Sign Out (à¸«à¸£à¸·à¸­à¸–à¸¹à¸à¸•à¸±à¸” session) â†’ auto SSO à¸–à¸¹à¸à¸›à¸´à¸”à¹„à¸§à¹‰ à¸•à¹‰à¸­à¸‡à¸šà¸­à¸à¸§à¹ˆà¸²à¸›à¸´à¸”à¸­à¸¢à¸¹à¹ˆ
                // à¹„à¸¡à¹ˆà¸‡à¸±à¹‰à¸™à¸«à¸™à¹‰à¸²à¸ˆà¸­à¹€à¸‡à¸µà¸¢à¸šà¸ªà¸™à¸´à¸—à¸ˆà¸™à¹à¸¢à¸à¹„à¸¡à¹ˆà¸­à¸­à¸à¸ˆà¸²à¸ "à¸£à¸°à¸šà¸šà¸žà¸±à¸‡" à¹à¸¥à¸°à¹„à¸¡à¹ˆà¸£à¸¹à¹‰à¸§à¹ˆà¸²à¸•à¹‰à¸­à¸‡à¸à¸”à¸›à¸¸à¹ˆà¸¡à¹€à¸­à¸‡
                if (ssoBlocked) setSsoNote('à¸›à¸´à¸” auto sign-in à¹„à¸§à¹‰à¸•à¸±à¹‰à¸‡à¹à¸•à¹ˆà¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸šà¸„à¸£à¸±à¹‰à¸‡à¸¥à¹ˆà¸²à¸ªà¸¸à¸” â€” à¸à¸” "Sign in with Microsoft" à¹€à¸žà¸·à¹ˆà¸­à¹€à¸‚à¹‰à¸²à¹ƒà¸«à¸¡à¹ˆ');
                else if (recentlyForced) setSsoNote('à¹€à¸žà¸´à¹ˆà¸‡à¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸šà¹€à¸žà¸£à¸²à¸°à¹€à¸‹à¸ªà¸Šà¸±à¸™à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸ â€” à¸à¸” "Sign in with Microsoft" à¹€à¸žà¸·à¹ˆà¸­à¹€à¸‚à¹‰à¸²à¹ƒà¸«à¸¡à¹ˆ');
                // overlay à¸­à¸²à¸ˆà¹€à¸›à¸´à¸”à¹„à¸§à¹‰à¸•à¸±à¹‰à¸‡à¹à¸•à¹ˆà¸•à¹‰à¸™ effect â€” à¸—à¸²à¸‡à¸—à¸µà¹ˆà¹„à¸¡à¹ˆà¸¥à¸­à¸‡ SSO à¸•à¹ˆà¸­à¸•à¹‰à¸­à¸‡à¸›à¸´à¸”à¹€à¸­à¸‡ à¹„à¸¡à¹ˆà¸‡à¸±à¹‰à¸™à¸„à¸¥à¸¸à¸¡à¸ˆà¸­à¸–à¸²à¸§à¸£
                if (ssoBlocked || recentlyForced) setIsLoading(false);
                if (!ssoBlocked && !recentlyForced) {
                    // ssoSilent à¸§à¸´à¹ˆà¸‡à¸œà¹ˆà¸²à¸™ hidden iframe à¹ƒà¸Šà¹‰à¹€à¸§à¸¥à¸²à¸«à¸¥à¸²à¸¢à¸§à¸´à¸™à¸²à¸—à¸µ â€” à¸£à¸°à¸«à¸§à¹ˆà¸²à¸‡à¸™à¸±à¹‰à¸™à¸•à¹‰à¸­à¸‡à¸¡à¸µà¸­à¸°à¹„à¸£à¸šà¸­à¸
                    // à¹„à¸¡à¹ˆà¸‡à¸±à¹‰à¸™à¸«à¸™à¹‰à¸²à¸ˆà¸­à¸§à¹ˆà¸²à¸‡à¹€à¸›à¸¥à¹ˆà¸²à¹à¸¢à¸à¹„à¸¡à¹ˆà¸­à¸­à¸à¸ˆà¸²à¸ "auto sign-in à¹„à¸¡à¹ˆà¸—à¸³à¸‡à¸²à¸™" (à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸ˆà¸°à¸–à¸¹à¸à¸—à¸±à¸šà¸”à¹‰à¸§à¸¢à¸œà¸¥à¸ˆà¸£à¸´à¸‡à¸—à¸µà¸«à¸¥à¸±à¸‡)
                    if (fromHub) setSsoNote(SSO_AUTO_MSG);
                    const silent = await acquireSsoSilent(ssoHint);
                    if (silent?.idToken) {
                        await processEntraIdToken(silent.idToken, false); // auto silent
                        return;
                    }
                    // silent iframe à¹„à¸¡à¹ˆà¸œà¹ˆà¸²à¸™ (à¹€à¸šà¸£à¸²à¸§à¹Œà¹€à¸‹à¸­à¸£à¹Œà¸šà¸¥à¹‡à¸­à¸ third-party cookie à¸‚à¸­à¸‡ login.microsoftonline.com)
                    // à¹à¸•à¹ˆà¹€à¸›à¸´à¸”à¸¡à¸²à¸ˆà¸²à¸ Portal = à¹à¸—à¸šà¹à¸™à¹ˆà¸§à¹ˆà¸²à¸¡à¸µ MS session à¸­à¸¢à¸¹à¹ˆ â†’ à¸¥à¸­à¸‡ full-page redirect prompt=none
                    // à¸à¸±à¸™à¸§à¸™à¸‹à¹‰à¸³à¸”à¹‰à¸§à¸¢ "à¹€à¸§à¸¥à¸²" à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆ one-shot à¸•à¹ˆà¸­à¹à¸—à¹‡à¸š â€” refresh à¹à¸¥à¹‰à¸§à¸•à¹‰à¸­à¸‡à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆà¹„à¸”à¹‰
                    // (redirect loop à¸ˆà¸£à¸´à¸‡à¹€à¸à¸´à¸”à¸ à¸²à¸¢à¹ƒà¸™à¹„à¸¡à¹ˆà¸à¸µà¹ˆà¸§à¸´à¸™à¸²à¸—à¸µ à¸ªà¹ˆà¸§à¸™à¸„à¸™à¸à¸”à¹€à¸—à¸ªà¸‹à¹‰à¸³à¸«à¹ˆà¸²à¸‡à¸à¸±à¸™à¹€à¸à¸´à¸™à¸™à¸±à¹‰à¸™à¹€à¸ªà¸¡à¸­)
                    const lastTry = Number(sessionStorage.getItem('sso_np_at') || 0);
                    if (fromHub && ssoHint && (!lastTry || Date.now() - lastTry > 60_000)) {
                        sessionStorage.setItem('sso_np_at', String(Date.now()));
                        sessionStorage.setItem('sso_np_pending', '1'); // à¸šà¸­à¸à¸£à¸­à¸šà¸«à¸™à¹‰à¸²à¸§à¹ˆà¸²à¹€à¸›à¹‡à¸™ auto à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆà¸à¸”à¸›à¸¸à¹ˆà¸¡à¹€à¸­à¸‡
                        setIsLoading(true);
                        await ssoRedirectSilent(ssoHint);
                        return;
                    }
                    // silent à¹„à¸¡à¹ˆà¸œà¹ˆà¸²à¸™à¹à¸¥à¸°à¹„à¸¡à¹ˆà¹„à¸”à¹‰ redirect à¸•à¹ˆà¸­ â€” à¸›à¸´à¸” overlay à¸„à¸·à¸™à¸Ÿà¸­à¸£à¹Œà¸¡à¸žà¸£à¹‰à¸­à¸¡à¹€à¸«à¸•à¸¸à¸œà¸¥à¸”à¹‰à¸²à¸™à¸¥à¹ˆà¸²à¸‡
                    setIsLoading(false);
                    if (fromHub) setSsoNote(`Auto sign-in à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ: ${getLastSsoError() || 'à¹„à¸¡à¹ˆà¸žà¸š Microsoft session'}`);
                }
            } catch (e) {
                // prompt=none à¸—à¸µà¹ˆà¹„à¸¡à¹ˆà¸¡à¸µ session à¸ˆà¸°à¹€à¸”à¹‰à¸‡à¸à¸¥à¸±à¸šà¸¡à¸²à¹€à¸›à¹‡à¸™ interaction_required à¸•à¸£à¸‡à¸™à¸µà¹‰ â†’ à¹à¸ªà¸”à¸‡à¸Ÿà¸­à¸£à¹Œà¸¡à¸›à¸à¸•à¸´
                sessionStorage.removeItem('sso_np_pending');
                setIsLoading(false);
                const code = (e as { errorCode?: string; message?: string })?.errorCode
                    || (e as { message?: string })?.message || String(e);
                // benign = à¹„à¸¡à¹ˆà¸¡à¸µ MS session à¸•à¸²à¸¡à¸›à¸à¸•à¸´ â†’ à¹€à¸‡à¸µà¸¢à¸šà¹„à¸”à¹‰à¸–à¹‰à¸²à¹„à¸¡à¹ˆà¹„à¸”à¹‰à¸¡à¸²à¸ˆà¸²à¸ hub
                // error à¸ˆà¸£à¸´à¸‡ (à¸šà¸±à¸à¸Šà¸µà¸–à¸¹à¸à¸£à¸°à¸‡à¸±à¸š/500/HTML) à¸•à¹‰à¸­à¸‡à¹‚à¸Šà¸§à¹Œà¹€à¸ªà¸¡à¸­ à¹„à¸¡à¹ˆà¸§à¹ˆà¸²à¸¡à¸²à¸ˆà¸²à¸ hub à¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆ
                if (fromHub || !isBenignSsoError(code)) setSsoNote(`Auto sign-in à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ: ${code}`);
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

            {/* overlay à¹€à¸•à¹‡à¸¡à¸ˆà¸­à¸£à¸°à¸«à¸§à¹ˆà¸²à¸‡ Microsoft sign-in â€” à¸„à¸™à¸—à¸µà¹ˆà¸–à¸¹à¸à¸žà¸²à¸¡à¸²à¸ˆà¸²à¸ hub à¹€à¸«à¹‡à¸™à¸§à¹ˆà¸²à¸£à¸°à¸šà¸šà¸à¸³à¸¥à¸±à¸‡à¸—à¸³à¸‡à¸²à¸™
                à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆà¸Ÿà¸­à¸£à¹Œà¸¡à¹€à¸›à¸¥à¹ˆà¸²; à¹€à¸à¸²à¸° isLoading à¹€à¸”à¸´à¸¡à¸ˆà¸¶à¸‡à¸«à¸²à¸¢à¹€à¸­à¸‡à¸—à¸¸à¸à¸„à¸£à¸±à¹‰à¸‡à¸—à¸µà¹ˆ flow à¸ˆà¸š (à¸ªà¸³à¹€à¸£à¹‡à¸ˆâ†’navigate, à¸¥à¹‰à¸¡â†’à¸Ÿà¸­à¸£à¹Œà¸¡+à¹€à¸«à¸•à¸¸à¸œà¸¥) */}
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
                    {/* à¸ªà¸–à¸²à¸™à¸°à¸£à¸²à¸¢à¸‚à¸±à¹‰à¸™à¸•à¸±à¸§à¹€à¸”à¸´à¸¡ (ssoNote) à¸•à¹‰à¸­à¸‡à¸¢à¸±à¸‡à¸­à¹ˆà¸²à¸™à¹„à¸”à¹‰à¸£à¸°à¸«à¸§à¹ˆà¸²à¸‡ overlay à¸„à¸¥à¸¸à¸¡à¸ˆà¸­ â€” à¸‹à¹ˆà¸­à¸™à¹€à¸‰à¸žà¸²à¸°à¸•à¸­à¸™à¸‹à¹‰à¸³à¸à¸±à¸šà¸šà¸£à¸£à¸—à¸±à¸”à¸«à¸¥à¸±à¸ */}
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
                            à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¹€à¸žà¸·à¹ˆà¸­à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¸•à¹ˆà¸­
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField
                            label="Username"
                            fullWidth
                            margin="normal"
                            {...register('username', {
                                required: 'à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸ Username',
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
                                required: 'à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸ Password',
                                minLength: {
                                    value: 6,
                                    message: 'Password à¸•à¹‰à¸­à¸‡à¸¡à¸µà¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ 6 à¸•à¸±à¸§à¸­à¸±à¸à¸©à¸£',
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
                                'à¸¢à¸·à¸™à¸¢à¸±à¸™à¹à¸¥à¸°à¸œà¸¹à¸à¸šà¸±à¸à¸Šà¸µ Microsoft'
                            ) : (
                                'à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š'
                            )}
                        </Button>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2 }}>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: '#E2E8F0' }} />
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>à¸«à¸£à¸·à¸­</Typography>
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
