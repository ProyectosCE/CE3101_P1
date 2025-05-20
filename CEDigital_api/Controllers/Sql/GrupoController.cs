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

        //POST : api/grupos/{id_semestre}/{codigo_curso}
        [HttpPost("{id_semestre}/{codigo_curso}")]
        public async Task<IActionResult> AddGrupo([FromBody] Grupo grupo, int id_semestre, string codigo_curso)
        {
            if (grupo == null)
                return BadRequest("Grupo no puede ser null.");

            // Verifica que el semestre y el curso existan
            var semestre = await _context.Semestre.FindAsync(id_semestre);
            if (semestre == null)
                return NotFound($"Semestre con id {id_semestre} no encontrado.");
            var curso = await _context.Curso.FindAsync(codigo_curso);
            if (curso == null)
                return NotFound($"Curso con codigo {codigo_curso} no encontrado.");

            // Asigna el semestre y el curso al grupo
            grupo.id_semestre = id_semestre;
            grupo.codigo_curso = codigo_curso;

            await _context.Grupo.AddAsync(grupo);
            await _context.SaveChangesAsync();
            // Devuelve 201 Created con la ubicación del recurso creado
            return CreatedAtAction(nameof(GetGrupoById), new { id = grupo.id_grupo }, grupo);
        }
    }
}
