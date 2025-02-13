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
  const futureDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // deadline 30 days

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

  selectedDate: Date;
  finalSavedDate: any = null;
  isLoadingTokenGoogleCalendar: Boolean = false;

  isLoading1: Boolean = false;
  isLoading2: Boolean = false;
  isLoading3: Boolean = false;
  isLoading4: Boolean = false;
  isLoading5: Boolean = false;
  isLoading6: Boolean = false;

  ShouldReConnect:Boolean = false;

  isErrorGoogleCalendarSync: Boolean = false;
  showPopUpDateSelection: Boolean = false;
  
  DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  SCOPES = 'https://www.googleapis.com/auth/calendar';
  CLIENT_SECRET = environment.CLIENT_SECRET;
  CLIENT_ID = environment.CLIENT_ID;
  API_KEY =  environment.API_KEY ;

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
    obj.setCountry("in");
  }
  onSelectionChange(event: any, MissionId: any) {
    const value = event.target.value;
    this.selectedMission = value; // Enregistrer la mission sélectionnée
    this.startAddClientMission(MissionId);
    // this.showPrestations = value === "Installation au Maroc";
    this.showPrestations = value === "Installation au Maroc" || value === "Retour en France";
    this.clientService.getPrestationsDynamique(MissionId).subscribe(
      (response) => {
        setTimeout(()=>{
          this.isLoading1 = false;
        }, 300)
        let i = 0;
        this.Prestations = response;
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
        this.showPopUpDateSelection = false;
      }
  }
  
  




  selectDateCLicked(event: any) {
    console.warn("---------------------------------");
    this.selectedDate = event.target.value;
    console.warn("1  | Selected Date : ", event.target.value);
  }



  



  SauvegarderEndDate(): void {
    if (this.selectedDate === null || this.selectedDate === undefined) {
      console.warn("2  | No date has been selected...");
      return;
    }
  
    const dateObj = new Date(this.selectedDate);
    
    dateObj.setHours(8);
    dateObj.setMinutes(45);
    dateObj.setSeconds(0);

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');  
    const day = String(dateObj.getDate()).padStart(2, '0');  
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
    console.warn("3  | Formated Date : "+formattedDate);
  
    this.finalSavedDate = formattedDate;
    this.showPopUpDateSelection = false;


    if (this.clientData.ClientTaches && this.clientData.ClientTaches.length > 0) {
      console.warn('Upadting EndDate Of Previously added events...');
      this.clientData.ClientTaches.forEach((task) => {
        console.log("Before => "+task.End_date);
        task.End_date = formattedDate;
        console.log("After => "+task.End_date);
        console.warn("--------------");
      });
    }

  }

  




  FermerPopUpSelectDate():void{
    this.selectedDate = null;
     console.warn("0  | Closing Pop Up Selection Date...")
    console.warn(".5 | selectedDate : "+this.selectedDate);
    this.showPopUpDateSelection = false;
  }




  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return ''; // Handle empty case
  
    const dateObj = new Date(dateTimeString);
    if (isNaN(dateObj.getTime())) return ''; // Handle invalid date case
  
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const year = dateObj.getFullYear();
  
    return `${hours}:${minutes} • ${day}/${month}/${year}`;
  }
  

 

  OpenpopUpOfTheDateSelector():void{
    this.showPopUpDateSelection = true;
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
       },
    });
    this.gisInited = true;
  }


  


 
 
   
 

      fetchAccessToken(): void {
        if (!this.isNullValue  ) {
          this.isLoadingAccToken = true;
      
          const tokenX = localStorage.getItem('google_token');

          if(tokenX){
            const expD = localStorage.getItem('google_token_expiration');
            this.isConnectedToGoogleCalendar = this.checkTokenExpiration(Number(expD));                
            this.isLoadingAccToken = false;
          }
          else{
            this.isConnectedToGoogleCalendar = false;                
            this.isLoadingAccToken = false;
          }

        } else {
          console.log("Utilisateur non authentifié, récupération du token impossible");
        }
      }


   
 
      checkTokenExpiration(expirationTime: number): boolean {
        const currentTime = Date.now();
        if (currentTime >= expirationTime) {
          console.log('Token expiré, veuillez ré-authentifier.');
           this.isConnectedToGoogleCalendar = false;
          return false;
        }
        return true;
      }
    
    
    






  prestationStates = {};
  tacheStates = {};

  toggleAllTaches(prestationId: any, isChecked: boolean) {
    this.prestationStates[prestationId] = isChecked;
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
      }
    } else {
      // Remove prestation
      this.clientData.ClientMissionPrestation = this.clientData.ClientMissionPrestation.filter((prestation) => prestation.PrestationId !== prestationId);
    }

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
    }

  }


  
  getServices() {
    this.isLoading2 = true;
    this.clientService.getServices().subscribe(
      (response) => {
        setTimeout(()=>{
          this.isLoading2 = false;
        }, 300)
        let i = 0;
        this.Services = response;
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
        setTimeout(()=>{
          this.isLoading3 = false;
        }, 300)
        let i = 0;
        this.Missions = response;
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
        setTimeout(()=>{
          this.isLoading4 = false;
        }, 300)
        let i = 0;
        this.Prestations = response;
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
        setTimeout(()=>{
          this.isLoading5 = false;
        }, 300)
        let i = 0;
        this.Taches = response;
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
          }
        );
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
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
    this.clientData.ClientMissionPrestation.push(this.newClientMissionPrestation);
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
    let dateENDoFxxx = "";
    
    console.warn("4  | Entering Checkpoint of Final Saved Date...");

    if(this.finalSavedDate !== null && this.finalSavedDate !== "" && this.finalSavedDate !== undefined){
      console.warn("5  | System used saved date, not the function...");
      dateENDoFxxx = this.finalSavedDate;
    }
    else{
      console.warn("5  | System used function to generate a new End Date of the Task...");
      dateENDoFxxx = getFutureDateTime();
    }
    console.warn("7  | Checkpoint Done");

    this.newClientTache = {
      ClientTacheId: uuidv4(),
      ClientMissionPrestationId: clientMissionPrestation.ClientMissionPrestationId,
      ClientMissionId: this.clientData.ClientMission[0].ClientMissionId,
      TacheId: TacheId,
      Intitule : title ,
      Commentaire : desc ,
      Start_date : getCurrentDateAndTime(),
      End_date : dateENDoFxxx, 
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
    }

    const existingTache = this.clientData.ClientTaches.find((tache) => tache.TacheId === this.newClientTache.TacheId);
    if (!existingTache) {
      this.clientData.ClientTaches.push(this.newClientTache);
    } else {
    }

    
    this.newClientTache = null;
    
  }





  cancelAddClientTache() {
    this.newClientTache = null;
  }
  isValidSSN(ssn: string): boolean {
    const ssnRegex = /^\d{13}\/\d{2}$/; // Exige 13 chiffres suivis de '/2 chiffres'
    return ssnRegex.test(ssn);
  }










  async insertEventsWithDelay(events) {
    for (let i = 0; i < events.length; i++) {
  
      const startDateTime = new Date(events[i].EventTimeStart).toISOString();
      const endDateTime = new Date(events[i].EventTimeEnd).toISOString();
  
      let eventXX = {
        summary: events[i].EventName,
        description: `Préparer les documents du client : ${events[i].EventName}`,
        colorId: "1",
        start: { dateTime: startDateTime, timeZone: "Africa/Casablanca" },
        end: { dateTime: endDateTime, timeZone: "Africa/Casablanca" },
        reminders: { useDefault: false, overrides: [{ method: "email", minutes: 45 }, { method: "popup", minutes: 30 }] },
        visibility: "public",
        status: "confirmed",
        EventId: events[i].EventId
      };
  
      try {
        await this.addEventToGoogleCalendar(eventXX);
      } catch (error) {
        console.error(`Error adding event ${i + 1}:`, error);
      }
      const randomDelay = Math.floor(Math.random() * (450 - 300 + 1)) + 300;
      await new Promise(resolve => setTimeout(resolve, randomDelay));

    }
  }

  


  onSave() {
 

    if (this.isFormValid()) {
      this.isLoading6 = true;

      this.fetchAccessToken();



      if (this.clientData.HasConjoint && this.newConjoint) {
        this.submitAddConjoint();
      }
      if (this.newClientMissionPrestation) {
        this.submitAddClientMissionPrestation();
      }
      if (this.newClientTache) {
        this.submitAddClientTache();
      }
      
      
      this.clientService.CreateClient(this.clientData).subscribe(
        (response) => {
          if (response) {
            this.AllEventsOfTheUser = response;
 
          

              if(this.isConnectedToGoogleCalendar === true){
                 
                if (response.events.length > 0) {
 
                  if (response.events.length > 0) {
                    
                    this.insertEventsWithDelay(response.events);
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

          console.warn("8  | Clearing Storage...");
          
          this.modalService.dismissAll();
          this.selectedDate = null;
          this.finalSavedDate = null;

          console.warn("9  | Displaying Storage After Clearing It...");
          console.warn("10 | Selected Date : "+this.selectedDate);
          console.warn("11 | Final Saved Date : "+this.finalSavedDate);

          console.warn("---------------------------------");

          
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
        return;
      }
  
      gapi.auth.setToken({
        access_token: accessToken,
      });
  
      await gapi.client.calendar.events.insert({
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
          extendedProperties: {
            private: {
              appEventId: event.EventId
            }
        }
        },
      });  
      

      
    } catch (error) {
      this.isErrorGoogleCalendarSync = true;      
      if (error.result?.error?.message?.includes("invalid authentication credentials")) {
        this.toastr.error("Une erreur est survenue : ces évenements n'ont pas été sauvegardé dans Google Calendar.");
      }
      else{
        this.toastr.error("Une erreur est survenue lors de l’ajout de l’événement à Google Calendar.");

      }
      console.error('Erreur lors de l’ajout de l’événement :', error);
      this.isConnectedToGoogleCalendar = false;
    }
  }
  




  onSaveDiss() {
    if (this.isFormValid()) {
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