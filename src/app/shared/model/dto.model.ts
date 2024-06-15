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

    SituationFamiliale: "Marié" | "Célibataire" | "Divorcé" | "Veuf" | "Union" | "PACS";

    Proches?: Proche[];
}

export interface Proche {
    ProcheId: string;
}