using Microsoft.EntityFrameworkCore;
using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;



namespace CEDigital_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EvaluacionesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EvaluacionesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /api/evaluaciones?idGrupo=...
        [HttpGet]
        public async Task<IActionResult> GetEvaluacionesPorGrupo([FromQuery] int idGrupo)
        {
            var rubros = await _context.Rubro
                .Where(r => r.id_grupo == idGrupo)
                .Include(r => r.evaluaciones)
                .ToListAsync();

            var resultado = rubros.Select(r => new
            {
                id = r.id_rubro,
                nombre = r.nombre,
                porcentaje = r.porcentaje,
                evaluaciones = r.evaluaciones.Select(e => new
                {
                    id = e.id_evaluacion,
                    nombre = e.nombre,
                    fechaEntrega = e.fecha_entrega.ToString("yyyy-MM-dd"),
                    horaEntrega = e.fecha_entrega.ToString("HH:mm"),
                    idRubro = e.id_rubro,
                    descripcion = e.tipo,
                    idDocumentoInstrucciones = e.idInstruccion,
                    trabajoGrupal = e.id_categoria != 0 && e.id_categoria !=null,
                    idCategoriaTrabajo = e.id_categoria == 0 ? null : e.id_categoria.ToString()
                })
            });

            return Ok(resultado);
        }

        // PATCH: /api/evaluaciones/{id}
        [HttpPatch("{id_evaluacion}")]
        public async Task<IActionResult> PatchEvaluacion(int id_evaluacion, [FromBody] EvaluacionUpdateDto dto)
        {
            var existingEvaluation = await _context.Evaluacion.FindAsync(id_evaluacion);
            if (existingEvaluation == null)
                return NotFound("Evaluación no encontrada.");

            if (!string.IsNullOrWhiteSpace(dto.nombreRubro))
                existingEvaluation.nombre = dto.nombreRubro;

            if (dto.porcentaje.HasValue)
                existingEvaluation.peso = dto.porcentaje.Value;

            if (dto.fechaEntrega.HasValue)
                existingEvaluation.fecha_entrega = dto.fechaEntrega.Value;

            if (!string.IsNullOrWhiteSpace(dto.descripcion))
                existingEvaluation.tipo = dto.descripcion;

            // Accept null values from DTO for archivo_especificacion
            existingEvaluation.idInstruccion = dto.idDocumentoInstrucciones;

            // Accept null values from DTO for id_categoria
            existingEvaluation.id_categoria = dto.idcategoria;

            if (dto.idRubro.HasValue)
                existingEvaluation.id_rubro = dto.idRubro.Value;

            await _context.SaveChangesAsync();

            return Ok(existingEvaluation);
        }

        // DELETE: /api/evaluaciones/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvaluacion(int id)
        {
            var evaluacion = await _context.Evaluacion.FindAsync(id);
            if (evaluacion == null)
                return NotFound();

            _context.Evaluacion.Remove(evaluacion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: /api/evaluaciones
        [HttpPost]
        public async Task<IActionResult> CreateEvaluacion([FromBody] EvaluacionUpdateDto dto)
        {
            if (dto == null)
                return BadRequest("Datos de evaluación inválidos.");

            var nuevaEvaluacion = new Evaluacion
            {
                nombre = dto.nombreRubro ?? "Nueva Evaluación",
                peso = dto.porcentaje ?? 0,
                fecha_entrega = dto.fechaEntrega ?? DateTime.UtcNow,
                tipo = dto.descripcion ?? "Sin descripción",
                idInstruccion = dto.idDocumentoInstrucciones,
                id_categoria = dto.idcategoria,
                id_rubro = dto.idRubro ?? 0
            };

            _context.Evaluacion.Add(nuevaEvaluacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvaluacionesPorGrupo), new { idGrupo = nuevaEvaluacion.id_rubro }, nuevaEvaluacion);
        }

        // DTO por si aca
        public class EvaluacionUpdateDto
        {
            public string? nombreRubro { get; set; }
            public double? porcentaje { get; set; }
            public DateTime? fechaEntrega { get; set; }
            public string? descripcion { get; set; }
            public int? idDocumentoInstrucciones { get; set; }
            public int? idRubro { get; set; }
            public int? idcategoria { get; set; }
        }
    }
}
