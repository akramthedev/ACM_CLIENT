import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, PLATFORM_ID, Inject, EventEmitter, Output } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.scss']
})
export class AddClientComponent implements OnInit, OnDestroy {

  @ViewChild("addClient", { static: false }) AddClient: TemplateRef<any>;
  @Output('btnSaveEmitter') btnSaveEmitter: EventEmitter<any> = new EventEmitter<any>();

  clientData: {
    ClientId: string,
    Nom: string,
    Prenom: string,
    DateNaissance: string,
    SituationFamiliale: string,
    Profession: string,
    DateRetraite: string,
    NumeroSS: string,
    Adresse: string,
    Email: string,
    Tel: string,
    TelType: string,
    ImgSrc: string,
    hasConjoint: string,
    ConjointName: string,
    ConjointPrenom: string,
    ConjointDateNaissance: string,
    ConjointProfession:string,
    ConjointDateRetraite: string,
    ConjointNumeroSS: string,
    DateMariage: string,
    RegimeMatrimonial: string,
    DonationEpoux: string,
    ModifRegimeDate:string,
    QuestComp:string
  } = {
    ClientId: '',
    Nom: '',
    Prenom: '',
    DateNaissance: '',
    SituationFamiliale: '',
    Profession: '',
    DateRetraite: '',
    NumeroSS: '',
    Adresse: '',
    Email: '',
    Tel: '',
    TelType: '',
    ImgSrc: "assets/images/user/8.jpg",
    hasConjoint: '',
    ConjointName: '',
    ConjointPrenom: '',
    ConjointDateNaissance: '',
    ConjointProfession:'',
    ConjointDateRetraite: '',
    ConjointNumeroSS: '',
    DateMariage: '',
    RegimeMatrimonial: '',
    DonationEpoux: '',
    ModifRegimeDate:'',
    QuestComp:''
  };

  public closeResult: string;
  public modalOpen: boolean = false;
  public currentStep: number = 1;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    console.log("addClient.ngOnInit");
  }

  openModal() {
    if (isPlatformBrowser(this.platformId)) {
      this.resetForm();
      this.modalService.open(this.AddClient, {
        size: 'xl',
        ariaLabelledBy: 'modal',
        centered: true,
        windowClass: 'modal-bookmark'
      }).result.then((result) => {
        this.modalOpen = true;
        `Result ${result}`;
      }, (reason) => {
        
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        console.log(this.closeResult)
      });
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      
      console.log(reason)
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      
      console.log(reason)
      return 'by clicking on a backdrop';
    } else {
      
      console.log(reason)
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

  onSave() {
    if (this.isFormValid()) {
      console.log("addClient.OnSave: ", this.clientData);
      this.btnSaveEmitter.emit(this.clientData);
      this.modalService.dismissAll();
      this.resetForm();
    } else {
      alert("Veuillez remplir tous les champs obligatoires.");
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

  sweetAlertDiss(){
    Swal.fire({
      title: "Tu veux enregistrer le client ?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Enregistrer",
      denyButtonText: `Ne pas enregistrer`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        Swal.fire("Enregistré !", "", "success");
      } else if (result.isDenied) {
        Swal.fire("Tu n'as pas enregistrer le client", "", "info");
      }
    });
  }

  private isFormValid(): boolean {
    if (this.currentStep === 1 && (!this.clientData.Nom || !this.clientData.Prenom)) {
      return false;
    }
    if (this.currentStep === 2 && (!this.clientData.Nom || !this.clientData.Prenom)) {
      return false;
    }
    if (this.currentStep === 3 && (!this.clientData.Nom || !this.clientData.Prenom)) {
      return false;
    }
    return true;
  }

  private resetForm() {
    this.clientData = {
      ClientId: '',
      Nom: '',
      Prenom: '',
      DateNaissance: '',
      SituationFamiliale: '',
      Profession: '',
      DateRetraite: '',
      NumeroSS: '',
      Adresse: '',
      Email: '',
      Tel: '',
      TelType: '',
      ImgSrc: "assets/images/user/8.jpg",
      hasConjoint: 'no',
      ConjointName: '',
      ConjointPrenom: '',
      ConjointDateNaissance: '',
      ConjointProfession:'',
      ConjointDateRetraite: '',
      ConjointNumeroSS: '',
      DateMariage: '',
      RegimeMatrimonial: '',
      DonationEpoux: '',
      ModifRegimeDate:'',
      QuestComp:''
    };
    this.currentStep = 1;
  }

  onConjointChange() {
    if (this.clientData.hasConjoint === 'no') {
      this.clientData.ConjointName='',
      this.clientData.ConjointPrenom = '';
      this.clientData.ConjointDateNaissance = '';
      this.clientData.ConjointProfession='';
      this.clientData.ConjointDateRetraite = '';
      this.clientData.ConjointNumeroSS = '';
      this.clientData.DateMariage = '';
      this.clientData.RegimeMatrimonial = '';
      this.clientData.DonationEpoux = '';
      this.clientData.ModifRegimeDate="";
      this.clientData.QuestComp="";
    }
  }
}
