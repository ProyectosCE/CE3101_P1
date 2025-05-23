SELECT 
    e.carnet_estudiante AS carnet,
    r.nombre AS rubro,
    r.porcentaje,
    ev.nombre AS evaluacion,
    ev.peso,
    n.calificacion
FROM Nota n
JOIN Entregable e ON n.id_entregable = e.id_entregable
JOIN Evaluacion ev ON e.id_evaluacion = ev.id_evaluacion
JOIN Rubro r ON ev.id_rubro = r.id_rubro
JOIN Grupo g ON r.id_grupo = g.id_grupo
WHERE g.codigo_curso = @codigo_curso
  AND g.id_grupo = @id_grupo
  AND e.carnet_estudiante = @carnet
  AND n.estado = 'activo'
ORDER BY r.nombre, ev.nombre;
