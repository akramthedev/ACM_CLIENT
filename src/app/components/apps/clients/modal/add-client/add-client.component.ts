import { Component, OnInit, OnDestroy, ViewChild, Renderer2, TemplateRef, PLATFORM_ID, Inject, EventEmitter,ElementRef, HostListener,  Output } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { NgbModal, ModalDismissReasons, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import { ToastrService } from "ngx-toastr";
import { ClientService } from "src/app/shared/services/client.service";
import { Client, ClientMission, ClientMissionPrestation, ClientTache, Conjoint, Mission, Prestation, Proche, Service } from "../../../../../shared/model/dto.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ssnValidator } from "./ssn-validator";
import { environment } from "src/environments/environment";
import { forkJoin, of } from "rxjs";
import { AuthService } from "src/app/shared/services/auth.service";
import { keycloakUser } from "src/app/shared/model/models.model";
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';



declare var google: any;
declare var gapi: any;



function getFutureDateTime() {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 54 * 24 * 60 * 60 * 1000); // deadline

  const year = futureDate.getFullYear();
  const month = String(futureDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(futureDate.getDate()).padStart(2, '0');
  const hours = '00'; // Fixed time
  const minutes = '00';
  const seconds = '00';
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}



function getCurrentDateAndTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); 
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}



@Component({
  selector: "app-add-client",
  templateUrl: "./add-client.component.html",
  styleUrls: ["./add-client.component.scss"],
})
export class AddClientComponent implements OnInit, OnDestroy {
  @ViewChild("addClient", { static: false }) AddClient: TemplateRef<any>;
  @Output("btnSaveEmitter") btnSaveEmitter: EventEmitter<any> = new EventEmitter<any>();
  ssnForm: FormGroup;
  showPrestations = false;
  selectedMission: string | null = null;



  isLoading1: Boolean = false;
  isLoading2: Boolean = false;
  isLoading3: Boolean = false;
  isLoading4: Boolean = false;
  isLoading5: Boolean = false;
  isLoading6: Boolean = false;

  isErrorGoogleCalendarSync: Boolean = false;

  
  CLIENT_ID = '267508651605-2vqqep29h97uef9tt7ahis82dskjsm1r.apps.googleusercontent.com';
  API_KEY = 'AIzaSyBhI34z9rSK7S-rfmngJ1nmb48zfb5nUz8';
  DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  SCOPES = 'https://www.googleapis.com/auth/calendar';

  showPopUpNotify: boolean = false;

  CurrentClient: any = null;
  titre: String;
  Clients: any[] = [];
  User: keycloakUser = null;
  isLoading: boolean = true;

  isLoadingAccToken:boolean = false;
  isConnectedToGoogleCalendar: boolean = false;
  dataFetchedAccToken : any = null; 

  ClientIdOfCloack: any = null;
  EmailKeyCloack: any = null;
  ClientIdOfGoogle: any = null;
  AccessTokenGoogle: any = null;
  isNullValue: boolean = true;
  userCurrent: keycloakUser = null;
  user: any = null;
  originalEvents: any[] = [];

  tokenClient: any;
  gapiInited = false;
  gisInited = false;
  events: string = '';


  private isNullValueSubject = new BehaviorSubject<boolean>(this.isNullValue);  




  AllEventsOfTheUser: any = null;

  clientData: Client = null;
  newProche: Proche = null;
  newConjoint: Conjoint = null;
  Prestations: any = null;
  Services: any = null;
  newService: Service;
  Missions: any = null;
  newClientMission: ClientMission = null;
  newClientMissionPrestation: ClientMissionPrestation = null;
  newClientTache: ClientTache = null;
  Taches: any = null;

