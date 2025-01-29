import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, HttpRequest } from '@angular/common/http';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from "./shared/shared.module";
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
// // for HttpClient import:
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
// // for Router import:
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
// // for Core import:
import { LoadingBarModule } from '@ngx-loading-bar/core';
// import { AdminGuard } from './shared/guard/admin.guard';
import { AuthGuard } from './shared/guard/auth.guard';
import { CookieService } from 'ngx-cookie-service';
import { AppComponent } from './app.component';
// import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgxSpinnerModule } from "ngx-spinner";
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment';
// import { provideUserIdleConfig } from 'angular-user-idle';
import { AuthService } from './shared/services/auth.service';

// keycloak
export const initializeKeycloak = (keycloak: KeycloakService) => async () =>
  keycloak.init({
    config: {
      url: environment.keycloak.serverUrl,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    },
    loadUserProfileAtStartUp: true,
    initOptions: {
      onLoad: 'check-sso',//'login-required'
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      // checkLoginIframe: false,
      // redirectUri: environment.keycloak.redirectUri,
    },
    bearerExcludedUrls: ['/assets', '/clients/public'],
    shouldAddToken: (request) => {
      // console.log("shouldAddToken")
      const { method, url } = request;
      const isGetRequest = 'GET' === method.toUpperCase();
      const acceptablePaths = ['/assets', '/clients/public'];
      const isAcceptablePathMatch = acceptablePaths.some((path) =>
        url.includes(path)
      );
      return !(isGetRequest && isAcceptablePathMatch);
    },
    shouldUpdateToken(request) {
      // console.log("shouldUpdateToken")
      return !request.headers.get('token-update') === false;
    }
  });


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    // LoginComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    OverlayModule,
    SharedModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FullCalendarModule,
    ToastrModule.forRoot(),
    // ToastrModule.forRoot({ closeButton: true, enableHtml: true, timeOut: 60 * 60 * 1000 }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
    }),
    // for HttpClient use:
    LoadingBarHttpClientModule,
    // for Router use:
    LoadingBarRouterModule,
    // for Core use:
    LoadingBarModule,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
    KeycloakAngularModule,
  ],
  providers: [CookieService,
    // AdminGuard,
    AuthService,
    AuthGuard,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },

    // provideUserIdleConfig({
    //   idle: environment.idleConfig.idle,
    //   ping: environment.idleConfig.ping,
    //   timeout: environment.idleConfig.timeout,
    // }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
