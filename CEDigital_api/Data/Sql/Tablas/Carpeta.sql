CREATE TABLE Carpeta (
    ID_Carpeta        INT IDENTITY(1,1) PRIMARY KEY,
    Nombre            NVARCHAR(100) NOT NULL,
    ID_Grupo          INT NOT NULL,
    Cedula            NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_Carpeta_Grupo FOREIGN KEY(ID_Grupo)
        REFERENCES Grupo(ID_Grupo),
    CONSTRAINT FK_Carpeta_Profesor FOREIGN KEY(Cedula)
        REFERENCES Profesor(Cedula)
);
GO