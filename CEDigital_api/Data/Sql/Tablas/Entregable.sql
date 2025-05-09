CREATE TABLE Entregable (
    ID_Entregable        INT IDENTITY(1,1) PRIMARY KEY,
    Fecha_Entrega        DATETIME NOT NULL,
    Archivo              NVARCHAR(200) NOT NULL,
    ID_Evaluacion        INT NOT NULL,
    Carnet               NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_Entregable_Evaluacion FOREIGN KEY(ID_Evaluacion)
        REFERENCES Evaluacion(ID_Evaluacion),
    CONSTRAINT FK_Entregable_Estudiante FOREIGN KEY(Carnet)
        REFERENCES Estudiante(Carnet)
);
GO