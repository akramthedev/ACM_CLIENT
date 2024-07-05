import { Component, EventEmitter, Output } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbNavChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { Client, Passif, Piece } from "src/app/shared/model/dto.model";
import { Patrimoine } from "src/app/shared/model/dto.model";
import { Budget } from "src/app/shared/model/dto.model";
import { ClientService } from "src/app/shared/services/client.service";
import { EnumService } from "src/app/shared/services/enum.service";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";

interface Task {
  title: string;
  date: string;
  status: string;
  prestation: string;
  statusClass: string;
}

@Component({
  selector: "app-detailclient",
  templateUrl: "./detailclient.component.html",
  styleUrl: "./detailclient.component.scss",
})
export class DetailclientComponent {
  @Output("btnSaveEmitter") btnSaveEmitter: EventEmitter<any> = new EventEmitter<any>();

  activeTabId: number = 1;
  disabled = true;
  currentClient: Client;

  filtredClientPieces: any[] = [];
  filterPiecesText: string = "";

  Pieces: Piece[] = [];
  Patrimoines: Patrimoine[] = [];
  Passifs: Passif[] = [];
  Budgets: Budget[] = [];
  constructor(private route: ActivatedRoute, private clientService: ClientService, private enumService: EnumService, private loader: NgxSpinnerService, private toastr: ToastrService, private router: Router, private title: Title, private modalService: NgbModal) {}

  editPatrimoine(id: string) {
    console.log("Edit patrimoine cliquer");
    this.dialogPatrimoine.Open(id);
  }

