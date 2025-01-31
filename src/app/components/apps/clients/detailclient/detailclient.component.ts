import { Component, ViewChild } from "@angular/core";
import { formatDate, DatePipe } from "@angular/common";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalDismissReasons, NgbModal, NgbModalConfig, NgbNavChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { Client, ClientTache, Conjoint, Passif, Piece, Proche, ClientMission, ClientMissionPrestation } from "src/app/shared/model/dto.model";
import { CustomTable, CustomTableColumn, CustomTableColumnInputOption } from "src/app/shared/model/models.model";
import { Patrimoine } from "src/app/shared/model/dto.model";
import { Budget } from "src/app/shared/model/dto.model";
import { ClientService } from "src/app/shared/services/client.service";
import { EnumService } from "src/app/shared/services/enum.service";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import { environment } from "src/environments/environment";
import { AuthService } from "src/app/shared/services/auth.service";

@Component({
  selector: "app-detailclient",
  templateUrl: "./detailclient.component.html",
  styleUrl: "./detailclient.component.scss",
})
export class DetailclientComponent {
  @ViewChild("dialogPrestation") dialogPrestation: any;
  @ViewChild("dialogMission") dialogMission: any;
  date = new Date();
  isCompReadyeee: boolean = false;
  activeTabId: number = 1;
  currentClient: Client;
  closeResult: string;
  
  isLoading1: Boolean = false;
  isLoading2: Boolean = false;
  isLoading3: Boolean = false;
  isLoading4: Boolean = false;
  isLoading5: Boolean = false;
  isLoading6: Boolean = false;
  isLoading7: Boolean = false;
  isLoading8: Boolean = false;
  isLoading9: Boolean = false;
  isLoading10: Boolean = false;
  isLoading11: Boolean = false;
  isLoading12: Boolean = false;
  isLoading13: Boolean = false;
  isLoading14: Boolean = false;

  
  
  filtredClientPieces: any[] = [];
  filterPiecesText: string = "";
  Pieces: Piece[] = [];
  ClientTaches: ClientTache[] = [];
  ClientMissions: ClientMission[] = [];
  ClientMissionPrestations: ClientMissionPrestation[] = [];
  ClientMissionPrestationss: { [key: string]: any[] } = {};

  UnassignedClientMissionPrestation: ClientMissionPrestation[] = [];
  UnassignedClientTache: ClientTache[] = [];
  selectedPrestationId: string;
  selectedMissionId: string;
  selectedClientMissionId: string;
  MissionWithPrestationCount: any[] = [];
  filteredPrestations: { [clientMissionId: string]: any[] } = {};

  canViewBp: boolean = false;
  canViewPiece: boolean = false;

  constructor(private route: ActivatedRoute, private clientService: ClientService, private enumService: EnumService, private loader: NgxSpinnerService, private toastr: ToastrService, private router: Router, private title: Title, private modalService: NgbModal, private config: NgbModalConfig, private authService: AuthService) {
    config.backdrop = "static";
    config.keyboard = false;

    if (this.authService.CurrentUserHasRole("bp_afficher", false)) {
      this.canViewBp = true;
    }
    if (this.authService.CurrentUserHasRole("piece_afficher", false)) {
      this.canViewPiece = true;
    }
  }

