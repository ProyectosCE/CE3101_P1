SELECT DISTINCT 
    C.codigo_curso      AS codigoCurso,
    C.nombre            AS nombreCurso,
    G.numero_grupo      AS numGrupo,
    S.anio               AS anio,
    S.periodo           AS periodo
FROM Curso C
JOIN Grupo G ON C.codigo_curso = G.codigo_curso
JOIN Semestre S ON G.id_semestre = S.id_semestre
WHERE G.id_grupo IN (
    SELECT EG.id_grupo
    FROM EstudianteXGrupo EG
    WHERE @rol = 'estudiante' AND EG.carnet_estudiante = @id
    UNION
    SELECT PG.id_grupo
    FROM ProfesorXGrupo PG
    WHERE @rol = 'profesor' AND PG.cedula_profesor = @id
);
