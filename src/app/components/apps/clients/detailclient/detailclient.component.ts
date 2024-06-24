import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute  } from '@angular/router';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ClientService } from 'src/app/shared/services/client.service';

interface Task {
  title: string;
  date: string;
  client:string;
  status: string;
  price: string;
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
  Deces:string;
  Partic: string;
   
}
interface Assur {
  Designation: string;
  Capital: string;
  Date: string;
  Assur: string;
  Benef:string;
  Partic: string;
   
}
interface Epar {
  Designation: string;
  Valeur: string;
  Detenteur: string;
  Date:string;
  Epar:string;
  Partic: string;
   
}
interface Mobiliere {
  Designation: string;
  Valeur: string;
  Detenteur: string;
  RevenuDis:string;
  Fisca:string;
  Taux: string;
   
}
interface Disponibilite {
  Designation: string;
  Valeur: string;
  Detenteur: string;
  Partic:string;
  
   
}
interface Budget {
  Designation: string;
  Montant: string;
  
   
}

interface SituationAdmin{
  CFE:string;
  Cotisation:string;
  Reversion:string;
  CNSS:string;
  CNAREFE:string;
  Capitone:string;
  Rapatriement:string;
  Mutuelle:string;
  Passeport:string;
  CarteSejour:string;
  Permis:string;
  AssurAuto:string;
  AssurHabi:string;
  InscriConsulat:string;
  UFE:string;
  CSG:string;
 

}
@Component({
  selector: 'app-detailclient',
  
  templateUrl: './detailclient.component.html',
  styleUrl: './detailclient.component.scss'
})
export class DetailclientComponent {
  // clientId:number;
  clientId:string;
  public active1 = 1;
  public active2 = 1;
  public active3 = 1;
  public active4 = 1;
  disabled = true;
  currentClient:any;

  constructor(private route: ActivatedRoute,private clientService:ClientService){

  }
  onNavChange1(changeEvent: NgbNavChangeEvent) {
    if (changeEvent.nextId === 4) {
      changeEvent.preventDefault();
    }
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    if (changeEvent.nextId === 4) {
      changeEvent.preventDefault();
    }
  }
  ngOnInit() {
    this.route.params.subscribe(params => {
      // this.clientId = +params['id'];
      this.clientId= params['id'];
      console.log("clientId : ",this.clientId)
      this.loadClientDetails();
    });
  }

  loadClientDetails() {
    // Logique pour charger les détails du client avec this.clientId
    // Exemple :
    this.clientService.getClientDetails(this.clientId).subscribe(data => {
      this.currentClient = data;
      this.tasks=[
        {
          title: 'Préparer la liste des pieces du dossier de la carte de sejour',
          date: '28 May 2023',
          client:this.currentClient.Nom + ' '+this.currentClient.Prenom,
          status: 'Terminé',
          price: '900 DH',
          statusClass: 'text-bg-success'
        },
        {
          title: 'Remettre la liste des pieces  du dossier carte sejour',
          date: '12 June 2023',
          client:this.currentClient.Nom + ' '+this.currentClient.Prenom,
          status: 'Terminé',
          price: '200 DH',
          statusClass: 'text-bg-success'
        },
        {
          title: 'Receptionner les pieces du depot de la carte de sejour',
          date: '12 July 2023',
          client:this.currentClient.Nom + ' '+this.currentClient.Prenom,
          status: 'En cours',
          price: '300 DH',
          statusClass: 'text-bg-warning'
        },
        {
          title: 'Scanner et enregistrer le passeport + cachet d\'entrée',
          date: '14 June 2023',
          client:this.currentClient.Nom + ' '+this.currentClient.Prenom,
          status: 'En cours',
          price: '400 DH',
          statusClass: 'text-bg-warning'
        },
        {
          title: 'Valider le dossier de la carte de sejour',
          date: '25 June 2023',
          client:this.currentClient.Nom + ' '+this.currentClient.Prenom,
          status: 'En cours',
          price: '300 DH',
          statusClass: 'text-bg-warning'
        },
        {
          title: 'Déposer le dossier de la carte sejour/prefecture',
          date: '25 June 2023',
          client:this.currentClient.Nom + ' '+this.currentClient.Prenom,
          status: 'En cours',
          price: '300 DH',
          statusClass: 'text-bg-warning'
        }
      ]
          console.log("currentClient : ",this.currentClient)
    });
  }
  tasks: Task[] ;
  
  clientData: {
    hasUsage: string;
    Usages: Usage[];
    hasImmobilier: string;
    Immobiliers: Immobilier[];
    hasProf:string;
    Profs:Professionnel[];
    hasDette:string;
    Dettes:Dette[];
    hasAssur:string;
    Assurs:Assur[];
    hasEpar:string;
    Epars:Epar[];
    hasMobil:string;
    Mobils:Mobiliere[];
    hasDispo:string;
    Dispos:Disponibilite[];
    hasBudget:string;
    Budgets:Budget[];
    Partic:string;
    SituationAdministrative:SituationAdmin;
  } = {
    hasUsage: '',
    Usages: [],
    hasImmobilier: '',
    Immobiliers: [],
    hasProf:'',
    Profs:[],
    hasDette:'',
    Dettes:[],
    hasAssur:'',
    Assurs:[],
    hasEpar:'',
    Epars:[],
    hasMobil:'',
    Mobils:[],
    hasDispo:'',
    Dispos:[],
    hasBudget:'',
    Budgets:[],
    Partic:'',
    SituationAdministrative:{
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

    } ,
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
    Taux:'',
    Deces: '',
    Partic: '',

  };
  newAssur: Assur = {
    Designation: '',
    Capital: '',
    Date: '',
    Assur:'',
    Benef: '',
    Partic: '',

  };
  newEpar: Epar = {
    Designation: '',
    Valeur: '',
    Detenteur: '',
    Date:'',
    Epar: '',
    Partic: '',

  };
  newMobil: Mobiliere = {
    Designation: '',
    Valeur: '',
    Detenteur: '',
    RevenuDis:'',
    Fisca: '',
    Taux: '',

  };
  newDispo: Disponibilite = {
    Designation: '',
    Valeur: '',
    Detenteur: '',
    Partic:'',
    

  };
  newBudget: Budget = {
    Designation: '',
    Montant: '',
    

  };
  newPartic: '';

  newSituationAdmin: SituationAdmin={
    CFE:'',
    Cotisation:'',
    Reversion:'',
    CNSS:'',
    CNAREFE:'',
    Capitone:'',
    Rapatriement:'',
    Mutuelle:'',
    Passeport:'',
    CarteSejour:'',
    Permis:'',
    AssurAuto:'',
    AssurHabi:'',
    InscriConsulat:'',
    UFE:'',
    CSG:'',

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
      Taux:'',
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
      Assur:'',
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
      Date:'',
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
      RevenuDis:'',
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
      Partic:'',
      
      
      
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
    this.clientData.Partic=this.newPartic;
    console.log(this.newPartic)
    this.newPartic = '';
  }

  addSituationAdmin() {
    this.clientData.SituationAdministrative={...this.newSituationAdmin};
    console.log(this.newSituationAdmin)
    this.newSituationAdmin = {
      CFE:'',
    Cotisation:'',
    Reversion:'',
    CNSS:'',
    CNAREFE:'',
    Capitone:'',
    Rapatriement:'',
    Mutuelle:'',
    Passeport:'',
    CarteSejour:'',
    Permis:'',
    AssurAuto:'',
    AssurHabi:'',
    InscriConsulat:'',
    UFE:'',
    CSG:'',

    }
  }
}
  

  
 

