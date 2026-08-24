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
                return await instance.acquireTokenSilent({ scopes: SSO_SCOPES, account });
            } catch (e) {
                // refresh token หมด/cache ค้าง → ตกไปลอง ssoSilent ต่อ ไม่จบที่นี่
                lastSsoError = ssoErr(e);
                console.warn('⚠️ [SSO] acquireTokenSilent failed:', lastSsoError);
            }
        }
        if (!loginHint) return null;
        return await instance.ssoSilent({ scopes: SSO_SCOPES, loginHint });
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
