export const environment = {
  production: true,
  // url: "https://acm-back-end.onrender.com",
  url: 'https://acm-backend.azurewebsites.net',
  CLIENT_ID : "267508651605-2vqqep29h97uef9tt7ahis82dskjsm1r.apps.googleusercontent.com",
  API_KEY : 'AIzaSyBhI34z9rSK7S-rfmngJ1nmb48zfb5nUz8',
  CLIENT_SECRET :"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",
  // change it when production 

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
