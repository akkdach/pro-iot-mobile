export const msalConfig = {
  auth: {
    clientId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // จาก Azure
    authority: 'https://login.microsoftonline.com/your-tenant-id', // หรือ common
    redirectUri: 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage',
  },
};

export const loginRequest = {
  scopes: ['User.Read'],
};
