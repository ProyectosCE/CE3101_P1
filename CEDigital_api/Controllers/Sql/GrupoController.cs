using CEDigital_api.Data.Sql;
using CEDigital_api.Data.Mongo;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Collections.Generic;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class GrupoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ProfesorService _profesorService;

        public GrupoController(AppDbContext context, ProfesorService profesorService)
        {
            _context = context;
            _profesorService = profesorService;
        }

        //GET : api/grupos
        [HttpGet]
        public async Task<IActionResult> GetAllGrupos()
        {
            var grupos = await _context.Grupo.Include(g => g.semestre).ToListAsync();
            var resultado = new List<object>();

            foreach (var grupo in grupos)
            {
                var profesoresSQL = await _context.ProfesorXGrupo
                    .Where(pg => pg.id_grupo == grupo.id_grupo)
                    .ToListAsync();

                var profesoresMongo = new List<object>();
                foreach (var profesorSQL in profesoresSQL)
                {
                    var profesorMongo = await _profesorService.GetByCedulaAsync(profesorSQL.cedula_profesor);
                    if (profesorMongo != null)
                    {
                        profesoresMongo.Add(new
                        {
                            profesorMongo.cedula,
                            profesorMongo.nombre,
                            profesorMongo.apellidos,
                            profesorMongo.nombre_completo,
                            profesorMongo.correo,
                            profesorMongo.estado,
                            profesorMongo.IsAdmin
                        });
                    }
                }

                resultado.Add(new
                {
                    grupo.id_grupo,
                    grupo.numero_grupo,
                    grupo.codigo_curso,
                    grupo.estado,
                    semestre = grupo.semestre != null ? new
                    {
                        grupo.semestre.anio,
                        grupo.semestre.periodo
                    } : null,
                    profesores = profesoresMongo
                });
            }

            return Ok(resultado);
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
        public async Task<IActionResult> AddGrupo([FromBody] Grupo grupo, [FromQuery] List<string> profesores, [FromQuery] int anio, [FromQuery] string periodo)
        {
            if (grupo == null)
                return BadRequest("Grupo no puede ser null.");

            // Identificar el semestre por anio y periodo
            var semestre = await _context.Semestre
                .FirstOrDefaultAsync(s => s.anio == anio && s.periodo == periodo);
            if (semestre == null)
                return NotFound($"Semestre con año {anio} y periodo {periodo} no encontrado.");

            grupo.id_semestre = semestre.id_semestre;

            // Verifica que el curso exista
            var curso = await _context.Curso.FindAsync(grupo.codigo_curso);
            if (curso == null)
                return NotFound($"Curso con codigo {grupo.codigo_curso} no encontrado.");

            // Verificar si ya existe el numero de grupo con el mismo semestre y curso
            var grupoExistente = await _context.Grupo
                .FirstOrDefaultAsync(g => g.numero_grupo == grupo.numero_grupo && g.id_semestre == grupo.id_semestre && g.codigo_curso == grupo.codigo_curso);
            if (grupoExistente != null)
                return BadRequest($"Ya existe un grupo con el número {grupo.numero_grupo} para el semestre {grupo.id_semestre} y curso {grupo.codigo_curso}.");

            // Guardar el grupo
            await _context.Grupo.AddAsync(grupo);
            await _context.SaveChangesAsync();

            // Crear carpetas por defecto para este grupo
            var carpetas = new List<Carpeta>
            {
                new Carpeta { nombre = "Presentaciones", id_grupo = grupo.id_grupo },
                new Carpeta { nombre = "Quices", id_grupo = grupo.id_grupo },
                new Carpeta { nombre = "Exámenes", id_grupo = grupo.id_grupo },
                new Carpeta { nombre = "Proyectos", id_grupo = grupo.id_grupo }
            };

            // Crear rubros por defecto para este grupo
            var rubros = new List<Rubro>
            {
                new Rubro { nombre = "Quices", porcentaje = 30.00, id_grupo = grupo.id_grupo },
                new Rubro { nombre = "Exámenes", porcentaje = 30.00, id_grupo = grupo.id_grupo },
                new Rubro { nombre = "Proyectos", porcentaje = 40.00, id_grupo = grupo.id_grupo }
            };

            await _context.Carpeta.AddRangeAsync(carpetas);
            await _context.Rubro.AddRangeAsync(rubros);

            // Relacionar profesores con el grupo
            var profesoresNoEncontrados = new List<string>();
            foreach (var cedula in profesores)
            {
                var profesorSQL = await _context.Profesor.FindAsync(cedula);
                if (profesorSQL != null)
                {
                    var relacion = new ProfesorXGrupo
                    {
                        cedula_profesor = cedula,
                        id_grupo = grupo.id_grupo
                    };
                    await _context.ProfesorXGrupo.AddAsync(relacion);
                }
                else
                {
                    profesoresNoEncontrados.Add(cedula);
                }
            }

            // Guardar los cambios
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGrupoById), new { id = grupo.id_grupo }, new
            {
                grupo,
                profesoresNoEncontrados
            });
        }


        // PATCH: api/grupos/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateGrupo(int id, [FromBody] Grupo grupo, [FromQuery] int anio, [FromQuery] string periodo, [FromQuery] List<string> profesores)
        {
            var grupoExistente = await _context.Grupo.Include(g => g.semestre).FirstOrDefaultAsync(g => g.id_grupo == id);
            if (grupoExistente == null)
                return NotFound($"Grupo con id {id} no encontrado.");

            // Actualizar semestre
            var semestre = await _context.Semestre.FirstOrDefaultAsync(s => s.anio == anio && s.periodo == periodo);
            if (semestre == null)
                return NotFound($"Semestre con año {anio} y periodo {periodo} no encontrado.");
            grupoExistente.id_semestre = semestre.id_semestre;
            grupoExistente.semestre = semestre;

            // Actualizar curso
            var curso = await _context.Curso.FindAsync(grupo.codigo_curso);
            if (curso == null)
                return NotFound($"Curso con código {grupo.codigo_curso} no encontrado.");
            grupoExistente.codigo_curso = grupo.codigo_curso;
            grupoExistente.curso = curso;

            // Actualizar número de grupo
            grupoExistente.numero_grupo = grupo.numero_grupo;

            // Actualizar relaciones de profesores
            var relacionesExistentes = await _context.ProfesorXGrupo.Where(pg => pg.id_grupo == id).ToListAsync();
            _context.ProfesorXGrupo.RemoveRange(relacionesExistentes);

            foreach (var cedula in profesores)
            {
                var profesorSQL = await _context.Profesor.FindAsync(cedula);
                if (profesorSQL != null)
                {
                    var nuevaRelacion = new ProfesorXGrupo
                    {
                        cedula_profesor = cedula,
                        id_grupo = id
                    };
                    await _context.ProfesorXGrupo.AddAsync(nuevaRelacion);
                }
            }

            // Guardar cambios
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
        

        // Nuevo GET: api/grupos/usuario/{identificador}
        [HttpGet("usuario/{identificador}")]
        public async Task<IActionResult> GetGruposByUsuario(string identificador)
        {
            // Verifica si es estudiante (por carnet)
            var estudiante = await _context.Estudiante.FindAsync(identificador);
            if (estudiante != null)
            {
                var gruposEstudiante = await _context.EstudiantexGrupo
                    .Include(eg => eg.grupo)
                    .Where(eg => eg.carnet_estudiante == identificador)
                    .ToListAsync();

                var resultado = new List<object>();

                foreach (var eg in gruposEstudiante)
                {
                    if (eg?.grupo == null) continue;

                    var curso = await _context.Curso.FindAsync(eg.grupo.codigo_curso);
                    var semestre = await _context.Semestre.FindAsync(eg.grupo.id_semestre);
                    
                    var profesorGrupo = await _context.ProfesorXGrupo
                        .Where(pg => pg.id_grupo == eg.grupo.id_grupo)
                        .FirstOrDefaultAsync();

                    object datosProfesor = null;
                    if (profesorGrupo != null)
                    {
                        var profesorMongo = await _profesorService.GetByCedulaAsync(profesorGrupo.cedula_profesor);
                        if (profesorMongo != null)
                        {
                            datosProfesor = new
                            {
                                profesorMongo.cedula,
                                profesorMongo.nombre,
                                profesorMongo.apellidos,
                                profesorMongo.correo
                            };
                        }
                    }

                    resultado.Add(new
                    {
                        eg.grupo.id_grupo,
                        eg.grupo.numero_grupo,
                        eg.grupo.codigo_curso,
                        nombre_curso = curso?.nombre,
                        semestre = semestre != null ? new
                        {
                            semestre.anio,
                            semestre.periodo
                        } : null,
                        profesor = datosProfesor
                    });
                }

                return Ok(resultado);
            }

            // Verifica si es profesor (por cédula)
            var profesorSQL = await _context.Profesor.FindAsync(identificador);
            if (profesorSQL != null)
            {
                var gruposProfesor = await _context.ProfesorXGrupo
                    .Include(pg => pg.grupo)
                    .Where(pg => pg.cedula_profesor == identificador)
                    .ToListAsync();

                var profesorMongo = await _profesorService.GetByCedulaAsync(identificador);
                var resultado = new List<object>();

                foreach (var pg in gruposProfesor)
                {
                    if (pg?.grupo == null) continue;

                    var curso = await _context.Curso.FindAsync(pg.grupo.codigo_curso);
                    var semestre = await _context.Semestre.FindAsync(pg.grupo.id_semestre);

                    resultado.Add(new
                    {
                        pg.grupo.id_grupo,
                        pg.grupo.numero_grupo,
                        pg.grupo.codigo_curso,
                        nombre_curso = curso?.nombre,
                        semestre = semestre != null ? new
                        {
                            semestre.anio,
                            semestre.periodo
                        } : null,
                        profesor = profesorMongo != null ? new
                        {
                            profesorMongo.cedula,
                            profesorMongo.nombre,
                            profesorMongo.apellidos,
                            profesorMongo.correo
                        } : null
                    });
                }

                return Ok(resultado);
            }

            return NotFound("No se encontró un estudiante ni profesor con ese identificador.");
        }



    }
}
