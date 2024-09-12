export const environment = {
  production: true,
  // url: "https://acm-back-end.onrender.com",
  url: 'https://acm-backend.azurewebsites.net',


  keycloak: {
    // serverUrl: 'http://localhost:8080',
    serverUrl: 'https://acm-keycloak.azurewebsites.net',
    redirectUri: 'http://universiapulse-001-site34.ltempurl.com',
    postLogoutRedirectUri: 'http://universiapulse-001-site34.ltempurl.com',
    realm: 'acm',
    clientId: 'acm-client',
  },
  idleConfig: { idle: 1000 * 60 * 4, timeout: 60, ping: 10 },

};
