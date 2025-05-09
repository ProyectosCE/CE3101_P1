CREATE TABLE Curso (
    Codigo_Curso      NVARCHAR(10) PRIMARY KEY,
    Nombre_Curso      NVARCHAR(100) NOT NULL,
    Creditos          INT NOT NULL,
    Codigo_Carrera    NVARCHAR(10) NOT NULL,
    ID_Semestre       INT NOT NULL,
    CONSTRAINT FK_Curso_Carrera FOREIGN KEY(Codigo_Carrera)
        REFERENCES Carrera(Codigo_Carrera),
    CONSTRAINT FK_Curso_Semestre FOREIGN KEY(ID_Semestre)
        REFERENCES Semestre(ID_Semestre)
);
GO