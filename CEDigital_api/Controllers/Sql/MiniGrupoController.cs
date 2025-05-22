using CEDigital_api.Data.Sql;
using CEDigital_api.Data.Mongo;
using CEDigital_api.Models.Mongo;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/minigrupos")]
    public class MiniGrupoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EstudianteService _estudianteService;

        public MiniGrupoController(AppDbContext context, EstudianteService estudianteService)
        {
            _context = context;
            _estudianteService = estudianteService;
        }
        // POST: api/grupos
        [HttpPost]
        public async Task<IActionResult> CrearGrupo([FromBody] MiniGrupoCreateDto dto)
        {
            var grupo = new MiniGrupo
            {
                nombre_minigrupo = dto.nombreGrupo,
                id_categoria = dto.idCategoria
            };

            _context.MiniGrupo.Add(grupo);
            await _context.SaveChangesAsync();

            foreach (var carnet in dto.estudiantes)
            {
                var relacion = new EstudianteXMiniGrupo
                {
                    carnet_estudiante = carnet,
                    id_minigrupo = grupo.id_minigrupo
                };
                _context.EstudianteXMiniGrupo.Add(relacion);
            }

            await _context.SaveChangesAsync();

            var estudiantesDetalles = new List<object>();
            foreach (var carnet in dto.estudiantes)
            {
                var estudiante = await _estudianteService.GetByCarnetAsync(carnet);
                if (estudiante != null)
                {
                    estudiantesDetalles.Add(new
                    {
                        carnet = estudiante.carnet,
                        nombre = estudiante.nombre
                    });
                }
            }

            return Ok(new
            {
                id = grupo.id_minigrupo,
                nombre = grupo.nombre_minigrupo,
                idCategoria = grupo.id_categoria,
                estudiantes = estudiantesDetalles
            });
        }

        // PATCH: api/grupos/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> EditarGrupo(int id, [FromBody] MiniGrupoUpdateDto dto)
        {
            var grupo = await _context.MiniGrupo
                .Include(g => g.estudiantes)
                .FirstOrDefaultAsync(g => g.id_minigrupo == id);

            if (grupo == null)
                return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.nombre))
                grupo.nombre_minigrupo = dto.nombre;

            if (dto.estudiantes != null)
            {
                // Eliminar relaciones existentes
                _context.EstudianteXMiniGrupo.RemoveRange(
                    _context.EstudianteXMiniGrupo.Where(e => e.id_minigrupo == id)
                );

                foreach (var carnet in dto.estudiantes)
                {
                    _context.EstudianteXMiniGrupo.Add(new EstudianteXMiniGrupo
                    {
                        carnet_estudiante = carnet,
                        id_minigrupo = id
                    });
                }
            }

            await _context.SaveChangesAsync();

            var estudiantesDetalles = new List<object>();
            if (dto.estudiantes != null)
            {
                foreach (var carnet in dto.estudiantes)
                {
                    var estudiante = await _estudianteService.GetByCarnetAsync(carnet);
                    if (estudiante != null)
                    {
                        estudiantesDetalles.Add(new
                        {
                            carnet = estudiante.carnet,
                            nombre = estudiante.nombre
                        });
                    }
                }
            }

            return Ok(new
            {
                id = grupo.id_minigrupo,
                nombre = grupo.nombre_minigrupo,
                idCategoria = grupo.id_categoria,
                estudiantes = estudiantesDetalles
            });
        }

        // DELETE: api/grupos/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarGrupo(int id)
        {
            var grupo = await _context.MiniGrupo
                .Include(g => g.estudiantes)
                .FirstOrDefaultAsync(g => g.id_minigrupo == id);

            if (grupo == null)
                return NotFound();

            // Eliminar relaciones
            _context.EstudianteXMiniGrupo.RemoveRange(
                _context.EstudianteXMiniGrupo.Where(e => e.id_minigrupo == id)
            );

            // Eliminar grupo
            _context.MiniGrupo.Remove(grupo);
            await _context.SaveChangesAsync();

            return Ok(new { status = "ok" });
        }
    }
// pa arraglar errores
    public class MiniGrupoCreateDto
    {
        
        public int idCategoria { get; set; }

     
        public string nombreGrupo { get; set; } = string.Empty;

      
        public List<string> estudiantes { get; set; } = new();
    }

    public class MiniGrupoUpdateDto
    {
        public string? nombre { get; set; }
        public List<string>? estudiantes { get; set; }
    }
}