  deletePatrimoine(id: string) {
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

  //#region Patrimoine

  tablesPatrimoines: { title: string; type: string; noDataMessage: string; total: number; columns: any[] }[] = [
    {
      title: "Biens d'usage",
      type: "Bien d'usage",
      noDataMessage: "Aucun bien d'usage enregistré",
      total: 1553548.52,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string" },
        { field: "Adresse", header: "Adresse", dataType: "string" },
        { field: "Valeur", header: "Valeur", dataType: "number" },
        { field: "Detenteur", header: "Détenteur", dataType: "string" },
        { field: "ChargesAssocies", header: "Charges associées", dataType: "string" },
        { field: "DateAchat", header: "Date d'achat", dataType: "date" },
        { field: "CapitalEmprunte", header: "Capital emprunté", dataType: "string" },
        { field: "Duree", header: "Durée", dataType: "number" },
        { field: "Taux", header: "Taux", dataType: "number" },
        { field: "AGarantieDeces", header: "Garantie Décès", dataType: "bool" },
        { field: null, header: "Action", dataType: "" },
      ],
    },
    {
      title: "Immobiliers de rapport",
      type: "Immobilier de rapport",
      noDataMessage: "Aucun immobilier de rapport enregistré",
      total: 123456.55,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string" },
        { field: "Adresse", header: "Adresse", dataType: "string" },
        { field: "Valeur", header: "Valeur", dataType: "number" },
        { field: "Detenteur", header: "Détenteur", dataType: "string" },
        { field: "DateAchat", header: "Date d'achat", dataType: "date" },
        { field: "RevenueFiscalite", header: "Revenue et fiscalité", dataType: "string" },
        { field: "Charges", header: "Charges", dataType: "string" },
        { field: "CapitalEmprunte", header: "Capital emprunté", dataType: "number" },
        { field: "Duree", header: "Durée", dataType: "number" },
        { field: "Taux", header: "Taux", dataType: "number" },
        { field: "AGarantieDeces", header: "Garantie Décès", dataType: "bool" },
        { field: null, header: "Action", dataType: "" },
      ],
    },
    {
      title: "Biens professionnels",
      type: "Bien professionnel",
      noDataMessage: "Aucun bien professionel enregistré",
      total: 941581,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string" },
        { field: "Valeur", header: "Valeur", dataType: "number" },
        { field: "Detenteur", header: "Détenteur", dataType: "string" },
        { field: "ChargesAssocies", header: "Charges Associées", dataType: "string" },
        { field: "Particularite", header: "Particularités", dataType: "string" },
      ],
    },
  ];

  GetPatrimoines(type?: "Bien d'usage" | "Immobilier de rapport" | "Bien professionnel") {
    return this.currentClient.Patrimoines.filter((x) => (type != null ? x.TypePatrimoine === type : true));
  }

  dialogPatrimoine: {
    data: Patrimoine;
    isEditing: boolean;
    Open: Function;
    Submit: Function;
    Close: Function;
    Clear: Function;
  } = {
    data: null,
    isEditing: null,
    Open: (id: string | null, type?: "Bien d'usage" | "Immobilier de rapport" | "Bien professionnel") => {
      if (id == null) {
        // create patrimoine
        this.dialogPatrimoine.isEditing = false;
        this.dialogPatrimoine.data = {
          PatrimoineId: uuidv4(),
          ClientId: this.currentClient.ClientId,
          TypePatrimoine: type,
        };
        const modalDiv = document.getElementById("DialogPatrimoine");
        if (modalDiv != null) modalDiv.style.display = "block";
      } else {
        // edit patrimoine
        this.dialogPatrimoine.isEditing = true;
        // get patrimoie data
        let p = this.currentClient.Patrimoines.find((x) => x.PatrimoineId == id);
        this.dialogPatrimoine.data = structuredClone(p);
        const modalDiv = document.getElementById("DialogPatrimoine");
        if (modalDiv != null) modalDiv.style.display = "block";
      }
    },

    Submit: () => {
      console.log("sublit: this.dialogPatrimoine.data: ", this.dialogPatrimoine.data);

      if (!this.dialogPatrimoine.isEditing) {
        // submit create
        this.clientService.CreatePatrimoine(this.dialogPatrimoine.data).subscribe(
          (response) => {
            console.log("response CreatePatrimoine: ", response);

            if (response == null && response == false) {
              this.toastr.error("Erreur de creation");
            } else {
              this.toastr.success("Patrimoine ajouté avec succès");
              this.currentClient.Patrimoines.push(this.dialogPatrimoine.data);
              this.dialogPatrimoine.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
              // this.btnSaveEmitter.emit(this.patrimoineData);
            }
          },
          (error) => {
            console.error("Erreur CreatePatrimoine: ", error);
            this.toastr.error(error?.error, "Erreur de creation du patrimoine");
          }
        );
      } else {
        // submit update
      }
    },
    Close: () => {
      const modalDiv = document.getElementById("DialogPatrimoine");
      if (modalDiv != null) modalDiv.style.display = "none";
      this.dialogPatrimoine.Clear();
    },
    Clear: () => {
      this.dialogPatrimoine.data = null;
      this.dialogPatrimoine.isEditing = null;
    },
  };

  //#endregion Patrimoine

  //#region Passif

  tablesPassifs: { title: string; type: string; noDataMessage: string; total: number; columns: any[] }[] = [
    {
      title: "Passif",
      type: "Passif",
      noDataMessage: "Aucun passif enregistré",
      total: 1553548.52,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string" },
        { field: "CapitalEmprunte", header: "Capital emprunté", dataType: "number" },
        { field: "DureeMois", header: "Durée", dataType: "number" },
        { field: "Taux", header: "Taux", dataType: "number" },
        { field: "AGarantieDeces", header: "Garantie Décès", dataType: "bool" },
        { field: "Particularite", header: "Particularités", dataType: "string" },
        { field: null, header: "Action", dataType: "" },
      ],
    },
    {
      title: "Assurance",
      type: "Assurance",
      noDataMessage: "Aucune assurance enregistrée",
      total: 123456.55,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string" },
        { field: "ValeurRachat", header: "Valeur de rachat", dataType: "number" },
        { field: "DateSouscription", header: "Date de souscription", dataType: "number" },
        { field: "Assure", header: "Assuré", dataType: "bool" },
        { field: "Beneficiaire", header: "Bénéficiaires", dataType: "string" },
        { field: "Particularite", header: "Particularités", dataType: "string" },
        { field: null, header: "Action", dataType: "" },
      ],
    },
    {
      title: "Epargne et depot à moyen et long terme",
      type: "Epargne",
      noDataMessage: "Aucun epargne enregistré",
      total: 941581,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string" },
        { field: "Valeur", header: "Valeur", dataType: "number" },
        { field: "Detenteur", header: "Détenteur", dataType: "string" },
        { field: "DateOuverture", header: "Date d'ouverture", dataType: "date" },
        { field: "EpargneAssocie", header: "Epargne associée", dataType: "string" },
        { field: "Particularite", header: "Particularités", dataType: "string" },
      ],
    },
    {
      title: "Valeurs mobilières",
      type: "Valeurs mobilières",
      noDataMessage: "Aucune valeur mobilière enregistré",
      total: 941581,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string" },
        { field: "Valeur", header: "Valeur", dataType: "number" },
        { field: "Detenteur", header: "Détenteur", dataType: "string" },
        { field: "RevenusDistribue", header: "Revenus distribués", dataType: "number" },
        { field: "FiscaliteOuRevenue", header: "Epargne associée", dataType: "number" },
        { field: "TauxRevalorisation", header: "Taux de révalorisation", dataType: "string" },
      ],
    },
    {
      title: "Disponibilités",
      type: "Disponibilité",
      noDataMessage: "Aucune disponibilité enregistré",
      total: 941581,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string" },
        { field: "Valeur", header: "Valeur", dataType: "number" },
        { field: "Detenteur", header: "Détenteur", dataType: "string" },
        { field: "Particularite", header: "Particularités", dataType: "string" },
      ],
    },
  ];

  GetPassifs(type?: "Passif" | "Assurance" | "Epargne" | "Valeurs mobilières" | "Disponibilité") {
    return this.currentClient.Passifs.filter((x) => (type != null ? x.TypePassifs === type : true));
  }

  dialogPassif: {
    data: Passif;
    isEditing: boolean;
    Open: Function;
    Submit: Function;
    Close: Function;
    Clear: Function;
  } = {
    data: null,
    isEditing: null,
    Open: (id: string | null, type?: "Passif" | "Assurance" | "Epargne" | "Valeurs mobilières" | "Disponibilité") => {
      if (id == null) {
        // create passif
        this.dialogPassif.isEditing = false;
        this.dialogPassif.data = {
          PassifsId: uuidv4(),
          ClientId: this.currentClient.ClientId,
          TypePassifs: type,
        };
        const modalDiv = document.getElementById("DialogPassif");
        if (modalDiv != null) modalDiv.style.display = "block";
      } else {
        // edit passif
        this.dialogPassif.isEditing = true;
        // get passif data
        let p = this.currentClient.Passifs.find((x) => x.PassifsId == id);
        this.dialogPassif.data = structuredClone(p);
        const modalDiv = document.getElementById("DialogPassif");
        if (modalDiv != null) modalDiv.style.display = "block";
      }
    },

    Submit: () => {
      console.log("sublit: this.dialogPassif.data: ", this.dialogPassif.data);

      if (!this.dialogPassif.isEditing) {
        // submit create
        this.clientService.CreatePassif(this.dialogPassif.data).subscribe(
          (response) => {
            console.log("response CreatePassif: ", response);

            if (response == null && response == false) {
              this.toastr.error("Erreur de creation");
            } else {
              this.toastr.success("Passif ajouté avec succès");
              this.currentClient.Passifs.push(this.dialogPassif.data);
              this.dialogPassif.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
              // this.btnSaveEmitter.emit(this.patrimoineData);
            }
          },
          (error) => {
            console.error("Erreur CreatePassif: ", error);
            this.toastr.error(error?.error, "Erreur de creation du passif");
          }
        );
      } else {
        // submit update
      }
    },
    Close: () => {
      const modalDiv = document.getElementById("DialogPassif");
      if (modalDiv != null) modalDiv.style.display = "none";
      this.dialogPassif.Clear();
    },
    Clear: () => {
      this.dialogPassif.data = null;
      this.dialogPassif.isEditing = null;
    },
  };

  //#endregion Passif

  //#region Budget

  tablesbudgets: { title: string; noDataMessage: string; total: number; columns: any[] }[] = [
    {
      title: "Budget",
      noDataMessage: "Aucun budget enregistré",
      total: 1553548.52,
      columns: [
        { field: "Designation", header: "Désignation", dataType: "string" },
        { field: "MontantMr", header: "Adresse", dataType: "string" },
        { field: "MontantMme", header: "Valeur", dataType: "number" },
        { field: null, header: "Action", dataType: "" },
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
    Open: Function;
    Submit: Function;
    Close: Function;
    Clear: Function;
  } = {
    data: null,
    isEditing: null,
    Open: (id: string | null) => {
      if (id == null) {
        // create budget
        this.dialogBudget.isEditing = false;
        this.dialogBudget.data = {
          BudgetsId: uuidv4(),
          ClientId: this.currentClient.ClientId,
        };
        const modalDiv = document.getElementById("DialogBudget");
        if (modalDiv != null) modalDiv.style.display = "block";
      } else {
        // edit patrimoine
        this.dialogBudget.isEditing = true;
        // get patrimoie data
        let p = this.currentClient.Budgets.find((x) => x.BudgetsId == id);
        this.dialogBudget.data = structuredClone(p);
        const modalDiv = document.getElementById("DialogBudget");
        if (modalDiv != null) modalDiv.style.display = "block";
      }
    },

    Submit: () => {
      console.log("sublit: this.dialogBudget.data: ", this.dialogBudget.data);

      if (!this.dialogBudget.isEditing) {
        // submit create
        this.clientService.CreateBudget(this.dialogBudget.data).subscribe(
          (response) => {
            console.log("response CreateBudget: ", response);

            if (response == null && response == false) {
              this.toastr.error("Erreur de creation");
            } else {
              this.toastr.success("Budget ajouté avec succès");
              this.currentClient.Budgets.push(this.dialogBudget.data);
              this.dialogBudget.Close();
              // Swal.fire("Succès", "Client ajouté avec succès", "success");
              // this.btnSaveEmitter.emit(this.patrimoineData);
            }
          },
          (error) => {
            console.error("Erreur CreateBudget: ", error);
            this.toastr.error(error?.error, "Erreur de creation du budget");
          }
        );
      } else {
        // submit update
      }
    },
    Close: () => {
      const modalDiv = document.getElementById("DialogBudget");
      if (modalDiv != null) modalDiv.style.display = "none";
      this.dialogBudget.Clear();
    },
    Clear: () => {
      this.dialogBudget.data = null;
      this.dialogBudget.isEditing = null;
    },
  };

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

            this.clientService.GetPatrimoines(this.currentClient.ClientId).subscribe(
              (response) => {
                console.log("response getPatrimoines ", response);
                this.currentClient.Patrimoines = response;
                this.loader.hide();
              },
              (error) => {
                console.error("error fetching patrimoines ", error);
                this.loader.hide();
              }
            );

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

  tasks: Task[] = [
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
