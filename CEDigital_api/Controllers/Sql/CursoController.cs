using CEDigital_api.Data.Mongo;
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
        private readonly EstudianteService _estudianteService;
        public CursoController(AppDbContext context, SqlService sqlService, EstudianteService estudianteService)
        {
            _context = context;
            _sqlService = sqlService;
            _estudianteService = estudianteService;
        }

        // GET: api/curso
        [HttpGet]
        public async Task<IActionResult> GetAllCursos()
        {
            var cursos = await _context.Curso.ToListAsync();
            return Ok(cursos);
        }

        // GET: api/curso/{id_curso}
        [HttpGet("{id_curso}")]
        public async Task<IActionResult> GetCursoById(string id_curso)
        {
            var curso = await _context.Curso.FindAsync(id_curso);
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

        // PATCH: api/curso
        [HttpPatch]
        public async Task<IActionResult> UpdateCurso([FromBody] Curso curso)
        {
            if (curso == null)
                return BadRequest("El cuerpo de la solicitud no puede ser null.");

            var existingCurso = await _context.Curso.FindAsync(curso.codigo_curso);
            if (existingCurso == null)
                return NotFound("Curso no encontrado.");

            // Actualizar campos permitidos
            existingCurso.nombre = curso.nombre;
            existingCurso.creditos = curso.creditos;

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
                    var anio = Convert.ToInt32(reader["anio"]);
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
                        semestre = $"{anio}-{new_periodo}"
                    });
                }

            }

            await connection.CloseAsync();

            return Ok(result);
        }

        // GET: api/curso/{codigoCurso}/estudiantes
        // Devuelve una lista de estudiantes por curso
        [HttpGet("{codigoCurso}/estudiantes")]
        public async Task<IActionResult> GetEstudiantesByCurso(string codigoCurso)
        {
            // 1. Obtener los grupos del curso
            var grupos = await _context.Grupo
                .Where(g => g.codigo_curso == codigoCurso)
                .Select(g => g.id_grupo)
                .ToListAsync();

            if (!grupos.Any())
                return NotFound("No se encontraron grupos para el curso.");

            // 2. Obtener carnets de estudiantes en esos grupos
            var carnets = await _context.EstudiantexGrupo
                .Where(exg => grupos.Contains(exg.id_grupo))
                .Select(exg => exg.carnet_estudiante)
                .Distinct()
                .ToListAsync();

            if (!carnets.Any())
                return Ok(new List<Estudiante>());

            // 3. Obtener en paralelo los estudiantes desde Mongo por carnet
            var tareas = carnets.Select(carnet => _estudianteService.GetByCarnetAsync(carnet));
            var estudiantes = await Task.WhenAll(tareas);

            var resultado = estudiantes
                .Where(e => e != null)
                .Select(e => new
                {
                    carnet = e.carnet,
                    nombre = e.nombre,
                    correo = e.correo,
                    telefono = e.telefono
                })
                .ToList();

            return Ok(resultado);
        }



    }
}
