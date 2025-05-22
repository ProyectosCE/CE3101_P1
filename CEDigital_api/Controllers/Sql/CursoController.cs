using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class CursoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly SqlService _sqlService;
        public CursoController(AppDbContext context, SqlService sqlService)
        {
            _context = context;
            _sqlService = sqlService;
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

        // PATCH: api/curso/{codigo_curso}
        [HttpPatch("{codigo_curso}")]
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

        // PATCH: api/curso/{codigo_curso}/toggle
        [HttpPatch("{codigo_curso}/toggle")]
        public async Task<IActionResult> ToggleCurso(string codigo_curso)
        {
            var curso = await _context.Curso.FindAsync(codigo_curso);
            if (curso == null)
                return NotFound();
            curso.estado = curso.estado == "activo" ? "inactivo" : "activo";
            _context.Entry(curso).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST api/curso/upload-excel
        // Falta


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

        // GET: api/curso/usuario
        [HttpGet("usuario")]
            public async Task<IActionResult> GetCursosByUsuario([FromQuery] string id, [FromQuery] string rol)
            {
                if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(rol))
                    return BadRequest("Debe especificar 'id' y 'rol' como parámetros.");

                if (rol != "estudiante" && rol != "profesor")
                    return BadRequest("El rol debe ser 'estudiante' o 'profesor'.");

                if (rol == "estudiante")
                {
                    var estudiante = await _context.Estudiante.FindAsync(id);
                    if (estudiante == null)
                        return NotFound("Estudiante no encontrado.");
                }
                else if (rol == "profesor")
                {
                    var profesor = await _context.Profesor.FindAsync(id);
                    if (profesor == null)
                        return NotFound("Profesor no encontrado.");
                }

                var sql = _sqlService.LoadSqlQuery("Controllers/Sql/Queries/cursos_usuario.sql");

                var connection = _context.Database.GetDbConnection();
                await connection.OpenAsync();

                var command = connection.CreateCommand();
                command.CommandText = sql;
                command.Parameters.Add(new SqlParameter("@rol", rol));
                command.Parameters.Add(new SqlParameter("@id", id));

                var result = new List<object>();

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var año = Convert.ToInt32(reader["año"]);
                        var periodo = reader["periodo"].ToString();
                        var new_periodo = "";

                    if (periodo == "1")
                    {
                        new_periodo = "I";
                    }
                    else if (periodo == "2")
                    {
                        new_periodo = "II";
                    }
                    else 
                    {
                        new_periodo = periodo;
                    }

                    result.Add(new
                        {
                            codigoCurso = reader["codigoCurso"].ToString(),
                            nombreCurso = reader["nombreCurso"].ToString(),
                            numGrupo = Convert.ToInt32(reader["numGrupo"]),
                            semestre = $"{año}-{new_periodo}"
                        });
                    }
                    
                }

            await connection.CloseAsync();

                return Ok(result);
            }

    }
}
