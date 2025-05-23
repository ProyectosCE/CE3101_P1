using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriaGrupoController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CategoriaGrupoController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/categoriaGrupo
        [HttpGet]
        public async Task<IActionResult> GetAllCategorias()
        {
            var categorias = await _context.CategoriaGrupo.ToListAsync();
            return Ok(categorias);
        }

        // GET: api/categoriaGrupo/{id_grupo}
        [HttpGet("{id_grupo}")]
        public async Task<IActionResult> GetCategoriasByGrupo(int id_grupo)
        {
            var categorias = await _context.CategoriaGrupo
                .Where(c => c.id_grupo == id_grupo)
                .ToListAsync();

            return Ok(categorias);
        }

        // POST: api/categoriaGrupo
        [HttpPost]
        public async Task<IActionResult> AddCategoria([FromBody] CategoriaGrupo categoria)
        {
            if (categoria == null || string.IsNullOrWhiteSpace(categoria.nombre_categoria))
                return BadRequest("Datos incompletos o inválidos.");

            var grupo = await _context.Grupo.FindAsync(categoria.id_grupo);
            if (grupo == null)
                return BadRequest("El grupo especificado no existe.");

            await _context.CategoriaGrupo.AddAsync(categoria);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategoriasByGrupo), new { id_grupo = categoria.id_grupo }, categoria);
        }

        // DELETE: api/categoriaGrupo/{id_categoria}
        [HttpDelete("{id_categoria}")]
        public async Task<IActionResult> DeleteCategoria(int id_categoria)
        {
            var categoria = await _context.CategoriaGrupo.FindAsync(id_categoria);
            if (categoria == null)
                return NotFound("Categoría no encontrada.");

            // Eliminar minigrupos asociados
            var miniGrupos = await _context.MiniGrupo
                .Where(m => m.id_categoria == id_categoria)
                .ToListAsync();

            _context.MiniGrupo.RemoveRange(miniGrupos);
            _context.CategoriaGrupo.Remove(categoria);

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