  public closeResult: string;
  public modalOpen: boolean = false;
  public currentStep: number = 1;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,private eRef: ElementRef, private modalService: NgbModal, private clientService: ClientService, private toastr: ToastrService, private fb: FormBuilder, private loader: NgxSpinnerService, config: NgbModalConfig, private http: HttpClient, private renderer: Renderer2,  private authService: AuthService) {
    
    this.authService.GetCurrentUser().then((userXX: any) => {
      this.userCurrent = userXX; 
      this.updateIsNullValue(false);
    });

    config.backdrop = "static";
    config.keyboard = false;
    this.ssnForm = this.fb.group({
      NumeroSS: ["", [Validators.required, ssnValidator()]],
      ConjointNumeroSS: ["", [Validators.required, ssnValidator()]], // Champ pour le conjoint
    });
  }
  telInputObject(obj) {
    console.log(obj);
    obj.setCountry("in");
  }
  onSelectionChange(event: any, MissionId: any) {
    const value = event.target.value;
    this.selectedMission = value; // Enregistrer la mission sélectionnée
    this.startAddClientMission(MissionId);
    console.log(MissionId, " ", value);
    // this.showPrestations = value === "Installation au Maroc";
    this.showPrestations = value === "Installation au Maroc" || value === "Retour en France";
    this.clientService.getPrestationsDynamique(MissionId).subscribe(
      (response) => {
        console.log("response getPrestations: ", response);
        setTimeout(()=>{
          this.isLoading1 = false;
        }, 300)
        let i = 0;
        this.Prestations = response;
        console.log("this.PrestationsDynamique affecter a this.Prestations : ", this.Prestations);
      },
      (error) => {
        console.error("Error fetching Prestation Dynamique: ", error);
        setTimeout(()=>{
          this.isLoading1 = false;
        }, 300)
      }
    );
  }

  ngOnInit(): void {

    this.getServices();
    this.getMissions();
    this.getPrestations();
    this.getTaches();

    this.loadGoogleApis();
    this.isNullValueSubject.subscribe((value) => {
        this.isNullValue = value;
        this.fetchAccessToken();
    });

    if (this.selectedMission === "Installation au Maroc" || this.selectedMission === "Retour en France") {
      this.showPrestations = true;
    }
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
          alert('✅ Connexion à Google Calendar réussie.');
          window.location.reload();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error creating account:', err);
          alert("❌ Connexion à Google Calendar échoué.");
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
  
            localStorage.setItem('google_token', response[0].AccessTokenGoogle);
            const expirationTime = Date.now() + (58 * 60 * 1000); 
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









  prestationStates = {};
  tacheStates = {};

  toggleAllTaches(prestationId: any, isChecked: boolean) {
    this.prestationStates[prestationId] = isChecked;
    console.log("PrestationId : ", prestationId);
    this.updateClientMissionPrestation(prestationId, isChecked);
    this.Taches.forEach((tache) => {
      if (tache.PrestationId === prestationId) {
        this.tacheStates[tache.TacheId] = isChecked;
        this.updateClientTache(tache.TacheId, isChecked, prestationId);
      }
    });
  }

  toggleTache(tacheId: any, isChecked: boolean) {
    this.tacheStates[tacheId] = isChecked;
    const tache = this.Taches.find((t) => t.TacheId === tacheId);
    const prestationId = tache.PrestationId;

    if (isChecked) {
      // Cocher automatiquement la prestation correspondante
      if (!this.prestationStates[prestationId]) {
        this.prestationStates[prestationId] = true;
        this.updateClientMissionPrestation(prestationId, true);
      }
      this.updateClientTache(tacheId, isChecked, prestationId);
    } else {
      // Décochez la tâche et vérifiez si toutes les tâches de cette prestation sont décochées
      this.updateClientTache(tacheId, isChecked, prestationId);
      const allTachesUnchecked = this.Taches.filter((t) => t.PrestationId === prestationId).every((t) => !this.tacheStates[t.TacheId]);

      if (allTachesUnchecked) {
        this.prestationStates[prestationId] = false;
        this.updateClientMissionPrestation(prestationId, false);
      }
    }
  }

  updateClientMissionPrestation(prestationId: any, isChecked: boolean) {
    if (isChecked) {
      // Add prestation if it does not already exist
      const existingPrestation = this.clientData.ClientMissionPrestation.find((prestation) => prestation.PrestationId === prestationId);

      if (!existingPrestation) {
        const newPrestation = {
          ClientMissionPrestationId: uuidv4(),
          ClientMissionId: this.clientData.ClientMission[0].ClientMissionId,
          PrestationId: prestationId,
        };

        this.clientData.ClientMissionPrestation.push(newPrestation);
        console.log("Added new prestation: ", newPrestation);
      }
    } else {
      // Remove prestation
      this.clientData.ClientMissionPrestation = this.clientData.ClientMissionPrestation.filter((prestation) => prestation.PrestationId !== prestationId);
      console.log("Removed prestation with PrestationId: ", prestationId);
    }

    console.log("Updated ClientMissionPrestation: ", this.clientData.ClientMissionPrestation);
  }
  updateClientTache(tacheId: any, isChecked: boolean, prestationId: any) {
    const clientMissionPrestation = this.clientData.ClientMissionPrestation.find((prestation) => prestation.PrestationId === prestationId);

    if (!clientMissionPrestation && isChecked) {
      const newPrestation = {
        ClientMissionPrestationId: uuidv4(),
        ClientMissionId: this.clientData.ClientMission[0].ClientMissionId,
        PrestationId: prestationId,
      };

      this.clientData.ClientMissionPrestation.push(newPrestation);
      console.log("Added new prestation for tache: ", newPrestation);
    }

    if (isChecked) {
      // Add task if it does not already exist
      const existingTache = this.clientData.ClientTaches.find((tache) => tache.TacheId === tacheId);

      if (!existingTache) {
        this.startAddClientTache(tacheId, prestationId);
        this.submitAddClientTache();
      }
    } else {
      // Remove task
      this.clientData.ClientTaches = this.clientData.ClientTaches.filter((tache) => tache.TacheId !== tacheId);
      console.log("Removed tache with TacheId: ", tacheId);
    }

    console.log("Updated ClientTache: ", this.clientData.ClientTaches);
  }


  
  getServices() {
    this.isLoading2 = true;
    this.clientService.getServices().subscribe(
      (response) => {
        console.log("response getServices: ", response);
        setTimeout(()=>{
          this.isLoading2 = false;
        }, 300)
        let i = 0;
        this.Services = response;
        console.log("this.Services : ", this.Services);
      },
      (error) => {
        console.error("Error fetching Services: ", error);
        setTimeout(()=>{
          this.isLoading2 = false;
        }, 300)
      }
    );
  }
  getMissions() {
    this.isLoading3 = true;
    this.clientService.getMissions().subscribe(
      (response) => {
        console.log("response getMissions: ", response);
        setTimeout(()=>{
          this.isLoading3 = false;
        }, 300)
        let i = 0;
        this.Missions = response;
        console.log("this.Missions : ", this.Missions);
      },
      (error) => {
        console.error("Error fetching Missions: ", error);
        setTimeout(()=>{
          this.isLoading3 = false;
        }, 300)
      }
    );
  }
  getPrestations() {
    this.isLoading4 = true;
    this.clientService.getPrestations().subscribe(
      (response) => {
        console.log("response getPrestations: ", response);
        setTimeout(()=>{
          this.isLoading4 = false;
        }, 300)
        let i = 0;
        this.Prestations = response;
        console.log("this.Prestations : ", this.Prestations);
      },
      (error) => {
        console.error("Error fetching Prestation: ", error);
        setTimeout(()=>{
          this.isLoading4 = false;
        }, 300)
      }
    );
  }
  getTaches() {
    this.isLoading5 = true;
    this.clientService.getTaches().subscribe(
      (response) => {
        console.log("response getTaches: ", response);
        setTimeout(()=>{
          this.isLoading5 = false;
        }, 300)
        let i = 0;
        this.Taches = response;
        console.log("this.Taches : ", this.Taches);
      },
      (error) => {
        console.error("Error fetching Taches: ", error);
        setTimeout(()=>{
          this.isLoading5 = false;
        }, 300)
      }
    );
  }
  formatNom() {
    if (this.clientData.Nom) {
      this.clientData.Nom = this.clientData.Nom.toUpperCase();
    }
  }

  formatPrenom() {
    if (this.clientData.Prenom) {
      this.clientData.Prenom = this.clientData.Prenom.charAt(0).toUpperCase() + this.clientData.Prenom.slice(1).toLowerCase();
    }
  }

  validatePhoneNumber(country: string, event: any) {
    let value = event.target.value;

    // Pour le Maroc, vérifier si le numéro comporte 9 chiffres après l'indicatif
    if (country === "maroc" && value.length > 9) {
      this.toastr.warning("Le numéro de téléphone pour le Maroc doit comporter 9 chiffres après l'indicatif.");
      event.target.value = value.slice(0, 9); // Limiter à 9 chiffres
    }

    // Pour la France, vérifier si le numéro comporte 9 chiffres après l'indicatif
    if (country === "france" && value.length > 9) {
      this.toastr.warning("Le numéro de téléphone pour la France doit comporter 9 chiffres après l'indicatif.");
      event.target.value = value.slice(0, 9); // Limiter à 9 chiffres
    }
  }
  openModal() {
    console.log("openModal: ");
    if (isPlatformBrowser(this.platformId)) {
      this.resetForm();
      // Réinitialiser les variables
      this.selectedMission = null;
      this.showPrestations = false;
      this.clientData = new Client();
      this.clientData.ClientId = uuidv4();
      this.clientData.ImgSrc = "assets/images/user/user.png";
      this.clientData.Conjoint = [];
      this.clientData.Proches = [];
      this.clientData.ClientMission = [];
      this.clientData.ClientMissionPrestation = [];
      this.clientData.ClientTaches = [];
      console.log("this.clientData: ", this.clientData);

      this.modalService
        .open(this.AddClient, {
          size: "xl",
          ariaLabelledBy: "modal",
          centered: true,
          windowClass: "modal-bookmark",
        })
        .result.then(
          (result) => {
            this.modalOpen = true;
            `Result ${result}`;
          },
          (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            console.log(this.closeResult);
          }
        );
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      console.log("getDismissReason: ", reason);
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      console.log(reason);
      return "by clicking on a backdrop";
    } else {
      console.log(reason);
      return `with: ${reason}`;
    }
  }

  ngOnDestroy() {
    if (this.modalOpen) {
      this.modalService.dismissAll();
    }
  }

  nextStep() {
    if (this.currentStep < 5) {
      // Étape 1 : Validation de la mission sélectionnée
      if (this.currentStep === 1) {
        if (!this.selectedMission) {
          this.toastr.warning("Veuillez sélectionner une mission avant de continuer");
          return; // Arrête l'exécution ici si la mission n'est pas sélectionnée
        }

        // Soumettre la mission seulement si elle est sélectionnée
        this.submitAddClientMission();
      }

      // Étape 2 : Validation des champs nom, prénom, et numéro SS du client
      if (this.currentStep === 2) {
        const nomRempli = this.clientData?.Nom?.trim() !== "";
        const prenomRempli = this.clientData?.Prenom?.trim() !== "";
        //const numeroSSRempli = this.ssnForm.get("NumeroSS").valid;
        const numeroSSRempli = this.clientData?.NumeroSS?.trim() !== "";

        if (!this.clientData.Nom || !this.clientData.Prenom) {
          this.toastr.warning("Veuillez remplir le nom, prénom avant de continuer");
          return; // Empêche le passage à l'étape suivante si ces champs ne sont pas remplis
        }
        // if (!nomRempli || !prenomRempli || !numeroSSRempli) {
        //   this.toastr.warning("Veuillez remplir le nom, prénom avant de continuer");
        //   return; // Empêche le passage à l'étape suivante si ces champs ne sont pas remplis
        // }

        // Vérification du format du numéro SS si saisi
        if (this.clientData.NumeroSS && !this.isValidSSN(this.clientData.NumeroSS)) {
          this.toastr.warning("Le format du numéro SS est invalide. Il doit comporter 13 chiffres suivis de 2 chiffres de clé.");
          return; // Empêche le passage à l'étape suivante si le format du numéro SS est incorrect
        }
        // Vérifier que les emails ne sont pas identiques ou vides
        if (!this.validateEmails()) {
          return; // Empêche le passage à l'étape suivante si les emails sont identiques
        }
        // Si "Oui" est sélectionné pour hasConjoint, valider les champs du conjoint
        if (this.clientData.HasConjoint === "oui") {
          // const conjointNomRempli = this.newConjoint?.Nom?.trim() !== "";
          // const conjointPrenomRempli = this.newConjoint?.Prenom?.trim() !== "";
          // const conjointNumeroSSRempli = this.newConjoint?.NumeroSS?.trim() !== "";

          // if (!conjointNomRempli || !conjointPrenomRempli || !conjointNumeroSSRempli) {
          //   this.toastr.warning("Veuillez remplir le nom, prénom, et numéro SS du conjoint avant de continuer");
          //   return; // Empêche le passage à l'étape suivante si les champs du conjoint sont vides
          // }
          if (!this.newConjoint.Nom || !this.newConjoint.Prenom) {
            this.toastr.warning("Veuillez remplir le nom, prénom du conjoint avant de continuer");
            return; // Empêche le passage à l'étape suivante si les champs du conjoint sont vides
          }
          // Vérification du numéro SS du conjoint à travers le validateur de ssnForm
          if (this.newConjoint.NumeroSS) {
            if (this.ssnForm.get("ConjointNumeroSS").invalid) {
              this.toastr.warning("Le numéro SS du conjoint est invalide.");
              return;
            }
          }

          // Ajouter le conjoint si tous les champs sont valides
          // this.submitAddConjoint();
        }

        // Si "Non" est sélectionné pour hasConjoint, réinitialiser les données du conjoint
        if (this.clientData.HasConjoint === "non") {
          this.newConjoint = null;
        }
      }

      // Seulement si toutes les validations passent, incrémenter l'étape
      this.currentStep++;
    }
  }

  validateEmails() {
    // Si les deux emails sont vides ou nulls, permettre de passer
    if ((!this.clientData.Email1 || this.clientData.Email1.trim() === "") && (!this.clientData.Email2 || this.clientData.Email2.trim() === "")) {
      return true;
    }

    // Si les deux emails ne sont pas vides et identiques, afficher un message d'erreur
    if (this.clientData.Email1 === this.clientData.Email2) {
      // this.toastr.warning("Les adresses email 1 et email 2 ne doivent pas être identiques.");
      return true;
    }

    // Si les emails sont différents ou l'un d'eux est vide, continuer
    return true;
  }
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  startAddConjoint() {
    this.newConjoint = {
      ConjointId: uuidv4(),
      ClientId: this.clientData.ClientId,
      Nom: null,
      Prenom: null,
      DateNaissance: null,
      Profession: null,
      DateRetraite: null,
      NumeroSS: null,
      DateMariage: null,
      Adresse: null,
      RegimeMatrimonial: null,
      DonationEpoux: null,
      ModifRegimeDate: null,
      QuestComp: null,
    };

    console.log("Start add conjoint : ", this.newConjoint);
  }

  submitAddConjoint() {
    if (!this.newConjoint.Nom || !this.newConjoint.Prenom) {
      this.toastr.warning("Veuillez remplir toutes les informations du conjoint avant de continuer.");
      return;
    }
    // Vérification du numéro SS du conjoint à travers le validateur de ssnForm
    if (this.newConjoint.NumeroSS) {
      if (this.ssnForm.get("ConjointNumeroSS").invalid) {
        this.toastr.warning("Le numéro SS du conjoint est invalide.");
        return;
      }
    }

    // Ajouter le conjoint au clientData
    if (!this.clientData.Conjoint) {
      this.clientData.Conjoint = [];
    }
    this.clientData.Conjoint.push(this.newConjoint);
  }

  cancelAddConjoint() {
    this.newConjoint = null;
  }
  onHasConjointChange(value: string) {
    if (value === "non") {
      // Réinitialiser les données du conjoint lorsque "Non" est sélectionné
      this.cancelAddConjoint();
    } else if (value === "oui") {
      // Initialiser un nouveau conjoint s'il n'y en a pas déjà un
      this.startAddConjoint();
    }
  }
  startAddProche() {
    this.newProche = {
      ProcheId: uuidv4(),
      ClientId: this.clientData.ClientId,
      Nom: null,
      Prenom: null,
      DateNaissance: null,
      Telephone1: null,
      Telephone2: null,
      Email1: null,
      Email2: null,
      Adresse: null,
      Charge: null,
      LienParente: null,
      Particularite: null,
      NombreEnfant: null,
      Commentaire: null,
    };
  }
  submitAddProche() {
    if (this.newProche.Nom == null || this.newProche.Nom == "" || this.newProche.Prenom == null || this.newProche.Prenom == "" || this.newProche.LienParente == null || this.newProche.LienParente == "" || this.newProche.Particularite == null || this.newProche.Particularite == "") {
      this.toastr.warning("Veuillez saisir le nom, prénom, lien parenté et particularité du proche");
      return;
    }
    this.clientData.Proches.push(this.newProche);
    this.newProche = null;
  }
  cancelAddProche() {
    this.newProche = null;
  }

  startAddClientMission(MissionId) {
    this.newClientMission = {
      ClientMissionId: uuidv4(),
      MissionId: MissionId,
      ClientId: this.clientData.ClientId,
    };
  }

  submitAddClientMission() {
    // Vérifie si clientData et ClientId sont définis
    if (!this.clientData || !this.clientData.ClientId) {
      this.toastr.warning("Erreur : Le ClientId n'est pas défini. Veuillez vérifier les informations du client.");
      return; // Arrêter si ClientId est null ou undefined
    }

    if (!this.newClientMission) {
      this.newClientMission = {
        ClientMissionId: uuidv4(),
        MissionId: this.selectedMission,
        ClientId: this.clientData.ClientId,
      };
    }

    // Ajouter la nouvelle mission au tableau des missions du client
    if (!this.clientData.ClientMission) {
      this.clientData.ClientMission = [];
    }

    this.clientData.ClientMission.push(this.newClientMission);
    this.newClientMission = null; // Réinitialiser après ajout
  }




  cancelAddClientMission() {
    this.newClientMission = null;
  }

  startAddClientMissionPrestation(PrestationId) {
    this.newClientMissionPrestation = {
      ClientMissionPrestationId: uuidv4(),
      ClientMissionId: this.clientData.ClientMission[0].ClientMissionId,
      PrestationId: PrestationId,
    };
  }
  submitAddClientMissionPrestation() {
    if (this.newClientMissionPrestation.ClientMissionId == null || this.newClientMissionPrestation.ClientMissionPrestationId == null || this.newClientMissionPrestation.PrestationId == null) {
      this.toastr.warning("Veuillez verifier submitClient du ClientMissionPrestation");
      return;
    }
    console.log(this.newClientMissionPrestation);
    this.clientData.ClientMissionPrestation.push(this.newClientMissionPrestation);
    console.log("Submit AddClientMissionPrestation (ClientData.ClientMissionPrestation)", this.clientData);
    this.newClientMissionPrestation = null;
  }
  cancelAddClientMissionPrestation() {
    this.newClientMissionPrestation = null;
  }

  startAddClientTache(TacheId, prestationId) {
    const clientMissionPrestation = this.clientData.ClientMissionPrestation.find((prestation) => prestation.PrestationId === prestationId);
    if (!clientMissionPrestation) {
      console.error(`No ClientMissionPrestation found for PrestationId: ${prestationId}`);
      return;
    }

    let desc = ``;
    let title = `${this.clientData.Nom} ${this.clientData.Prenom}`;
    
    this.newClientTache = {
      ClientTacheId: uuidv4(),
      ClientMissionPrestationId: clientMissionPrestation.ClientMissionPrestationId,
      ClientMissionId: this.clientData.ClientMission[0].ClientMissionId,
      TacheId: TacheId,
      Intitule : title ,
      Commentaire : desc ,
      Start_date : getCurrentDateAndTime(),
      End_date : getFutureDateTime(), 
      Color : '#7265fd',
      IsReminder : false, 
      IsDone : false
    };
  }





  submitAddClientTache() {
    
    if (this.newClientTache.ClientMissionId == null || this.newClientTache.ClientMissionPrestationId == null || this.newClientTache.TacheId == null || this.newClientTache.ClientTacheId == null) {
      this.toastr.warning("Veuillez verifier submitClient du ClientMissionPrestation");
      return;
    }
    else{
      console.warn("------------------");
      console.log('A')
      console.log(this.newClientTache);
      console.warn("------------------");
    }

    const existingTache = this.clientData.ClientTaches.find((tache) => tache.TacheId === this.newClientTache.TacheId);
    if (!existingTache) {
      this.clientData.ClientTaches.push(this.newClientTache);
      console.log("B Test");
      console.log(this.clientData.ClientTaches);
    } else {
      console.log("C");
    }

    console.log("D");
    console.log(this.newClientTache);
    
    this.newClientTache = null;
    
  }





  cancelAddClientTache() {
    this.newClientTache = null;
  }
  isValidSSN(ssn: string): boolean {
    const ssnRegex = /^\d{13}\/\d{2}$/; // Exige 13 chiffres suivis de '/2 chiffres'
    return ssnRegex.test(ssn);
  }






  onSave() {


    


    if (this.isFormValid()) {
      this.isLoading6 = true;

      console.log("Begin F");
      console.log(this.clientData.ClientTaches);
      console.log("End F")

      if (this.clientData.Telephone1 && this.clientData.Telephone1.trim() !== "") {
        this.clientData.Telephone1 = `+212${this.clientData.Telephone1}`;
      } else {
        this.clientData.Telephone1 = ""; // Leave empty if not provided
      }

      if (this.clientData.Telephone2 && this.clientData.Telephone2.trim() !== "") {
        this.clientData.Telephone2 = `+33${this.clientData.Telephone2}`;
      } else {
        this.clientData.Telephone2 = ""; // Leave empty if not provided
      }
      if (this.clientData.HasConjoint && this.newConjoint) {
        this.submitAddConjoint();
      }
      if (this.newClientMissionPrestation) {
        this.submitAddClientMissionPrestation();
      }
      if (this.newClientTache) {
        console.log("E");
        this.submitAddClientTache();
      }
      
      
      this.clientService.CreateClient(this.clientData).subscribe(
        (response) => {
          if (response) {
            this.AllEventsOfTheUser = response;

            if(this.isNullValue === true){
               this.loadGoogleApis();
              this.isNullValueSubject.subscribe((value) => {
                  this.isNullValue = value;
                  this.fetchAccessToken();
              });
            }
          

              if(this.isConnectedToGoogleCalendar === true){
                
                console.warn("----------------------------------")
                console.warn(response.events);
                console.warn("----------------------");
                
                
                

                if (response.events.length > 0) {

                  function convertToGoogleDateTime(dateString) {
                    return new Date(dateString).toISOString(); 
                  }

                  for (let i = 0; i < response.events.length; i++) {


                    console.warn(response.events[i]);
                    console.warn("-----------------");
                    const startDateTime = convertToGoogleDateTime(response.events[i].EventTimeStart);
                    const endDateTime = convertToGoogleDateTime(response.events[i].EventTimeEnd);
                    
                    let eventXX = {
                      summary: response.events[i].EventName,
                      description: `Préparer les documents du client : ${response.events[i].EventName}`,
                      colorId: "1",
                      start: { dateTime: startDateTime, timeZone: "Africa/Casablanca" },
                      end: { dateTime: endDateTime, timeZone: "Africa/Casablanca" },
                      reminders: { useDefault: false, overrides: [{ method: "email", minutes: 45 }, { method: "popup", minutes: 30 }] },
                      visibility: "public",
                      status: "confirmed",
                    };
                    
                    this.addEventToGoogleCalendar(eventXX);
                  }
                }
                
                else{
                  //aucun evenement ... 
                  // we dont do anything...
                }
              }
              else{
                // we dont do anything...
              }
            
          } else {
            this.AllEventsOfTheUser = null
          }
          this.toastr.success("Client ajouté avec succès ! ");
          this.btnSaveEmitter.emit(this.clientData);
          this.modalService.dismissAll();
          this.resetForm();
          setTimeout(() => {
            this.isLoading6 = false;
          }, 300);
        },
        (error) => {
          setTimeout(() => {
            this.isLoading6 = false;
          }, 300);
          console.error("Erreur lors de l'ajout du client", error);
          Swal.fire("Erreur", "Erreur lors de l'ajout du client", "error");
        }
      );
      

      
    } else {
      Swal.fire("Erreur", "Veuillez remplir tous les champs obligatoires.", "error");
    }
  }




  

  async addEventToGoogleCalendar(event: any) {
    try {
      const accessToken = localStorage.getItem('google_token');
      
      if (!accessToken) {
        console.error('No Google access token found');
        alert('Please authenticate with Google Calendar.');
        return;
      }
  
      gapi.auth.setToken({
        access_token: accessToken,
      });
  
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: event.summary,
          description: event.description,
          colorId: event.colorId,
          start: event.start,
          end: event.end,
          reminders: event.reminders,
          visibility: event.visibility,
          status: event.status,
        },
      });        
      console.log("Done");
    } catch (error) {
      console.log("Not Done");
      this.isErrorGoogleCalendarSync = true;      
      console.error('Erreur lors de l’ajout de l’événement :', error);
    }
  }
  




  onSaveDiss() {
    if (this.isFormValid()) {
      console.log("addClient.OnSaveDiss: ", this.clientData);
      this.btnSaveEmitter.emit(this.clientData);
      this.modalService.dismissAll();
      this.resetForm();
    } else {
      this.sweetAlertDiss();
    }    
  }

  sweetAlertDiss() {
    Swal.fire({
      title: "Tu veux enregistrer le client ?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Enregistrer",
      denyButtonText: `Ne pas enregistrer`,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Enregistré !", "", "success");
      } else if (result.isDenied) {
        Swal.fire("Tu n'as pas enregistrer le client", "", "info");
      }
    });
  }

  private isFormValid(): boolean {
    if (this.currentStep === 2 && (!this.clientData.Nom || !this.clientData.Prenom)) {
      return false;
    }
    if (this.currentStep === 3 && (!this.clientData.Nom || !this.clientData.Prenom)) {
      return false;
    }
    if (this.currentStep === 4 && (!this.clientData.Nom || !this.clientData.Prenom)) {
      return false;
    }
    if (this.currentStep === 5 && (!this.clientData.Nom || !this.clientData.Prenom)) {
      return false;
    }
    return true;
  }

  private resetForm() {
    this.currentStep = 1;
    this.prestationStates = {};
    this.tacheStates = {};
    this.selectedMission = null; // Réinitialiser la mission sélectionnée
    this.showPrestations = false; // Réinitialiser l'affichage des prestations
    this.newProche = null;
    this.newConjoint = null;
    this.newClientMission = null;
    this.newClientMissionPrestation = null;
    this.newClientTache = null;
    // Réinitialiser les données client
    this.clientData = {
      CabinetId: null,
      ClientId: null,
      HasConjoint: null,
      Nom: null,
      Prenom: null,
      DateNaissance: null,
      DateResidence: null,
      Profession: null,
      DateRetraite: null,
      NumeroSS: null,
      SituationFamiliale: null,
      RegimeMatrimonial: null,
      Adresse: null,
      Email1: null,
      Email2: null,
      Telephone1: null,
      Telephone2: null,
      ClientMission: [],
      ClientMissionPrestation: [],
      ClientTaches: [],
      Conjoint: [],
      Proches: [],
    };
    this.ssnForm.reset();
  }
}
