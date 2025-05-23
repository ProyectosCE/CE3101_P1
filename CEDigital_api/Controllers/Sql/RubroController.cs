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

        // GET : api/rubros/{id_grupo}
        [HttpGet("{id_grupo}")]
        public async Task<IActionResult> GetRubrosByGrupo(int id_grupo)
        {
            var rubros = await _context.Rubro
                .Where(r => r.id_grupo == id_grupo)
                .Select(r => new
                {
                    id = r.id_rubro,
                    nombre = r.nombre,
                    porcentaje = r.porcentaje
                })
                .ToListAsync();
            if (rubros == null || !rubros.Any())
                return NotFound($"No se encontraron rubros para el grupo con ID {id_grupo}.");
            return Ok(rubros);
        }

        // POST: api/Rubros/{id_grupo}
        [HttpPost("{id_grupo}")]
        public async Task<IActionResult> CreateRubro(int id_grupo, [FromBody] Rubro rubro)
        {
            if (rubro == null)
                return BadRequest("El rubro no puede ser nulo.");
            var grupo = await _context.Grupo.FindAsync(id_grupo);
            if (grupo == null)
                return NotFound($"Grupo con ID {id_grupo} no encontrado.");
            rubro.id_grupo = grupo.id_grupo;

            // Verificar si la suma de los porcentajes de los rubros es 100% 
            if (sumaPorcentajeTotal(grupo.id_grupo, rubro.porcentaje))
                return BadRequest("La suma de los porcentajes de los rubros no puede ser mayor a 100%.");

            _context.Rubro.Add(rubro);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRubrosByGrupo), new { id_grupo = grupo.id_grupo }, rubro);
        }

        // PATCH: api/Rubros/{id_rubro}
        [HttpPatch("{id_rubro}")]
        public async Task<IActionResult> UpdateRubro(int id_rubro, [FromBody] Rubro rubro)
        {
            if (rubro == null)
                return BadRequest("El rubro no puede ser nulo.");

            var existingRubro = await _context.Rubro.FindAsync(id_rubro);
            if (existingRubro == null)
                return NotFound($"Rubro con ID {id_rubro} no encontrado.");

            if (sumaPorcentajeTotal(existingRubro.id_grupo, rubro.porcentaje, existingRubro.id_rubro))
                return BadRequest("La suma de los porcentajes de los rubros no puede ser mayor a 100%.");

            // Actualizar solo campos necesarios
            existingRubro.nombre = rubro.nombre;
            existingRubro.porcentaje = rubro.porcentaje;

            await _context.SaveChangesAsync();
            return Ok(existingRubro);
        }


        // DELETE: api/Rubros/{id_rubro}
        [HttpDelete("{id_rubro}")]
        public async Task<IActionResult> DeleteRubro(int id_rubro)
        {
            var rubro = await _context.Rubro.FindAsync(id_rubro);
            if (rubro == null)
                return NotFound($"Rubro con ID {id_rubro} no encontrado.");
            _context.Rubro.Remove(rubro);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/Rubros/porcentajeTotal/{id_grupo}
        // Devuelve el porcentaje total de los rubros de un grupo
        [HttpGet("porcentajeTotal/{id_grupo}")]
        public async Task<IActionResult> GetPorcentajeTotal(int id_grupo)
        {
            var rubros = await _context.Rubro
                .Where(r => r.id_grupo == id_grupo)
                .ToListAsync();
            if (rubros == null || !rubros.Any())
                return NotFound($"No se encontraron rubros para el grupo con ID {id_grupo}.");
            var total = rubros.Sum(r => r.porcentaje);
            return Ok(new { total });
        }

        // Metodo para verificar si la suma de los porcentajes de los rubros es mayor a 100%
        private bool sumaPorcentajeTotal(int id_grupo, double nuevoPorcentaje, int? id_rubro_actual = null)
        {
            var rubrosExistentes = _context.Rubro
                .Where(r => r.id_grupo == id_grupo)
                .ToList();

            if (id_rubro_actual.HasValue)
            {
                var rubroActual = rubrosExistentes.FirstOrDefault(r => r.id_rubro == id_rubro_actual.Value);
                if (rubroActual != null)
                { 
                    rubrosExistentes.Remove(rubroActual);
                }
            }

            var sumaPorcentajes = rubrosExistentes.Sum(r => r.porcentaje) + nuevoPorcentaje;
            return sumaPorcentajes > 100;
        }

    }
}
