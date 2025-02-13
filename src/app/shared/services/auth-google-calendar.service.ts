import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../environments/environment";
import { BehaviorSubject } from 'rxjs';
import { AuthService } from "../../shared/services/auth.service";
import { keycloakUser } from "../../shared/model/models.model";
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';


declare var google: any;
declare var gapi: any;


@Injectable({
  providedIn: 'root'
})
export class AuthGoogleCalendarService {

constructor() { }




}
