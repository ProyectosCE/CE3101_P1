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
(1, 'CE1101', 1);