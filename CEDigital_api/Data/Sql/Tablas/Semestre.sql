CREATE TABLE Semestre (
    ID_Semestre       INT IDENTITY(1,1) PRIMARY KEY,
    Anio              INT NOT NULL,
    Periodo           CHAR(1) NOT NULL CHECK (Periodo IN ('1','2','V'))
);
GO