using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class GrupoController : ControllerBase
    {
        private readonly AppDbContext _context;
        public GrupoController(AppDbContext context)
        {
            _context = context;
        }

        //GET : api/grupos
        [HttpGet]
        public async Task<IActionResult> GetAllGrupos()
        {
            var grupos = await _context.Grupo.ToListAsync();
            return Ok(grupos);
        }

        //GET: api/grupos/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetGrupoById(int id)
        {
            var grupo = await _context.Grupo.FindAsync(id);
            if (grupo == null)
                return NotFound();
            return Ok(grupo);
        }

        //GET: api/grupos/{id_semestre}/{codigo_curso}
        [HttpGet("{id_semestre}/{codigo_curso}")]
        public async Task<IActionResult> GetGruposBySemestreAndCurso(int id_semestre, string codigo_curso)
        {
            var grupos = await _context.Grupo
                .Where(g => g.id_semestre == id_semestre && g.codigo_curso == codigo_curso)
                .ToListAsync();
            if (grupos == null || grupos.Count == 0)
                return NotFound($"No se encontraron grupos para el semestre {id_semestre} y curso {codigo_curso}.");
            return Ok(grupos);
        }

        //POST : api/grupos
        [HttpPost]
        public async Task<IActionResult> AddGrupo([FromBody] Grupo grupo)
        {
            if (grupo == null)
                return BadRequest("Grupo no puede ser null.");
            // Verifica que el semestre y el curso existan
            var semestre = await _context.Semestre.FindAsync(grupo.id_semestre);
            if (semestre == null)
                return NotFound($"Semestre con id {grupo.id_semestre} no encontrado.");
            var curso = await _context.Curso.FindAsync(grupo.codigo_curso);
            if (curso == null)
                return NotFound($"Curso con codigo {grupo.codigo_curso} no encontrado.");
            await _context.Grupo.AddAsync(grupo);
            await _context.SaveChangesAsync();
            // Devuelve 201 Created con la ubicación del recurso creado
            return CreatedAtAction(nameof(GetGrupoById), new { id = grupo.id_grupo }, grupo);
        }

        // PATCH: api/grupos/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateGrupo(int id, [FromBody] Grupo grupo)
        {
            if (id != grupo.id_grupo)
                return BadRequest("El ID del grupo no coincide.");
            var grupoExistente = await _context.Grupo.FindAsync(id);
            if (grupoExistente == null)
                return NotFound($"Grupo con id {id} no encontrado.");
            // Verifica que el semestre y el curso existan
            var semestre = await _context.Semestre.FindAsync(grupo.id_semestre);
            if (semestre == null)
                return NotFound($"Semestre con id {grupo.id_semestre} no encontrado.");
            var curso = await _context.Curso.FindAsync(grupo.codigo_curso);
            if (curso == null)
                return NotFound($"Curso con codigo {grupo.codigo_curso} no encontrado.");
            _context.Entry(grupoExistente).CurrentValues.SetValues(grupo);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH : api/grupos/{id}/toggle
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleGrupo(int id)
        {
            var grupo = await _context.Grupo.FindAsync(id);
            if (grupo == null)
                return NotFound($"Grupo con id {id} no encontrado.");
            grupo.estado = grupo.estado == "activo" ? "inactivo" : "activo";
            _context.Entry(grupo).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST : api/grupos/upload-excel
        // Falta
    }
}
