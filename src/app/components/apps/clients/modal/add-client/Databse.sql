CREATE TABLE Cabinet (
    CabinetID INT PRIMARY KEY AUTO_INCREMENT,
    Nom NVARCHAR(100) NOT NULL,
    Adresse NVARCHAR(255),
    Telephone NVARCHAR(20)
);
CREATE TABLE Client (
    ClientId INT PRIMARY KEY AUTO_INCREMENT,
    Nom NVARCHAR(100) NOT NULL,
    Prenom NVARCHAR(100) NOT NULL,
    DateNaissance DATE,
    SituationFamiliale NVARCHAR(50),
    Profession NVARCHAR(100),
    DateRetraite DATE,
    NumeroSS NVARCHAR(20),  --Numero Sécurité Sociale
    Adresse NVARCHAR(255),
    Email1 NVARCHAR(100),
    Email1 NVARCHAR(100),
    Tel1 NVARCHAR(20),
    Tel1 NVARCHAR(20),
    ImgSrc NVARCHAR(255),
    HasConjoint BIT,
    CabinetID INT NOT NULL,
    FOREIGN KEY (CabinetID) REFERENCES Cabinet(CabinetID)
    
    
);
CREATE TABLE Conjoint (
    ConjointId INT PRIMARY KEY AUTO_INCREMENT,
    ClientId INT NOT NULL, -- Référence au client 
    Nom NVARCHAR(100) NOT NULL,
    Prenom NVARCHAR(100) NOT NULL,
    DateNaissance DATE,
    Profession NVARCHAR(100),
    DateRetraite DATE,
    NumeroSS NVARCHAR(20),
    DateMariage DATE,
    Adresse NVARCHAR(255),
    RegimeMatrimonial NVARCHAR(100),
    DonationEpoux NVARCHAR(100),
    ModifRegimeDate NVARCHAR(100),
    QuestComp NVARCHAR(MAX),
    FOREIGN KEY (ClientId) REFERENCES ClientData(ClientId)
);
CREATE TABLE Proche (
    ProcheId INT PRIMARY KEY AUTO_INCREMENT,
    ClientId INT NOT NULL, -- Référence au client 
    Nom NVARCHAR(100) NOT NULL,
    Prenom NVARCHAR(100) NOT NULL,
    DateNaissance DATE,
    LienParenteID INT,  
    Charge NVARCHAR(100),
    Particularite NVARCHAR(MAX),
    NombreEnfant Int,
    Comment NVARCHAR(MAX),
    FOREIGN KEY (ClientId) REFERENCES ClientData(ClientId)
);
