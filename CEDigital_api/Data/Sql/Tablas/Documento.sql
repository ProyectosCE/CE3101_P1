CREATE TABLE Documento (
    ID_Documento      INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_Archivo    NVARCHAR(200) NOT NULL,
    Fecha_Subida      DATETIME NOT NULL DEFAULT GETDATE(),
    Tamano_Archivo    BIGINT NOT NULL,
    ID_Carpeta        INT NOT NULL,
    CONSTRAINT FK_Documento_Carpeta FOREIGN KEY(ID_Carpeta)
        REFERENCES Carpeta(ID_Carpeta)
);
GO