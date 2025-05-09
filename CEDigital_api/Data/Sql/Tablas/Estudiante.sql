CREATE TABLE Estudiante (
    Carnet            NVARCHAR(20) PRIMARY KEY,
    Codigo_Carrera    NVARCHAR(10) NOT NULL,
    CONSTRAINT FK_Estudiante_Carrera FOREIGN KEY(Codigo_Carrera)
        REFERENCES Carrera(Codigo_Carrera)
);
GO