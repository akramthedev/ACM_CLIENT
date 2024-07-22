import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, PLATFORM_ID, Inject, EventEmitter, Output } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { NgbModal, ModalDismissReasons, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import { ToastrService } from "ngx-toastr";
import { ClientService } from "src/app/shared/services/client.service";
import { Client, ClientMission, ClientMissionPrestation, Mission, Prestation, Proche, Service } from "../../../../../shared/model/dto.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ssnValidator } from "./ssn-validator";
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

  clientData: Client = null;
  newProche: Proche = null;
  Prestations: any = null;
  Services: any = null;
  newService: Service;
  Missions: any = null;
  newClientMission: ClientMission = null;
  newClientMissionPrestation: ClientMissionPrestation = null;
  Taches: any = null;

  public closeResult: string;
  public modalOpen: boolean = false;
  public currentStep: number = 1;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private modalService: NgbModal, private clientService: ClientService, private toastr: ToastrService, private fb: FormBuilder, private loader: NgxSpinnerService, config: NgbModalConfig) {
    config.backdrop = "static";
    config.keyboard = false;
    this.ssnForm = this.fb.group({
      NumeroSS: ["", [Validators.required, ssnValidator()]],
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
    this.showPrestations = value === "Installation au Maroc";
  }

  ngOnInit(): void {
    console.log("addClient.ngOnInit......");
    // this.getClients();
    this.getServices();
    this.getMissions();
    this.getPrestations();
    this.getTaches();
    //this.startAddMission();
    // Restaurer la mission sélectionnée si elle existe
    if (this.selectedMission === "Installation au Maroc") {
      this.showPrestations = true;
    }
  }
  prestationStates = {};
  tacheStates = {};

  toggleAllTaches(prestationId: number, isChecked: boolean) {
    this.prestationStates[prestationId] = isChecked;
    this.Taches.forEach((tache) => {
      if (tache.PrestationId === prestationId) {
        this.tacheStates[tache.TacheId] = isChecked;
      }
    });
  }

  toggleTache(tacheId: number, isChecked: boolean) {
    this.tacheStates[tacheId] = isChecked;
  }
  getServices() {
    this.loader.show();
    this.clientService.getServices().subscribe(
      (response) => {
        console.log("response getServices: ", response);
        this.loader.hide();
        let i = 0;
        this.Services = response;
        console.log("this.Services : ", this.Services);
      },
      (error) => {
        console.error("Error fetching Services: ", error);
        this.loader.hide();
      }
    );
  }
  getMissions() {
    this.loader.show();
    this.clientService.getMissions().subscribe(
      (response) => {
        console.log("response getMissions: ", response);
        this.loader.hide();
        let i = 0;
        this.Missions = response;
        console.log("this.Missions : ", this.Missions);
      },
      (error) => {
        console.error("Error fetching Missions: ", error);
        this.loader.hide();
      }
    );
  }
  getPrestations() {
    this.loader.show();
    this.clientService.getPrestations().subscribe(
      (response) => {
        console.log("response getPrestations: ", response);
        this.loader.hide();
        let i = 0;
        this.Prestations = response;
        console.log("this.Prestations : ", this.Prestations);
      },
      (error) => {
        console.error("Error fetching Prestation: ", error);
        this.loader.hide();
      }
    );
  }
  getTaches() {
    this.loader.show();
    this.clientService.getTaches().subscribe(
      (response) => {
        console.log("response getTaches: ", response);
        this.loader.hide();
        let i = 0;
        this.Taches = response;
        console.log("this.Taches : ", this.Taches);
      },
      (error) => {
        console.error("Error fetching Taches: ", error);
        this.loader.hide();
      }
    );
  }
  openModal() {
    console.log("openModal: ");
    if (isPlatformBrowser(this.platformId)) {
      this.resetForm();
      this.clientData = new Client();
      this.clientData.ClientId = uuidv4();
      this.clientData.Proches = [];
      this.clientData.ClientMissions = [];
      this.clientData.ClientMissionPrestations = [];
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
      if (this.currentStep < 2) {
        this.submitAddClientMission();
      }
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
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
      DateAffectation: null,
    };
  }
  submitAddClientMission() {
    if (this.newClientMission.ClientId == null || this.newClientMission.ClientMissionId == null || this.newClientMission.MissionId == null) {
      this.toastr.warning("Veuillez verifier submitClient du ClientMission");
      return;
    }
    console.log(this.newClientMission);
    this.clientData.ClientMissions.push(this.newClientMission);
    console.log("Submit AddClientMission (ClientData.ClientMission)", this.clientData);
    this.newClientMission = null;
  }
  cancelAddClientMission() {
    this.newClientMission = null;
  }

  onSave() {
    if (this.isFormValid()) {
      this.clientService.CreateClient(this.clientData).subscribe(
        (response) => {
          console.log("Client ajouté avec succès", response);
          this.toastr.success("Client ajouté avec succès");
          // Swal.fire("Succès", "Client ajouté avec succès", "success");
          this.btnSaveEmitter.emit(this.clientData);
          this.modalService.dismissAll();
          this.resetForm();
        },
        (error) => {
          console.error("Erreur lors de l'ajout du client", error);
          Swal.fire("Erreur", "Erreur lors de l'ajout du client", "error");
        }
      );
    } else {
      Swal.fire("Erreur", "Veuillez remplir tous les champs obligatoires.", "error");
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
  }
}
