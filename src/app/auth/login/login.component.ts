import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  public newUser = false;
  // public user: firebase.User;
  public loginForm: FormGroup;
  public show: boolean = false
  public errorMessage: any;

  constructor(private fb: FormBuilder, public router: Router) {
    this.loginForm = this.fb.group({
      email: ["Test@gmail.com", [Validators.required, Validators.email]],
      password: ["test123", Validators.required],
    });
  }

  ngOnInit() {
    console.log("--> ", localStorage)
    if (localStorage.getItem("user") != null) {
      this.router.navigate(["/home"]);
    }
  }

  login() {
    console.log();
    console.log(this.loginForm.value["password"]);
    // if (this.loginForm.value["email"] == "Test@gmail.com" && this.loginForm.value["password"] == "test123") {
    let email = this.loginForm.value["email"];
    let username = email;
    if (email.includes("@"))
      username = email.split("@")[0];
    let user = {
      email: this.loginForm.value["email"],
      password: this.loginForm.value["password"],
      name: username,
      username: username,
    };
    localStorage.setItem("user", JSON.stringify(user));
    this.router.navigate(["/home"]);
    // }
  }

  // showPassword(){
  //   this.show = !this.show
  // }
}
