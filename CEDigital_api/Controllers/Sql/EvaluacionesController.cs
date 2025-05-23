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
                    idDocumentoInstrucciones = e.archivo_especificacion,
                    trabajoGrupal = e.id_categoria != 0,
                    idCategoriaTrabajo = e.id_categoria == 0 ? null : e.id_categoria.ToString()
                })
            });

            return Ok(resultado);
        }

        // PATCH: /api/evaluaciones/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchEvaluacion(int id, [FromBody] EvaluacionUpdateDto dto)
        {
            var evaluacion = await _context.Evaluacion.FindAsync(id);
            if (evaluacion == null)
                return NotFound();

            if (dto.nombre != null)
                evaluacion.nombre = dto.nombre;

            if (dto.peso.HasValue)
                evaluacion.peso = dto.peso.Value;

            if (dto.fecha_entrega.HasValue)
                evaluacion.fecha_entrega = dto.fecha_entrega.Value;

            if (dto.tipo != null)
                evaluacion.tipo = dto.tipo;

            if (dto.archivo_especificacion != null)
                evaluacion.archivo_especificacion = dto.archivo_especificacion;

            if (dto.id_rubro.HasValue)
                evaluacion.id_rubro = dto.id_rubro.Value;

            if (dto.id_categoria.HasValue)
                evaluacion.id_categoria = dto.id_categoria.Value;

            await _context.SaveChangesAsync();

            return Ok(evaluacion);
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

        // DTO por si aca
        public class EvaluacionUpdateDto
        {
            public string? nombre { get; set; }
            public double? peso { get; set; }
            public DateTime? fecha_entrega { get; set; }
            public string? tipo { get; set; }
            public string? archivo_especificacion { get; set; }
            public int? id_rubro { get; set; }
            public int? id_categoria { get; set; }
        }
    }
}
