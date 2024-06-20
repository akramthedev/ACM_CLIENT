import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  PLATFORM_ID,
  Inject,
  EventEmitter,
  Output,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { ClientService } from "../../../../../client.service";
import { v4 as uuidv4 } from "uuid";

@Component({
  selector: "app-add-client",
  templateUrl: "./add-client.component.html",
  styleUrls: ["./add-client.component.scss"],
})
export class AddClientComponent implements OnInit, OnDestroy {
  @ViewChild("addClient", { static: false }) AddClient: TemplateRef<any>;
  @Output("btnSaveEmitter") btnSaveEmitter: EventEmitter<any> =
    new EventEmitter<any>();
  Clients: any[] = [];
  clientData = {
    ClientId: "",
    Nom: "",
    Prenom: "",
    DateNaissance: "",
    SituationFamiliale: "",
    Profession: "",
    DateRetraite: "",
    NumeroSS: "",
    Adresse: "",
    Email: "",
    Tel: "",
    TelType: "",
    ImgSrc: "assets/images/user/8.jpg",
    hasConjoint: "",
    ConjointName: "",
    ConjointPrenom: "",
    ConjointDateNaissance: "",
    ConjointProfession: "",
    ConjointDateRetraite: "",
    ConjointNumeroSS: "",
    DateMariage: "",
    RegimeMatrimonial: "",
    DonationEpoux: "",
    ModifRegimeDate: "",
    QuestComp: "",
    Children: [],
    hasUsage: "",
    Usages: [], // New array for usage goods
    hasImmobilier: "",
    Immobiliers: [],
  };

  newChild = {
    Nom: "",
    Prenom: "",
    Date: "",
    Parent: "",
    Charge: "",
    Particularite: "",
    Nchild: "",
    Comment: "",
  };
  newUsage = {
    // New object for a single usage good
    Designation: "",
    Valeur: "",
    Detenteur: "",
    Charge: "",
    Capital: "",
    Duree: "",
    Taux: "",
    Deces: "",
  };
  newImmobilier = {
    // New object for a single immobilier good
    Designation: "",
    Valeur: "",
    Detenteur: "",
    Revenue: "",
    Charge: "",
    Capital: "",
    Duree: "",
    Taux: "",
    Deces: "",
  };

