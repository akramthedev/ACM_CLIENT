import { Component, OnInit, HostListener, ElementRef,ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import { ToastrService } from "ngx-toastr";
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import frLocale from '@fullcalendar/core/locales/fr'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Title } from '@angular/platform-browser';
import { AuthService } from "../../shared/services/auth.service";
import { keycloakUser } from "../../shared/model/models.model";
import { BehaviorSubject } from 'rxjs';
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
  isLoadingAccToken:boolean = false;
  dataFetchedAccToken : any = null; 
  CLIENT_ID = environment.CLIENT_ID;
  API_KEY =  environment.API_KEY ;
  CLIENT_SECRET = environment.CLIENT_SECRET;
  DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  SCOPES = 'https://www.googleapis.com/auth/calendar';
  ClientIdOfCloack: any = null;
  EmailKeyCloack: any = null;
  ClientIdOfGoogle: any = null;
  AccessTokenGoogle: any = null;
  ExpiresIn: any = null;
  isReplanifierClicked: boolean = false;
  isSauvegarding: boolean = false;
  tokenClient: any;
  gapiInited = false;
  gisInited = false;
  events: string = '';
  user: any = null;
  userCurrent: keycloakUser | null = null;
  isNullValue: boolean = true;
  private isNullValueSubject = new BehaviorSubject<boolean>(this.isNullValue);
  isLoading: boolean = false;
  expirationGoogleToken: string = 'No';
  


