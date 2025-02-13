import {  ViewChild, Renderer2, ElementRef, HostListener } from "@angular/core";
import { AddClientComponent } from "./modal/add-client/add-client.component";
import { AddCategoryComponent } from "./modal/add-category/add-category.component";
import { PrintContactComponent } from "./modal/print-contact/print-contact.component";
import { Title } from "@angular/platform-browser";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { ClientService } from "../../../shared/services/client.service";
import { Client } from "../../../shared/model/dto.model";
import { forkJoin, of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../../environments/environment";
import { BehaviorSubject } from 'rxjs';
import { AuthService } from "../../../shared/services/auth.service";
import { keycloakUser } from "../../../shared/model/models.model";
import { CommonModule } from '@angular/common';




declare var google: any;
declare var gapi: any;


@Component({
  selector: "app-clients",
  templateUrl: "./clients.component.html",
  styleUrls: ["./clients.component.scss"],
})
export class ClientsComponent implements OnInit {
  @ViewChild("addClient") AddClient: AddClientComponent;
  @ViewChild("addCategory") AddCategory: AddCategoryComponent;
  @ViewChild("print") Print: PrintContactComponent;



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
        isUpdating: boolean = false;
        isDeleteTask: boolean = false;
        showCompletedTasks: boolean = false;
        ClientIdOfCloack: any = null;
        EmailKeyCloack: any = null;
        CurrentClient: any = null;


      public history: boolean = false;
      titre: String;
      Clients: any[] = [];
      showPopUpNotify: boolean = false;
      events: string = '';
      

  filters: { persons: string[]; tasks: string[] } = { persons: [], tasks: [] };
  allPersons: { id: string; nom: string; prenom: string }[] = [];  
  allTasks: { id: string; nom: string }[] = [];    
  originalEvents: any[] = [];


 




  constructor(private title: Title,private eRef: ElementRef, private router: Router, private clientService: ClientService, private loader: NgxSpinnerService,private http: HttpClient, private toastr: ToastrService, private renderer: Renderer2, private authService: AuthService) {
    this.title.setTitle("Clients | ACM");
    this.titre = this.title.getTitle();

    this.authService.GetCurrentUser().then((userXX: any) => {
      this.userCurrent = userXX; 
      this.updateIsNullValue(false);
    });
  }
  


  ngOnInit(): void {
      this.LoadTous();
      this.loadGoogleApis();
      this.getClients();
      this.isNullValueSubject.subscribe((value) => {
        this.isNullValue = value;
        if (!this.isNullValue) {
          this.fetchAccessToken();
        }
      });    
  }



  AddClientButCheckConnectionWithGoogleCalendarFirst(): void{
    if(this.isConnectedToGoogleCalendar === true){
      this.AddClient.openModal();
    }
    else{
      this.showPopUpNotify = true;
    }
  }


  NePasContinuerCommeMeme():void{
    this.showPopUpNotify = false;
  }



  @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
      const clickedInside = this.eRef.nativeElement.contains(event.target);
      if (!clickedInside && this.showPopUpNotify) {
        this.showPopUpNotify = false;
      }
    }


  preventClose(event: MouseEvent): void {
    event.stopPropagation();  
  }


  ContinuerCommeMeme():void{
    this.showPopUpNotify = false;
    setTimeout(()=>{
      this.AddClient.openModal();
    }, 300);
  }






































  updateIsNullValue(newValue: boolean) {
    this.isNullValueSubject.next(newValue);
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
        this.maybeEnableButtons();
      }
  

      maybeEnableButtons(): void {
        if (this.gapiInited && this.gisInited) {
          document.getElementById('authorize_button')!.style.visibility = 'visible';
        }
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
              this.isLoading = false;
            }
          }
        });
    
        this.ClientIdOfGoogle = this.tokenClient.s.client_id;
        this.isLoading = false;
      }
    
      
    
      handleSignoutClick(): void {
        const token = gapi.client.getToken();
        if (token !== null) {
          google.accounts.oauth2.revoke(token.access_token);
          gapi.client.setToken(null);
          this.events = '';
        }
      }
   


      async handleAuthResponse(resp: any): Promise<void> {
        if (resp.error) {
          console.error(resp);
          this.isConnectedToGoogleCalendar = false;
          return;
        }
      
        // Store the access token
        this.AccessTokenGoogle = resp.access_token;
    
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
  


 




      

      
  

  
      fetchAccessToken(): void {
        if (!this.isNullValue && this.userCurrent?.id) {
          this.isLoadingAccToken = true;
          const tokenInUppercase = this.userCurrent.id.toUpperCase();
      
          this.http.get(`${environment.url}/GetAccessTokenGoogleCalendar?ClientIdOfCloack=${tokenInUppercase}`).subscribe({
            next: (response: any) => {
              if (response && response[0]) {
      
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
  
                console.warn(this.expirationGoogleToken);
   
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
          console.log("Utilisateur non authentifié, récupération du token impossible");
        }
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
      }
    });
  }



  closeShouldReconnect():void{
    this.shouldReconnect = false;
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



  
  refreshToken(): void {


    const REFRESH__TOKEN = localStorage.getItem('google_refresh_token');

    if (!REFRESH__TOKEN) {
      this.shouldReconnect = true;
      console.warn("Should Reconnect : true");
      return;
    }
  
    const url = 'https://oauth2.googleapis.com/token';
    const data = new URLSearchParams();
    data.append('client_id', this.CLIENT_ID); 
    data.append('client_secret', this.CLIENT_SECRET);
    data.append('grant_type', 'refresh_token');
    data.append('refresh_token', REFRESH__TOKEN);
  
    fetch(url, { method: 'POST', body: data })
      .then((response) => response.json())
      .then((data) => {
        if (data.access_token) {
   
          this.toastr.success("Votre session Google Calendar a été rafraîchi avec succès!");

          const expiresInSeconds = data.expires_in;  
          const newExpirationTime = Date.now() + expiresInSeconds * 1000; 
          const adjustedExpirationTime = newExpirationTime - (5 * 60 * 1000);
          localStorage.setItem('google_token', data.access_token);
          localStorage.setItem('google_token_expiration', adjustedExpirationTime.toString());

          const requestBody = {
            ClientIdOfCloack: this.userCurrent?.id,
            EmailKeyCloack: this.userCurrent?.email,
            AccessTokenGoogle: this.AccessTokenGoogle,
            ClientIdOfGoogle: this.ClientIdOfGoogle,
            ExpiresIn: adjustedExpirationTime.toString()   
          };
        
          this.http.post(`${environment.url}/CreateGoogleCalendarAccount`, requestBody).subscribe({
            next: () => {
            },
            error: (err) => {
              console.error('Error creating account:', err);
            },
          });


          this.isConnectedToGoogleCalendar = true;
          this.startTokenCheckLoop();
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





    
    
    

















































  async addEventToGoogleCalendar(event: any) {
    try {
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: event.title, 
          start: { dateTime: event.start },
          end: { dateTime: event.end },
        },
      });
      console.log('Événement ajouté :', response);
    } catch (error) {
      console.error('Erreur lors de l’ajout de l’événement :', error);
    }
  }



  addTestEventToGoogleCalendar() {
    const event = {
      title: 'Nouvel Événement',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
    };
    this.addEventToGoogleCalendar(event);
  }





 

  AreClientsEmpty(){
    if(this.Clients.length === 0 || this.Clients === null || this.Clients === undefined){
      return true;
    }
    else{
      return false;
    }
  }



  
  ImprimerListeClients(): void {
    if (this.AreClientsEmpty()) {
      return;
    }
  
    const doc = new jsPDF('landscape');  // Set to landscape mode
    doc.setFontSize(17);
    doc.text('Liste des clients', doc.internal.pageSize.width / 2, 10, { align: 'center' });
  
    let ROWS = [];
  
    // Reduced columns to make the layout more compact
    const columns = [
      'Prénom',
      'Nom',
      'Téléphone',
      'Email',
      'Adresse', 
      'Situation', 
      'Age', 
    ];
  

    for (let i = 0; i < this.Clients.length; i++) {
      const defaultValues = {
        Prenom: "---",
        Nom: "---",
        Telephone1: "---",
        Email1: "---",
        Adresse: "---",
        SituationFamiliale: "---",
        DateNaissance: "----",
        // DateResidence: "---",
      };
    
      let row = [];
      for (const key in defaultValues) {
        // If the key is DateNaissance, calculate the age
        if (key === 'DateNaissance') {
          const age = this.calculateAge(this.Clients[i][key]);
          row.push(age);  // Use the calculated age instead of the birth date
        } 
        // if(key === "DateResidence"){
        //   const dateX = this.formatDate(this.Clients[i][key]);
        //   row.push(dateX);
        // }
        else {
          row.push(this.Clients[i][key] || defaultValues[key]);
        }
      }
      ROWS.push(row);
    }
  
    // Personnalisation de la table avec autoTable
    autoTable(doc, {
      head: [columns],
      body: ROWS,
      startY: 20,
      theme: 'grid', // Table style with borders
      headStyles: {
        fillColor: [138, 43, 226], // Header color
        textColor: [255, 255, 255], // Text color in white
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        halign: 'center', // Center text in cells
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // Alternate row color
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 33 },
        3: { cellWidth: 55 },
        4: { cellWidth: 72 },
      },
      margin: { top: 25 }, // Top margin
    });
  
    // Save the PDF
    doc.save('liste-clients.pdf');
  }
  







  
  triggerFileInput() {
    const fileInput = document.querySelector(".updateimg") as HTMLInputElement;
    fileInput.click();
  }



  onProfileImageChange(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png"];
      const mimeType = file.type;

      // Check if the file is an image and has the allowed extension
      if (!allowedExtensions.includes(fileExtension) || !mimeType.startsWith("image/")) {
        this.toastr.error("Veuillez sélectionner un fichier image valide (jpg, jpeg, png).");
        return;
      }

      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("ClientId", this.CurrentClient.ClientId);

      const clientId = this.CurrentClient.ClientId;
      const oldExtensions = ["jpg", "jpeg", "png"];

      // Créer une requête HTTP pour chaque extension
      const checkAndDeleteRequests = oldExtensions.map((ext) => {
        return this.clientService.checkImageExists(clientId, ext).pipe(
          switchMap((exists: boolean) => {
            if (exists) {
              return this.clientService.DeleteProfileImage(clientId, ext);
            } else {
              return of(null); // Si l'image n'existe pas, on continue
            }
          }),
          catchError((err) => {
            console.log(`Erreur lors de la suppression de l'image avec extension ${ext}:`, err);
            return of(null); // En cas d'erreur, continuer quand même
          })
        );
      });

      // Exécuter les suppressions en parallèle
      forkJoin(checkAndDeleteRequests).subscribe(() => {
        // Après avoir supprimé les anciennes images, uploader la nouvelle
        this.clientService.UploadProfileImage(formData).subscribe(
          (response: any) => {
            // Utilisez le chemin complet avec un timestamp pour forcer le rechargement de l'image
            const timestamp = new Date().getTime();
            const imageUrl = `${environment.url}/Pieces/${clientId}/profile.${fileExtension}?t=${timestamp}`;

            // Mettre à jour l'URL de l'image de profil
            this.CurrentClient.ImgSrc = imageUrl;
            console.log("Image mise à jour:", this.CurrentClient.ImgSrc);
            this.toastr.success("Image de profil mise à jour avec succès");
          },
          (error: any) => {
            this.toastr.error("Erreur lors de l'upload de l'image de profil");
          }
        );
      });
    }
  }

  
  LoadTous() {
    const butonTous = document.getElementById("pills-personal-tab");
    if (butonTous) {
      butonTous.click();
      console.log("bouton cliqued");
    }
  }

  images = ["assets/images/user/2.png", "assets/images/user/user-dp.png", "assets/images/user/1.png", "assets/images/user/2.png", "assets/images/user/2.png", "assets/images/user/2.png", "assets/images/user/2.png"];

  
  




  getClients() {
    this.isLoading = true;
    this.clientService.getClients().subscribe(
      (response) => {
        console.log("response getClients: ", response);
  
        // Charger tous les clients
        this.Clients = response.map((client, index) => {
          if (client.Photo == null) client.ImgSrc = "assets/images/user/user.png";
          else client.ImgSrc = `${environment.url}/${client.Photo}`;
  
          // Set the first client as selected
          if (index === 0) {
            client.IsSelected = true;
            this.CurrentClient = client;
          } else {
            client.IsSelected = false;
          }
  
          return client;
        });
  
        setTimeout(() => {
          this.isLoading = false;
        }, 300);
      },
      (error) => {
        console.error("Error fetching clients: ", error);
        setTimeout(() => {
          this.isLoading = false;
        }, 300);
      }
    );
  }

  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
  
    // Ensure the date is valid before formatting
    if (isNaN(date.getTime())) {
      return "---"; // Return empty string or a fallback if the date is invalid
    }
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  }
  
  


  calculateAge(dateString) {
    const birthDate = new Date(dateString);
    
    // Check if the date is valid
    if (!birthDate) {
      return "---";
    }
    
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();
    
    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  


  
  // Function to format Moroccan and French phone numbers
  formatPhoneNumber(phone: string): string {
    if (!phone) return "";

    // Check if the phone number starts with the Moroccan or French code
    if (phone.startsWith("+212")) {
      // Format for Moroccan numbers: +212 6 01 01 00 46
      return phone.replace(/^(\+212)(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5 $6");
    } else if (phone.startsWith("+33")) {
      // Format for French numbers: +33 6 25 00 25 04
      return phone.replace(/^(\+33)(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5 $6");
    }

    // Return the phone as-is if it doesn't match either format
    return phone;
  }
  // Unformat the phone number before saving to remove spaces (optional)
  unformatPhoneNumber(phone: string): string {
    return phone.replace(/\s/g, ""); // Remove all spaces
  }
  navigateToDetails(clientId: string) {
    this.router.navigate(["/clients/details/", clientId]);
  }
  showHistory() {
    this.history = !this.history;
  }

  OnClientSelected(id: string) {
    if (this.IsEditingClient) {
      this.toastr.warning("Veuillez compléter la modification");
      return;
    }

    this.Clients = this.Clients.map((item) => {
      item.IsSelected = false;
      if (item.ClientId === id) {
        item.IsSelected = true;
        this.CurrentClient = item;
      }
      return item;
    });
  }

  // Méthode pour vérifier l'existence de l'image sans générer d'erreur visible dans la console
  checkImageExists(url: string, callback: (exists: boolean) => void) {
    const img = new Image();

    // Si l'image est chargée avec succès
    img.onload = () => {
      callback(true); // L'image existe
    };

    // Si l'image échoue à charger (404 ou autre erreur)
    img.onerror = () => {
      callback(false); // L'image n'existe pas
    };

    // Désactiver la mise en cache pour éviter les erreurs dues à des images précédemment manquantes
    img.src = `${url}?t=${new Date().getTime()}`;
  }

  sweetAlertDelete(id: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-light me-2",
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: "Tu es sûr ?",
        text: "Vous ne pourrez pas revenir en arrière !",
        showCancelButton: true,
        confirmButtonText: "Supprimer",
        cancelButtonText: "Annuler",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.value) {
          this.clientService.deleteClient(id).subscribe(
            () => {
              this.CurrentClient = null;
              this.Clients = this.Clients.filter((x) => x.ClientId != id);
              this.toastr.success("Client supprimé");
              // swalWithBootstrapButtons.fire('Supprimé !', 'Le client est supprimé.', 'success');
            },
            (error) => {
              console.error("Error deleting client: ", error);
              this.toastr.error("Erreur de suppression du client");
              // swalWithBootstrapButtons.fire('Erreur', 'Erreur lors de la suppression du client.', 'error');
            }
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // swalWithBootstrapButtons.fire('Annulé', 'Le client est en sécurité :)', 'error');
        }
      });
  }

  DeleteClient(id: string) {
    this.CurrentClient = null;
    this.Clients = this.Clients.filter((x) => x.ClientId != id);
  }

  //#region UpdateClient
  public IsEditingClient: boolean = false;
  ClientToUpdate: Client = null;
  StartUpdateClient() {
    this.ClientToUpdate = structuredClone(this.CurrentClient);
    // Format phone numbers for display
    this.ClientToUpdate.Telephone1 = this.formatPhoneNumber(this.ClientToUpdate.Telephone1);
    this.ClientToUpdate.Telephone2 = this.formatPhoneNumber(this.ClientToUpdate.Telephone2);
    console.log("ClientToUpdate: ", this.ClientToUpdate);

    this.IsEditingClient = true;
  }
  SubmitUpdateClient() {
    if (this.ClientToUpdate.Nom == null || this.ClientToUpdate.Nom == "" || this.ClientToUpdate.Prenom == null || this.ClientToUpdate.Prenom == "") {
      this.toastr.warning("Veuillez saisir le nom et prénom du client.");
      return;
    }
    // Format phone numbers before saving
    this.ClientToUpdate.Telephone1 = this.formatPhoneNumber(this.ClientToUpdate.Telephone1);
    this.ClientToUpdate.Telephone2 = this.formatPhoneNumber(this.ClientToUpdate.Telephone2);
    this.isLoading = true;
    this.clientService.UpdateClient(this.ClientToUpdate).subscribe(
      (response) => {
        console.log("response UpdateClient: ", response);
        setTimeout(() => {
          this.isLoading = false;
        }, 400);
        
        if (response == null || response == false) {
          this.toastr.error("Erreur de modification du client");
        } else {
          this.toastr.success("Enregistrement réussi");

          this.CurrentClient = structuredClone(this.ClientToUpdate);
          this.Clients = this.Clients.map((item) => {
            if (item.ClientId == this.ClientToUpdate.ClientId) {
              item.Nom = this.ClientToUpdate.Nom;
              item.Prenom = this.ClientToUpdate.Prenom;
              item.Telephone1 = this.ClientToUpdate.Telephone1;
              item.Telephone2 = this.ClientToUpdate.Telephone2;
              item.Email1 = this.ClientToUpdate.Email1;
              item.Email2 = this.ClientToUpdate.Email2;
            }
            return item;
          });
          this.IsEditingClient = false;
          this.ClientToUpdate = null;
        }
      },
      (error: any) => {
        console.log("Error UpdateClient: ", error);
        this.toastr.error(`Erreur de modification du client. ${error?.error}`);
        setTimeout(() => {
          this.isLoading = false;
        }, 400);
      }
    );
  }
  CancelUpdateClient() {
    this.IsEditingClient = false;
    this.ClientToUpdate = null;
  }
  //#endregion UpdateClient

  OnSaveAddClient(newClientData) {
    console.log("OnSaveAddClient: ", newClientData);
    this.Clients.push(newClientData);
  }
}
