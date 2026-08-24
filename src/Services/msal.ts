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

/**
 * Silent SSO: get an idToken from the existing Microsoft session.
 * Returns null on failure — never throws.
 */
export async function acquireSsoSilent(loginHint?: string): Promise<AuthenticationResult | null> {
    try {
        const instance = await getMsalInstance();
        const scopes = ['openid', 'profile', 'email'];
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
            return await instance.acquireTokenSilent({ scopes, account: accounts[0] });
        }
        if (!loginHint) return null;
            return await instance.ssoSilent({ scopes, loginHint });
    } catch {
        return null;
    }
}
