CREATE TABLE ProfesorXGrupo (
    Cedula            NVARCHAR(20) NOT NULL,
    ID_Grupo          INT NOT NULL,
    PRIMARY KEY(Cedula, ID_Grupo),
    CONSTRAINT FK_PxG_Profesor FOREIGN KEY(Cedula)
        REFERENCES Profesor(Cedula),
    CONSTRAINT FK_PxG_Grupo FOREIGN KEY(ID_Grupo)
        REFERENCES Grupo(ID_Grupo)
);
GO