using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class RubrosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RubrosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/rubros?idCurso=curso123
        [HttpGet]
        public async Task<IActionResult> GetRubrosByCurso([FromQuery] string idCurso)
        {
            if (string.IsNullOrEmpty(idCurso))
                return BadRequest("Debe proporcionar el parámetro 'idCurso'.");

            var rubros = await _context.Rubro
                .Include(r => r.grupo)
                .Where(r => r.grupo!.codigo_curso == idCurso)
                .Select(r => new
                {
                    id = r.id_rubro,
                    nombre = r.nombre,
                    porcentaje = r.porcentaje
                })
                .ToListAsync();

            return Ok(rubros);
        }

        // POST: api/rubros
        [HttpPost]
        public async Task<IActionResult> CreateRubro([FromBody] RubroCreateDto rubroDto)
        {
            // Buscar el grupo que corresponde al curso
            var grupo = await _context.Grupo
                .FirstOrDefaultAsync(g => g.codigo_curso == rubroDto.idCurso);

            if (grupo == null)
                return NotFound($"No se encontró grupo para el curso con código {rubroDto.idCurso}.");

            var rubro = new Rubro
            {
                nombre = rubroDto.nombre,
                porcentaje = rubroDto.porcentaje,
                id_grupo = grupo.id_grupo
            };

            _context.Rubro.Add(rubro);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = rubro.id_rubro,
                nombre = rubro.nombre,
                porcentaje = rubro.porcentaje
            });
        }

        // PATCH: api/rubros/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateRubro(int id, [FromBody] RubroUpdateDto rubroDto)
        {
            var rubro = await _context.Rubro.FindAsync(id);
            if (rubro == null)
                return NotFound($"Rubro con ID {id} no encontrado.");

            if (!string.IsNullOrEmpty(rubroDto.nombre))
                rubro.nombre = rubroDto.nombre;

            if (rubroDto.porcentaje.HasValue)
                rubro.porcentaje = rubroDto.porcentaje.Value;

            _context.Entry(rubro).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = rubro.id_rubro,
                nombre = rubro.nombre,
                porcentaje = rubro.porcentaje
            });
        }

        // DELETE: api/rubros/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRubro(int id)
        {
            var rubro = await _context.Rubro.FindAsync(id);
            if (rubro == null)
                return NotFound($"Rubro con ID {id} no encontrado.");

            _context.Rubro.Remove(rubro);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // DTOs

    public class RubroCreateDto
    {
        public string idCurso { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public double porcentaje { get; set; }
    }

    public class RubroUpdateDto
    {
        public string? nombre { get; set; }
        public double? porcentaje { get; set; }
    }
}
