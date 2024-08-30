export const environment = {
  production: true,
  url: "https://acm-back-end.onrender.com",

  // keycloak: {
  //   serverUrl: "https://acm-keycloak.azurewebsites.net",
  //   // serverUrl: "http://srvprod.ma:8080",
  //   // serverUrl: "http://localhost:9081",
  //   realm: 'acm',
  //   clientId: 'acm-client',
  //   redirectUri: 'http://localhost:4200/',
  // },

  keycloak: {
    // serverUrl: 'http://localhost:8080',
    serverUrl: 'https://acm-keycloak.azurewebsites.net',    
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200/logout',
    realm: 'acm',
    clientId: 'acm-client',
  },
  idleConfig: { idle: 1000 * 60 * 4, timeout: 60, ping: 10 },

};
