import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  public newUser = false;
  // public user: firebase.User;
  public loginForm: FormGroup;
  params: { Login: string, Password: string, StayConnected: boolean } = { Login: "", Password: "", StayConnected: false };
  public show: boolean = false
  public errorMessage: any;

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private loader: NgxSpinnerService,) {
    // this.loginForm = this.fb.group({
    //   Login: ["", [Validators.required,]],
    //   Password: ["", Validators.required],
    // });
  }

  ngOnInit() {
    console.log("--> ", localStorage)
    if (localStorage.getItem("user") != null) {
      this.router.navigate(["/home"]);
    }
  }

  login() {
    // this.loader.show();
    // this.authService.Login(this.params)
    //   .subscribe((response) => {
    //     console.log("response login: ", response);
    //     this.loader.hide();

    //     localStorage.setItem("user", JSON.stringify(response));
    //     this.router.navigate(["/home"]);

    //   }, (error) => {
    //     console.error("Error login: ", error);
    //     this.toastr.error(error?.error);
    //     this.loader.hide();

    //   });
    // return;
    // console.log(this.loginForm.value);
    // let email = this.loginForm.value["email"];
    // let username = email;
    // if (email.includes("@"))
    //   username = email.split("@")[0];
    // let user = {
    //   email: this.loginForm.value["email"],
    //   password: this.loginForm.value["password"],
    //   name: username,
    //   username: username,
    // };
    // localStorage.setItem("user", JSON.stringify(user));
    // this.router.navigate(["/home"]);
  }
}
