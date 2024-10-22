import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { keycloakUser } from "src/app/shared/model/models.model";
import { AuthService } from "src/app/shared/services/auth.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.scss"],
})
export class MyAccountComponent implements OnInit {
  public userName: string;
  public profileImg: "assets/images/dashboard/profile.jpg";

  user: keycloakUser = null;
  constructor(public router: Router, private authService: AuthService) {
    // let user = JSON.parse(localStorage.getItem("user"))
    // console.log("user: ", user);

    this.authService.GetCurrentUser().then((user: any) => {
      console.log("user: ", user);
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

  logoutFunc() {
    this.authService.Logout();
  }

  userProfile() {
    window.open(
      `${environment.keycloak.serverUrl}/realms/${environment.keycloak.realm}/account/#/personal-info`,
      "_blank"
    );
  }
}