constructor(private title: Title,private eRef: ElementRef, private toastr: ToastrService, private http: HttpClient, private authService: AuthService) {
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
          this.fetchAccessToken();
      });
    }



      
    updateIsNullValue(newValue: boolean) {
      this.isNullValueSubject.next(newValue);
    }





  
    

    fetchAccessToken(): void {
      if (!this.isNullValue) {
        this.isLoadingAccToken = true;
        const tokenInUppercase = this.userCurrent?.id.toUpperCase();
    
        this.http.get(`${environment.url}/GetAccessTokenGoogleCalendar?ClientIdOfCloack=${tokenInUppercase}`).subscribe({
          next: (response: any) => {
            if (response && response[0]) {
              console.warn('Fetched Access Token:', response[0]);
    
              const expiresIn = response[0].ExpiresIn; // ExpiresIn is in seconds
              const expirationTime = Date.now() + expiresIn * 1000; // Convert to milliseconds
              localStorage.setItem('google_token_expiration', expirationTime.toString());
    
              this.expirationGoogleToken = this.formatExpirationDate(expirationTime);
              this.isConnectedToGoogleCalendar = this.checkTokenExpiration();
            } else {
              console.error('Erreur lors de la récupération du token');
            }
          },
          error: (error) => {
            console.error('Erreur fetching access token:', error);
            this.toastr.error("Une erreur est survenue au niveau de Google Calendar.");
          },
          complete: () => {
            this.isLoadingAccToken = false;
          }
        });
      } else {
        console.warn("Utilisateur non authentifié, récupération du token impossible");
      }
    }
    
    checkTokenExpiration(): boolean {
      const expirationTime = localStorage.getItem('google_token_expiration');
    
      if (expirationTime) {
        const currentTime = Date.now();
        const expiryDate = parseInt(expirationTime);
    
        if (currentTime >= expiryDate) {
          console.log('Token expiré, veuillez ré-authentifier.');
          this.refreshToken(); // Refresh the token if expired
          return false;
        }
        return true; // Token is still valid
      } else {
        console.log('Aucun token trouvé, veuillez vous connecter.');
        return false; // No token found
      }
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
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
        callback: (resp: any) => {
          this.AccessTokenGoogle = resp.access_token;
          this.ExpiresIn = resp.expires_in;
          this.handleAuthResponse(resp)
        },
      });
      this.gisInited = true;
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
  


    
  async handleAuthResponse(resp: any): Promise<void> {

    if (resp.error) {
      console.error(resp);
      this.isConnectedToGoogleCalendar = false;
      return;
    }


    this.AccessTokenGoogle = resp.access_token;
    localStorage.setItem('google_token', resp.access_token);
    const expiresIn = resp.expires_in;  
    const expirationTime = Date.now() + expiresIn * 1000;
    localStorage.setItem('google_token_expiration', expirationTime.toString());
    this.isConnectedToGoogleCalendar = true;

    const authButton = document.getElementById('authorize_button');
    
    if (authButton) {
      authButton.innerText = '';
      authButton.style.color = 'white';
      authButton.style.background = 'white';
      authButton.style.pointerEvents = 'none';
      authButton.style.cursor = 'default';
    }

    const expiresInX = this.ExpiresIn;  
    const expirationTimeX = Date.now() + expiresInX * 1000;  
    const adjustedExpirationTime = expirationTimeX - (6 * 60 * 1000); 
    localStorage.setItem('google_token_expiration', adjustedExpirationTime.toString());


    const requestBody = {
      ClientIdOfCloack: this.userCurrent?.id, 
      EmailKeyCloack: this.userCurrent?.email,
      AccessTokenGoogle: this.AccessTokenGoogle, 
      ClientIdOfGoogle: this.ClientIdOfGoogle, 
      ExpiresIn : adjustedExpirationTime.toString()
    };

    console.log("X X XX X X X X X X X X X  X");
    console.warn(requestBody);
    console.log("X X XX X X X X X X X X X  X");
    
  
    console.warn("Body Of Request : ");
    console.warn(requestBody);
    this.http.post(`${environment.url}/CreateGoogleCalendarAccount`, requestBody)
      .subscribe({
        next: (res) => {
          this.toastr.success("Connexion à Google Calendar réussie.");
          // window.location.reload();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error creating account:', err);
          this.toastr.error("Connexion à Google Calendar échoué.");
          this.isLoading = false;
        }
      });  
      this.isLoading = false;
  }






  

  refreshToken(): void {
    const refreshTokenX = localStorage.getItem('google_refresh_token');   
  
    if (!refreshTokenX) {
      this.handleLogout();
      this.toastr.error("Veuillez vous reconnecter, votre session a expiré.");
      return;
    }
  
    const url = 'https://oauth2.googleapis.com/token';
    const data = new URLSearchParams();
    data.append('client_id', this.ClientIdOfGoogle);  
    data.append('client_secret', this.CLIENT_SECRET);   
    data.append('refresh_token', refreshTokenX);  
    data.append('grant_type', 'refresh_token');  
  
    fetch(url, { method: 'POST', body: data })
      .then((response) => response.json())
      .then((data) => {
          
        if (data.access_token) {
          console.log('Token rafraîchi avec succès!');
  
          // Mettre à jour le token et la date d'expiration
          const newExpirationTime = Date.now() + (58 * 60 * 1000); // 1 heure de validité
          localStorage.setItem('google_token', data.access_token);
          localStorage.setItem('google_token_expiration', newExpirationTime.toString());
  
          console.log('New refresh token:', data.refresh_token);

          if (data.refresh_token) {
            localStorage.setItem('google_refresh_token', data.refresh_token);
          }
          this.isConnectedToGoogleCalendar = true;

        } else {
          console.log('Impossible de rafraîchir le token:', data);
          this.handleLogout();
          this.toastr.error("Veuillez vous reconnecter à Google Calendar.");
          this.isConnectedToGoogleCalendar = false;
        }
      })
      .catch((error) => {
        console.error('Erreur lors du rafraîchissement du token:', error);
        this.toastr.error("Une erreur est survenue au niveau de Google Calendar.");
        this.isConnectedToGoogleCalendar = false;
      });
  }
     




    
 
    handleLogout(): void {
      this.isLoadingAccToken = true
      localStorage.removeItem('google_token');
      localStorage.removeItem('google_refresh_token');
    
      this.isConnectedToGoogleCalendar = false;
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
          window.location.reload();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du token', error);
          alert('Une erreur est survenue lors de votre déconnexion.')
        }
      });
    }
    
  
  

    
    
  formatExpirationDate(timestamp: number){
    const date = new Date(timestamp);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}  -  ${day}/${month}/${year}`;
}
  



}
