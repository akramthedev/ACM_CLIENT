import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { KeycloakService } from "keycloak-angular";

@Injectable({
  providedIn: "root",
})
export class AuthService {

  constructor(private readonly keycloak: KeycloakService) { }

  redirectToLoginPage(): Promise<void> {
    return this.keycloak.login();
  }

  get userName(): string {
    return this.keycloak.getUsername();
  }
  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }
  logout(): void {
    this.keycloak.logout(environment.keycloak.redirectUri);
    // this.keycloak.logout(environment.keycloak.postLogoutRedirectUri);
  }

  Logout(returnUrl: string = '/') {
    this.keycloak.logout(environment.keycloak.redirectUri);
    // this.keycloak.logout()
    //   .then((response) => {
    //     console.log("Reponse logout: ", response);

    //   }, (error) => {
    //     console.log("Error logout: ", error);
    //   });
  }

  GetCurrentUser() {
    return this.keycloak.loadUserProfile();
  }
}
