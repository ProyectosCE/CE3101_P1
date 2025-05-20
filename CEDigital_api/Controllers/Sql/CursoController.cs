using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class CursoController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CursoController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/curso
        [HttpGet]
        public async Task<IActionResult> GetAllCursos()
        {
            var cursos = await _context.Curso.ToListAsync();
            return Ok(cursos);
        }

        // GET: api/curso/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCursoById(int id)
        {
            var curso = await _context.Curso.FindAsync(id);
            if (curso == null)
                return NotFound();
            return Ok(curso);
        }

        // POST: api/curso
        [HttpPost]
        public async Task<IActionResult> AddCurso([FromBody] Curso curso)
        {
            if (curso == null)
                return BadRequest("Curso no puede ser null.");
            
            await _context.Curso.AddAsync(curso);
            await _context.SaveChangesAsync();
            // Devuelve 201 Created con la ubicación del recurso creado
            return CreatedAtAction(nameof(GetCursoById), new { id = curso.codigo_curso }, curso);
        }

        // DELETE: api/curso/{codigo_curso}
        [HttpDelete("{codigo_curso}")]
        public async Task<IActionResult> DeleteCurso(string codigo_curso)
        {
            var curso = await _context.Curso.FindAsync(codigo_curso);
            if (curso == null)
                return NotFound();
            _context.Curso.Remove(curso);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/curso/{codigo_curso}
        [HttpPut("{codigo_curso}")]
        public async Task<IActionResult> UpdateCurso(string codigo_curso, [FromBody] Curso curso)
        {
            if (codigo_curso != curso.codigo_curso)
                return BadRequest("El código del curso no coincide.");
            var existingCurso = await _context.Curso.FindAsync(codigo_curso);
            if (existingCurso == null)
                return NotFound();
            existingCurso.nombre = curso.nombre;
            _context.Entry(existingCurso).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
