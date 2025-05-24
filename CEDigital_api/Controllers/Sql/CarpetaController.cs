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

        // GET: api/carpeta/grupo/{id_grupo}
        [HttpGet("grupo/{id_grupo}")]
        public async Task<IActionResult> GetCarpetasByGrupo(int id_grupo)
        {
            var carpetas = await _context.Carpeta.Where(c => c.id_grupo == id_grupo).ToListAsync();
            if (carpetas == null || carpetas.Count == 0)
                return NotFound("No se encontraron carpetas para el grupo especificado.");
            return Ok(carpetas);
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

        //POST: api/carpeta/{id_grupo}/{cedula_profesor}
        // Agrega una carpeta a un profesor por cedula y id_grupo
        [HttpPost("{id_grupo}/{cedula_profesor}")]
        public async Task<IActionResult> AddCarpetaToProfesor(int id_grupo, string cedula_profesor, [FromBody] Carpeta carpeta)
        {
            if (carpeta == null)
                return BadRequest("Carpeta no puede ser null.");
            var grupo = await _context.Grupo.FindAsync(id_grupo);
            if (grupo == null)
                return NotFound("Grupo no encontrado.");
            var profesor = await _context.Profesor.FindAsync(cedula_profesor);
            if (profesor == null)
                return NotFound("Profesor no encontrado.");
            carpeta.id_grupo = id_grupo;
            carpeta.cedula_profesor = cedula_profesor;
            await _context.Carpeta.AddAsync(carpeta);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCarpetaById), new { id = carpeta.id_carpeta }, carpeta);
        }

        //DELETE: api/carpeta/{id_carpeta}
        // Elimina solo si fue creado por un profesor
        [HttpDelete("{id_carpeta}")]
        public async Task<IActionResult> DeleteCarpeta(int id_carpeta)
        {
            var carpeta = await _context.Carpeta
                .Include(c => c.documentos)
                .Include(c => c.grupo)
                .FirstOrDefaultAsync(c => c.id_carpeta == id_carpeta);

            if (carpeta == null)
                return NotFound("Carpeta no encontrada.");
            if (carpeta.cedula_profesor == null)
                return BadRequest("No se puede eliminar carpeta. Solo si fue creada por un profesor.");

            try
            {
                // Eliminar documentos de la base de datos
                _context.Documento.RemoveRange(carpeta.documentos);

                // Eliminar carpeta de la base de datos
                _context.Carpeta.Remove(carpeta);

                await _context.SaveChangesAsync();

                // Eliminar carpeta física
                var rutaCarpeta = Path.Combine(
                    "wwwroot",
                    "Archivos",
                    $"Semestre_{carpeta.grupo.id_semestre}",
                    carpeta.grupo.codigo_curso!,
                    $"Grupo_{carpeta.grupo.id_grupo}",
                    $"Carpeta_{carpeta.id_carpeta}_{carpeta.nombre}"
                );

                if (Directory.Exists(rutaCarpeta))
                {
                    Directory.Delete(rutaCarpeta, true); // Elimina la carpeta y su contenido
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al eliminar la carpeta: {ex.Message}");
            }
        }

        //PATCH: api/carpeta/{id_carpeta}
        [HttpPatch("{id_carpeta}")]
        public async Task<IActionResult> UpdateCarpeta(int id_carpeta, [FromBody] Carpeta updatedCarpeta)
        {
            if (updatedCarpeta == null)
                return BadRequest("No puede ser null.");

            var existingCarpeta = await _context.Carpeta.FindAsync(id_carpeta);
            if (existingCarpeta == null)
                return NotFound("Carpeta no encontrada.");

            existingCarpeta.nombre = updatedCarpeta.nombre;

            await _context.SaveChangesAsync();
            return NoContent();
        }

    }
}
