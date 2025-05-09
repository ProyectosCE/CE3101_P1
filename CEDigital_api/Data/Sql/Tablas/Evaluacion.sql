CREATE TABLE Evaluacion (
    ID_Evaluacion         INT IDENTITY(1,1) PRIMARY KEY,
    Nombre                NVARCHAR(100) NOT NULL,
    Peso                  DECIMAL(5,2) NOT NULL,
    Fecha_Entrega         DATETIME NOT NULL,
    Tipo                  NVARCHAR(50) NOT NULL,
    Archivo_Especificacion NVARCHAR(200) NULL,
    ID_Rubro              INT NOT NULL,
    CONSTRAINT FK_Evaluacion_Rubro FOREIGN KEY(ID_Rubro)
        REFERENCES Rubro(ID_Rubro)
);
GO