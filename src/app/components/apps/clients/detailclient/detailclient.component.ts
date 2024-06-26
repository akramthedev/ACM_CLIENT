import { Component, EventEmitter, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Piece, } from 'src/app/shared/model/dto.model';
import { ClientService } from 'src/app/shared/services/client.service';
import { EnumService } from 'src/app/shared/services/enum.service';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from "uuid";

interface Task {
  title: string;
  date: string;
  status: string;
  prestation: string;
  statusClass: string;
}

interface Usage {
  Designation: string;
  Valeur: string;
  Detenteur: string;
  Charge: string;
  Capital: string;
  Duree: string;
  Taux: string;
  Deces: string;
}

interface Immobilier {
  Designation: string;
  Valeur: string;
  Detenteur: string;
  Revenue: string;
  Charge: string;
  Capital: string;
  Duree: string;
  Taux: string;
  Deces: string;
}
interface Professionnel {
  Designation: string;
  Valeur: string;
  Detenteur: string;
  Charge: string;
  Partic: string;

}
interface Dette {
  Designation: string;
  Capital: string;
  Duree: string;
  Taux: string;
  Deces: string;
  Partic: string;

}
interface Assur {
  Designation: string;
  Capital: string;
  Date: string;
  Assur: string;
  Benef: string;
  Partic: string;

}
interface Epar {
  Designation: string;
  Valeur: string;
  Detenteur: string;
  Date: string;
  Epar: string;
  Partic: string;

}
interface Mobiliere {
  Designation: string;
  Valeur: string;
  Detenteur: string;
  RevenuDis: string;
  Fisca: string;
  Taux: string;

}
interface Disponibilite {
  Designation: string;
  Valeur: string;
  Detenteur: string;
  Partic: string;


}
interface Budget {
  Designation: string;
  Montant: string;


}

interface SituationAdmin {
  CFE: string;
  Cotisation: string;
  Reversion: string;
  CNSS: string;
  CNAREFE: string;
  Capitone: string;
  Rapatriement: string;
  Mutuelle: string;
  Passeport: string;
  CarteSejour: string;
  Permis: string;
  AssurAuto: string;
  AssurHabi: string;
  InscriConsulat: string;
  UFE: string;
  CSG: string;
}

@Component({
  selector: 'app-detailclient',
  templateUrl: './detailclient.component.html',
  styleUrl: './detailclient.component.scss'
})
export class DetailclientComponent {

  clientId: string;

  activeTabId: number = 1;
  disabled = true;
  currentClient: any;

  filtredClientPieces: any[] = [];
  filterPiecesText: string = "";

