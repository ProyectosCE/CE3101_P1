CREATE TABLE Carpeta (
    id_carpeta        INT IDENTITY(1,1) PRIMARY KEY,
    nombre            NVARCHAR(100) NOT NULL,
    id_grupo          INT NOT NULL,
    cedula_profesor            NVARCHAR(20) NOT NULL
);
GO

CREATE TABLE Carrera (
    codigo_carrera    NVARCHAR(10) PRIMARY KEY,
    nombre            NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE Curso (
    codigo_curso      NVARCHAR(10) PRIMARY KEY,
    nombre            NVARCHAR(100) NOT NULL,
    creditos          INT NOT NULL,
    codigo_carrera    NVARCHAR(10) NOT NULL,
    id_semestre       INT NOT NULL
);
GO

CREATE TABLE Documento (
    id_documento      INT IDENTITY(1,1) PRIMARY KEY,
    nombre_archivo    NVARCHAR(200) NOT NULL,
    fecha_subida      DATETIME NOT NULL DEFAULT GETDATE(),
    size              FLOAT NOT NULL,
    id_carpeta        INT NOT NULL
);
GO

CREATE TABLE Entregable (
    id_entregable        INT IDENTITY(1,1) PRIMARY KEY,
    fecha_entrega        DATETIME NOT NULL,
    archivo              NVARCHAR(200) NOT NULL,
    id_evaluacion        INT NOT NULL,
    carnet_estudiante    NVARCHAR(20) NOT NULL
);
GO


CREATE TABLE Evaluacion (
    id_evaluacion         INT IDENTITY(1,1) PRIMARY KEY,
    nombre                NVARCHAR(100) NOT NULL,
    peso                  DECIMAL(5,2) NOT NULL,
    fecha_entrega         DATETIME NOT NULL,
    tipo                  NVARCHAR(50) NOT NULL,
    archivo_especificacion NVARCHAR(200) NULL,
    id_rubro              INT NOT NULL
);
GO

CREATE TABLE Grupo (
    id_grupo          INT IDENTITY(1,1) PRIMARY KEY,
    numero_grupo      INT NOT NULL
);
GO

CREATE TABLE GrupoXEstudiante (
    id_grupo          INT NOT NULL,
    carnet_estudiante NVARCHAR(20) NOT NULL,
    PRIMARY KEY(id_grupo, carnet_estudiante)
);
GO

CREATE TABLE Nota (
    id_entregable        INT PRIMARY KEY,
    calificacion         DECIMAL(5,2) NOT NULL,
    observaciones        NVARCHAR(200) NULL,
    estado               BIT NOT NULL DEFAULT 1,
    carnet_estudiante    NVARCHAR(20) NOT NULL
);
GO

CREATE TABLE Noticia (
    id_noticia         INT IDENTITY(1,1) PRIMARY KEY,
    titulo             NVARCHAR(200) NOT NULL,
    fecha_publicacion  DATETIME NOT NULL DEFAULT GETDATE(),
    mensaje            NVARCHAR(MAX) NOT NULL,
    id_grupo           INT NOT NULL,
    cedula_profesor    NVARCHAR(20) NOT NULL
);
GO


CREATE TABLE ProfesorXGrupo (
    cedula_profesor            NVARCHAR(20) NOT NULL,
    id_grupo          INT NOT NULL,
    PRIMARY KEY(cedula_profesor, id_grupo)
);
GO

CREATE TABLE Rubro (
    id_rubro          INT IDENTITY(1,1) PRIMARY KEY,
    nombre            NVARCHAR(100) NOT NULL,
    porcentaje        DECIMAL(5,2) NOT NULL,
    id_grupo          INT NOT NULL
);
GO

CREATE TABLE Semestre (
    id_semestre       INT IDENTITY(1,1) PRIMARY KEY,
    año              INT NOT NULL,
    periodo           CHAR(1) NOT NULL CHECK (Periodo IN ('1','2','V'))
);
GO

-- Agregar las foreign keys --

ALTER TABLE Carpeta
    ADD CONSTRAINT FK_Carpeta_Grupo FOREIGN KEY(id_grupo)
        REFERENCES Grupo(id_grupo);

--ALTER TABLE Carpeta
--    ADD CONSTRAINT FK_Carpeta_Profesor FOREIGN KEY(cedula_profesor)
--        REFERENCES Profesor(cedula_profesor);

ALTER TABLE Curso
    ADD CONSTRAINT FK_Curso_Carrera FOREIGN KEY(codigo_carrera)
        REFERENCES Carrera(codigo_carrera);

ALTER TABLE Curso
    ADD CONSTRAINT FK_Curso_Semestre FOREIGN KEY(id_semestre)
        REFERENCES Semestre(id_semestre);

ALTER TABLE Documento
    ADD CONSTRAINT FK_Documento_Carpeta FOREIGN KEY(id_carpeta)
        REFERENCES Carpeta(id_carpeta);

ALTER TABLE Entregable
    ADD CONSTRAINT FK_Entregable_Evaluacion FOREIGN KEY(id_evaluacion)
        REFERENCES Evaluacion(id_evaluacion);

--ALTER TABLE Entregable
--    ADD CONSTRAINT FK_Entregable_Estudiante FOREIGN KEY(carnet_estudiante)
--        REFERENCES Estudiante(carnet_estudiante);

--ALTER TABLE Estudiante
--    ADD CONSTRAINT FK_Estudiante_Carrera FOREIGN KEY(codigo_carrera)
--        REFERENCES Carrera(codigo_carrera);

ALTER TABLE Evaluacion
    ADD CONSTRAINT FK_Evaluacion_Rubro FOREIGN KEY(id_rubro)
        REFERENCES Rubro(id_rubro);

--ALTER TABLE Grupo
--    ADD CONSTRAINT FK_Grupo_Curso FOREIGN KEY(codigo_curso)
--        REFERENCES Curso(codigo_curso);

ALTER TABLE GrupoXEstudiante
    ADD CONSTRAINT FK_GxE_Grupo FOREIGN KEY(id_grupo)
        REFERENCES Grupo(id_grupo);

--ALTER TABLE GrupoXEstudiante
--    ADD CONSTRAINT FK_GxE_Estudiante FOREIGN KEY(carnet_estudiante)
--        REFERENCES Estudiante(carnet_estudiante);

ALTER TABLE Nota
    ADD CONSTRAINT FK_Nota_Entregable FOREIGN KEY(id_entregable)
        REFERENCES Entregable(id_entregable);

--ALTER TABLE Nota
--    ADD CONSTRAINT FK_Nota_Estudiante FOREIGN KEY(carnet_estudiante)
--        REFERENCES Estudiante(carnet_estudiante);

ALTER TABLE Noticia
    ADD CONSTRAINT FK_Noticia_Grupo FOREIGN KEY (id_grupo)
        REFERENCES Grupo(id_grupo);

--ALTER TABLE Noticia
--   ADD CONSTRAINT FK_Noticia_Profesor FOREIGN KEY (cedula_profesor)
--        REFERENCES Profesor(cedula_profesor);

--ALTER TABLE ProfesorXGrupo
--    ADD CONSTRAINT FK_PxG_Profesor FOREIGN KEY(cedula_profesor)
--        REFERENCES Profesor(cedula_profesor);

ALTER TABLE ProfesorXGrupo
    ADD CONSTRAINT FK_PxG_Grupo FOREIGN KEY(id_grupo)
        REFERENCES Grupo(id_grupo);

ALTER TABLE Rubro
    ADD CONSTRAINT FK_Rubro_Grupo FOREIGN KEY(id_grupo)
        REFERENCES Grupo(id_grupo);

GO
