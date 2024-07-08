import { Component, ViewChild } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalDismissReasons, NgbModal, NgbModalConfig, NgbNavChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { Client, Passif, Piece } from "src/app/shared/model/dto.model";
import { Patrimoine } from "src/app/shared/model/dto.model";
import { Budget } from "src/app/shared/model/dto.model";
import { ClientService } from "src/app/shared/services/client.service";
import { EnumService } from "src/app/shared/services/enum.service";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";

@Component({
  selector: "app-detailclient",
  templateUrl: "./detailclient.component.html",
  styleUrl: "./detailclient.component.scss",
})
export class DetailclientComponent {
  activeTabId: number = 1;
  currentClient: Client;
  closeResult: string;
  filtredClientPieces: any[] = [];
  filterPiecesText: string = "";
  Pieces: Piece[] = [];

  constructor(private route: ActivatedRoute, private clientService: ClientService, private enumService: EnumService, private loader: NgxSpinnerService, private toastr: ToastrService, private router: Router, private title: Title, private modalService: NgbModal, config: NgbModalConfig) {
    config.backdrop = "static";
    config.keyboard = false;
  }

  // checkDate() {
  //   let formatedDate = new DatePipe().transform(this.Students.dob, 'dd/mm/yyyy')
  //   console.log(formatedDate);
  // }
  //#region Patrimoine

