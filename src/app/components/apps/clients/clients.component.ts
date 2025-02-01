import { Component, OnInit, ViewChild, Renderer2, ElementRef } from "@angular/core";
import { AddClientComponent } from "./modal/add-client/add-client.component";
import { AddCategoryComponent } from "./modal/add-category/add-category.component";
import { PrintContactComponent } from "./modal/print-contact/print-contact.component";
import { Title } from "@angular/platform-browser";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { ClientService } from "src/app/shared/services/client.service";
import { Client } from "src/app/shared/model/dto.model";
import { environment } from "src/environments/environment";
import { forkJoin, of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { AuthService } from "src/app/shared/services/auth.service";
import { keycloakUser } from "src/app/shared/model/models.model";
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

  public history: boolean = false;

  CurrentClient: any = null;
  titre: String;
  Clients: any[] = [];
  User: keycloakUser = null;
  isLoading: boolean = true;


  isLoadingAccToken:boolean = false;
  isConnectedToGoogleCalendar: boolean = false;
  dataFetchedAccToken : any = null; 

  
  CLIENT_ID = '267508651605-2vqqep29h97uef9tt7ahis82dskjsm1r.apps.googleusercontent.com';
  API_KEY = 'AIzaSyBhI34z9rSK7S-rfmngJ1nmb48zfb5nUz8';
  DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  SCOPES = 'https://www.googleapis.com/auth/calendar';


  ClientIdOfCloack: any = null;
  EmailKeyCloack: any = null;
  ClientIdOfGoogle: any = null;
  AccessTokenGoogle: any = null;


  tokenClient: any;
  gapiInited = false;
  gisInited = false;
  events: string = '';

  filters: { persons: string[]; tasks: string[] } = { persons: [], tasks: [] };
  allPersons: { id: string; nom: string; prenom: string }[] = [];  
  allTasks: { id: string; nom: string }[] = [];    
  originalEvents: any[] = [];
  user: any = null;
  userCurrent: keycloakUser = null;
  isNullValue: boolean = true;

  private isNullValueSubject = new BehaviorSubject<boolean>(this.isNullValue);  







  constructor(private title: Title, private router: Router, private clientService: ClientService, private loader: NgxSpinnerService,private http: HttpClient, private toastr: ToastrService, private renderer: Renderer2, private authService: AuthService) {
    this.title.setTitle("Clients | ACM");
    this.titre = this.title.getTitle();

    this.authService.GetCurrentUser().then((userXX: any) => {
      this.userCurrent = userXX; 
      this.updateIsNullValue(false);
    });
  }
  


  ngOnInit(): void {
      this.getClients();
      this.LoadTous();
      this.loadGoogleApis();
      this.isNullValueSubject.subscribe((value) => {
          this.isNullValue = value;
          this.fetchAccessToken();
      });
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
        apiKey: this.API_KEY,
        discoveryDocs: [this.DISCOVERY_DOC],
      });
      this.gapiInited = true;
      this.maybeEnableButtons();
    });
  }



  gisLoaded(): void {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
      callback: (resp: any) => {
        this.AccessTokenGoogle = resp.access_token;
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





  handleAuthClick(): void {
    if (!this.tokenClient) return;
  
    this.isLoading = true;
    this.tokenClient.requestAccessToken({
      prompt: 'consent',
      callback: (response: any) => {
        // Check if there's an error in the response
        if (response.error) {
          console.error('Google authentication error:', response.error);
          this.isLoading = false;
          alert('Une erreur est survenue lors de la synchronisation avec Google Calendar.')
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


    this.AccessTokenGoogle = resp.access_token;
    localStorage.setItem('google_token', resp.access_token);
    const expiresIn = resp.expires_in;  
    const expirationTime = Date.now() + expiresIn * 1000;
    localStorage.setItem('google_token_expiration', expirationTime.toString());
    this.isConnectedToGoogleCalendar = true;

    console.warn("--------------------------------");
    console.warn(this.userCurrent.id);
    console.warn(this.userCurrent.email);
    console.warn(this.ClientIdOfGoogle);
    console.warn(this.AccessTokenGoogle);
    console.warn("--------------------------------");

    const authButton = document.getElementById('authorize_button');
    
    if (authButton) {
      authButton.innerText = '';
      authButton.style.color = 'white';
      authButton.style.background = 'white';
      authButton.style.pointerEvents = 'none';
      authButton.style.cursor = 'default';
    }



    const requestBody = {
      ClientIdOfCloack : this.userCurrent.id, 
      EmailKeyCloack : this.userCurrent.email, 
      AccessTokenGoogle : this.AccessTokenGoogle, 
      ClientIdOfGoogle : this.ClientIdOfGoogle
    };
  
    console.warn("Body Of Request : ");
    console.warn(requestBody);
    this.http.post(`${environment.url}/CreateGoogleCalendarAccount`, requestBody)
      .subscribe({
        next: (res) => {
          console.log('Account created successfully:');
          alert('La connexion avec Google Calendar est bien validée.');
          console.log(res);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error creating account:', err);
          alert("La connexion avec Google Calendar a échoué.");
          this.isLoading = false;
        }
      });  
      this.isLoading = false;
  }




  
  checkTokenExpiration(): boolean {
    const expirationTime = localStorage.getItem('google_token_expiration');
    
    if (expirationTime) {
      const currentTime = Date.now();
      const expiryDate = parseInt(expirationTime);

      if (currentTime >= expiryDate) {
        console.log('Token expiré, veuillez ré-authentifier.');
        this.refreshToken();  // Rafraîchir le token si nécessaire
        this.isConnectedToGoogleCalendar = false;
        return false;
      }
    } else {
      console.log('Aucun token trouvé, veuillez vous connecter.');
      this.isConnectedToGoogleCalendar = false;
      return false;
    }
    return true;
  }




  refreshToken(): void {
    const refreshTokenX = localStorage.getItem('google_refresh_token');   
  
    if (!refreshTokenX) {
      console.log('Aucun refresh token trouvé, veuillez vous reconnecter.');
      alert("Veuillez vous reconnecter avec Google Calendar.");
      return;
    }
  
    const url = 'https://oauth2.googleapis.com/token';
    const data = new URLSearchParams();
    data.append('client_id', this.ClientIdOfGoogle);  
    data.append('client_secret', this.AccessTokenGoogle);   
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
  
          // Mettre à jour le refresh token si disponible
          if (data.refresh_token) {
            localStorage.setItem('google_refresh_token', data.refresh_token);
          }
          this.isConnectedToGoogleCalendar = true;

        } else {
          console.log('Impossible de rafraîchir le token:', data);
          this.isConnectedToGoogleCalendar = false;
        }
      })
      .catch((error) => {
        console.error('Erreur lors du rafraîchissement du token:', error);
        this.isConnectedToGoogleCalendar = false;
      });
  }
  
  

  
  fetchAccessToken(): void {
    if (!this.isNullValue) {
      this.isLoadingAccToken = true;
      const tokenInUppercase = this.userCurrent.id.toUpperCase();
  
      this.http.get(`${environment.url}/GetAccessTokenGoogleCalendar?ClientIdOfCloack=${tokenInUppercase}`).subscribe({
        next: (response: any) => {
          // Si le token est bien récupéré
          if (response && response[0]) {
            console.warn('Fetched Access Token:', response[0]);
  
            // Mettre à jour le token dans localStorage
            localStorage.setItem('google_token', response[0]);
            const expirationTime = Date.now() + (58 * 60 * 1000); // 1 heure de validité
            localStorage.setItem('google_token_expiration', expirationTime.toString());
            this.isConnectedToGoogleCalendar = this.checkTokenExpiration();
            this.isLoadingAccToken = false;
          } else {
            console.error('Erreur lors de la récupération du token');
            this.isLoadingAccToken = false;
          }
        },
        error: (error) => {
          console.error('Erreur fetching access token:', error);
          this.isLoadingAccToken = false;
        },
        complete: () => {
          console.log('Token fetch complete');
        }
      });
    } else {
      console.warn("Utilisateur non authentifié, récupération du token impossible");
    }
  }

  




 
  handleLogout(): void {
    this.isLoadingAccToken = true
    localStorage.removeItem('google_token');
    localStorage.removeItem('google_token_expiration');
    localStorage.removeItem('google_refresh_token');
  
    this.isConnectedToGoogleCalendar = false;
    this.removeTokenFromDatabase();
    this.isLoadingAccToken = false;
  }
  




  removeTokenFromDatabase(): void {

    let XXX = this.userCurrent.id.toUpperCase();

    const body = {
      ClientIdOfCloack: XXX, 
    };

  
    this.http.post(`${environment.url}/DeleteGoogleToken`, body).subscribe({
      next: (response) => {
        console.log('Token supprimé avec succès de la base de données', response);
        alert('Vous avez été déconnecté de Google Calendar.')

      },
      error: (error) => {
        console.error('Erreur lors de la suppression du token', error);
        alert('Une erreur est survenue lors de votre déconnexion.')
      }
    });
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
