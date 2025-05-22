CREATE TABLE Carpeta (
    id_carpeta        INT IDENTITY(1,1) PRIMARY KEY,
    nombre            NVARCHAR(100) NOT NULL,
    id_grupo          INT NOT NULL,
    cedula_profesor   NVARCHAR(20) 
);
GO

CREATE TABLE Carrera (
    codigo_carrera    NVARCHAR(10) PRIMARY KEY,
    nombre            NVARCHAR(100) NOT NULL,
    estado           NVARCHAR(100) NOT NULL DEFAULT 'activo',
);
GO

CREATE TABLE Curso (
    codigo_curso      NVARCHAR(10) PRIMARY KEY,
    nombre            NVARCHAR(100) NOT NULL,
    creditos          INT NOT NULL,
    codigo_carrera    NVARCHAR(10) NOT NULL,
    estado           NVARCHAR(100) NOT NULL DEFAULT 'inactivo',
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
    id_rubro              INT NOT NULL,
    id_categoria          INT NOT NULL
);
GO

CREATE TABLE Grupo (
    id_grupo          INT IDENTITY(1,1) PRIMARY KEY,
    numero_grupo      INT NOT NULL,
    codigo_curso      NVARCHAR(10) NOT NULL,
    id_semestre       INT NOT NULL,
    estado           NVARCHAR(100) NOT NULL DEFAULT 'activo',
);
GO

