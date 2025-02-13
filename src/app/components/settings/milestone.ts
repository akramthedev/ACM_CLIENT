import { Component, OnInit, ElementRef } from '@angular/core';
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

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  isConnectedToGoogleCalendar: boolean = false;
  isLoadingAccToken: boolean = false;
  dataFetchedAccToken: any = null;
  CLIENT_ID = environment.CLIENT_ID;
  API_KEY = environment.API_KEY;
  CLIENT_SECRET = environment.CLIENT_SECRET;
  DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  SCOPES = 'https://www.googleapis.com/auth/calendar';
  ClientIdOfGoogle: any = null;
  AccessTokenGoogle: any = null;
  ExpiresIn: any = null;
  isReplanifierClicked: boolean = false;
  isSauvegarding: boolean = false;
  tokenClient: any;
  gapiInited = false;
  gisInited = false;
  user: any = null;
  userCurrent: keycloakUser | null = null;
  isNullValue: boolean = true;
  isLoading: boolean = false;
  expirationGoogleToken: string = 'No';
  private isNullValueSubject = new BehaviorSubject<boolean>(this.isNullValue);
  private tokenCheckInterval: any = null;
  shouldReconnect: boolean = false;


  constructor(
    private title: Title,
    private eRef: ElementRef,
    private toastr: ToastrService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.title.setTitle("Paramètres | ACM");

    this.authService.GetCurrentUser().then((userXX: any) => {
      this.userCurrent = userXX;
      this.updateIsNullValue(false);
    });
  }

  ngOnInit(): void {
    this.loadGoogleApis();
    this.isNullValueSubject.subscribe((value) => {
      this.isNullValue = value;
      if (!this.isNullValue) {
        this.fetchAccessToken();
      }
    });
  }

  updateIsNullValue(newValue: boolean) {
    this.isNullValueSubject.next(newValue);
  }



  fetchAccessToken(): void {
    if (!this.isNullValue && this.userCurrent?.id) {
      this.isLoadingAccToken = true;
      const tokenInUppercase = this.userCurrent.id.toUpperCase();
  
      this.http.get(`${environment.url}/GetAccessTokenGoogleCalendar?ClientIdOfCloack=${tokenInUppercase}`).subscribe({
        next: (response: any) => {
          if (response && response[0]) {
            console.warn('Fetched Access Token:', response[0]);
  
            // Store the token in localStorage
            localStorage.setItem('google_token', response[0].AccessTokenGoogle);
  
            // Retrieve the expiration time (already a timestamp in milliseconds)
            const expirationTime = Number(response[0].ExpiresIn);
  
            // Store the expiration time in localStorage
            localStorage.setItem('google_token_expiration', expirationTime.toString());
  
            // Format the expiration time for display
            this.expirationGoogleToken = this.formatExpirationDate(expirationTime);
  
            // Check if the token is still valid
            this.isConnectedToGoogleCalendar = this.checkTokenExpiration(expirationTime);
            this.isLoadingAccToken = false;
            this.startTokenCheckLoop();
          } else {
            console.log('No token fetched...');
            this.isLoadingAccToken = false;
          }
        },
        error: (error) => {
          console.error('Erreur fetching access token:', error);
          this.isLoadingAccToken = false;
          this.toastr.error("Une erreur est survenue au niveau de Google Calendar.");
        }
      });
    } else {
      console.warn("Utilisateur non authentifié, récupération du token impossible");
    }
  }


  handleAuthClick(): void {
    if (!this.tokenClient) return;
  
    this.isLoading = true;
    this.tokenClient.requestAccessToken({
      prompt: 'consent',
      callback: (response: any) => {
        if (response.error) {
          console.error('Google authentication error:', response.error);
          this.isLoading = false;
          return;
        }
        else{
          console.warn(response);
          this.isLoading = false;
        }
      }
    });

    this.ClientIdOfGoogle = this.tokenClient.s.client_id;
    this.isLoading = false;
  }

  loadGoogleApis(): void {
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onload = () => this.gapiLoaded();
    document.body.appendChild(gapiScript);

    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = () => this.gisLoaded();
    document.body.appendChild(gisScript);
  }

  gapiLoaded(): void {
    gapi.load('client', async () => {
      await gapi.client.init({
        apiKey: environment.API_KEY,
        discoveryDocs: [this.DISCOVERY_DOC],
      });

      if (this.AccessTokenGoogle) {
        gapi.client.setToken({
          access_token: this.AccessTokenGoogle,
        });
      }

      this.gapiInited = true;
    });
  }

  gisLoaded(): void {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
      prompt: 'consent',
      access_type: 'offline',
      callback: (resp: any) => {
        this.AccessTokenGoogle = resp.access_token;
        this.ExpiresIn = resp.expires_in;
        this.handleAuthResponse(resp)
      },
    });
    this.gisInited = true;
  }




  formatExpirationDate(timestamp: number): string {
    // Debugging: Log the timestamp and validate it
    console.log('Timestamp:', timestamp);
  
    // Check if the timestamp is valid
    if (!timestamp || isNaN(timestamp)) {
      console.error('Invalid timestamp:', timestamp);
      return 'Invalid Date';
    }
  
    // Create a Date object from the timestamp
    const date = new Date(timestamp);
  
    // Debugging: Log the Date object to ensure it's valid
    console.log('Date Object:', date);
  
    // Check if the Date object is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid Date object:', date);
      return 'Invalid Date';
    }
  
    // Extract date and time components
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    // Format the date and time
    return `${hours}:${minutes} - ${day}/${month}/${year}`;
  }
  





  async handleAuthResponse(resp: any): Promise<void> {
    if (resp.error) {
      console.error(resp);
      this.isConnectedToGoogleCalendar = false;
      return;
    }
  
    // Store the access token
    this.AccessTokenGoogle = resp.access_token;


    console.warn(resp);
    console.log();
    console.warn(resp);
    console.log();
    console.warn(resp);
    console.log();
    console.warn(resp);

    if (resp.refresh_token) {
      localStorage.setItem('google_refresh_token', resp.refresh_token);
    }

    
  
    // Calculate the expiration time
    const expiresInSeconds = resp.expires_in;  
    const expirationTime = Date.now() + expiresInSeconds * 1000;  
    // minus 10 minutes because it can be sometimes a delay or the loop not working or others unknown bugs 
    const adjustedExpirationTime = expirationTime - (5 * 60 * 1000);  // for test put : - 
  
    // Store the token and expiration time in localStorage
    localStorage.setItem('google_token', this.AccessTokenGoogle);
    localStorage.setItem('google_token_expiration', adjustedExpirationTime.toString());
  
    // Update the UI state
    this.isConnectedToGoogleCalendar = true;
  
    this.startTokenCheckLoop();

    // Prepare the request body for your backend
    const requestBody = {
      ClientIdOfCloack: this.userCurrent?.id,
      EmailKeyCloack: this.userCurrent?.email,
      AccessTokenGoogle: this.AccessTokenGoogle,
      ClientIdOfGoogle: this.ClientIdOfGoogle,
      ExpiresIn: adjustedExpirationTime.toString(), // Send the correct expiration time to the backend
    };
  
    // Send the request to your backend
    this.http.post(`${environment.url}/CreateGoogleCalendarAccount`, requestBody).subscribe({
      next: () => {
        this.toastr.success("Connexion à Google Calendar réussie.");
      },
      error: (err) => {
        console.error('Error creating account:', err);
        this.toastr.error("Connexion à Google Calendar échoué.");
      },
    });
  }



 


  handleLogout(): void {
    this.isLoadingAccToken = true;
    localStorage.removeItem('google_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_expiration');
    this.isConnectedToGoogleCalendar = false;
    this.stopTokenCheckLoop(); // Stop the loop
    this.removeTokenFromDatabase();
    this.isLoadingAccToken = false;
    this.toastr.success("Google Calendar n'est plus connecté à votre compte.");
  }



  removeTokenFromDatabase(): void {
    let XXX = this.userCurrent?.id.toUpperCase();

    const body = {
      ClientIdOfCloack: XXX, 
    };

    this.http.post(`${environment.url}/DeleteGoogleToken`, body).subscribe({
      next: (response) => {
        console.log('Token supprimé avec succès de la base de données', response);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du token', error);
        alert('Une erreur est survenue lors de votre déconnexion.')
      }
    });
  }





  closeShouldReconnect():void{
    this.shouldReconnect = false;
  }


  
  checkTokenExpiration(expirationTime: number): boolean {
    const currentTime = Date.now();
    if (currentTime >= expirationTime) {
      console.log('Token expiré, veuillez ré-authentifier.');
      this.refreshToken();
      this.isConnectedToGoogleCalendar = false;
      return false;
    }
    return true;
  }




  startTokenCheckLoop(): void {
    // Clear any existing interval
    if (this.tokenCheckInterval) {
      console.log('Clearing existing token check interval...');
      clearInterval(this.tokenCheckInterval);
    }
  
    console.log('Starting new token check loop...');
  
    // Start a new interval
    this.tokenCheckInterval = setInterval(() => {
      console.log('Loop running...');
  
      if (this.isConnectedToGoogleCalendar) {
        console.log('User is connected to Google Calendar. Checking token expiration...');
  
        const expirationTime = Number(localStorage.getItem('google_token_expiration'));
        console.log('Expiration Time from localStorage:', expirationTime);
  
        if (isNaN(expirationTime)) {
          console.error('Invalid expiration time in localStorage. Stopping loop.');
          this.stopTokenCheckLoop();
          return;
        }
  
        const isTokenValid = this.checkTokenExpirationForLoopingSystem(expirationTime);
        console.log('Is token valid?', isTokenValid);
  
        if (!isTokenValid) {
          console.log('Token is expired. Stopping loop...');
          // Stop the loop if the token is expired
          this.stopTokenCheckLoop();
        }
      } else {
        console.log('User is no longer connected to Google Calendar. Stopping loop...');
        // Stop the loop if the user is no longer connected
        this.stopTokenCheckLoop();
      }
    }, 3000); // Check every 10 seconds
  }
  
  stopTokenCheckLoop(): void {
    if (this.tokenCheckInterval) {
      console.log('Stopping token check loop...');
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    } else {
      console.log('No token check loop to stop.');
    }
  }



  checkTokenExpirationForLoopingSystem(expirationTime: number): boolean {
    const currentTime = Date.now();
    if (currentTime >= expirationTime) {
      console.log('Token expiré, veuillez ré-authentifier.');
      this.refreshToken();
      this.isConnectedToGoogleCalendar = false;
      return false;
    } else {
      return true;
    }
  }

  




























  refreshToken(): void {
    
    const REFRESH__TOKEN = localStorage.getItem('google_refresh_token');

    if (!REFRESH__TOKEN) {
      //this.handleLogout();
      this.shouldReconnect = true;
      return;
    }
  
    const url = 'https://oauth2.googleapis.com/token';
    const data = new URLSearchParams();
    data.append('client_id', this.CLIENT_ID); 
    data.append('client_secret', this.CLIENT_SECRET);
    data.append('refresh_token', REFRESH__TOKEN);
    data.append('grant_type', 'refresh_token');
  
    fetch(url, { method: 'POST', body: data })
      .then((response) => response.json())
      .then((data) => {
        if (data.access_token) {
          console.log('Token rafraîchi avec succès!');

      
          
          this.toastr.success("Votre session Google Calendar a été rafraîchi avec succès!");
          // Calculate the new expiration time
          const expiresInSeconds = data.expires_in;  
          const newExpirationTime = Date.now() + expiresInSeconds * 1000; 
          const adjustedExpirationTime = newExpirationTime - (5 * 60 * 1000);
          localStorage.setItem('google_token', data.access_token);
          localStorage.setItem('google_token_expiration', adjustedExpirationTime.toString());

          //we need to update the backend also 
          //we need to update the backend also 
          //we need to update the backend also 
          //we need to update the backend also 
          //we need to update the backend also 
          //we need to update the backend also 
          //we need to update the backend also 
          //we need to update the backend also 
          //we need to update the backend also 
          //we need to update the backend also 
          //we need to update the backend also 
          //we need to update the backend also 


          this.isConnectedToGoogleCalendar = true;
  
          // Restart the token check loop
          this.startTokenCheckLoop();
  
          // Notify the user
        } else {
          console.error('Impossible de rafraîchir le token:', data);
          //this.handleLogout();
          this.shouldReconnect = true;
        }
      })
      .catch((error) => {
        console.error('Erreur lors du rafraîchissement du token:', error);
        this.toastr.error("Une erreur est survenue au niveau de Google Calendar.");
        //this.handleLogout();
        this.shouldReconnect = true;
      });
  }





}