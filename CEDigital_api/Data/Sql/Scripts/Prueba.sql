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
INSERT INTO Semestre (anio, periodo) VALUES
(2025, '1');

-- Población para Grupo
INSERT INTO Grupo (numero_grupo, codigo_curso, id_semestre) VALUES
(1, 'CE1101', 1),
(1, 'MA0101', 1),
(1, 'MA1102', 1),
(2, 'QU1106', 1),
(1, 'CI0205', 1);


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
