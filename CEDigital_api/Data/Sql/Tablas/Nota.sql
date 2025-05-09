CREATE TABLE Nota (
    ID_Entregable        INT PRIMARY KEY,
    Nota_Valor           DECIMAL(5,2) NOT NULL,
    Observacion          NVARCHAR(200) NULL,
    Estado               BIT NOT NULL DEFAULT 1,
    Carnet               NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_Nota_Entregable FOREIGN KEY(ID_Entregable)
        REFERENCES Entregable(ID_Entregable),
    CONSTRAINT FK_Nota_Estudiante FOREIGN KEY(Carnet)
        REFERENCES Estudiante(Carnet)
);
GO