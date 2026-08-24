import { PublicClientApplication, type AuthenticationResult } from '@azure/msal-browser';

// Same Entra ID app registration as the other BevPro apps — one Microsoft
// session shared across the whole hub. This app's URL must be registered
// as an SPA redirect URI on that registration.
const MSAL_CONFIG = {
    auth: {
        clientId: process.env.REACT_APP_AZURE_CLIENT_ID || '85e8563f-abf6-468f-8d2f-8d22759dcbeb',
        authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID || 'bd887fc9-1f27-4bff-9076-fc752a54cfaf'}`,
        redirectUri: typeof window !== 'undefined' ? window.location.origin + '/login' : '',
        navigateToLoginRequestUrl: false,
    },
    cache: {
        // localStorage — MSAL account cache survives tabs/restarts (needed for auto SSO)
        cacheLocation: 'localStorage' as const,
    },
};

let msalInstance: PublicClientApplication | null = null;
let initPromise: Promise<void> | null = null;

async function getMsalInstance(): Promise<PublicClientApplication> {
    if (!msalInstance) {
        msalInstance = new PublicClientApplication(MSAL_CONFIG);
        initPromise = msalInstance.initialize();
    }
    await initPromise;
    return msalInstance;
}

/** Handle redirect response — call on login page mount */
export async function handleMsalRedirect(): Promise<AuthenticationResult | null> {
    const instance = await getMsalInstance();
    return instance.handleRedirectPromise();
}

/** Start Microsoft login via full-page redirect */
export async function loginWithMicrosoft(): Promise<void> {
    const instance = await getMsalInstance();
    const fromHub = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('sso_hub') === '1';
    await instance.loginRedirect({ scopes: ['openid', 'profile', 'email'], ...(fromHub ? {} : { prompt: 'select_account' }) });
}

/** ดึง errorCode ของ MSAL ออกมา — เดิม catch กลืน error ทิ้ง ทำให้หาสาเหตุ auto-login ล้มไม่ได้เลย */
function ssoErr(e: unknown): string {
    const err = e as { errorCode?: string; errorMessage?: string; message?: string };
    return err?.errorCode || err?.errorMessage || err?.message || String(e);
}

// สาเหตุล่าสุดที่ auto-SSO ล้ม — หน้า login เอาไปแสดงให้ผู้ใช้เห็นโดยไม่ต้องเปิด DevTools
let lastSsoError = '';
export function getLastSsoError(): string {
    return lastSsoError;
}

/**
 * idToken ยังไม่หมดอายุจริงไหม
 *
 * acquireTokenSilent ตัดสินใจจากอายุ access token เป็นหลัก — ถ้า access token ยังดีอยู่
 * มันคืน idToken ตัวเก่าจาก cache กลับมาเลย แม้ idToken นั้นหมดอายุไปแล้ว ส่งต่อไปที่
 * server แล้ว verify จะไม่ผ่าน → ผู้ใช้เห็น "Microsoft token ไม่ถูกต้องหรือหมดอายุ"
 * ทั้งที่ session Microsoft ยังใช้ได้ปกติ
 */
function idTokenFresh(idToken?: string, skewSec = 60): boolean {
    if (!idToken) return false;
    try {
        const part = idToken.split('.')[1] || '';
        const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
        // atob คืน binary string — แปลงกลับเป็น UTF-8 ก่อน ไม่งั้น claim ภาษาไทยทำ JSON.parse พัง
        const bin = atob(b64 + pad);
        const json = decodeURIComponent(
            Array.prototype.map
                .call(bin, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const exp = JSON.parse(json)?.exp;
        return typeof exp === 'number' && exp * 1000 > Date.now() + skewSec * 1000;
    } catch {
        return false;
    }
}

const SSO_SCOPES = ['openid', 'profile', 'email'];

/**
 * Silent SSO: get an idToken from the existing Microsoft session.
 * - มี account ใน cache ที่ตรงกับ loginHint → acquireTokenSilent
 * - ไม่มี/ไม่ตรง → ssoSilent (hidden iframe) ด้วย loginHint
 * Returns null on failure — never throws.
 */
export async function acquireSsoSilent(loginHint?: string): Promise<AuthenticationResult | null> {
    try {
        const instance = await getMsalInstance();
        const hint = loginHint?.trim().toLowerCase();
        const accounts = instance.getAllAccounts();
        // ต้องเลือก account ให้ตรง loginHint — cache ค้างของบัญชีอื่นทำให้ silent ล้ม
        // (แล้วไม่ตกไปลอง ssoSilent ต่อ) และเสี่ยงเข้าระบบเป็นคนอื่น
        const account = hint
            ? accounts.find((a) => a.username?.toLowerCase() === hint)
            : accounts[0];
        if (account) {
            try {
                let r = await instance.acquireTokenSilent({ scopes: SSO_SCOPES, account });
                if (!idTokenFresh(r?.idToken)) {
                    // cache คืน idToken ที่หมดอายุ → บังคับต่ออายุด้วย refresh token
                    r = await instance.acquireTokenSilent({ scopes: SSO_SCOPES, account, forceRefresh: true });
                }
                if (idTokenFresh(r?.idToken)) return r;
                // ยังเก่าอยู่แม้ forceRefresh → อย่าส่งไป server ให้ตกไปใช้ ssoSilent/redirect ต่อ
                lastSsoError = 'stale_id_token';
                console.warn('⚠️ [SSO] idToken หมดอายุแม้ forceRefresh แล้ว — ข้ามไปวิธีถัดไป');
            } catch (e) {
                // refresh token หมด/cache ค้าง → ตกไปลอง ssoSilent ต่อ ไม่จบที่นี่
                lastSsoError = ssoErr(e);
                console.warn('⚠️ [SSO] acquireTokenSilent failed:', lastSsoError);
            }
        }
        if (!loginHint) return null;
        const silent = await instance.ssoSilent({ scopes: SSO_SCOPES, loginHint });
        // ปกติ ssoSilent คืนของใหม่เสมอ แต่กันไว้ — token เก่าถูกปฏิเสธที่ server อยู่ดี
        // คืน null ดีกว่า เพราะหน้า login จะไป fallback prompt=none ที่ได้ token สดแน่นอน
        if (!idTokenFresh(silent?.idToken)) {
            lastSsoError = 'stale_id_token';
            return null;
        }
        return silent;
    } catch (e) {
        lastSsoError = ssoErr(e);
        console.warn('⚠️ [SSO] ssoSilent failed:', lastSsoError);
        return null;
    }
}

/**
 * Fallback ของ auto-login เมื่อ silent iframe ใช้ไม่ได้
 * (เบราว์เซอร์บล็อก third-party cookie ของ login.microsoftonline.com → ssoSilent ล้มเสมอ)
 *
 * full-page redirect ไป Microsoft ด้วย prompt=none:
 * - มี MS session อยู่ → เด้งกลับมาพร้อม token เอง ผู้ใช้ไม่ต้องกรอกอะไร
 * - ไม่มี session → เด้งกลับมาพร้อม error (interaction_required) → แสดงฟอร์ม login ปกติ
 *   ไม่มีหน้าจอ Microsoft ให้กรอกโผล่มาขัดจังหวะ
 */
export async function ssoRedirectSilent(loginHint: string): Promise<void> {
    const instance = await getMsalInstance();
    await instance.loginRedirect({ scopes: SSO_SCOPES, loginHint, prompt: 'none' });
}
