CREATE TABLE GrupoXEstudiante (
    ID_Grupo          INT NOT NULL,
    Carnet            NVARCHAR(20) NOT NULL,
    PRIMARY KEY(ID_Grupo, Carnet),
    CONSTRAINT FK_GxE_Grupo FOREIGN KEY(ID_Grupo)
        REFERENCES Grupo(ID_Grupo),
    CONSTRAINT FK_GxE_Estudiante FOREIGN KEY(Carnet)
        REFERENCES Estudiante(Carnet)
);
GO