CREATE TABLE Rubro (
    ID_Rubro          INT IDENTITY(1,1) PRIMARY KEY,
    Nombre            NVARCHAR(100) NOT NULL,
    Porcentaje        DECIMAL(5,2) NOT NULL,
    ID_Grupo          INT NOT NULL,
    CONSTRAINT FK_Rubro_Grupo FOREIGN KEY(ID_Grupo)
        REFERENCES Grupo(ID_Grupo)
);
GO