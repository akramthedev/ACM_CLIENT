export class Client {
  ClientId: string;
  CabinetId: string;
  Nom: string;
  Prenom: string;
  DateNaissance: string;
  Photo?: string;
  Profession?: string;
  DateRetraite?: string;
  NumeroSS?: string;
  Adresse?: string;
  Email1?: string;
  Email2?: string;
  Telephone1?: string;
  Telephone2?: string;
  HasConjoint: boolean;

  SituationFamiliale: "Marié" | "Célibataire" | "Divorcé" | "Veuf" | "Union" | "PACS";

  ParticulariteFiscale?: string;

  AssuranceAuto?: string;
  AssuranceHabitation?: string;
  AssuranceRapatriement?: string;
  CAPITONE?: string;
  CFE?: string;
  CNAREFE?: string;
  CNSS?: string;
  CPAM?: string;
  CSG_CRDS?: string;
  CarteSejour?: string;
  Cotisation?: string;
  InscriptionConsulat?: string;
  MutuelleFrancaise?: string;
  PASSEPORT?: string;
  PermisConduire?: string;
  Reversion?: string;

  Proches?: Proche[];
  Patrimoines?: Patrimoine[];
  ClientPieces?: any[];
  Passifs?: Passif[];
  Budgets?: Budget[];
  Conjoint?: Conjoint[];
  Service?: Service[];
  Mission?: Mission[];
  Prestation?: Prestation[];
  ClientMission?: ClientMission[];
  ClientMissionPrestation?: ClientMissionPrestation[];
  ClientTache?: ClientTache[];
}

export class Proche {
  ProcheId: string;
  ClientId: string;
  Nom?: string;
  Prenom?: string;
  DateNaissance?: string;
  Telephone1?: string;
  Telephone2?: string;
  Email1?: string;
  Email2?: string;
  Adresse?: string;
  Charge?: boolean;
  LienParente?: string;
  Particularite?: string;
  NombreEnfant?: string;
  Commentaire?: string;
}

export class Conjoint {
  ConjointId: string;
  ClientId: string;
  Nom?: string;
  Prenom?: string;
  DateNaissance?: string;
  Profession?: string;
  DateRetraite?: string;
  NumeroSS?: string;
  DateMariage?: string;
  Adresse?: string;
  RegimeMatrimonial?: string;
  DonationEpoux?: string;
  ModifRegimeDate?: string;
  QuestComp?: string;
}

export class Piece {
  PieceId: string;
  Libelle: string;
  Description?: string;
}

export class Patrimoine {
  PatrimoineId: string;
  ClientId: string;
  TypePatrimoine?: "Bien d'usage" | "Immobilier de rapport" | "Bien professionnel";
  Designation?: string;
  Adresse?: string;
  Valeur?: string;
  Detenteur?: string;
  ChargesAssocies?: string;
  Charges?: string;
  DateAchat?: string;
  RevenueFiscalite?: string;
  CapitalEmprunte?: string;
  Duree?: string;
  Taux?: string;
  AGarantieDeces?: boolean;
  Particularite?: string;
  Commentaire?: string;
  QuestionComplementaire?: string;
}

export class Passif {
  PassifsId: string;
  ClientId: string;
  TypePassifs?: "Passif" | "Assurance" | "Epargne" | "Valeurs mobilières" | "Disponibilité";
  Designation?: string;
  CapitalEmprunte?: string;
  Valeur?: string;
  Detenteur?: string;
  DureeMois?: string;
  Taux?: string;
  Deces?: string;
  Particularite?: string;
  ValeurRachat?: string;
  DateSouscription?: string;
  Assure?: string;
  Beneficiaire?: string;
  DateOuverture?: string;
  EpargneAssocie?: string;
  RevenusDistribue?: string;
  FiscaliteOuRevenue?: string;
  TauxRevalorisation?: string;
  CommentPassifs?: string;
}

export class Budget {
  BudgetsId: string;
  ClientId: string;
  Designation?: string;
  Montant?: string;
  Sexe?: string;
  CommentBudget?: string;
}

export class Service {
  ServiceId: string;
  CabinetId: string;
  Designation?: string;
  Description?: string;
}

export class Mission {
  MissionId: string;
  ServiceId: string;
  Designation?: string;
  Description?: string;
}

export class Prestation {
  PrestationId: string;
  MissionId: string;
  Designation?: string;
  Description?: string;
}

export class ClientMission {
  ClientMissionId: string;
  ClientId: string;
  MissionId: string;
  DateAffectation?: string;
}

export class ClientMissionPrestation {
  ClientMissionPrestationId: string;
  ClientMissionId: string;
  PrestationId: string;
  DateAffectation?: string;
}

export class ClientTache {
  ClientTacheId: string;
  ClientMissionPrestationId: string;
  ClientMissionId: string;
  TacheId: string;
  DateAffectation?: string;
  Intitule?: string;
  Numero_Ordre?: string;
  Commentaire?: string;
  Deadline?: string;
  DateButoir?: string;
  Date_Execution?: string;
  Status?: string;
  AgentResponsable?: string;
}
