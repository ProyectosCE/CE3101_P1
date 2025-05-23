using CEDigital_api.Data.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/calificaciones")]
    public class CalificacionesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CalificacionesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/calificaciones/resumen?idEstudiante=...&idCurso=...
        [HttpGet("resumen")]
        public async Task<IActionResult> GetResumen([FromQuery] string idEstudiante, [FromQuery] string idCurso)
        {
            if (string.IsNullOrWhiteSpace(idEstudiante) || string.IsNullOrWhiteSpace(idCurso))
                return BadRequest("Debe especificar 'idEstudiante' e 'idCurso'.");

            // Obtener rubros del curso
            var rubros = await _context.Rubro
                .Include(r => r.grupo)
                .Where(r => r.grupo.codigo_curso == idCurso)
                .ToListAsync();

            var resumen = new List<object>();

            foreach (var rubro in rubros)
            {
                // Obtener evaluaciones de este rubro
                var evIds = await _context.Evaluacion
                    .Where(e => e.id_rubro == rubro.id_rubro)
                    .Select(e => e.id_evaluacion)
                    .ToListAsync();

                // Obtener entregables y notas del estudiante
                var califs = await _context.Entregable
                    .Where(ent => evIds.Contains(ent.id_evaluacion)
                                  && ent.carnet_estudiante == idEstudiante)
                    .Join(_context.Nota,
                          ent => ent.id_entregable,
                          nota => nota.id_entregable,
                          (ent, nota) => nota.calificacion)
                    .ToListAsync();

                var suma = califs.Sum();

                resumen.Add(new {
                    rubro = rubro.nombre,
                    calificacionAcumulada = suma
                });
            }

            return Ok(resumen);
        }
    }
}