  @ViewChild("DialogPatrimoine") public DialogPatrimoine!: any;
  tablesPatrimoines: {
    title: string;
    type: string;
    noDataMessage: string;
    total: number;
    columns: {
      field: string;
      header: string;
      dataType: "string" | "number" | "date" | "datetime" | "bool";
      TextTrue?: string;
      TextFalse?: string;
      inputOptions?: {
        type: "text" | "number" | "date" | "select" | "checkbox";
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
      title: "Biens d'usage",
      type: "Bien d'usage",
      noDataMessage: "Aucun bien d'usage enregistré",
      total: 1553548.52,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "Adresse", header: "Adresse", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "Valeur", header: "Valeur", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Detenteur", header: "Détenteur", dataType: "string", inputOptions: { type: "text", required: false } },
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
              { key: "charge1", libelle: "Charge numero1" },
              { key: "charge2", libelle: "Charge numero2" },
            ],
          },
        },
        { field: "DateAchat", header: "Date d'achat", dataType: "date", inputOptions: { type: "date", required: false } },
        { field: "CapitalEmprunte", header: "Capital emprunté", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Duree", header: "Durée (année)", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Taux", header: "Taux", dataType: "number", inputOptions: { type: "number", required: false, min: 0, max: 1, step: 0.1 } },
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
        { field: "Valeur", header: "Valeur", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Detenteur", header: "Détenteur", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "DateAchat", header: "Date d'achat", dataType: "date", inputOptions: { type: "date", required: false } },
        { field: "RevenueFiscalite", header: "Revenue et fiscalité", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "Charges", header: "Charges", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "CapitalEmprunte", header: "Capital emprunté", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Duree", header: "Durée", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Taux", header: "Taux", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 0.1 } },
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
        { field: "Valeur", header: "Valeur", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Detenteur", header: "Détenteur", dataType: "string", inputOptions: { type: "text", required: true } },
        {
          field: "ChargesAssocies",
          header: "Charges Associées",
          dataType: "string",
          inputOptions: {
            type: "select",
            required: false,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: "charge1", libelle: "Charge numero1" },
              { key: "charge2", libelle: "Charge numero2" },
            ],
          },
        },
        { field: "Particularite", header: "Particularités", dataType: "string", inputOptions: { type: "text", required: false } },
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
        // create patrimoine
        this.dialogPatrimoine.title = "Creation de " + type;
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
        this.loader.show();
        this.clientService.CreatePatrimoine(this.dialogPatrimoine.data).subscribe(
          (response) => {
            console.log("response CreatePatrimoine: ", response);
            this.loader.hide();
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
            this.loader.hide();
            this.toastr.error(error?.error, "Erreur de creation du patrimoine");
          }
        );
      } else {
        // submit update
        this.loader.show();
        this.clientService.UpdatePatrimoine(this.dialogPatrimoine.data).subscribe(
          (response) => {
            console.log("response UpdatePatrimoine: ", response);
            this.loader.hide();
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
            this.loader.hide();
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
      this.clientService.DeletePatrimoine(id).subscribe(
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
  tablesPassifs: {
    title: string;
    type: string;
    noDataMessage: string;
    total: number;
    columns: {
      field: string;
      header: string;
      dataType: "string" | "number" | "date" | "datetime" | "bool";
      TextTrue?: string;
      TextFalse?: string;
      inputOptions?: {
        type: "text" | "number" | "date" | "select" | "checkbox";
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
      title: "Passif",
      type: "Passif",
      noDataMessage: "Aucun passif enregistré",
      total: 1553548.52,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "CapitalEmprunte", header: "Capital emprunté", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "DureeMois", header: "Durée", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Taux", header: "Taux", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 0.1 } },
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
        { field: "ValeurRachat", header: "Valeur de rachat", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
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
        { field: "Valeur", header: "Valeur", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
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
        { field: "Valeur", header: "Valeur", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "Detenteur", header: "Détenteur", dataType: "string", inputOptions: { type: "text", required: false } },
        { field: "RevenusDistribue", header: "Revenus distribués", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "FiscaliteOuRevenue", header: "Fiscalité ou revenu", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
        { field: "TauxRevalorisation", header: "Taux de révalorisation", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 0.1 } },
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
        { field: "Valeur", header: "Valeur", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 0.1 } },
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
        // create passif
        this.dialogPassif.title = "Creation de " + type;
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
        this.loader.show();
        this.clientService.CreatePassif(this.dialogPassif.data).subscribe(
          (response) => {
            console.log("response CreatePassif: ", response);
            this.loader.hide();
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
            this.loader.hide();
            this.toastr.error(error?.error, "Erreur de creation du passif");
          }
        );
      } else {
        // submit update
        this.loader.show();
        this.clientService.UpdatePassif(this.dialogPassif.data).subscribe(
          (response) => {
            console.log("response UpdatePassif: ", response);
            this.loader.hide();
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
            this.loader.hide();
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
          header: "Sexe",
          dataType: "string",
          inputOptions: {
            type: "select",
            required: true,
            selectValue: "key",
            selectLibelle: "libelle",
            selectData: [
              { key: "homme", libelle: "Homme" },
              { key: "femme", libelle: "Femme" },
            ],
          },
        },
        { field: "Designation", header: "Désignation", dataType: "string", inputOptions: { type: "text", required: true } },
        { field: "Montant", header: "Montant", dataType: "number", inputOptions: { type: "number", required: false, min: 0, step: 1 } },
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
        this.dialogBudget.title = "Creation de Budget";
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
        this.loader.show();
        this.clientService.CreateBudget(this.dialogBudget.data).subscribe(
          (response) => {
            console.log("response CreateBudget: ", response);
            this.loader.hide();
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
            this.loader.hide();
            this.toastr.error(error?.error, "Erreur de creation du budget");
          }
        );
      } else {
        // submit update
        this.loader.show();
        this.clientService.UpdateBudget(this.dialogBudget.data).subscribe(
          (response) => {
            console.log("response UpdateBudget: ", response);
            this.loader.hide();
            if (response == null && response == false) {
              this.toastr.error("Erreur de modification du budget");
            } else {
              this.toastr.success("Budget modifié avec succès");
              this.currentClient.Budgets.push(this.dialogBudget.data);
              this.dialogBudget.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
            }
          },
          (error) => {
            console.error("Erreur UpdateBudget: ", error);
            this.loader.hide();
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
  onNavChange(changeEvent: NgbNavChangeEvent) {
    // console.log("onNavChange changeEvent: ", changeEvent)
    if (changeEvent.nextId === 4) {
      changeEvent.preventDefault();
    }
  }

  OpenPieceTools(clientpieceid: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: { confirmButton: "btn btn-danger", cancelButton: "btn btn-light me-2", denyButton: "btn btn-primary me-2" },
      buttonsStyling: false,
    });

    let clientPiece = this.currentClient.ClientPieces.find((x) => x.ClientPieceId == clientpieceid);
    console.log("clientPiece: ", clientPiece);

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
          this.loader.show();
          this.clientService.DeleteClientPiece(clientpieceid).subscribe(
            (response) => {
              console.log("response DeleteClientPiece: ", response);
              this.loader.hide();
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
              this.loader.hide();
            }
          );
        } else if (result.isDenied) {
          // Action lorsque l'utilisateur clique sur "Télécharger"

          Swal.fire("Téléchargement!", "Votre fichier est en cours de téléchargement.", "info");
        } else {
          // Action lorsque l'utilisateur clique sur "Annuler" ou ferme la boîte de dialogue
          // Swal.fire('Annulé', 'Votre action a été annulée :)', 'info');
        }
      });
  }
  OnSearchPieceKeyUp(event) {
    // console.log("OnSearchPieceKeyUp: ", event, "this.filterPiecesText: ", this.filterPiecesText);
    this.filtredClientPieces = this.currentClient.ClientPieces.filter((x) => x.Libelle.toLowerCase().includes(this.filterPiecesText.toLowerCase()) || x.Extension.toLowerCase().includes(this.filterPiecesText.toLowerCase()));
  }
  ngOnInit() {
    this.activeTabId = 1;

    this.route.params.subscribe((params) => {
      let clientId = params["id"];

      this.loader.show();
      this.clientService.GetClient(clientId).subscribe(
        (response) => {
          console.log("response GetClient: ", response);

          if (response == null) {
            this.toastr.error("Erreur de récuperation du client");
            setTimeout(() => {
              this.router.navigate(["/clients"]);
            }, 2000);
          } else {
            this.currentClient = response;
            this.filtredClientPieces = this.currentClient.ClientPieces;
            this.title.setTitle(`${this.currentClient.Nom} ${this.currentClient.Prenom} | ACM`);

            // get liste pieces
            this.enumService.GetPieces().subscribe(
              (responsePieces) => {
                this.loader.hide();
                this.Pieces = responsePieces;
              },
              (errorPieces) => {
                this.loader.hide();
              }
            );
          }
        },
        (error) => {
          console.error("Error GetClient: ", error);
          this.loader.hide();
          this.toastr.error("Erreur de récuperation du client");
          setTimeout(() => {
            this.router.navigate(["/clients"]);
          }, 2000);
        }
      );
    });
  }

  //#region ImportPiece
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
        this.toastr.warning("Veuillez choisir une piece.");
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

      this.loader.show();
      this.clientService.CreateClientPiece(this.dialogImportPiece.formData).subscribe(
        (response: any) => {
          console.log("response CreateClientPiece: ", response);
          this.loader.hide();

          if (response == null || response == false) {
            this.toastr.error("Erreur d'imporation du fichier.");
          } else {
            this.toastr.success("Importation reussi");
            // clear file input:
            let inputElem: any = document.getElementById(`importFile`);
            inputElem.value = "";

            this.currentClient.ClientPieces.push(newClientPiece);
            this.dialogImportPiece.Close();
          }
        },
        (error: any) => {
          console.error("error CreateClientPiece: ", error);
          this.loader.hide();
          this.toastr.error("Erreur d'imporation du fichier.");

          // clear file input:
          let inputElem: any = document.getElementById(`importFile`);
          inputElem.value = "";
        }
      );
    },
  };
  //#endregion ImportPiece

  tasks: any[] = [
    {
      title: "Préparer la liste des pieces du dossier de la carte de sejour",
      date: "28 Mai 2023",
      status: "Terminé",
      prestation: "Demande de carte de sejour",
      statusClass: "text-bg-success",
    },
    {
      title: "Remettre la liste des pieces  du dossier carte sejour",
      date: "12 Juin 2023",
      status: "Terminé",
      prestation: "Demande de carte de sejour",
      statusClass: "text-bg-success",
    },
    {
      title: "Receptionner les pieces du depot de la carte de sejour",
      date: "12 Juillet 2023",
      status: "En cours",
      prestation: "Demande de carte de sejour",
      statusClass: "text-bg-warning",
    },
    {
      title: "Scanner et enregistrer le passeport + cachet d'entrée",
      date: "14 Juin 2023",
      status: "En cours",
      prestation: "Demande de carte de sejour",
      statusClass: "text-bg-warning",
    },
    {
      title: "Valider le dossier de la carte de sejour",
      date: "25 Juin 2023",
      status: "En cours",
      prestation: "Demande de carte de sejour",
      statusClass: "text-bg-warning",
    },
    {
      title: "Déposer le dossier de la carte sejour/prefecture",
      date: "25 Juin 2023",
      status: "En cours",
      prestation: "Demande de carte de sejour",
      statusClass: "text-bg-warning",
    },
  ];

  // onImmobilierChange() {
  // }

  // addImmobilier() {

  // }

  // onProfChange() {
  // }

  // addProf() {
  // }

  // onDetteChange() {
  // }

  // addDette() {
  // }
  // onAssurChange() {
  // }

  // addAssur() {
  // }
  // onEparChange() {
  // }

  // addEpar() {
  // }

  // onMobilChange() {
  // }

  // addMobil() {
  // }
  // onDispoChange() {
  // }

  // addDispo() {
  // }

  // onBudgetChange() {
  // }

  // addBudget() {
  // }

  // addPartic() {
  // }

  // addSituationAdmin() {
  // }
}
