import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { keycloakUser } from "src/app/shared/model/models.model";
import { AuthService } from "src/app/shared/services/auth.service";
import { environment } from "src/environments/environment";
import { HttpClient } from '@angular/common/http';


@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.scss"],
})
export class MyAccountComponent implements OnInit {
  public userName: string;
  public profileImg: "assets/images/dashboard/profile.jpg";

  user: keycloakUser = null;
  isLoadingDelete: boolean = false;
  constructor(public router: Router, private authService: AuthService,private http: HttpClient) {
    // let user = JSON.parse(localStorage.getItem("user"))
    // console.log("user: ", user);

    this.authService.GetCurrentUser().then((user: any) => {

      
      this.user = user;
      if (
        (this.user.firstName == null || this.user.firstName == "") &&
        (this.user.lastName == null || this.user.lastName == "")
      ) {
        this.user.FullName = this.user.email;
      } else
        this.user.FullName =
          (this.user.firstName != null &&
          this.user.firstName != "" &&
          this.user.firstName != "undefined"
            ? this.user.firstName
            : "") +
          " " +
          (this.user.lastName != null &&
          this.user.lastName != "" &&
          this.user.lastName != "undefined"
            ? this.user.lastName
            : "");
      // else if (this.user.lastName == null || this.user.lastName == "") {
      //   this.user.FullName = this.user.firstName;
      // } else {
      //   this.user.FullName = this.user.firstName + " " + (this.user.lastName != null && this.user.lastName != "" && this.user.lastName != "undefined" ? this.user.lastName : "");
      // }
    });
  }

  ngOnInit() {}









  


  async removeTokenFromDatabase() {

    let IDofUserToDelete = this.user.id.toUpperCase();

    const body = {
      ClientIdOfCloack: IDofUserToDelete, 
    };

  
    this.http.post(`${environment.url}/DeleteGoogleToken`, body).subscribe({
      next: (response) => {
        console.log('Token supprimé avec succès de la base de données', response);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du token', error);
      }
    });
  }



  async logoutFunc() {
    this.isLoadingDelete = true;
    await this.removeTokenFromDatabase();
    localStorage.removeItem('google_token');
    localStorage.removeItem('google_token_expiration');
    localStorage.removeItem('google_refresh_token');
    this.authService.Logout();
    this.isLoadingDelete = false;
  }

  userProfile() {
    window.open(
      `${environment.keycloak.serverUrl}/realms/${environment.keycloak.realm}/account/#/personal-info`,
      "_blank"
    );
  }
}
