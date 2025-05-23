using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class SemestreController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SemestreController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/semestres
        [HttpGet]
        public async Task<IActionResult> GetAllSemestres()
        {
            var semestres = await _context.Semestre.ToListAsync();
            return Ok(semestres);
        }

        // GET: api/semestres/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSemestreById(int id)
        {
            var semestre = await _context.Semestre.FindAsync(id);
            if (semestre == null)
                return NotFound();
            return Ok(semestre);
        }

        // POST: api/semestres
        // Crear un nuevo semestre
        [HttpPost]
        public async Task<IActionResult> AddSemestre([FromBody] Semestre semestre)
        {
            if (semestre == null)
                return BadRequest("Semestre no puede ser null.");
            // Verifica el formato del periodo 1, 2 o V
            if (semestre.periodo != "1" && semestre.periodo != "2" && semestre.periodo != "V")
                return BadRequest("El periodo debe ser 1, 2 o V.");
  
            await _context.Semestre.AddAsync(semestre);
            await _context.SaveChangesAsync();
            // Devuelve 201 Created con la ubicación del recurso creado
            return CreatedAtAction(nameof(GetSemestreById), new { id = semestre.id_semestre }, semestre);
        }

        // PATCH: api/semestres/{id_semestre}
        // Actualizar un semestre
        [HttpPatch("{id_semestre}")]
        public async Task<IActionResult> UpdateSemestre(int id_semestre, [FromBody] Semestre semestre)
        {
            if (semestre == null)
                return BadRequest("El cuerpo de la solicitud no puede ser null.");

            if (id_semestre <= 0)
                return BadRequest("Debe proveer un id_semestre válido en la URL.");

            var existingSemestre = await _context.Semestre.FindAsync(id_semestre);
            if (existingSemestre == null)
                return NotFound("Semestre no encontrado.");

            // validar que el id_semestre del cuerpo coincida con el de la URL
            if (semestre.id_semestre != 0 && semestre.id_semestre != id_semestre)
                return BadRequest("El id_semestre en la URL no coincide con el del cuerpo.");

            // Validar el formato del periodo
            if (semestre.periodo != "1" && semestre.periodo != "2" && semestre.periodo != "V")
                return BadRequest("El periodo debe ser 1, 2 o V.");

            // Actualizar los campos permitidos
            existingSemestre.anio = semestre.anio;
            existingSemestre.periodo = semestre.periodo;

            await _context.SaveChangesAsync();
            return NoContent();
        }



        // PATCH: api/semestres/{id}/toggle
        // Habilitar o deshabilitar un semestre
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleSemestre(int id)
        {
            var semestre = await _context.Semestre.FindAsync(id);
            if (semestre == null)
                return NotFound();
            // Cambia el estado del semestre (activo/inactivo)
            semestre.estado = semestre.estado == "activo" ? "inactivo" : "activo";
            _context.Entry(semestre).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/semestres/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSemestre(int id)
        {
            var semestre = await _context.Semestre.FindAsync(id);
            if (semestre == null)
                return NotFound();
            _context.Semestre.Remove(semestre);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
