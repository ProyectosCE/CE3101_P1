using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarpetaController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CarpetaController(AppDbContext context)
        {
            _context = context;
        }
        // GET: api/carpeta
        [HttpGet]
        public async Task<IActionResult> GetAllCarpetas()
        {
            var carpetas = await _context.Carpeta.ToListAsync();
            return Ok(carpetas);
        }
        // GET: api/carpeta/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCarpetaById(int id)
        {
            var carpeta = await _context.Carpeta.FindAsync(id);
            if (carpeta == null)
                return NotFound();
            return Ok(carpeta);
        }
        //POST: api/carpeta
       [HttpPost]
        public async Task<IActionResult> AddCarpeta([FromBody] Carpeta carpeta)
        {
            if (carpeta == null)
                return BadRequest("Carpeta no puede ser null.");
            await _context.Carpeta.AddAsync(carpeta);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCarpetaById), new { id = carpeta.id_carpeta }, carpeta);
        }

        //POST: api/carpeta/{cedula_profesor}
        [HttpPost("{cedula_profesor}")]
        public async Task<IActionResult> AddCarpetaByCedula(string cedula_profesor, [FromBody] Carpeta carpeta)
        {
            if (carpeta == null)
                return BadRequest("Carpeta no puede ser null.");
            var profesor = await _context.Profesor.FindAsync(cedula_profesor);
            if (profesor == null)
                return NotFound("Profesor no encontrado.");
            carpeta.cedula_profesor = cedula_profesor;
            await _context.Carpeta.AddAsync(carpeta);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCarpetaById), new { id = carpeta.id_carpeta }, carpeta);
        }

        //DELETE: api/carpeta/{id}
        // Elimina solo si fue creado por un profesor
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCarpeta(int id)
        {
            var carpeta = await _context.Carpeta.FindAsync(id);
            if (carpeta == null)
                return NotFound();
            if (carpeta.cedula_profesor == "0")
                return BadRequest("No se puede eliminar carpeta. Solo si fue creada por un profesor.");
            _context.Carpeta.Remove(carpeta);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        //PATCH: api/carpeta/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateCarpeta(int id, [FromBody] Carpeta carpeta)
        {
            if (id != carpeta.id_carpeta)
                return BadRequest("El ID de la carpeta no coincide.");
            _context.Entry(carpeta).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
