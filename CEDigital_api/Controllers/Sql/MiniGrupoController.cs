using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace CEDigital_api.Controllers
{
    [ApiController]
    [Route("api/grupos")]
    public class MiniGruposController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MiniGruposController(AppDbContext context)
        {
            _context = context;
        }
        // por si aca x3
        public class CrearMiniGrupoDTO
        {
            [Required]
            public int idCategoria { get; set; }
            [Required]
            public string nombreGrupo { get; set; }
            [Required]
            public List<string> estudiantes { get; set; } = new();
        }
        public class MiniGrupoResponseDTO
        {
            public int id { get; set; }
            public string nombre { get; set; }
            public int idCategoria { get; set; }
            public List<EstudianteDTO> estudiantes { get; set; } = new();
        }
        public class EstudianteDTO
        {
            public string carnet { get; set; }
            public string nombre { get; set; }
        }
        // POST /api/grups
        [HttpPost]
        public async Task<ActionResult<MiniGrupoResponseDTO>> CrearMiniGrupo([FromBody] CrearMiniGrupoDTO dto)
        {
            var minigrupo = new MiniGrupo
            {
                nombre_minigrupo = dto.nombreGrupo,
                id_categoria = dto.idCategoria
            };
            _context.MiniGrupo.Add(minigrupo);
            await _context.SaveChangesAsync();

            foreach (var carnet in dto.estudiantes)
            {
                _context.EstudianteXMiniGrupo.Add(new EstudianteXMiniGrupo
                {
                    carnet_estudiante = carnet,
                    id_minigrupo = minigrupo.id_minigrupo
                });
            }

            await _context.SaveChangesAsync();

            var estudiantes = await _context.Estudiante
                .Where(e => dto.estudiantes.Contains(e.carnet_estudiante))
                .Select(e => new EstudianteDTO
                {
                    carnet = e.carnet_estudiante,
                    nombre = e.nombre
                })
                .ToListAsync();

            return Ok(new MiniGrupoResponseDTO
            {
                id = minigrupo.id_minigrupo,
                nombre = minigrupo.nombre_minigrupo,
                idCategoria = minigrupo.id_categoria,
                estudiantes = estudiantes
            });
        }
        // PATCH /api/grupos/:id
        [HttpPatch("{id}")]
        public async Task<ActionResult<MiniGrupoResponseDTO>> EditarMiniGrupo(int id, [FromBody] CrearMiniGrupoDTO dto)
        {
            var grupo = await _context.MiniGrupo.FindAsync(id);
            if (grupo == null) return NotFound();

            grupo.nombre_minigrupo = dto.nombreGrupo;
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

            await _context.SaveChangesAsync();

            var estudiantes = await _context.Estudiante
                .Where(e => dto.estudiantes.Contains(e.carnet_estudiante))
                .Select(e => new EstudianteDTO
                {
                    carnet = e.carnet_estudiante,
                    nombre = e.nombre
                })
                .ToListAsync();

            return Ok(new MiniGrupoResponseDTO
            {
                id = grupo.id_minigrupo,
                nombre = grupo.nombre_minigrupo,
                idCategoria = grupo.id_categoria,
                estudiantes = estudiantes
            });
        }

        // DELETE /api/grupos/:id
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarMiniGrupo(int id)
        {
            var grupo = await _context.MiniGrupo.FindAsync(id);
            if (grupo == null) return NotFound();

            _context.EstudianteXMiniGrupo.RemoveRange(
                _context.EstudianteXMiniGrupo.Where(e => e.id_minigrupo == id)
            );
            _context.MiniGrupo.Remove(grupo);
            await _context.SaveChangesAsync();

            return Ok(new { status = "ok" });
        }
    }
}
