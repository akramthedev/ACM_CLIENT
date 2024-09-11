// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  url: 'http://localhost:3000',
  // url: 'https://acm-backend.azurewebsites.net',

  // keycloak: {
  //   // serverUrl: "https://upulse-keycloak.azurewebsites.net",
  //   // serverUrl: "http://srvprod.ma:8080",
  //   serverUrl: "http://localhost:8080",
  //   realm: 'upulse',
  //   clientId: 'client-backend',
  //   redirectUri: 'http://localhost:4200/',
  // },

  keycloak: {
    // serverUrl: 'http://localhost:8080',
    serverUrl: "https://acm-keycloak.azurewebsites.net",
    redirectUri: "http://localhost:4200",
    postLogoutRedirectUri: "http://localhost:4200/logout",
    realm: "acm",
    clientId: "acm-client",
  },
  idleConfig: { idle: 1000 * 60 * 4, timeout: 60, ping: 10 },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
