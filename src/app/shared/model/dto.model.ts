export class Client {
  ClientId: string;
  CabinetId: string;
  Nom: string;
  Prenom: string;
  DateNaissance: Date;
  Photo?: string;

  Profession?: string;
  DateRetraite?: Date;
  NumeroSS?: string;
  Adresse?: string;
  Email1?: string;
  Email2?: string;
  Telephone1?: string;
  Telephone2?: string;
  HasConjoint: boolean;

  SituationFamiliale:
    | "Marié"
    | "Célibataire"
    | "Divorcé"
    | "Veuf"
    | "Union"
    | "PACS";

  Proches?: Proche[];
  Patrimoines?: Patrimoine[];
  ClientPieces?: any[];
}

export class Proche {
  ProcheId: string;
  ClientId: string;
  Nom: string;
  Prenom: string;
  DateNaissance?: Date;
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
  Deces?: string;
  Particularite?: string;
  Commentaire?: string;
  QuestionComplementaire?: string;
}
