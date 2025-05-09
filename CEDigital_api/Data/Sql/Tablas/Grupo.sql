CREATE TABLE Grupo (
    ID_Grupo          INT IDENTITY(1,1) PRIMARY KEY,
    Numero_Grupo      INT NOT NULL,
    Codigo_Curso      NVARCHAR(10) NOT NULL,
    CONSTRAINT FK_Grupo_Curso FOREIGN KEY(Codigo_Curso)
        REFERENCES Curso(Codigo_Curso)
);
GO