  public closeResult: string;
  public modalOpen: boolean = false;
  public currentStep: number = 1;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private modalService: NgbModal,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    console.log("addClient.ngOnInit......");
    this.getClients();
  }
  getClients() {
    this.clientService.getClients().subscribe(
      (response) => {
        this.Clients = response;
        console.log(response);
      },
      (error) => {
        console.error("Error fetching clients: ", error);
      }
    );
  }
  openModal() {
    console.log("openModal: ")
    if (isPlatformBrowser(this.platformId)) {
      this.resetForm();
      this.clientData.ClientId = uuidv4();
      console.log("this.clientData: ", this.clientData);
      
      this.modalService
        .open(this.AddClient, {
          size: "lg",
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
      console.log(reason);
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
    if (this.currentStep < 3) {
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
    }
  }
  submitAddProche() {
    if (this.newProche.Nom == null || this.newProche.Nom == "" ||
      this.newProche.Prenom == null || this.newProche.Prenom == "" ||
      this.newProche.LienParente == null || this.newProche.LienParente == "" ||
      this.newProche.Particularite == null || this.newProche.Particularite == ""
    ) {
      this.toastr.warning("Veuillez saisir le nom, prénom, lien parenté et particularité du proche");
      return;
    }
    this.clientData.Proches.push(this.newProche);
    this.newProche = null;
  }
  cancelAddProche() {
    this.newProche = null;
  }
  addUsage() {
    this.clientData.Usages.push({ ...this.newUsage });
    this.newUsage = {
      Designation: "",
      Valeur: "",
      Detenteur: "",
      Charge: "",
      Capital: "",
      Duree: "",
      Taux: "",
      Deces: "",
    };
  }
  addImmobilier() {
    this.clientData.Immobiliers.push({ ...this.newImmobilier });
    this.newImmobilier = {
      Designation: "",
      Valeur: "",
      Detenteur: "",
      Revenue: "",
      Charge: "",
      Capital: "",
      Duree: "",
      Taux: "",
      Deces: "",
    };
  }

  // onSave() {
  //   if (this.isFormValid()) {
  //     console.log("addClient.OnSave: ", this.clientData);
  //     this.btnSaveEmitter.emit(this.clientData);
  //     this.modalService.dismissAll();
  //     this.resetForm();
  //   } else {
  //     alert("Veuillez remplir tous les champs obligatoires.");
  //   }
  // }

  onSave() {
    if (this.isFormValid()) {
      console.log("clientData",this.clientData)
      this.clientService.CreateClient(this.clientData).subscribe(
        (response) => {
          console.log("Client ajouté avec succès", response);
          Swal.fire("Succès", "Client ajouté avec succès", "success");
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
      Swal.fire(
        "Erreur",
        "Veuillez remplir tous les champs obligatoires.",
        "error"
      );
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
    if (
      this.currentStep === 1 &&
      (!this.clientData.Nom || !this.clientData.Prenom)
    ) {
      return false;
    }
    if (
      this.currentStep === 2 &&
      (!this.clientData.Nom || !this.clientData.Prenom)
    ) {
      return false;
    }
    if (
      this.currentStep === 3 &&
      (!this.clientData.Nom || !this.clientData.Prenom)
    ) {
      return false;
    }
    return true;
  }

  private resetForm() {
    this.clientData = {
      ClientId: "",
      Nom: "",
      Prenom: "",
      DateNaissance: "",
      SituationFamiliale: "",
      Profession: "",
      DateRetraite: "",
      NumeroSS: "",
      Adresse: "",
      Email: "",
      Tel: "",
      TelType: "",
      ImgSrc: "assets/images/user/8.jpg",
      hasConjoint: "non",
      ConjointName: "",
      ConjointPrenom: "",
      ConjointDateNaissance: "",
      ConjointProfession: "",
      ConjointDateRetraite: "",
      ConjointNumeroSS: "",
      DateMariage: "",
      RegimeMatrimonial: "",
      DonationEpoux: "",
      ModifRegimeDate: "",
      QuestComp: "",
      Children: [],
      hasUsage: "",
      Usages: [], // Reset the usage goods array
      hasImmobilier: "",
      Immobiliers: [],
    };
    this.newChild = {
      Nom: "",
      Prenom: "",
      Date: "",
      Parent: "",
      Charge: "",
      Particularite: "",
      Nchild: "",
      Comment: "",
    };
    this.newUsage = {
      Designation: "",
      Valeur: "",
      Detenteur: "",
      Charge: "",
      Capital: "",
      Duree: "",
      Taux: "",
      Deces: "",
    };
    this.newImmobilier = {
      Designation: "",
      Valeur: "",
      Detenteur: "",
      Revenue: "",
      Charge: "",
      Capital: "",
      Duree: "",
      Taux: "",
      Deces: "",
    };
    this.currentStep = 1;
  }

  onConjointChange() {
    if (this.clientData.hasConjoint === "non") {
      (this.clientData.ConjointName = ""),
        (this.clientData.ConjointPrenom = "");
      this.clientData.ConjointDateNaissance = "";
      this.clientData.ConjointProfession = "";
      this.clientData.ConjointDateRetraite = "";
      this.clientData.ConjointNumeroSS = "";
      this.clientData.DateMariage = "";
      this.clientData.RegimeMatrimonial = "";
      this.clientData.DonationEpoux = "";
      this.clientData.ModifRegimeDate = "";
      this.clientData.QuestComp = "";
      this.clientData.Children = [];
    }
  }
  onUsageChange() {
    if (this.clientData.hasUsage === "non") {
      this.clientData.Usages = [];
    }
  }
  onImmobilierChange() {
    if (this.clientData.hasImmobilier === "non") {
      this.clientData.Immobiliers = [];
    }
  }
}