  Pieces: Piece[] = [];

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private enumService: EnumService,
    private loader: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router,
    private title: Title,
    private modalService: NgbModal,
  ) {

    // setInterval(() => {
    //   this.toastr.success("aaaghbjkl;knhghjk");
    // }, 5000)

  }



  onNavChange(changeEvent: NgbNavChangeEvent) {
    // console.log("onNavChange changeEvent: ", changeEvent)
    if (changeEvent.nextId === 4) {
      changeEvent.preventDefault();
    }
  }

  OpenPieceTools(clientpieceid: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-light me-2',
        denyButton: 'btn btn-primary me-2'
      },
      buttonsStyling: false,
    });

    let clientPiece = this.currentClient.ClientPieces.find(x => x.ClientPieceId == clientpieceid);
    console.log("clientPiece: ", clientPiece);


    swalWithBootstrapButtons.fire({
      title: clientPiece.Libelle,//,'Tu es sûr ?',
      // text: clientPiece.Libelle,
      icon: null,//'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      showDenyButton: true,
      denyButtonText: 'Télécharger',
    }).then((result) => {
      // Gérer les actions en fonction du bouton cliqué
      if (result.isConfirmed) {
        // Action lorsque l'utilisateur clique sur "Supprimer"
        // Swal.fire('Supprimé!', 'Votre élément a été supprimé.', 'success');
        this.loader.show()
        this.clientService.DeleteClientPiece(clientpieceid)
          .subscribe((response) => {
            console.log("response DeleteClientPiece: ", response);
            this.loader.hide();
            if (response == null || response == false) {
              this.toastr.error("Erreur de suppression de la pièce");

            } else {
              this.toastr.success("Suppression de la pièce effectué");
              this.filtredClientPieces = this.filtredClientPieces.filter(x => x.ClientPieceId != clientpieceid);
              this.currentClient.ClientPieces = this.currentClient.ClientPieces.filter(x => x.ClientPieceId != clientpieceid);
            }

          }, (error) => {
            console.error("Erreur DeleteClientPiece: ", error);
            this.toastr.error("Erreur de suppression de la pièce");
            this.loader.hide();
          })

      } else if (result.isDenied) {
        // Action lorsque l'utilisateur clique sur "Télécharger"

        Swal.fire('Téléchargement!', 'Votre fichier est en cours de téléchargement.', 'info');
      } else {
        // Action lorsque l'utilisateur clique sur "Annuler" ou ferme la boîte de dialogue
        // Swal.fire('Annulé', 'Votre action a été annulée :)', 'info');
      }
    });
  }
  OnSearchPieceKeyUp(event) {
    // console.log("OnSearchPieceKeyUp: ", event, "this.filterPiecesText: ", this.filterPiecesText);
    this.filtredClientPieces = this.currentClient.ClientPieces.filter(x =>
      x.Libelle.toLowerCase().includes(this.filterPiecesText.toLowerCase()) ||
      x.Extension.toLowerCase().includes(this.filterPiecesText.toLowerCase()));
  }
  ngOnInit() {
    this.activeTabId = 1;

    this.route.params.subscribe((params) => {
      this.clientId = params['id'];

      this.loader.show();
      this.clientService.GetClient(this.clientId)
        .subscribe((response) => {
          console.log("response GetClient: ", response)

          if (response == null) {
            this.loader.hide();
            this.toastr.error("Erreur de récuperation du client");
            setTimeout(() => {
              this.router.navigate(["/clients"]);
            }, 2000);
          }
          this.currentClient = response;
          this.filtredClientPieces = this.currentClient.ClientPieces;
          this.title.setTitle(`${this.currentClient.Nom} ${this.currentClient.Prenom} | ACM`);

          // this.loader.show();
          this.enumService.GetPieces()
            .subscribe((responsePieces) => {
              // console.log("responsePieces: ", responsePieces);
              this.loader.hide();
              this.Pieces = responsePieces;
            }, (errorPieces) => {
              this.loader.hide();
            })

        }, (error) => {
          console.error("Error GetClient: ", error)
          this.loader.hide();
          this.toastr.error("Erreur de récuperation du client");
          setTimeout(() => {
            this.router.navigate(["/clients"]);
          }, 2000);
        });
    });
  }

  dialogImportPiece: any = {
    PiecesToChoose: [],
    SelectedPiece: null,
    SelectedFile: null,
    FileReady: false,
    formData: null,
    Open: (content) => {
      this.dialogImportPiece.PiecesToChoose = this.Pieces.filter(x => !this.currentClient.ClientPieces.map(w => w.PieceId).includes(x.PieceId));
      this.dialogImportPiece.SelectedPiece = null;
      console.log("PiecesToChoose: ", this.dialogImportPiece.PiecesToChoose);

      this.modalService.open(content, { centered: true, backdrop: true, });
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
      formData.append('file', event.target.files[0], event.target.files[0].name);
      console.log("event.target.files[0]: ", event.target.files[0])
      let fileName = event.target.files[0].name
      let extension = fileName.split(".")[fileName.split(".").length - 1]
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
        Libelle: this.Pieces.find(x => x.PieceId == this.dialogImportPiece.SelectedPiece)?.Libelle,
        Extension: this.dialogImportPiece.Extension,
      }
      this.dialogImportPiece.formData.append('ClientPieceId', newClientPiece.ClientPieceId);
      this.dialogImportPiece.formData.append('ClientId', newClientPiece.ClientId);
      this.dialogImportPiece.formData.append('PieceId', newClientPiece.PieceId);

      this.loader.show();
      this.clientService.CreateClientPiece(this.dialogImportPiece.formData)
        .subscribe((response: any) => {
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
        }, (error: any) => {
          console.error("error CreateClientPiece: ", error);
          this.loader.hide();
          this.toastr.error("Erreur d'imporation du fichier.");

          // clear file input:
          let inputElem: any = document.getElementById(`importFile`);
          inputElem.value = "";
        })
    }
  }

  tasks: Task[] = [
    {
      title: 'Préparer la liste des pieces du dossier de la carte de sejour',
      date: '28 Mai 2023',
      status: 'Terminé',
      prestation: 'Demande de carte de sejour',
      statusClass: 'text-bg-success'
    },
    {
      title: 'Remettre la liste des pieces  du dossier carte sejour',
      date: '12 Juin 2023',
      status: 'Terminé',
      prestation: 'Demande de carte de sejour',
      statusClass: 'text-bg-success'
    },
    {
      title: 'Receptionner les pieces du depot de la carte de sejour',
      date: '12 Juillet 2023',
      status: 'En cours',
      prestation: 'Demande de carte de sejour',
      statusClass: 'text-bg-warning'
    },
    {
      title: 'Scanner et enregistrer le passeport + cachet d\'entrée',
      date: '14 Juin 2023',
      status: 'En cours',
      prestation: 'Demande de carte de sejour',
      statusClass: 'text-bg-warning'
    },
    {
      title: 'Valider le dossier de la carte de sejour',
      date: '25 Juin 2023',
      status: 'En cours',
      prestation: 'Demande de carte de sejour',
      statusClass: 'text-bg-warning'
    },
    {
      title: 'Déposer le dossier de la carte sejour/prefecture',
      date: '25 Juin 2023',
      status: 'En cours',
      prestation: 'Demande de carte de sejour',
      statusClass: 'text-bg-warning'
    }
  ];

  clientData: {
    hasUsage: string;
    Usages: Usage[];
    hasImmobilier: string;
    Immobiliers: Immobilier[];
    hasProf: string;
    Profs: Professionnel[];
    hasDette: string;
    Dettes: Dette[];
    hasAssur: string;
    Assurs: Assur[];
    hasEpar: string;
    Epars: Epar[];
    hasMobil: string;
    Mobils: Mobiliere[];
    hasDispo: string;
    Dispos: Disponibilite[];
    hasBudget: string;
    Budgets: Budget[];
    Partic: string;
    SituationAdministrative: SituationAdmin;
  } = {
      hasUsage: '',
      Usages: [],
      hasImmobilier: '',
      Immobiliers: [],
      hasProf: '',
      Profs: [],
      hasDette: '',
      Dettes: [],
      hasAssur: '',
      Assurs: [],
      hasEpar: '',
      Epars: [],
      hasMobil: '',
      Mobils: [],
      hasDispo: '',
      Dispos: [],
      hasBudget: '',
      Budgets: [],
      Partic: '',
      SituationAdministrative: {
        CFE: '',
        Cotisation: '',
        Reversion: '',
        CNSS: '',
        CNAREFE: '',
        Capitone: '',
        Rapatriement: '',
        Mutuelle: '',
        Passeport: '',
        CarteSejour: '',
        Permis: '',
        AssurAuto: '',
        AssurHabi: '',
        InscriConsulat: '',
        UFE: '',
        CSG: '',

      },
    };

  newUsage: Usage = {
    Designation: '',
    Valeur: '',
    Detenteur: '',
    Charge: '',
    Capital: '',
    Duree: '',
    Taux: '',
    Deces: ''
  };

  newImmobilier: Immobilier = {
    Designation: '',
    Valeur: '',
    Detenteur: '',
    Revenue: '',
    Charge: '',
    Capital: '',
    Duree: '',
    Taux: '',
    Deces: ''
  };
  newProf: Professionnel = {
    Designation: '',
    Valeur: '',
    Detenteur: '',
    Charge: '',
    Partic: '',

  };
  newDette: Dette = {
    Designation: '',
    Capital: '',
    Duree: '',
    Taux: '',
    Deces: '',
    Partic: '',

  };
  newAssur: Assur = {
    Designation: '',
    Capital: '',
    Date: '',
    Assur: '',
    Benef: '',
    Partic: '',

  };
  newEpar: Epar = {
    Designation: '',
    Valeur: '',
    Detenteur: '',
    Date: '',
    Epar: '',
    Partic: '',

  };
  newMobil: Mobiliere = {
    Designation: '',
    Valeur: '',
    Detenteur: '',
    RevenuDis: '',
    Fisca: '',
    Taux: '',

  };
  newDispo: Disponibilite = {
    Designation: '',
    Valeur: '',
    Detenteur: '',
    Partic: '',


  };
  newBudget: Budget = {
    Designation: '',
    Montant: '',


  };
  newPartic: '';

  newSituationAdmin: SituationAdmin = {
    CFE: '',
    Cotisation: '',
    Reversion: '',
    CNSS: '',
    CNAREFE: '',
    Capitone: '',
    Rapatriement: '',
    Mutuelle: '',
    Passeport: '',
    CarteSejour: '',
    Permis: '',
    AssurAuto: '',
    AssurHabi: '',
    InscriConsulat: '',
    UFE: '',
    CSG: '',

  };


  onUsageChange() {
    if (this.clientData.hasUsage === 'non') {
      this.clientData.Usages = [];
    }
  }

  addUsage() {
    this.clientData.Usages.push({ ...this.newUsage });
    console.log(this.newUsage)
    this.newUsage = {
      Designation: '',
      Valeur: '',
      Detenteur: '',
      Charge: '',
      Capital: '',
      Duree: '',
      Taux: '',
      Deces: ''
    };

  }

  onImmobilierChange() {
    if (this.clientData.hasImmobilier === 'non') {
      this.clientData.Immobiliers = [];
    }
  }

  addImmobilier() {
    this.clientData.Immobiliers.push({ ...this.newImmobilier });
    this.newImmobilier = {
      Designation: '',
      Valeur: '',
      Detenteur: '',
      Revenue: '',
      Charge: '',
      Capital: '',
      Duree: '',
      Taux: '',
      Deces: ''
    };
  }

  onProfChange() {
    if (this.clientData.hasProf === 'non') {
      this.clientData.Profs = [];
    }
  }

  addProf() {
    this.clientData.Profs.push({ ...this.newProf });
    console.log(this.newProf)
    this.newProf = {
      Designation: '',
      Valeur: '',
      Detenteur: '',
      Charge: '',
      Partic: '',


    };
  }

  onDetteChange() {
    if (this.clientData.hasDette === 'non') {
      this.clientData.Dettes = [];
    }
  }

  addDette() {
    this.clientData.Dettes.push({ ...this.newDette });
    console.log(this.newDette)
    this.newDette = {
      Designation: '',
      Capital: '',
      Duree: '',
      Taux: '',
      Deces: '',
      Partic: '',


    };
  }
  onAssurChange() {
    if (this.clientData.hasAssur === 'non') {
      this.clientData.Assurs = [];
    }
  }

  addAssur() {
    this.clientData.Assurs.push({ ...this.newAssur });
    console.log(this.newAssur)
    this.newAssur = {
      Designation: '',
      Capital: '',
      Date: '',
      Assur: '',
      Benef: '',
      Partic: '',


    };
  }
  onEparChange() {
    if (this.clientData.hasEpar === 'non') {
      this.clientData.Epars = [];
    }
  }

  addEpar() {
    this.clientData.Epars.push({ ...this.newEpar });
    console.log(this.newEpar)
    this.newEpar = {
      Designation: '',
      Valeur: '',
      Detenteur: '',
      Date: '',
      Epar: '',
      Partic: '',


    };
  }

  onMobilChange() {
    if (this.clientData.hasMobil === 'non') {
      this.clientData.Mobils = [];
    }
  }

  addMobil() {
    this.clientData.Mobils.push({ ...this.newMobil });
    console.log(this.newMobil)
    this.newMobil = {
      Designation: '',
      Valeur: '',
      Detenteur: '',
      RevenuDis: '',
      Fisca: '',
      Taux: '',


    };
  }
  onDispoChange() {
    if (this.clientData.hasDispo === 'non') {
      this.clientData.Dispos = [];
    }
  }

  addDispo() {
    this.clientData.Dispos.push({ ...this.newDispo });
    console.log(this.newDispo)
    this.newDispo = {
      Designation: '',
      Valeur: '',
      Detenteur: '',
      Partic: '',



    };
  }

  onBudgetChange() {
    if (this.clientData.hasBudget === 'non') {
      this.clientData.Budgets = [];
    }
  }

  addBudget() {
    this.clientData.Budgets.push({ ...this.newBudget });
    console.log(this.newBudget)
    this.newBudget = {
      Designation: '',
      Montant: '',

    };
  }

  addPartic() {
    this.clientData.Partic = this.newPartic;
    console.log(this.newPartic)
    this.newPartic = '';
  }

  addSituationAdmin() {
    this.clientData.SituationAdministrative = { ...this.newSituationAdmin };
    console.log(this.newSituationAdmin)
    this.newSituationAdmin = {
      CFE: '',
      Cotisation: '',
      Reversion: '',
      CNSS: '',
      CNAREFE: '',
      Capitone: '',
      Rapatriement: '',
      Mutuelle: '',
      Passeport: '',
      CarteSejour: '',
      Permis: '',
      AssurAuto: '',
      AssurHabi: '',
      InscriConsulat: '',
      UFE: '',
      CSG: '',

    }
  }
}





