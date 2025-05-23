using CEDigital_api.Data.Mongo;
using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class NoticiaController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly SqlService _sqlService;
        private readonly ProfesorService _profesorService;
        public NoticiaController(AppDbContext context, SqlService sqlService, ProfesorService profesorService)
        {
            _context = context;
            _sqlService = sqlService;
            _profesorService = profesorService;
        }

        // GET: api/noticias
        [HttpGet("usuario")]
        public async Task<IActionResult> GetNoticiasByUsuario(
            [FromQuery] string idusuario,
            [FromQuery] string rol,
            [FromQuery] string idcurso)
        {
            if (string.IsNullOrEmpty(idusuario) || string.IsNullOrEmpty(rol) || string.IsNullOrEmpty(idcurso))
                return BadRequest("Debe proporcionar 'idusuario', 'rol' y 'idcurso'.");

            if (rol != "estudiante" && rol != "profesor")
                return BadRequest("El rol debe ser 'estudiante' o 'profesor'.");

            var sql = _sqlService.LoadSqlQuery("Controllers/Sql/Queries/noticias_usuario.sql");

            var paramRol = new SqlParameter("@rol", rol);
            var paramId = new SqlParameter("@idusuario", idusuario);
            var paramCurso = new SqlParameter("@idcurso", idcurso);

            var noticiasRaw = await _context
                .Noticia
                .FromSqlRaw(sql, paramRol, paramId, paramCurso)
                .ToListAsync();

            var cedulas = noticiasRaw
                    .Select(n => n.cedula_profesor)
                    .Where(c => !string.IsNullOrEmpty(c))
                    .Distinct()
                    .ToList();

            // Consultar nombres desde Mongo
            var profesores = new Dictionary<string, string>();
            foreach (var cedula in cedulas)
            {
                var profesor = await _profesorService.GetByCedulaAsync(cedula);
                if (profesor != null)
                    profesores[cedula] = profesor.nombre_completo;
            }

            var noticias = noticiasRaw
                    .OrderByDescending(n => n.fecha_publicacion)
                    .Select(n => new
                    {
                        id = n.id_noticia,
                        n.titulo,
                        fecha = n.fecha_publicacion.ToString("yyyy-MM-dd"),
                        autor = profesores.ContainsKey(n.cedula_profesor)
                            ? profesores[n.cedula_profesor]
                            : "Profesor desconocido",
                        cuerpo = n.mensaje
                    });

            return Ok(noticias);
        }


        // POST : api/noticias
        [HttpPost]
        public async Task<IActionResult> AddNoticia([FromBody] Noticia noticia)
        {
            if (noticia == null)
                return BadRequest("Noticia no puede ser null.");
            // Verifica que el id_grupo y cedula_profesor no sean null
            if (noticia.id_grupo <= 0 || string.IsNullOrEmpty(noticia.cedula_profesor))
                return BadRequest("El id_grupo y cedula_profesor son obligatorios.");
            await _context.Noticia.AddAsync(noticia);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNoticiasByUsuario), new { idusuario = noticia.cedula_profesor }, noticia);
        }

        // PATCH: api/noticias/{id}
        // Actualizar una noticia 
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateNoticia(int id, [FromBody] Noticia noticia)
        {
            if (id != noticia.id_noticia)
                return BadRequest("El ID de la noticia no coincide.");
            var noticiaExistente = await _context.Noticia.FindAsync(id);
            if (noticiaExistente == null)
                return NotFound();
            noticiaExistente.titulo = noticia.titulo;
            noticiaExistente.fecha_publicacion = noticia.fecha_publicacion;
            noticiaExistente.mensaje = noticia.mensaje;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
