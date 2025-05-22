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


-- 1. Obtener id del grupo
DECLARE @id_grupo INT = (SELECT id_grupo FROM Grupo WHERE codigo_curso = 'CE1101' AND numero_grupo = 1 AND id_semestre = 1);

-- 2. Obtener ids de los rubros automáticos
DECLARE @id_rubro_quices INT = (SELECT id_rubro FROM Rubro WHERE nombre = 'Quices' AND id_grupo = @id_grupo);
DECLARE @id_rubro_examenes INT = (SELECT id_rubro FROM Rubro WHERE nombre = 'Exámenes' AND id_grupo = @id_grupo);
DECLARE @id_rubro_proyectos INT = (SELECT id_rubro FROM Rubro WHERE nombre = 'Proyectos' AND id_grupo = @id_grupo);

INSERT INTO CategoriaGrupo (nombre_categoria) VALUES
('Teórica');

-- 3. Insertar evaluaciones para esos rubros
INSERT INTO Evaluacion (nombre, peso, fecha_entrega, tipo, archivo_especificacion, id_rubro, id_categoria) VALUES
('Quiz 1', 15, '2025-04-15', 'Quiz', NULL, @id_rubro_quices, 1),
('Quiz 2', 15, '2025-04-30', 'Quiz', NULL, @id_rubro_quices, 1),
('Examen Parcial', 30, '2025-05-10', 'Examen', NULL, @id_rubro_examenes, 1),
('Proyecto Final', 40, '2025-06-01', 'Proyecto', NULL, @id_rubro_proyectos, 1);

-- 4. Obtener ids de las evaluaciones para insertar entregables
DECLARE @id_eval_quiz1 INT = (SELECT id_evaluacion FROM Evaluacion WHERE nombre = 'Quiz 1' AND id_rubro = @id_rubro_quices);
DECLARE @id_eval_quiz2 INT = (SELECT id_evaluacion FROM Evaluacion WHERE nombre = 'Quiz 2' AND id_rubro = @id_rubro_quices);
DECLARE @id_eval_examen INT = (SELECT id_evaluacion FROM Evaluacion WHERE nombre = 'Examen Parcial' AND id_rubro = @id_rubro_examenes);
DECLARE @id_eval_proyecto INT = (SELECT id_evaluacion FROM Evaluacion WHERE nombre = 'Proyecto Final' AND id_rubro = @id_rubro_proyectos);

-- 5. Insertar entregables (ejemplo para dos estudiantes)
INSERT INTO Entregable (fecha_entrega, archivo, id_evaluacion, carnet_estudiante) VALUES
(GETDATE(), 'quiz1_est1.pdf', @id_eval_quiz1, '2023060347'),
(GETDATE(), 'quiz1_est2.pdf', @id_eval_quiz1, '2023166058'),
(GETDATE(), 'quiz2_est1.pdf', @id_eval_quiz2, '2023060347'),
(GETDATE(), 'quiz2_est2.pdf', @id_eval_quiz2, '2023166058'),
(GETDATE(), 'examen_est1.pdf', @id_eval_examen, '2023060347'),
(GETDATE(), 'examen_est2.pdf', @id_eval_examen, '2023166058'),
(GETDATE(), 'proyecto_est1.pdf', @id_eval_proyecto, '2023060347'),
(GETDATE(), 'proyecto_est2.pdf', @id_eval_proyecto, '2023166058');

-- 6. Obtener ids de entregables
DECLARE @ent1 INT = (SELECT id_entregable FROM Entregable WHERE carnet_estudiante = '2023060347' AND id_evaluacion = @id_eval_quiz1);
DECLARE @ent2 INT = (SELECT id_entregable FROM Entregable WHERE carnet_estudiante = '2023166058' AND id_evaluacion = @id_eval_quiz1);
DECLARE @ent3 INT = (SELECT id_entregable FROM Entregable WHERE carnet_estudiante = '2023060347' AND id_evaluacion = @id_eval_quiz2);
DECLARE @ent4 INT = (SELECT id_entregable FROM Entregable WHERE carnet_estudiante = '2023166058' AND id_evaluacion = @id_eval_quiz2);
DECLARE @ent5 INT = (SELECT id_entregable FROM Entregable WHERE carnet_estudiante = '2023060347' AND id_evaluacion = @id_eval_examen);
DECLARE @ent6 INT = (SELECT id_entregable FROM Entregable WHERE carnet_estudiante = '2023166058' AND id_evaluacion = @id_eval_examen);
DECLARE @ent7 INT = (SELECT id_entregable FROM Entregable WHERE carnet_estudiante = '2023060347' AND id_evaluacion = @id_eval_proyecto);
DECLARE @ent8 INT = (SELECT id_entregable FROM Entregable WHERE carnet_estudiante = '2023166058' AND id_evaluacion = @id_eval_proyecto);

-- 7. Insertar notas
INSERT INTO Nota (id_entregable, calificacion, observaciones, estado, carnet_estudiante) VALUES
(@ent1, 85, 'Buen Quiz', 'activo', '2023060347'),
(@ent2, 90, 'Muy bien', 'activo', '2023166058'),
(@ent3, 78, 'Aceptable', 'activo', '2023060347'),
(@ent4, 95, 'Excelente', 'activo', '2023166058'),
(@ent5, 88, 'Buen examen', 'activo', '2023060347'),
(@ent6, 92, 'Muy bien', 'activo', '2023166058'),
(@ent7, 90, 'Proyecto muy bueno', 'activo', '2023060347'),
(@ent8, 93, 'Excelente proyecto', 'activo', '2023166058');