  // checkDate() {
  //   let formatedDate = new DatePipe().transform(this.Students.dob, 'dd/mm/yyyy')
  //   console.log(formatedDate);
  // }
  onStatusDocumentChange(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type !== "application/pdf") {
        this.toastr.error("Seuls les fichiers PDF sont autorisés");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("ClientId", this.currentClient.ClientId);
      formData.append("PatrimoineId", this.dialogPatrimoine.data.PatrimoineId);

      this.clientService.UploadStatusDocument(formData).subscribe(
        (response: any) => {
          this.dialogPatrimoine.data.StatusDocumentPath = response.documentUrl;
          this.toastr.success("Document de statut importé avec succès");
        },
        (error: any) => {
          this.toastr.error("Erreur lors de l'importation du document de statut");
        }
      );
    }
  }

  //#region Patrimoine
  @ViewChild("DialogPatrimoine") public DialogPatrimoine!: any;
  tablesPatrimoines: CustomTable[] = [
    {
      title: "Biens d'usage",
      type: "Bien d'usage",
      noDataMessage: "Aucun bien d'usage enregistré",
      total: 1553548.52,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "Adresse", header: "Adresse", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "Valeur", header: "Valeur (€)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        {
          field: "Detenteur",
          header: "Détenteur",
          dataType: "string",
          inputOptions: {
            type: "select",
            required: false,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: "M-MME", libelle: "M-MME" },
              { key: "M", libelle: "M" },
              { key: "MME", libelle: "MME" },
              { key: "USUFRUIT", libelle: "USUFRUIT" },
              { key: "NP", libelle: "NP" },
            ],
          },
        },
        {
          field: "ChargesAssocies",
          header: "Charges associées",
          dataType: "string",
          inputOptions: {
            type: "select",
            required: false,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: "TF", libelle: "TF" },
              { key: "TH", libelle: "TH" },
              { key: "Syndic", libelle: "Syndic" },
              { key: "Charges Corpo", libelle: "Charges Corpo" },
              { key: "Crédit", libelle: "Crédit" },
            ],
          },
        },
        { field: "DateAchat", header: "Date d'achat", dataType: "date", inputOptions: { type: "date", required: false } },
        { field: "CapitalEmprunte", header: "Capital emprunté", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Duree", header: "Durée (Année)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Taux", header: "Taux (%)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, max: 1, step: 0.1 } },
        {
          field: "AGarantieDeces",
          header: "Garantie Décès",
          dataType: "bool",
          TextTrue: "Oui",
          TextFalse: "Non",
          inputOptions: {
            type: "checkbox",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: true, libelle: "Oui" },
              { key: false, libelle: "Non" },
            ],
          },
        },
        { field: "action", header: "Action", dataType: null },
      ],
    },
    {
      title: "Immobiliers de rapport",
      type: "Immobilier de rapport",
      noDataMessage: "Aucun immobilier de rapport enregistré",
      total: 123456.55,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "Adresse", header: "Adresse", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "Valeur", header: "Valeur (€)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Detenteur", header: "Détenteur", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "DateAchat", header: "Date d'achat", dataType: "date", inputOptions: { type: "date", required: false } },
        { field: "RevenueFiscalite", header: "Revenue / loyer (Annuel)", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "Charges", header: "Charges (Annuel)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "CapitalEmprunte", header: "Capital emprunté", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Duree", header: "Durée (année)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Taux", header: "Taux (%)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 0.1 } },
        {
          field: "AGarantieDeces",
          header: "Garantie Décès",
          dataType: "bool",
          TextTrue: "Oui",
          TextFalse: "Non",
          inputOptions: {
            type: "checkbox",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: true, libelle: "Oui" },
              { key: false, libelle: "Non" },
            ],
          },
        },
        { field: "action", header: "Action", dataType: null },
      ],
    },
    {
      title: "Biens professionnels",
      type: "Bien professionnel",
      noDataMessage: "Aucun bien professionel enregistré",
      total: 941581,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "Valeur", header: "Valeur (€)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Detenteur", header: "Détenteur", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "DateCreation", header: "Date de création", dataType: "date", inputOptions: { type: "date", required: false } },
        { field: "DateAchat", header: "Date d'achat", dataType: "date", inputOptions: { type: "date", required: false } },
        { field: "CapitalEmprunte", header: "Capital", dataType: "number", inputOptions: { type: "number", required: false } },
        { field: "Restant", header: "Restant", dataType: "number", inputOptions: { type: "number", required: false } },

        // {
        //   field: "ChargesAssocies",
        //   header: "Charges Associées",
        //   dataType: "string",
        //   inputOptions: {
        //     type: "select",
        //     required: false,
        //     selectValue: "key",
        //     selectLibelle: "libelle",
        //     selectData: [
        //       { key: "charge1", libelle: "Charge numero1" },
        //       { key: "charge2", libelle: "Charge numero2" },
        //     ],
        //   },
        // },
        //{ field: "Status", header: "Statut", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "StatusDocumentPath", header: "Document Statut", dataType: "link", inputOptions: { type: "link", required: false } },
        { field: "Particularite", header: "Dividende", dataType: "number", inputOptions: { type: "number", required: false } },
        { field: "action", header: "Action", dataType: null },
      ],
    },
  ];

  GetPatrimoines(type?: "Bien d'usage" | "Immobilier de rapport" | "Bien professionnel") {
    return this.currentClient.Patrimoines.filter((x) => (type != null ? x.TypePatrimoine === type : true));
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
  dialogPatrimoine: {
    data: Patrimoine;
    isEditing: boolean;
    title: string;
    Inputs: any[];
    Open: Function;
    Submit: Function;
    Close: Function;
    Clear: Function;
  } = {
    title: null,
    data: null,
    isEditing: null,
    Inputs: [],
    Open: (id: string | null, type?: "Bien d'usage" | "Immobilier de rapport" | "Bien professionnel") => {
      if (id == null) {
        // // create patrimoine
        // this.dialogPatrimoine.title = "Creation de " + type;
        let typeTitle = type === "Immobilier de rapport" ? "d'" + type : "de " + type;
        this.dialogPatrimoine.title = "Création " + typeTitle;
        this.dialogPatrimoine.isEditing = false;
        this.dialogPatrimoine.data = {
          PatrimoineId: uuidv4(),
          ClientId: this.currentClient.ClientId,
          TypePatrimoine: type,
        };
        //DialogPatrimoineLabel
        this.dialogPatrimoine.Inputs = this.tablesPatrimoines.find((x) => x.type == type).columns.filter((x) => x.field != "action");
      } else {
        // edit patrimoine
        this.dialogPatrimoine.isEditing = true;
        // get patrimoie data
        let p = this.currentClient.Patrimoines.find((x) => x.PatrimoineId == id);
        this.dialogPatrimoine.title = p.Designation;
        this.dialogPatrimoine.Inputs = this.tablesPatrimoines.find((x) => x.type == p.TypePatrimoine).columns.filter((x) => x.field != "action");
        this.dialogPatrimoine.data = structuredClone(p);
        this.dialogPatrimoine.data.DateAchat = this.formatDate(this.dialogPatrimoine.data.DateAchat);
      }

      this.modalService.open(this.DialogPatrimoine, { ariaLabelledBy: "DialogPatrimoineLabel", fullscreen: false, size: "xl" }).result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
      console.log("this.dialogPatrimoine.data: ", this.dialogPatrimoine.data);
    },
    Submit: () => {
      console.log("sublit: this.dialogPatrimoine.data: ", this.dialogPatrimoine.data);
      //return;
      if (!this.dialogPatrimoine.isEditing) {
        // submit create
        // this.dialogPatrimoine.data.AGarantieDeces = this.dialogPatrimoine.data.AGarantieDeces.includes("true") ? true : false;
        this.isLoading1 = true;
        this.clientService.CreatePatrimoine(this.dialogPatrimoine.data).subscribe(
          (response) => {
            console.log("response CreatePatrimoine: ", response);
            setTimeout(()=>{
              this.isLoading1 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de création du patrimoine");
            } else {
              this.toastr.success("Patrimoine ajouté avec succès");
              this.currentClient.Patrimoines.push(this.dialogPatrimoine.data);
              this.dialogPatrimoine.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur CreatePatrimoine: ", error);
            setTimeout(()=>{
              this.isLoading1 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de creation du patrimoine");
          }
        );
      } else {
        // submit update
        this.isLoading1 = true;
        this.clientService.UpdatePatrimoine(this.dialogPatrimoine.data).subscribe(
          (response) => {
            console.log("response UpdatePatrimoine: ", response);
            setTimeout(()=>{
              this.isLoading1 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de modification du patrimoine");
            } else {
              this.toastr.success("Patrimoine modifié avec succès");
              this.currentClient.Patrimoines = this.currentClient.Patrimoines.map((item) => {
                if (item.PatrimoineId == this.dialogPatrimoine.data.PatrimoineId) item = this.dialogPatrimoine.data;
                return item;
              });
              this.dialogPatrimoine.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur UpdatePatrimoine: ", error);
            setTimeout(()=>{
              this.isLoading1 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de modification du patrimoine");
          }
        );
      }
    },
    Close: () => {
      this.modalService.dismissAll();
      this.dialogPatrimoine.Clear();
    },
    Clear: () => {
      this.dialogPatrimoine.title = null;
      this.dialogPatrimoine.data = null;
      this.dialogPatrimoine.Inputs = [];
      this.dialogPatrimoine.isEditing = null;
    },
  };
  DeletePatrimoine(id: string) {
    console.log("delete patrimoine cliquer");
    // Utilisez une boîte de dialogue de confirmation si nécessaire
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      console.log(this.currentClient.ClientId);
      this.clientService.DeletePatrimoine(id, this.currentClient.ClientId).subscribe(
        (response) => {
          console.log("Delete client response : ", response);
          this.toastr.success("Patrimoine supprimé avec succès");
          this.currentClient.Patrimoines = this.currentClient.Patrimoines.filter((x) => x.PatrimoineId !== id);
        },
        (error) => {
          console.error("Erreur lors de la suppression du patrimoine", error);
          this.toastr.error("Erreur lors de la suppression du patrimoine");
        }
      );
    } else {
      console.log("error lors de la suppression");
    }
  }
  //#endregion Patrimoine

  //#region Passif
  @ViewChild("DialogPassif") public DialogPassif!: any;
  tablesPassifs: CustomTable[] = [
    {
      title: "Passif",
      type: "Passif",
      noDataMessage: "Aucun passif enregistré",
      total: 1553548.52,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "CapitalEmprunte", header: "Capital emprunté", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "DureeMois", header: "Durée (Mois)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Taux", header: "Taux (%)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 0.1 } },
        {
          field: "AGarantieDeces",
          header: "Garantie Décès",
          dataType: "bool",
          TextTrue: "Oui",
          TextFalse: "Non",
          inputOptions: {
            type: "checkbox",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: true, libelle: "Oui" },
              { key: false, libelle: "Non" },
            ],
          },
        },
        { field: "Particularite", header: "Particularités", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "action", header: "Action", dataType: null },
      ],
    },
    {
      title: "Assurance",
      type: "Assurance",
      noDataMessage: "Aucune assurance enregistrée",
      total: 123456.55,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "ValeurRachat", header: "Valeur de rachat (€)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "DateSouscription", header: "Date de souscription", dataType: "date", inputOptions: { type: "date", required: false } },
        {
          field: "Assure",
          header: "Assuré",
          dataType: "bool",
          TextTrue: "Oui",
          TextFalse: "Non",
          inputOptions: {
            type: "checkbox",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: true, libelle: "Oui" },
              { key: false, libelle: "Non" },
            ],
          },
        },
        { field: "Beneficiaire", header: "Bénéficiaires", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "Particularite", header: "Particularités", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "action", header: "Action", dataType: null },
      ],
    },
    {
      title: "Epargne et depot à moyen et long terme",
      type: "Epargne",
      noDataMessage: "Aucun epargne enregistré",
      total: 941581,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "Valeur", header: "Valeur (€)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Detenteur", header: "Détenteur", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "DateOuverture", header: "Date d'ouverture", dataType: "date", inputOptions: { type: "date", required: false } },
        { field: "EpargneAssocie", header: "Epargne associée", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "Particularite", header: "Particularités", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "action", header: "Action", dataType: null },
      ],
    },
    {
      title: "Valeurs mobilières",
      type: "Valeurs mobilières",
      noDataMessage: "Aucune valeur mobilière enregistré",
      total: 941581,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "Valeur", header: "Valeur (€)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Detenteur", header: "Détenteur", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "RevenusDistribue", header: "Revenus distribués", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "FiscaliteOuRevenue", header: "Fiscalité ou revenu", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "TauxRevalorisation", header: "Taux de révalorisation (%)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 0.1 } },
        { field: "action", header: "Action", dataType: null },
      ],
    },
    {
      title: "Disponibilités",
      type: "Disponibilité",
      noDataMessage: "Aucune disponibilité enregistré",
      total: 941581,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "Valeur", header: "Valeur (€)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 0.1 } },
        { field: "Detenteur", header: "Détenteur", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "Particularite", header: "Particularités", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "action", header: "Action", dataType: null },
      ],
    },
  ];

  GetPassifs(type?: "Passif" | "Assurance" | "Epargne" | "Valeurs mobilières" | "Disponibilité") {
    return this.currentClient.Passifs.filter((x) => (type != null ? x.TypePassifs === type : true));
  }

  dialogPassif: {
    data: Passif;
    isEditing: boolean;
    title: string;
    Inputs: any[];
    Open: Function;
    Submit: Function;
    Close: Function;
    Clear: Function;
  } = {
    data: null,
    title: null,
    Inputs: [],
    isEditing: null,
    Open: (id: string | null, type?: "Passif" | "Assurance" | "Epargne" | "Valeurs mobilières" | "Disponibilité") => {
      if (id == null) {
        // // create passif
        // this.dialogPassif.title = "Creation de " + type;
        let typeTitle = type === "Assurance" || type === "Epargne" ? "d'" + type : "de " + type;
        this.dialogPassif.title = "Création " + typeTitle;
        this.dialogPassif.isEditing = false;
        this.dialogPassif.data = {
          PassifsId: uuidv4(),
          ClientId: this.currentClient.ClientId,
          TypePassifs: type,
        };
        this.dialogPassif.Inputs = this.tablesPassifs.find((x) => x.type == type).columns.filter((x) => x.field != "action");
      } else {
        // edit passif
        this.dialogPassif.isEditing = true;
        // get passif data
        let p = this.currentClient.Passifs.find((x) => x.PassifsId == id);
        this.dialogPassif.title = p.Designation;
        this.dialogPassif.Inputs = this.tablesPassifs.find((x) => x.type == p.TypePassifs).columns.filter((x) => x.field != "action");
        this.dialogPassif.data = structuredClone(p);
        this.dialogPassif.data.DateOuverture = this.formatDate(this.dialogPassif.data.DateOuverture);
        this.dialogPassif.data.DateSouscription = this.formatDate(this.dialogPassif.data.DateSouscription);
      }
      this.modalService.open(this.DialogPassif, { ariaLabelledBy: "DialogPassifLabel", fullscreen: false, size: "xl" }).result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
      console.log("this.dialogPassif.data: ", this.dialogPassif.data);
    },
    Submit: () => {
      console.log("sublit: this.dialogPassif.data: ", this.dialogPassif.data);
      // return;
      if (!this.dialogPassif.isEditing) {
        // submit create
        this.isLoading2 = true;
        this.clientService.CreatePassif(this.dialogPassif.data).subscribe(
          (response) => {
            console.log("response CreatePassif: ", response);
            setTimeout(()=>{
              this.isLoading2 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de création du passif");
            } else {
              this.toastr.success("Passif ajouté avec succès");
              this.currentClient.Passifs.push(this.dialogPassif.data);
              this.dialogPassif.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur CreatePassif: ", error);
            setTimeout(()=>{
              this.isLoading2 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de creation du passif");
          }
        );
      } else {
        // submit update
        this.isLoading2 = true;
        this.clientService.UpdatePassif(this.dialogPassif.data).subscribe(
          (response) => {
            console.log("response UpdatePassif: ", response);
            setTimeout(()=>{
              this.isLoading2 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de modification du passif");
            } else {
              this.toastr.success("Passif modifié avec succès");
              this.currentClient.Passifs = this.currentClient.Passifs.map((item) => {
                if (item.PassifsId == this.dialogPassif.data.PassifsId) item = this.dialogPassif.data;
                return item;
              });
              this.dialogPassif.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur UpdatePassif: ", error);
            setTimeout(()=>{
              this.isLoading2 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de modification du passif");
          }
        );
      }
    },
    Close: () => {
      this.modalService.dismissAll();
      this.dialogPassif.Clear();
    },
    Clear: () => {
      this.dialogPassif.title = null;
      this.dialogPassif.data = null;
      this.dialogPassif.Inputs = [];
      this.dialogPassif.isEditing = null;
    },
  };
  DeletePassif(id: string) {
    console.log("delete passif cliquer");
    // Utilisez une boîte de dialogue de confirmation si nécessaire
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      this.clientService.DeletePassif(id).subscribe(
        (response) => {
          console.log("Delete client response : ", response);
          this.toastr.success("Passif supprimé avec succès");
          this.currentClient.Passifs = this.currentClient.Passifs.filter((x) => x.PassifsId !== id);
        },
        (error) => {
          console.error("Erreur lors de la suppression du passif", error);
          this.toastr.error("Erreur lors de la suppression du passif");
        }
      );
    } else {
      console.log("error lors de la suppression");
    }
  }
  //#endregion Passif

  //#region Budget
  @ViewChild("DialogBudget") public DialogBudget!: any;
  tablesBudgets: {
    title: string;
    noDataMessage: string;
    total: number;
    columns: {
      field: string;
      header: string;
      dataType: "string" | "number" | "date" | "datetime" | "bool";
      TextTrue?: string;
      TextFalse?: string;
      inputOptions?: {
        type: "text" | "number" | "date" | "select";
        required: boolean;
        min?: number;
        max?: number;
        step?: number;
        selectData?: any[];
        selectValue?: string;
        selectLibelle?: string;
      };
    }[];
  }[] = [
    {
      title: "Budget",
      noDataMessage: "Aucun budget enregistré",
      total: 1553548.52,
      columns: [
        {
          field: "Sexe",
          header: "Personne",
          dataType: "string",
          inputOptions: {
            type: "select",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: "Monsieur", libelle: "Monsieur" },
              { key: "Madame", libelle: "Madame" },
            ],
          },
        },
        {
          field: "Designation",
          header: "Désignation",
          dataType: "string",
          inputOptions: {
            type: "select",
            required: false,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: "Salaire", libelle: "Salaire" },
              { key: "Retraite", libelle: "Retraite" },
              { key: "CARSAT", libelle: "CARSAT" },
              { key: "CNAV", libelle: "CNAV" },
              { key: "AGIRC-ARCCO", libelle: "AGIRC-ARCCO" },
              { key: "CIPAV", libelle: "CIPAV" },
              { key: "CARMF", libelle: "CARMF" },
              { key: "IRCANTEC", libelle: "IRCANTEC" },
              { key: "IRP", libelle: "IRP" },
              { key: "Autres", libelle: "Autres" },
            ],
          },
        },
        { field: "Montant", header: "Montant (Annuel)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "action", header: "Action", dataType: null },
      ],
    },
  ];

  GetBudgets() {
    return this.currentClient.Budgets;
    // .filter((x) => (type != null ? x.TypePatrimoine === type : true))
  }

  dialogBudget: {
    data: Budget;
    isEditing: boolean;
    title: string;
    Inputs: any[];
    Open: Function;
    Submit: Function;
    Close: Function;
    Clear: Function;
  } = {
    data: null,
    isEditing: null,
    title: null,
    Inputs: [],
    Open: (id: string | null) => {
      if (id == null) {
        // create budget
        this.dialogBudget.title = "Création de Budget";
        this.dialogBudget.isEditing = false;
        this.dialogBudget.data = {
          BudgetsId: uuidv4(),
          ClientId: this.currentClient.ClientId,
        };
        this.dialogBudget.Inputs = this.tablesBudgets.find((x) => x.title == "Budget").columns.filter((x) => x.field != "action");
      } else {
        // edit budget
        this.dialogBudget.isEditing = true;
        // get budget data
        let p = this.currentClient.Budgets.find((x) => x.BudgetsId == id);
        this.dialogBudget.title = p.Designation;
        this.dialogBudget.Inputs = this.tablesBudgets.find((x) => x.title == "Budget").columns.filter((x) => x.field != "action");
        this.dialogBudget.data = structuredClone(p);
      }
      this.modalService.open(this.DialogBudget, { ariaLabelledBy: "DialogBudgetLabel", fullscreen: false, size: "xl" }).result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
      console.log("this.dialogBudget.data: ", this.dialogBudget.data);
    },
    Submit: () => {
      console.log("sublit: this.dialogBudget.data: ", this.dialogBudget.data);
      // return;
      if (!this.dialogBudget.isEditing) {
        // submit create
        this.isLoading3 = true;
        this.clientService.CreateBudget(this.dialogBudget.data).subscribe(
          (response) => {
            console.log("response CreateBudget: ", response);
            setTimeout(()=>{
              this.isLoading3 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de création du budget");
            } else {
              this.toastr.success("Budget ajouté avec succès");
              this.currentClient.Budgets.push(this.dialogBudget.data);
              this.dialogBudget.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur CreateBudget: ", error);
            setTimeout(()=>{
              this.isLoading3 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de creation du budget");
          }
        );
      } else {
        // submit update
        this.isLoading3 = true;
        this.clientService.UpdateBudget(this.dialogBudget.data).subscribe(
          (response) => {
            console.log("response UpdateBudget: ", response);
            setTimeout(()=>{
              this.isLoading3 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de modification du budget");
            } else {
              this.toastr.success("Budget modifié avec succès");
              this.currentClient.Budgets = this.currentClient.Budgets.map((item) => {
                if (item.BudgetsId == this.dialogBudget.data.BudgetsId) item = this.dialogBudget.data;
                return item;
              });
              this.dialogBudget.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur UpdateBudget: ", error);
            setTimeout(()=>{
              this.isLoading3 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de modification du budget");
          }
        );
      }
    },
    Close: () => {
      this.modalService.dismissAll();
      this.dialogBudget.Clear();
    },
    Clear: () => {
      this.dialogBudget.title = null;
      this.dialogBudget.data = null;
      this.dialogBudget.Inputs = [];
      this.dialogBudget.isEditing = null;
    },
  };
  DeleteBudget(id: string) {
    console.log("delete budget cliquer");
    // Utilisez une boîte de dialogue de confirmation si nécessaire
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      this.clientService.DeleteBudget(id).subscribe(
        (response) => {
          console.log("Delete client response : ", response);
          this.toastr.success("Budget supprimé avec succès");
          this.currentClient.Budgets = this.currentClient.Budgets.filter((x) => x.BudgetsId !== id);
        },
        (error) => {
          console.error("Erreur lors de la suppression du budget", error);
          this.toastr.error("Erreur lors de la suppression du budget");
        }
      );
    } else {
      console.log("error lors de la suppression");
    }
  }
  //#endregion Budget

  //#region Fiscale
  oldParticulariteFiscale: string = null;
  particulariteFiscaleChanged: boolean = false;
  situationAdministrativeChanged: boolean = false;

  //#endregion Fiscale

  //#region SituationAdministrative
  areAllRadioValuesNull(): boolean {
    return (
      this.currentClient.CFE == null &&
      this.currentClient.PASSEPORT == null &&
      this.currentClient.Cotisation == null &&
      this.currentClient.CarteSejour == null &&
      this.currentClient.Reversion == null &&
      this.currentClient.PermisConduire == null &&
      this.currentClient.CNSS == null &&
      this.currentClient.AssuranceAuto == null &&
      this.currentClient.CNAREFE == null &&
      this.currentClient.AssuranceHabitation == null &&
      this.currentClient.CAPITONE == null &&
      this.currentClient.InscriptionConsulat == null &&
      this.currentClient.AssuranceRapatriement == null &&
      this.currentClient.CPAM == null &&
      this.currentClient.MutuelleFrancaise == null &&
      this.currentClient.CSG_CRDS == null
    );
  }

  shouldShowModifyButton(): boolean {
    return this.situationAdministrativeChanged || this.areAllRadioValuesNull();
  }

  //#endregion SituationAdministrative

  //#region Proche
  @ViewChild("DialogProche") public DialogProche!: any;
  tablesProches: CustomTable[] = [
    {
      title: "Proche",
      type: null,
      noDataMessage: "Aucun proche enregistré",
      total: 2,
      columns: [
        { field: "Nom", header: "Nom", dataType: "string", visible: true, inputOptions: { type: "text", required: true } },
        { field: "Prenom", header: "Prénom", dataType: "string", visible: true, inputOptions: { type: "text", required: true } },
        { field: "DateNaissance", header: "Date de naissance", dataType: "date", visible: true, inputOptions: { type: "date", required: false } },
        { field: "Telephone1", header: "Téléphone 1", dataType: "string", visible: true, inputOptions: { type: "text", required: false } },
        { field: "Telephone2", header: "Téléphone 2", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
        { field: "Email1", header: "Email 1", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
        { field: "Email2", header: "Email 2", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
        { field: "Adresse", header: "Adresse", dataType: "string", visible: true, inputOptions: { type: "text", required: false } },
        {
          field: "Charge",
          header: "A Charge fiscalement",
          dataType: "bool",
          TextTrue: "Oui",
          TextFalse: "Non",
          visible: true,
          inputOptions: {
            type: "checkbox",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: true, libelle: "Oui" },
              { key: false, libelle: "Non" },
            ],
          },
        },
        {
          field: "LienParente",
          header: "Lien de parenté",
          dataType: "string",
          visible: true,
          inputOptions: {
            type: "select",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: "Père", libelle: "Père" },
              { key: "Mère", libelle: "Mère" },
              { key: "Enfant", libelle: "Enfant" },
              { key: "Neveu", libelle: "Neveu" },
              { key: "Nièce", libelle: "Nièce" },
              { key: "Époux", libelle: "Époux" },
              { key: "Adoption simple", libelle: "Adoption simple" },
              { key: "Adoption plénière", libelle: "Adoption plénière" },
            ],
          },
        },
        //{ field: "LienParente", header: "Lien de parenté", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
        //{ field: "Particularite", header: "Particularité", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
        {
          field: "Particularite",
          header: "Particularité",
          dataType: "string",
          visible: false,
          inputOptions: {
            type: "select",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: "Handicapé", libelle: "Handicapé" },
              { key: "À charge", libelle: "À charge" },
              { key: "Tutelle", libelle: "Tutelle" },
              { key: "Curatelle", libelle: "Curatelle" },
              { key: "Aucune", libelle: "Aucune" },
            ],
          },
        },
        { field: "NombreEnfant", header: "Nombre d'enfant", dataType: "number", visible: false, inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "action", header: "Action", visible: true, dataType: null },
      ],
    },
  ];

  GetProches() {
    return this.currentClient.Proches;
  }
  getVisibleColumns(columns: any[]): any[] {
    return columns.filter((column) => column.visible);
  }
  dialogProche: {
    data: Proche;
    isEditing: boolean;
    title: string;
    Inputs: any[];
    Open: Function;
    Submit: Function;
    Close: Function;
    Clear: Function;
  } = {
    data: null,
    isEditing: null,
    title: null,
    Inputs: [],
    Open: (id: string | null) => {
      if (id == null) {
        // create proche
        this.dialogProche.title = "Création de Proche";
        this.dialogProche.isEditing = false;
        this.dialogProche.data = {
          ProcheId: uuidv4(),
          ClientId: this.currentClient.ClientId,
        };
        this.dialogProche.Inputs = this.tablesProches.find((x) => x.title == "Proche").columns.filter((x) => x.field != "action");
      } else {
        // edit proche
        this.dialogProche.isEditing = true;
        // get proche data
        let p = this.currentClient.Proches.find((x) => x.ProcheId == id);
        this.dialogProche.title = p.Nom;
        this.dialogProche.Inputs = this.tablesProches.find((x) => x.title == "Proche").columns.filter((x) => x.field != "action");
        this.dialogProche.data = structuredClone(p);
        this.dialogProche.data.DateNaissance = this.formatDate(this.dialogProche.data.DateNaissance);
      }
      this.modalService.open(this.DialogProche, { ariaLabelledBy: "DialogProcheLabel", fullscreen: false, size: "xl" }).result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
      console.log("this.dialogProche.data: ", this.dialogProche.data);
    },
    Submit: () => {
      console.log("sublit: this.dialogProche.data: ", this.dialogProche.data);
      // return;
      if (!this.dialogProche.isEditing) {
        // submit create
        this.isLoading4 = true;
        this.clientService.CreateProche(this.dialogProche.data).subscribe(
          (response) => {
            console.log("response CreateProche: ", response);
            setTimeout(()=>{
              this.isLoading4 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de création du proche");
            } else {
              this.toastr.success("Proche ajouté avec succès");
              this.currentClient.Proches.push(this.dialogProche.data);
              this.dialogProche.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur CreateProche: ", error);
            setTimeout(()=>{
              this.isLoading4 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de creation du proche");
          }
        );
      } else {
        // submit update
        this.isLoading4 = true;
        this.clientService.UpdateProche(this.dialogProche.data).subscribe(
          (response) => {
            console.log("response UpdateProche: ", response);
            setTimeout(()=>{
              this.isLoading4 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de modification du proche");
            } else {
              this.toastr.success("Proche modifié avec succès");
              this.currentClient.Proches = this.currentClient.Proches.map((item) => {
                if (item.ProcheId == this.dialogProche.data.ProcheId) item = this.dialogProche.data;
                return item;
              });
              this.dialogProche.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur UpdateProche: ", error);
            setTimeout(()=>{
              this.isLoading4 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de modification du proche");
          }
        );
      }
    },
    Close: () => {
      this.modalService.dismissAll();
      this.dialogProche.Clear();
    },
    Clear: () => {
      this.dialogProche.title = null;
      this.dialogProche.data = null;
      this.dialogProche.Inputs = [];
      this.dialogProche.isEditing = null;
    },
  };
  DeleteProche(id: string) {
    console.log("delete proche cliquer");
    // Utilisez une boîte de dialogue de confirmation si nécessaire
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      this.clientService.DeleteProche(id).subscribe(
        (response) => {
          console.log("Delete proche response : ", response);
          this.toastr.success("Proche supprimé avec succès");
          this.currentClient.Proches = this.currentClient.Proches.filter((x) => x.ProcheId !== id);
        },
        (error) => {
          console.error("Erreur lors de la suppression du proche", error);
          this.toastr.error("Erreur lors de la suppression du proche");
        }
      );
    } else {
      console.log("error lors de la suppression");
    }
  }
  //#endregion Proche

  //#region Client
  formClientInputs: CustomTableColumn[] = [
    { field: "Nom", header: "Nom", dataType: "string", visible: true, inputOptions: { type: "text", required: true } },
    { field: "Prenom", header: "Prénom", dataType: "string", visible: true, inputOptions: { type: "text", required: true } },
    { field: "DateNaissance", header: "Date de naissance", dataType: "date", visible: true, inputOptions: { type: "date", required: false } },
    { field: "Telephone1", header: "Téléphone 1", dataType: "string", visible: true, inputOptions: { type: "text", required: false } },
    { field: "Telephone2", header: "Téléphone 2", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
    { field: "Email1", header: "Email 1", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
    { field: "Email2", header: "Email 2", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
    { field: "Adresse", header: "Adresse", dataType: "string", visible: true, inputOptions: { type: "text", required: false } },
    //{ field: "Charge", header: "A Charge fiscalement", dataType: "bool", TextTrue: "Oui", TextFalse: "Non", visible: true, inputOptions: { type: "checkbox", required: true, selectValue: "key", selectLibelle: "libelle", selectData: [{ key: true, libelle: "Oui" }, { key: false, libelle: "Non" },], }, },
    { field: "NumeroSS", header: "Numéro SS", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
    { field: "DateRetraite", header: "Date de Retraite", dataType: "date", visible: false, inputOptions: { type: "date", required: false } },
    { field: "DateResidence", header: "Date de Residence fiscale", dataType: "date", visible: false, inputOptions: { type: "date", required: false } },
    {
      field: "SituationFamiliale",
      header: "Situation Familiale",
      dataType: "string",
      visible: false,
      inputOptions: {
        type: "select",
        required: false,
        selectValue: "key",
        selectLibelle: "libelle",
        selectData: [
          { key: "Marié", libelle: "Marié" },
          { key: "Mariée", libelle: "Mariée" },
          { key: "Célibataire", libelle: "Célibataire" },
          { key: "Divorcé", libelle: "Divorcé" },
          { key: "Divorcée", libelle: "Divorcée" },
          { key: "Veuf", libelle: "Veuf" },
          { key: "Veuve", libelle: "Veuve" },
          { key: "Union libre", libelle: "Union libre" },
          { key: "PACS", libelle: "PACS" },
        ],
      },
    },
  ];
  //#endregion Client
  // Format NumeroSS when it's retrieved or displayed
  formatNumeroSS(num: string): string {
    if (num === null || num === undefined || num === "") return "";
    // Use regex to format the NumeroSS
    const regex = /^(\d{1})(\d{2})(\d{2})(\d{2})(\d{3})(\d{3})\/(\d{2})$/;
    return num.replace(regex, "$1 $2 $3 $4 $5 $6/$7");
  }

  // Unformat the NumeroSS to its raw form if needed (optional for backend)
  unformatNumeroSS(num: string): string {
    if(num === null || num === undefined || num === ""){
      return '';
    }
    else{
      return num.replace(/\s/g, "");
    }
  }
  //#region LettreMission
  generatePdf(clientMissionId: string) {
    this.isLoading5 = true;
    this.clientService.GetLettreMission(clientMissionId).subscribe(
      (response) => {
        console.log("response GetLettreMission: ", response);
        setTimeout(()=>{
          this.isLoading5 = false;
        }, 1500)
        if (response) {
          // Créer un URL Blob à partir de la réponse et ouvrir dans un nouvel onglet
          const fileURL = URL.createObjectURL(response);
          window.open(fileURL, "_blank");
          this.toastr.success("Impression de la lettre de mission du client réussie");
        } else {
          this.toastr.error("Erreur de génération de la lettre de mission.");
        }
      },
      (error) => {
        console.error("Erreur GetLettreMission: ", error);
        setTimeout(()=>{
          this.isLoading5 = false;
        }, 1500)
        this.toastr.error("Erreur de génération de la lettre de mission.");
        // this.handleBlobError(error);
      }
    );
  }

  // handleBlobError(error: any) {
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     const errorMessage = reader.result as string;
  //     this.toastr.error(errorMessage, "Erreur de GetLettreMission du client");
  //   };
  //   reader.onerror = () => {
  //     this.toastr.error("Erreur de GetLettreMission du client");
  //   };
  //   reader.readAsText(error.error);
  // }

  //#endregion LettreMission

  //#region Conjoint
  @ViewChild("DialogConjoint") public DialogConjoint!: any;
  tablesConjoints: CustomTable[] = [
    {
      title: "Conjoint",
      type: null,
      noDataMessage: "Aucun conjoint enregistré",
      columns: [
        { field: "Nom", header: "Nom", dataType: "string", visible: true, inputOptions: { type: "text", required: true } },
        { field: "Prenom", header: "Prénom", dataType: "string", visible: true, inputOptions: { type: "text", required: true } },
        { field: "DateNaissance", header: "Date de naissance", dataType: "date", visible: true, inputOptions: { type: "date", required: false } },
        { field: "Adresse", header: "Adresse", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
        { field: "Profession", header: "Profession", dataType: "string", visible: true, inputOptions: { type: "text", required: false } },
        { field: "DateRetraite", header: "Date de retraite", dataType: "date", visible: true, inputOptions: { type: "date", required: false } },
        { field: "NumeroSS", header: "Numéro SS", dataType: "string", visible: true, inputOptions: { type: "text", required: false } },
        { field: "DateMariage", header: "Date de mariage", dataType: "date", visible: false, inputOptions: { type: "date", required: false } },
        { field: "RegimeMatrimonial", header: "Régime matrimonial", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
        {
          field: "DonationEpoux",
          header: "DDV",
          dataType: "bool",
          TextTrue: "Oui",
          TextFalse: "Non",
          visible: true,
          inputOptions: {
            type: "checkbox",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: true, libelle: "Oui" },
              { key: false, libelle: "Non" },
            ],
          },
        },
        { field: "ModifRegimeDate", header: "Modification régime et date", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
        { field: "QuestComp", header: "Question complémentaire", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
        { field: "action", header: "Action", visible: true, dataType: null },
      ],
    },
  ];

  GetConjoints() {
    return this.currentClient.Conjoint;
    // .filter((x) => (type != null ? x.TypePatrimoine === type : true))
  }

  dialogConjoint: {
    data: Conjoint;
    isEditing: boolean;
    title: string;
    Inputs: any[];
    Open: Function;
    Submit: Function;
    Close: Function;
    Clear: Function;
  } = {
    data: null,
    isEditing: null,
    title: null,
    Inputs: [],
    Open: (id: string | null) => {
      if (id == null) {
        // create conjoint
        this.dialogConjoint.title = "Création de Conjoint";
        this.dialogConjoint.isEditing = false;
        this.dialogConjoint.data = {
          ConjointId: uuidv4(),
          ClientId: this.currentClient.ClientId,
        };
        this.dialogConjoint.Inputs = this.tablesConjoints.find((x) => x.title == "Conjoint").columns.filter((x) => x.field != "action");
      } else {
        // edit conjoint
        this.dialogConjoint.isEditing = true;
        // get conjoint data
        let p = this.currentClient.Conjoint.find((x) => x.ConjointId == id);
        this.dialogConjoint.title = p.Nom + " " + p.Prenom;
        this.dialogConjoint.Inputs = this.tablesConjoints.find((x) => x.title == "Conjoint").columns.filter((x) => x.field != "action");
        this.dialogConjoint.data = structuredClone(p);
        this.dialogConjoint.data.DateNaissance = this.formatDate(this.dialogConjoint.data.DateNaissance);
        this.dialogConjoint.data.DateRetraite = this.formatDate(this.dialogConjoint.data.DateRetraite);
        this.dialogConjoint.data.DateMariage = this.formatDate(this.dialogConjoint.data.DateMariage);
      }
      this.modalService.open(this.DialogConjoint, { ariaLabelledBy: "DialogConjointLabel", fullscreen: false, size: "xl" }).result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
      console.log("this.dialogConjoint.data: ", this.dialogConjoint.data);
    },
    Submit: () => {
      console.log("sublit: this.dialogConjoint.data: ", this.dialogConjoint.data);
      this.cleanDateFields(this.dialogConjoint.data);
      // return;
      if (!this.dialogConjoint.isEditing) {
        // submit create
        this.isLoading6 = true;
        this.clientService.CreateConjoint(this.dialogConjoint.data).subscribe(
          (response) => {
            console.log("response CreateConjoint: ", response);
            setTimeout(()=>{
              this.isLoading6 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de création du conjoint");
            } else {
              this.toastr.success("Conjoint ajouté avec succès");
              this.currentClient.Conjoint.push(this.dialogConjoint.data);
              this.dialogConjoint.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur CreateConjoint: ", error);
            setTimeout(()=>{
              this.isLoading6 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de creation du conjoint");
          }
        );
      } else {
        // submit update
        this.isLoading7 = true;
        this.clientService.UpdateConjoint(this.dialogConjoint.data).subscribe(
          (response) => {
            console.log("response UpdateConjoint: ", response);
            setTimeout(()=>{
              this.isLoading7 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de modification du conjoint");
            } else {
              this.toastr.success("Conjoint modifié avec succès");
              this.currentClient.Conjoint = this.currentClient.Conjoint.map((item) => {
                if (item.ConjointId == this.dialogConjoint.data.ConjointId) item = this.dialogConjoint.data;
                return item;
              });
              this.dialogConjoint.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur UpdateConjoint: ", error);
            setTimeout(()=>{
              this.isLoading7 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de modification du conjoint");
          }
        );
      }
    },
    Close: () => {
      this.modalService.dismissAll();
      this.dialogConjoint.Clear();
    },
    Clear: () => {
      this.dialogConjoint.title = null;
      this.dialogConjoint.data = null;
      this.dialogConjoint.Inputs = [];
      this.dialogConjoint.isEditing = null;
    },
  };
  DeleteConjoint(id: string) {
    console.log("delete conjoint cliquer");
    // Utilisez une boîte de dialogue de confirmation si nécessaire
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      this.clientService.DeleteConjoint(id).subscribe(
        (response) => {
          console.log("Delete conjoint response : ", response);
          this.toastr.success("Conjoint supprimé avec succès");
          this.currentClient.Conjoint = this.currentClient.Conjoint.filter((x) => x.ConjointId !== id);
        },
        (error) => {
          console.error("Erreur lors de la suppression du conjoint", error);
          this.toastr.error("Erreur lors de la suppression du conjoint");
        }
      );
    } else {
      console.log("error lors de la suppression");
    }
  }
  //#endregion Conjoint

  private formatDate(date: string | null): string | null {
    return date ? formatDate(date, "yyyy-MM-dd", "en-US") : null;
  }

  private cleanDateFields(data: any) {
    if (!data.DateNaissance) data.DateNaissance = null;
    if (!data.DateRetraite) data.DateRetraite = null;
    if (!data.DateMariage) data.DateMariage = null;
    if (!data.DateResidence) data.DateResidence = null;
  }
  onNavChange(changeEvent: NgbNavChangeEvent) {
    // console.log("onNavChange changeEvent: ", changeEvent)
    if (changeEvent.nextId === 6) {
      changeEvent.preventDefault();
    }
  }

  downloadFile(clientPiece: any): Promise<void> {
    this.isLoading8 = true;
    return new Promise((resolve, reject) => {
      const fileUrl = `${environment.url}/DownloadClientPiece/${clientPiece.ClientPieceId}`;

      fetch(fileUrl)
        .then((response) => {
          if (response.ok) {
            return response.blob(); // File found, proceed with download
          } else if (response.status === 404) {
            // Handle file not found (404) error
            throw new Error("File not found");
          } else {
            throw new Error("Unexpected error occurred during file download");
          }
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${clientPiece.Libelle}.${clientPiece.Extension}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          resolve(); // Successfully downloaded
        })
        .catch((error) => {
          if (error.message === "File not found") {
            console.warn("Download failed: File not found on server.");
          } else {
            console.error("Download error:", error);
          }
          reject(error);
        })
        .finally(() => {
          setTimeout(()=>{
            this.isLoading8 = false;
          }, 1500) // Hide8 loader after download completes (success or fail)
        });
    });
  }

  OpenPieceTools(clientpieceid: string) {
    const swalWithBootstrapButtons = Swal.mixin({ customClass: { confirmButton: "btn btn-danger", cancelButton: "btn btn-light me-2", denyButton: "btn btn-primary me-2" }, buttonsStyling: false });
    let clientPiece = this.currentClient.ClientPieces.find((x) => x.ClientPieceId == clientpieceid);
    swalWithBootstrapButtons
      .fire({
        title: clientPiece.Libelle,
        // text: clientPiece.Libelle,
        icon: null, //'warning',
        showCancelButton: true,
        confirmButtonText: "Supprimer",
        cancelButtonText: "Annuler",
        reverseButtons: true,
        showDenyButton: true,
        denyButtonText: "Télécharger",
      })
      .then((result) => {
        // Gérer les actions en fonction du bouton cliqué
        if (result.isConfirmed) {
          // Action lorsque l'utilisateur clique sur "Supprimer"
          // Swal.fire('Supprimé!', 'Votre élément a été supprimé.', 'success');
          this.isLoading9 = true;
          this.clientService.DeleteClientPiece(clientpieceid).subscribe(
            (response) => {
              console.log("response DeleteClientPiece: ", response);
              setTimeout(()=>{
                this.isLoading9 = false;
              }, 1000)
              if (response == null || response == false) {
                this.toastr.error("Erreur de suppression de la pièce");
              } else {
                this.toastr.success("Suppression de la pièce effectué");
                this.filtredClientPieces = this.filtredClientPieces.filter((x) => x.ClientPieceId != clientpieceid);
                this.currentClient.ClientPieces = this.currentClient.ClientPieces.filter((x) => x.ClientPieceId != clientpieceid);
              }
            },
            (error) => {
              console.error("Erreur DeleteClientPiece: ", error);
              this.toastr.error("Erreur de suppression de la pièce");
              setTimeout(()=>{
                this.isLoading9 = false;
              }, 1000)
            }
          );
        } else if (result.isDenied) {
          // Action lorsque l'utilisateur clique sur "Télécharger"
          // this.downloadFile(clientPiece);
          // Swal.fire("Téléchargement!", "Votre fichier est en cours de téléchargement.", "info");
          this.downloadFile(clientPiece)
            .then(() => {
              setTimeout(()=>{
                this.isLoading9 = false;
              }, 1500)
              Swal.fire("Téléchargement réussi!", "Votre fichier a été téléchargé avec succès.", "success");
            })
            .catch((error) => {
              setTimeout(()=>{
                this.isLoading9 = false;
              }, 1500)

              if (error.message === "File not found") {
                Swal.fire("Erreur!", "Le fichier n'a pas été trouvé sur le serveur.", "error");
              } else {
                Swal.fire("Erreur!", "Le téléchargement du fichier a échoué.", "error");
              }
            });
        } else {
          // Action lorsque l'utilisateur clique sur "Annuler" ou ferme la boîte de dialogue
          // Swal.fire('Annulé', 'Votre action a été annulée :)', 'info');
        }
      });
  }
  OnSearchPieceKeyUp(event) {
    // console.log("OnSearchPieceKeyUp: ", event, "this.filterPiecesText: ", this.filterPiecesText);
    // this.filtredClientPieces = this.currentClient.ClientPieces.filter((x) => x.Libelle.toLowerCase().includes(this.filterPiecesText.toLowerCase()) || x.Extension.toLowerCase().includes(this.filterPiecesText.toLowerCase()));
    this.filtredClientPieces = this.currentClient.ClientPieces.filter((x) => x.Libelle.toLowerCase().includes(this.filterPiecesText.toLowerCase()));
  }
  //#region ngOnInit
  ngOnInit() {
    this.activeTabId = 1;

    this.route.params.subscribe((params) => {
      let clientId = params["id"];
      console.warn(clientId);
      this.isLoading10 = true;
      this.clientService.GetClient(clientId).subscribe(
        (response) => {

          console.warn(response)

          if (response === null) {
            this.toastr.error("Erreur lors de la récuperation du client");
            console.warn("ERROR FATAL");
            setTimeout(() => {
              this.router.navigate(["/clients"]);
            }, 2000);
          } else {
            //this.isComponentReady = true;
            this.currentClient = response;
            this.filtredClientPieces = this.currentClient.ClientPieces;
            this.title.setTitle(`${this.currentClient.Nom} ${this.currentClient.Prenom} | ACM`);
            this.oldParticulariteFiscale = structuredClone(this.currentClient.ParticulariteFiscale);
            this.currentClient.DateNaissance = this.formatDate(this.currentClient.DateNaissance);
            this.currentClient.DateRetraite = this.formatDate(this.currentClient.DateRetraite);
            this.currentClient.DateResidence = this.formatDate(this.currentClient.DateResidence);
            // If currentClient.NumeroSS is retrieved from the backend in raw format
            if (this.currentClient.NumeroSS) {
              this.currentClient.NumeroSS = this.formatNumeroSS(this.currentClient.NumeroSS);
            }
            // Apply formatting to the phone numbers if they exist
            if (this.currentClient.Telephone1) {
              this.currentClient.Telephone1 = this.formatPhoneNumber(this.currentClient.Telephone1);
            }
            if (this.currentClient.Telephone2) {
              this.currentClient.Telephone2 = this.formatPhoneNumber(this.currentClient.Telephone2);
            }
            this.currentClient.Patrimoines = this.currentClient.Patrimoines.map((item) => {
              if (item.StatusDocumentPath != null && item.StatusDocumentPath != "") item.StatusDocumentPath = `${environment.url}/${item.StatusDocumentPath}`;
              return item;
            });
            if (this.currentClient.Photo == null) this.currentClient.ImgSrc = "assets/images/user/user.png";
            else this.currentClient.ImgSrc = `${environment.url}/${this.currentClient.Photo}`;
            // get liste pieces
            this.enumService.GetPieces().subscribe(
              (responsePieces) => {
                setTimeout(()=>{
                  this.isLoading10 = false;
                }, 1500)
                this.Pieces = responsePieces;
              },
              (errorPieces) => {
                setTimeout(()=>{
                  this.isLoading10 = false;
                }, 1500)
              }
            );

            //get ClientTache
            this.clientService.GetClientTachesSimple(clientId).subscribe((responseClientTache) => {
              console.log("responseClientTacheSimple : ", responseClientTache);
              this.ClientTaches = responseClientTache;
            });
            //get ClientMissionPrestationss
            this.clientService.GetClientMissionPrestationSimple(clientId).subscribe((responseClientMissionPrestation) => {
              console.log("responseClientMissionPrestationSimple : ", responseClientMissionPrestation);
              this.ClientMissionPrestationss = {}; // Initialize as an empty object

              responseClientMissionPrestation.forEach((prestation) => {
                // Group prestations by ClientMissionId
                if (!this.ClientMissionPrestationss[prestation.ClientMissionId]) {
                  this.ClientMissionPrestationss[prestation.ClientMissionId] = [];
                }
                this.ClientMissionPrestationss[prestation.ClientMissionId].push(prestation);
              });
              this.ClientMissionPrestations = responseClientMissionPrestation;
              console.log("ClientMissionPrestations:", this.ClientMissionPrestationss);
            });
            //get MissionsWithPrestationsCount

            this.clientService.getMissionsWithPrestationsCount().subscribe(
              (response) => {
                this.MissionWithPrestationCount = response;
                console.log(this.MissionWithPrestationCount);
              },
              (error: any) => {
                this.toastr.error("Erreur lors de l'importation des missions");
              }
            );
          }
        },
        (error) => {
          console.error("Error GetClient: ", error);
          setTimeout(()=>{
            this.isLoading10 = false;
          }, 1500)
          this.toastr.error("Erreur de récuperation du client");
          setTimeout(() => {
            this.router.navigate(["/clients"]);
          }, 2000);
        }
      );
    });
  }
  //#endregion ngOnInit
  openDialogMission(ClientId: string) {
    console.log("selected ClientId ", ClientId);
    this.clientService.getMissionsWithPrestationsCount().subscribe(
      (response) => {
        console.log(response);
      },
      (error: any) => {
        this.toastr.error("Erreur lors de l'importation des missions");
      }
    );
    this.modalService.open(this.dialogMission, { ariaLabelledBy: "modal-basic-title" });
  }
  addMission() {
    console.log("Selected Mission ID:", this.selectedMissionId);

    const newClientMissionId = uuidv4();
    const newMissionData = {
      ClientMissionId: newClientMissionId,
      ClientId: this.currentClient.ClientId,

      // ClientMissionId: this.currentClient.ClientMissions[0].ClientMissionId,
      MissionId: this.selectedMissionId,
    };
    this.clientService.CreateClientMission(newMissionData).subscribe(
      (response) => {
        console.log("response of CreateClientMission", response);
        this.toastr.success("ajout de la mission effectué");
        //get ClientMissionPrestation
        this.clientService.GetClientMissionPrestationSimple(this.currentClient.ClientId).subscribe((responseClientMissionPrestation) => {
          console.log("responseClientMissionPrestationSimple : ", responseClientMissionPrestation);
          this.ClientMissionPrestations = responseClientMissionPrestation;
        });
        //get ClientMissionPrestationss
        this.clientService.GetClientMissionPrestationSimple(this.currentClient.ClientId).subscribe((responseClientMissionPrestation) => {
          console.log("responseClientMissionPrestationSimple : ", responseClientMissionPrestation);
          this.ClientMissionPrestationss = {}; // Initialize as an empty object

          responseClientMissionPrestation.forEach((prestation) => {
            // Group prestations by ClientMissionId
            if (!this.ClientMissionPrestationss[prestation.ClientMissionId]) {
              this.ClientMissionPrestationss[prestation.ClientMissionId] = [];
            }
            this.ClientMissionPrestationss[prestation.ClientMissionId].push(prestation);
          });
          this.ClientMissionPrestations = responseClientMissionPrestation;
          console.log("ClientMissionPrestations:", this.ClientMissionPrestationss);
        });
        //get ClientTache
        this.clientService.GetClientTachesSimple(this.currentClient.ClientId).subscribe((responseClientTache) => {
          console.log("responseClientTacheSimple : ", responseClientTache);
          this.ClientTaches = responseClientTache;
        });
        //get ClientMission
        this.clientService.GetClientMissions(this.currentClient.ClientId).subscribe((responseClientMission) => {
          console.log("responseClientMissions : ", responseClientMission);
          this.currentClient.ClientMissions = responseClientMission;
        });
        //get ClientPieces
        this.clientService.GetClientPiecess(this.currentClient.ClientId).subscribe((responseClientPieces) => {
          console.log("responseClientPiecess : ", responseClientPieces);
          this.currentClient.ClientPieces = responseClientPieces;
          this.filtredClientPieces = this.currentClient.ClientPieces;
        });

        this.selectedMissionId = null;
        this.GetMissions();
      },
      (error) => {
        console.error("Erreur lors de la création de la mission:", error);
      }
    );

    this.modalService.dismissAll(); // Close the modal after selection
    this.selectedMissionId = null;
  }
  openDialog(clientMissionId: string) {
    this.selectedClientMissionId = clientMissionId;
    console.log("selected ClientMissionId", this.selectedClientMissionId);

    if (this.selectedClientMissionId) {
      // Fetch the latest unassigned prestations for the selected mission
      this.clientService.GetUnassignedClientMissionPrestationSimple(this.selectedClientMissionId).subscribe(
        (responseClientMissionPrestation) => {
          console.log("responseUnassignedClientMissionPrestationSimple:", responseClientMissionPrestation);
          this.UnassignedClientMissionPrestation = responseClientMissionPrestation;

          // Automatically select the first available prestation, if any
          if (this.UnassignedClientMissionPrestation.length > 0) {
            this.selectedPrestationId = this.UnassignedClientMissionPrestation[0].PrestationId;
          } else {
            this.selectedPrestationId = null;
          }
        },
        (error) => {
          console.error("Error fetching unassigned prestations:", error);
        }
      );
      this.modalService.open(this.dialogPrestation, { ariaLabelledBy: "modal-basic-title" });
    } else {
      console.error("ClientMissionId is undefined");
    }
  }

  addPrestation() {
    console.log("Selected Prestation ID:", this.selectedPrestationId);
    const newClientMissionPrestationId = uuidv4();
    const newPrestationData = {
      ClientMissionPrestationId: newClientMissionPrestationId,
      ClientMissionId: this.selectedClientMissionId,

      // ClientMissionId: this.currentClient.ClientMissions[0].ClientMissionId,
      PrestationId: this.selectedPrestationId,
    };
    this.clientService.CreateClientMissionPrestationCustom(newPrestationData).subscribe(
      (response) => {
        console.log("response of CreateClientMissionPrestationCustom", response);
        this.toastr.success("ajout de la prestation effectué");
        //get ClientMissionPrestation
        this.clientService.GetClientMissionPrestationSimple(this.currentClient.ClientId).subscribe((responseClientMissionPrestation) => {
          console.log("responseClientMissionPrestationSimple : ", responseClientMissionPrestation);
          this.ClientMissionPrestations = responseClientMissionPrestation;
        });
        //get ClientMissionPrestationss
        this.clientService.GetClientMissionPrestationSimple(this.currentClient.ClientId).subscribe((responseClientMissionPrestation) => {
          console.log("responseClientMissionPrestationSimple : ", responseClientMissionPrestation);
          this.ClientMissionPrestationss = {}; // Initialize as an empty object

          responseClientMissionPrestation.forEach((prestation) => {
            // Group prestations by ClientMissionId
            if (!this.ClientMissionPrestationss[prestation.ClientMissionId]) {
              this.ClientMissionPrestationss[prestation.ClientMissionId] = [];
            }
            this.ClientMissionPrestationss[prestation.ClientMissionId].push(prestation);
          });
          this.ClientMissionPrestations = responseClientMissionPrestation;
          console.log("ClientMissionPrestations:", this.ClientMissionPrestationss);
        });
        //get ClientTache
        this.clientService.GetClientTachesSimple(this.currentClient.ClientId).subscribe((responseClientTache) => {
          console.log("responseClientTacheSimple : ", responseClientTache);
          this.ClientTaches = responseClientTache;
        });
        this.selectedPrestationId = null;
      },
      (error) => {
        console.error("Erreur lors de la création de la prestation:", error);
      }
    );

    this.modalService.dismissAll(); // Close the modal after selection
    this.selectedPrestationId = null;
  }

  onCancelPrestation(modal: any) {
    // Annuler la sélection temporaire et fermer le modal
    this.selectedPrestationId = null;
    this.modalService.dismissAll(); // Fermer le modal sans enregistrer
  }
  onCancelMission(modal: any) {
    // Annuler la sélection temporaire et fermer le modal
    this.selectedPrestationId = null;
    this.modalService.dismissAll(); // Fermer le modal sans enregistrer
  }
  filteredTaches(prestationId: string) {
    return this.ClientTaches.filter((tache) => tache.ClientMissionPrestationId === prestationId);
  }

  deletePrestation(clientMissionPrestationId: string) {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Les tâches liées à cette prestation seront également supprimées !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        // Ici, tu peux ajouter ta logique de suppression réelle
        console.log("ID de la prestation à supprimer : ", clientMissionPrestationId);

        // Appeler le service de suppression si nécessaire
        this.clientService.DeleteClientMissionPrestation(clientMissionPrestationId).subscribe(
          (response) => {
            // Afficher un message de succès
            Swal.fire("Supprimé !", "La prestation et ses tâches liées ont été supprimées.", "success");

            // Mise à jour de la liste des prestations après suppression
            this.ClientMissionPrestations = this.ClientMissionPrestations.filter((prestation) => prestation.ClientMissionPrestationId !== clientMissionPrestationId);
            // Filtrer les tâches pour exclure celles liées à la prestation supprimée
            this.ClientTaches = this.ClientTaches.filter((task) => task.ClientMissionPrestationId !== clientMissionPrestationId);
            // this.clientService.GetUnassignedClientMissionPrestationSimple(this.selectedMissionId).subscribe((responseClientMissionPrestation) => {
            //   console.log("Mise à jour des prestations non affectées : ", responseClientMissionPrestation);
            //   this.UnassignedClientMissionPrestation = responseClientMissionPrestation;
            // });
            for (let missionId in this.ClientMissionPrestationss) {
              this.ClientMissionPrestationss[missionId] = this.ClientMissionPrestationss[missionId].filter((prestation) => prestation.ClientMissionPrestationId !== clientMissionPrestationId);
            }
            this.GetTasks();
          },
          (error) => {
            console.error("Erreur lors de la suppression : ", error);
            Swal.fire("Erreur", "La suppression a échoué.", "error");
          }
        );
      }
    });
  }
  // Méthode pour vérifier l'existence de l'image
  checkImageExists(url: string, callback: (exists: boolean) => void) {
    const http = new XMLHttpRequest();
    http.open("HEAD", url, true);
    http.onreadystatechange = function () {
      if (this.readyState === this.DONE) {
        callback(this.status === 200);
      }
    };
    http.send();
  }

  //#region ImportPiece
  DirectImportForPiece(clientPieceId: string) {
    const clientPiece = this.currentClient.ClientPieces.find((x) => x.ClientPieceId == clientPieceId);

    if (!clientPiece) {
      this.toastr.error("La pièce sélectionnée est introuvable.");
      return;
    }

    // Create a file input element dynamically
    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.accept = ".pdf, .xls, .xlsx, .doc, .docx, .jpg, .jpeg, .png"; // Accept PDF files, modify as needed
    inputElement.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadFileForSelectedPiece(clientPiece, file);
      }
    };

    // Trigger the file input dialog
    inputElement.click();
  }

  uploadFileForSelectedPiece(clientPiece: any, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ClientPieceId", clientPiece.ClientPieceId);
    formData.append("ClientId", this.currentClient.ClientId);
    formData.append("Extension", file.name.split(".").pop());

    this.isLoading11 = true;
    this.clientService.UploadClientPieceFile(formData).subscribe(
      (response: any) => {
        console.log("response UploadClientPieceFile: ", response);
        setTimeout(()=>{
          this.isLoading11 = false;
        }, 1500)

        if (response == null || response == false) {
          this.toastr.error("Erreur d'importation du fichier.");
        } else {
          this.toastr.success("Importation réussie");
          clientPiece.Extension = file.name.split(".").pop(); // Update the piece with the file extension
          // formDataUpdate.append("ClientId", this.currentClient.ClientId);
          // formDataUpdate.append("PieceId", clientPiece.PieceId);
          this.clientService.UpdateClientPiece(formData);
        }
      },
      (error: any) => {
        console.error("error UploadClientPieceFile: ", error);
        setTimeout(()=>{
          this.isLoading11 = false;
        }, 1500)
        this.toastr.error("Erreur d'importation du fichier.");
      }
    );
  }

  dialogImportPiece: any = {
    PiecesToChoose: [],
    SelectedPiece: null,
    SelectedFile: null,
    FileReady: false,
    formData: null,
    Open: (content) => {
      this.dialogImportPiece.PiecesToChoose = this.Pieces.filter((x) => !this.currentClient.ClientPieces.map((w) => w.PieceId).includes(x.PieceId));
      this.dialogImportPiece.SelectedPiece = null;
      console.log("PiecesToChoose: ", this.dialogImportPiece.PiecesToChoose);

      this.modalService.open(content, { centered: true, backdrop: true });
    },
    Close: () => {
      this.dialogImportPiece.Clear();
      this.modalService.dismissAll();
    },
    Clear: () => {
      this.dialogImportPiece.PiecesToChoose = [];
      this.dialogImportPiece.SelectedPiece = null;
      this.dialogImportPiece.SelectedFile = null;
      this.dialogImportPiece.FileReady = false;
      this.dialogImportPiece.formData = null;
    },
    OnFileChange: (event: any) => {
      const formData = new FormData();
      // for (let i = 0; i < event.target.files.length; i++)
      formData.append("file", event.target.files[0], event.target.files[0].name);
      console.log("event.target.files[0]: ", event.target.files[0]);
      let fileName = event.target.files[0].name;
      let extension = fileName.split(".")[fileName.split(".").length - 1];
      console.log("extension: ", extension);
      this.dialogImportPiece.Extension = extension;

      this.dialogImportPiece.formData = formData;
      this.dialogImportPiece.FileReady = true;
    },
    Submit: () => {
      if (this.dialogImportPiece.SelectedPiece == null || this.dialogImportPiece.SelectedPiece == "") {
        this.toastr.warning("Veuillez choisir une pièce.");
        return;
      }
      let newClientPiece = {
        ClientPieceId: uuidv4(),
        ClientId: this.currentClient.ClientId,
        PieceId: this.dialogImportPiece.SelectedPiece,
        Libelle: this.Pieces.find((x) => x.PieceId == this.dialogImportPiece.SelectedPiece)?.Libelle,
        Extension: this.dialogImportPiece.Extension,
      };
      this.dialogImportPiece.formData.append("ClientPieceId", newClientPiece.ClientPieceId);
      this.dialogImportPiece.formData.append("ClientId", newClientPiece.ClientId);
      this.dialogImportPiece.formData.append("PieceId", newClientPiece.PieceId);

      this.isLoading12 = true;
      this.clientService.CreateClientPiece(this.dialogImportPiece.formData).subscribe(
        (response: any) => {
          console.log("response CreateClientPiece: ", response);
          setTimeout(()=>{
            this.isLoading12 = false;
          }, 1500)

          if (response == null || response == false) {
            this.toastr.error("Erreur d'imporation du fichier.");
          } else {
            this.toastr.success("Importation reussi");
            // clear file input:
            let inputElem: any = document.getElementById(`importFile`);
            inputElem.value = "";

            this.currentClient.ClientPieces.push(newClientPiece);
            this.filtredClientPieces.push(newClientPiece);
            this.dialogImportPiece.Close();
          }
        },
        (error: any) => {
          console.error("error CreateClientPiece: ", error);
          setTimeout(()=>{
            this.isLoading12 = false;
          }, 1500)
          this.toastr.error("Erreur d'imporation du fichier.");

          // clear file input:
          let inputElem: any = document.getElementById(`importFile`);
          inputElem.value = "";
        }
      );
    },
  };
  //#endregion ImportPiece

  //#region Task
  @ViewChild("DialogTask") public DialogTask!: any;
  tablesTasks: CustomTable[] = [
    {
      title: "Taches",
      type: null,
      noDataMessage: "Aucune tache affecter",
      columns: [
        { field: "Intitule", header: "Tâche", dataType: "string", visible: true, inputOptions: { type: "text", required: false } },
        { field: "Numero_Ordre", header: "Numéro Ordre", dataType: "string", visible: true, inputOptions: { type: "text", required: false } },
        { field: "PrestationDesignation", header: "Prestation", dataType: "string", visible: true, inputOptions: { type: "text", required: false } },
        { field: "Commentaire", header: "Commentaire", dataType: "string", visible: false, inputOptions: { type: "text", required: false } },
        {
          field: "Status",
          header: "Statut",
          dataType: "string",
          visible: true,
          inputOptions: {
            type: "select",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: "En attente", libelle: "En attente" },
              { key: "En cours", libelle: "En cours" },
              { key: "Terminé", libelle: "Terminé" },
            ],
          },
        },
        {
          field: "AgentResposable",
          header: "Agent",
          dataType: "string",
          visible: true,
          inputOptions: {
            type: "select",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: "3d9d1ac0-ac20-469e-be24-97cb3c8c5187", libelle: "Radouane" },
              { key: "a4d50d3f-cdfb-44f4-86e7-411f9428fff7", libelle: "Cecile" },
              { key: "c1fa6c8b-ed6a-4416-8f1d-7b8ed980575b", libelle: "Manal" },
              { key: "8ea98a14-b480-4743-b214-25eeba35a4e8", libelle: "Magali" },
            ],
          },
        },
        { field: "action", header: "Action", visible: true, dataType: null },
      ],
    },
  ];
  getAgentValueByKey(key: string, options: any[]): string {
    if (!key) {
      console.warn("Invalid key provided:", key);
      return "Inconnu"; // Return a default value if the key is invalid
    }

    const normalizedKey = key.toLowerCase();
    const option = options.find((opt) => opt.key.toLowerCase() === normalizedKey);
    return option ? option.libelle : "Inconnu";
  }
  getAgentLibelleByKey(key: string): string {
    const agentOptions = this.tablesTasks.find((x) => x.title === "Taches").columns.find((col) => col.field === "AgentResposable").inputOptions.selectData;

    if (!key) {
      console.warn("La clé est manquante ou invalide:", key);
      return "Inconnu";
    }

    const normalizedKey = key.trim().toLowerCase(); // Normaliser la clé en minuscules
    const agent = agentOptions.find((item) => item.key.trim().toLowerCase() === normalizedKey);

    if (agent) {
      return agent.libelle; // Retourne le libellé si une correspondance est trouvée
    } else {
      console.warn("Aucune correspondance trouvée pour la clé:", normalizedKey);
      return "Inconnu";
    }
  }
  GetTasks() {
    this.currentClient.ClientTaches = this.ClientTaches;
    return this.currentClient.ClientTaches;
  }
  GetMissions() {
    this.currentClient.ClientMissions = this.ClientMissions;
    return this.currentClient.ClientMissions;
  }
  dialogTask: {
    data: ClientTache;
    isEditing: boolean;
    title: string;
    Inputs: any[];
    Open: Function;
    Submit: Function;
    Close: Function;
    Clear: Function;
  } = {
    data: null,
    isEditing: null,
    title: null,
    Inputs: [],
    Open: (id: string | null) => {
      if (id == null) {
        // create task
        this.dialogTask.title = "Création de la tache";
        this.dialogTask.isEditing = false;
        this.dialogTask.data = {
          ClientTacheId: uuidv4(),
          ClientMissionPrestationId: null,
          ClientMissionId: null,
          TacheId: null,
          Start_date : null, 
          End_date : null, 
          Color : null, 
          IsDone : false, 
          IsReminder : false
        };

        this.dialogTask.Inputs = this.tablesTasks.find((x) => x.title == "Taches").columns.filter((x) => x.field != "action" && x.field != "PrestationDesignation");
        console.log(this.tablesTasks.find((x) => x.title == "Taches").columns.filter((x) => x.field != "action"));
      } else {
        // edit task
        this.dialogTask.isEditing = true;
        // get task data
        let p = this.currentClient.ClientTaches.find((x) => x.ClientTacheId == id);
        this.dialogTask.title = "Modifer la Tache";
        this.dialogTask.Inputs = this.tablesTasks.find((x) => x.title == "Taches").columns.filter((x) => x.field != "action" && x.field != "PrestationDesignation");
        this.dialogTask.data = structuredClone(p);
        console.log("la valeur de Agent", this.dialogTask.data.AgentResposable);
        if (this.dialogTask.data.AgentResposable) {
          this.dialogTask.data.AgentResposable = this.dialogTask.data.AgentResposable.toLowerCase();
        }
      }
      this.modalService.open(this.DialogTask, { ariaLabelledBy: "DialogTaskLabel", fullscreen: false, size: "xl" }).result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
      console.log("this.dialogTask.data: ", this.dialogTask.data);
    },
    Submit: () => {
      console.log("sublit: this.dialogTask.data: ", this.dialogTask.data);
      // return;
      if (!this.dialogTask.isEditing) {
        // submit create
        this.isLoading13 = true;
        this.clientService.CreateClientTacheCustom(this.dialogTask.data).subscribe(
          (response) => {
            console.log("response CreateTask: ", response);
            setTimeout(()=>{
              this.isLoading13 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de création du task");
            } else {
              this.toastr.success("Task ajouté avec succès");
              this.currentClient.ClientTaches.push(this.dialogTask.data);
              this.dialogTask.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur CreateTask: ", error);
            setTimeout(()=>{
              this.isLoading13 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de creation du task");
          }
        );
      } else {
        // submit update

        const originalTask = this.currentClient.ClientTaches.find((item) => item.ClientTacheId === this.dialogTask.data.ClientTacheId);
        const originalStatus = originalTask ? originalTask.Status : null; // Save original status

        this.isLoading13 = true;
        this.clientService.UpdateClientTache(this.dialogTask.data).subscribe(
          (response) => {
            console.log("response UpdateClientTache: ", response);
            setTimeout(()=>{
              this.isLoading13 = false;
            }, 1500)
            if (response == null && response == false) {
              this.toastr.error("Erreur de modification du CleintTache");
            } else {
              this.toastr.success("ClientTache modifié avec succès");
              // this.currentClient.ClientTaches = this.currentClient.ClientTaches.map((item) => {
              //   if (item.ClientTacheId == this.dialogTask.data.ClientTacheId) item = this.dialogTask.data;
              //   return item;
              // });
              // Update the task in the list
              const index = this.currentClient.ClientTaches.findIndex((item) => item.ClientTacheId === this.dialogTask.data.ClientTacheId);
              if (index !== -1) {
                this.currentClient.ClientTaches[index] = { ...this.dialogTask.data };
              }

              // // Check if the status changed from something else to "Terminé" and send an email
              // if (originalStatus !== "Terminé" && this.dialogTask.data.Status === "Terminé") {
              //   this.clientService.SentEmail2("elmahdi.boulloul@netwaciila.ma", "Test Custom", "<p>Hello from custom</p>").subscribe(
              //     (emailResponse) => {
              //       console.log("Email sent successfully: ", emailResponse);
              //     },
              //     (emailError) => {
              //       console.error("Error sending email: ", emailError);
              //     }
              //   );
              // }
              this.dialogTask.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur UpdateClientTask: ", error);
            setTimeout(()=>{
              this.isLoading13 = false;
            }, 1500)
            this.toastr.error(error?.error, "Erreur de modification du clientTask");
          }
        );
      }
    },
    Close: () => {
      this.modalService.dismissAll();
      this.dialogTask.Clear();
    },
    Clear: () => {
      this.dialogTask.title = null;
      this.dialogTask.data = null;
      this.dialogTask.Inputs = [];
      this.dialogTask.isEditing = null;
    },
  };
  DeleteTask(id: string) {
    console.log("delete task cliquer");
    // Utilisez une boîte de dialogue de confirmation si nécessaire
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      this.clientService.DeleteClientTache(id).subscribe(
        (response) => {
          console.log("Delete ClientTache response : ", response);
          this.toastr.success("Task supprimé avec succès");
          //this.currentClient.ClientTaches = this.currentClient.ClientTaches.filter((x) => x.ClientTacheId !== id);
          const index = this.currentClient.ClientTaches.findIndex((item) => item.ClientTacheId === id);

          // Si l'élément est trouvé, le supprimer
          if (index !== -1) {
            this.currentClient.ClientTaches.splice(index, 1);
          }
        },
        (error) => {
          console.error("Erreur lors de la suppression du task", error);
          this.toastr.error("Erreur lors de la suppression du task");
        }
      );
    } else {
      console.log("error lors de la suppression");
    }
  }
  //#endregion Task
  // Function to format Moroccan and French phone numbers
  formatPhoneNumber(phone: string): string {
    if (phone === null || phone === undefined || phone === "") return "";

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
    if (phone === null || phone === undefined || phone === ""){
      return '';
    }
    else{
      return phone.replace(/\s/g, "");
    }
  }

  UpdateClient() {
    this.isLoading14 = true;
    // Unformat before sending to backend

    console.log("Detail Client");
    console.warn(this.currentClient);

    this.currentClient.NumeroSS = this.unformatNumeroSS(this.currentClient.NumeroSS);
    // Unformat both phone numbers before saving
    this.currentClient.Telephone1 = this.unformatPhoneNumber(this.currentClient.Telephone1);
    this.currentClient.Telephone2 = this.unformatPhoneNumber(this.currentClient.Telephone2);

    this.currentClient.DateNaissance = this.formatDate(this.currentClient.DateNaissance);
    this.currentClient.DateRetraite = this.formatDate(this.currentClient.DateRetraite);
    this.clientService.UpdateClient(this.currentClient).subscribe(
      (response) => {
        console.log("response UpdateClient: ", response);
        setTimeout(()=>{
          this.isLoading14 = false;
        }, 1500)
        if (response == null && response == false) {
          this.toastr.error("Erreur de modification du client");
        } else {
          this.toastr.success("Enregisté");
          this.particulariteFiscaleChanged = false;
          this.situationAdministrativeChanged = false;
          this.oldParticulariteFiscale = structuredClone(this.currentClient.ParticulariteFiscale);
          // If currentClient.NumeroSS is retrieved from the backend in raw format
          if (this.currentClient.NumeroSS) {
            this.currentClient.NumeroSS = this.formatNumeroSS(this.currentClient.NumeroSS);
          }
          // Apply formatting to the phone numbers if they exist
          if (this.currentClient.Telephone1) {
            this.currentClient.Telephone1 = this.formatPhoneNumber(this.currentClient.Telephone1);
          }
          if (this.currentClient.Telephone2) {
            this.currentClient.Telephone2 = this.formatPhoneNumber(this.currentClient.Telephone2);
          }
          // Swal.fire("Succès", "Client ajouté avec succès", "success");
        }
      },
      (error) => {
        console.error("Erreur UpdateClient: ", error);
        setTimeout(()=>{
          this.isLoading14 = false;
        }, 1500)
        this.toastr.error(error?.error, "Erreur de modification du client");
      }
    );
  }
}