CREATE TABLE Nota (
    id_entregable        INT PRIMARY KEY,
    calificacion         DECIMAL(5,2) NOT NULL,
    observaciones        NVARCHAR(200) NULL,
    estado               NVARCHAR(100) NOT NULL DEFAULT 'inactivo',
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

CREATE TABLE Profesor (
    cedula_profesor NVARCHAR(20) PRIMARY KEY
);
GO

CREATE TABLE Estudiante (
    carnet_estudiante NVARCHAR(20) PRIMARY KEY
);
GO

CREATE TABLE EstudianteXGrupo (
    id_grupo          INT NOT NULL,
    carnet_estudiante NVARCHAR(20) NOT NULL,
    PRIMARY KEY(id_grupo, carnet_estudiante)
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
    anio              INT NOT NULL,
    periodo           CHAR(1) NOT NULL CHECK (Periodo IN ('1','2','V')),
    estado           NVARCHAR(100) NOT NULL DEFAULT 'inactivo',
);
GO

CREATE TABLE MiniGrupo (
    id_minigrupo      INT IDENTITY(1,1) PRIMARY KEY,
    nombre_minigrupo  NVARCHAR(100) NOT NULL,
    id_categoria      INT NOT NULL
);
GO

CREATE TABLE CategoriaGrupo (
    id_categoria      INT IDENTITY(1,1) PRIMARY KEY,
    nombre_categoria  NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE EstudianteXMiniGrupo (
    id_minigrupo      INT NOT NULL,
    carnet_estudiante NVARCHAR(20) NOT NULL,
    PRIMARY KEY(id_minigrupo, carnet_estudiante)
);
GO


-- Agregar las foreign keys --

ALTER TABLE Carpeta
    ADD CONSTRAINT FK_Carpeta_Grupo FOREIGN KEY(id_grupo)
        REFERENCES Grupo(id_grupo);

ALTER TABLE Carpeta
    ADD CONSTRAINT FK_Carpeta_Profesor FOREIGN KEY(cedula_profesor)
        REFERENCES Profesor(cedula_profesor);

ALTER TABLE Curso
    ADD CONSTRAINT FK_Curso_Carrera FOREIGN KEY(codigo_carrera)
        REFERENCES Carrera(codigo_carrera);

ALTER TABLE Documento
    ADD CONSTRAINT FK_Documento_Carpeta FOREIGN KEY(id_carpeta)
        REFERENCES Carpeta(id_carpeta);

ALTER TABLE Entregable
    ADD CONSTRAINT FK_Entregable_Evaluacion FOREIGN KEY(id_evaluacion)
        REFERENCES Evaluacion(id_evaluacion);

ALTER TABLE Entregable
    ADD CONSTRAINT FK_Entregable_Estudiante FOREIGN KEY(carnet_estudiante)
        REFERENCES Estudiante(carnet_estudiante);

--ALTER TABLE Estudiante
--    ADD CONSTRAINT FK_Estudiante_Carrera FOREIGN KEY(codigo_carrera)
--        REFERENCES Carrera(codigo_carrera);

ALTER TABLE Evaluacion
    ADD CONSTRAINT FK_Evaluacion_Rubro FOREIGN KEY(id_rubro)
        REFERENCES Rubro(id_rubro);

ALTER TABLE Grupo
    ADD CONSTRAINT FK_Grupo_Curso FOREIGN KEY(codigo_curso)
        REFERENCES Curso(codigo_curso);

ALTER TABLE Grupo
    ADD CONSTRAINT FK_Grupo_Semestre FOREIGN KEY(id_semestre)
        REFERENCES Semestre(id_semestre);


ALTER TABLE EstudianteXGrupo
    ADD CONSTRAINT FK_GxE_Grupo FOREIGN KEY(id_grupo)
        REFERENCES Grupo(id_grupo);

ALTER TABLE EstudianteXGrupo
    ADD CONSTRAINT FK_GxE_Estudiante FOREIGN KEY(carnet_estudiante)
        REFERENCES Estudiante(carnet_estudiante);

ALTER TABLE Nota
    ADD CONSTRAINT FK_Nota_Entregable FOREIGN KEY(id_entregable)
        REFERENCES Entregable(id_entregable);

ALTER TABLE Nota
    ADD CONSTRAINT FK_Nota_Estudiante FOREIGN KEY(carnet_estudiante)
        REFERENCES Estudiante(carnet_estudiante);

ALTER TABLE Noticia
    ADD CONSTRAINT FK_Noticia_Grupo FOREIGN KEY (id_grupo)
        REFERENCES Grupo(id_grupo);

ALTER TABLE Noticia
   ADD CONSTRAINT FK_Noticia_Profesor FOREIGN KEY (cedula_profesor)
        REFERENCES Profesor(cedula_profesor);

ALTER TABLE ProfesorXGrupo
    ADD CONSTRAINT FK_PxG_Profesor FOREIGN KEY(cedula_profesor)
        REFERENCES Profesor(cedula_profesor);

ALTER TABLE ProfesorXGrupo
    ADD CONSTRAINT FK_PxG_Grupo FOREIGN KEY(id_grupo)
        REFERENCES Grupo(id_grupo);

ALTER TABLE Rubro
    ADD CONSTRAINT FK_Rubro_Grupo FOREIGN KEY(id_grupo)
        REFERENCES Grupo(id_grupo);

ALTER TABLE EstudianteXMiniGrupo
    ADD CONSTRAINT FK_EstudianteXMiniGrupo_MiniGrupo FOREIGN KEY(id_minigrupo)
        REFERENCES MiniGrupo(id_minigrupo);

ALTER TABLE EstudianteXMiniGrupo
    ADD CONSTRAINT FK_EstudianteXMiniGrupo_Estudiante FOREIGN KEY(carnet_estudiante)
        REFERENCES Estudiante(carnet_estudiante);

ALTER TABLE MiniGrupo
    ADD CONSTRAINT FK_MiniGrupo_CategoriaGrupo FOREIGN KEY(id_categoria)
        REFERENCES CategoriaGrupo(id_categoria);

ALTER TABLE Evaluacion
    ADD CONSTRAINT FK_Evaluacion_CategoriaGrupo FOREIGN KEY(id_categoria)
        REFERENCES CategoriaGrupo(id_categoria);

GO


-- Población para Carrera
INSERT INTO Carrera (codigo_carrera, nombre) VALUES
('CE', 'Escuela de Ingeniería en Computadores'),
('EE', 'Escuela de Ingeniería en Electrónica'),
('CI', 'Escuela de Ciencias del Lenguaje'),
('CS', 'Escuela de Ciencias Sociales'),
('MA', 'Escuela de Matemática'),
('QU', 'Escuela de Química');


-- Población para Curso
INSERT INTO Curso (codigo_curso, nombre, creditos, codigo_carrera) VALUES
('CI0205', 'Prueba avanzada inglés', 0, 'CI'),
('MA0101', 'Matemática general', 2, 'MA'),
('CE1101', 'Introducción a la programación', 3, 'CE'),
('CE1104', 'Fundamentos de sistemas computacionales', 3, 'CE'),
('MA1102', 'Cálculo diferencial e integral', 4, 'MA'),
('MA1403', 'Matemática discreta', 4, 'MA'),
('QU1102', 'Laboratorio de química básica i', 1, 'QU'),
('QU1106', 'Química básica i', 3, 'QU');

-- Población para Semestre
INSERT INTO Semestre (año, periodo) VALUES
(2025, '1');

-- Población para Grupo
INSERT INTO Grupo (numero_grupo, codigo_curso, id_semestre) VALUES
(1, 'CE1101', 1),
(1, 'MA0101', 1),
(1, 'MA1102', 1),
(2, 'QU1106', 1),
(1, 'CI0205', 1);

-- Población para Carpeta 
INSERT INTO Carpeta (nombre, id_grupo) VALUES
('Presentaciones', 1),
('Quices', 1),
('Exámenes', 1),
('Proyectos', 1);

-- Población para Rubro
INSERT INTO Rubro (nombre, porcentaje, id_grupo) VALUES
('Quices', 30.00, 1),
('Exámenes', 30.00, 1),
('Proyectos', 40.00, 1);

-- Obtener los id_grupo generados para insertar en EstudianteXGrupo

DECLARE @id1 INT = (SELECT id_grupo FROM Grupo WHERE numero_grupo = 1 AND codigo_curso = 'CE1101' AND id_semestre = 1);
DECLARE @id2 INT = (SELECT id_grupo FROM Grupo WHERE numero_grupo = 1 AND codigo_curso = 'MA0101' AND id_semestre = 1);
DECLARE @id3 INT = (SELECT id_grupo FROM Grupo WHERE numero_grupo = 1 AND codigo_curso = 'MA1102' AND id_semestre = 1);
DECLARE @id4 INT = (SELECT id_grupo FROM Grupo WHERE numero_grupo = 2 AND codigo_curso = 'QU1106' AND id_semestre = 1);
DECLARE @id5 INT = (SELECT id_grupo FROM Grupo WHERE numero_grupo = 1 AND codigo_curso = 'CI0205' AND id_semestre = 1);

-- Insertar en EstudianteXGrupo para el estudiante
INSERT INTO EstudianteXGrupo (id_grupo, carnet_estudiante) VALUES
(@id1, '2023060347'),
(@id2, '2023060347'),
(@id1, '2023166058'),
(@id3, '2023166058'),
(@id4, '2023166058'),
(@id5, '2023166058');

-- Insertar en ProfesorXGrupo para el profesor
INSERT INTO ProfesorXGrupo (cedula_profesor, id_grupo) VALUES
('12345678', @id1),
('12345678', @id2),
('12345678', @id3),
('87654321', @id4),
('87654321', @id5);

-- Insertar Noticia prueba 
INSERT INTO Noticia (titulo, mensaje, id_grupo, cedula_profesor) VALUES
('Prueba 1', 'Esta es la primera prueba grupo 1', @id1, '12345678'),
('Prueba 1.2', 'Esta es la segunda prueba grupo 1', @id1, '12345678'),
('Prueba 2', 'Esta es la segunda prueba', @id2, '12345678'),
('Prueba 3', 'Esta es la tercera prueba', @id3, '12345678'),
('Prueba 4', 'Esta es la cuarta prueba', @id4, '87654321'),
('Prueba 5', 'Esta es la quinta prueba', @id5, '87654321');
