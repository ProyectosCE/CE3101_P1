SELECT
    n.id_noticia,
    n.titulo,
    n.fecha_publicacion,
    n.mensaje,
    n.id_grupo,
    n.cedula_profesor
FROM Noticia n
JOIN Grupo g ON g.id_grupo = n.id_grupo
WHERE g.codigo_curso = @idcurso
AND g.estado = 'activo'
AND (
    (@rol = 'profesor' AND EXISTS (
        SELECT 1 FROM ProfesorXGrupo pg WHERE pg.id_grupo = g.id_grupo AND pg.cedula_profesor = @idusuario
    ))
    OR
    (@rol = 'estudiante' AND EXISTS (
        SELECT 1 FROM EstudiantexGrupo eg WHERE eg.id_grupo = g.id_grupo AND eg.carnet_estudiante = @idusuario
    ))
)
ORDER BY n.fecha_publicacion DESC;