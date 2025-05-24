using System.IO;
using System.IO.Compression;
using CEDigital_api.Data.Sql;
using CEDigital_api.Data.Mongo;
using CEDigital_api.Models.Sql;
using CEDigital_api.Models.Mongo;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql

{
    [ApiController]
    [Route("api/[controller]")]
    public class EntregasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EstudianteService _estService;
        private readonly SqlService _sqlService;
        private readonly IWebHostEnvironment _env;

        public EntregasController(AppDbContext context, EstudianteService estService, SqlService sqlService, IWebHostEnvironment env)
        {
            _context = context;
            _estService = estService;
            _sqlService = sqlService;
            _env = env;
        }
        public class RetroalimentacionDto
        {
            public IFormFile archivo { get; set; }

           
            public string comentario { get; set; }
        }

        // GET: api/entregas?idEvaluacion=...
        [HttpGet]
        public async Task<IActionResult> GetEntregas([FromQuery] int idEvaluacion)
        {
            var entregas = await _context.Entregable
                .Where(e => e.id_evaluacion == idEvaluacion)
                .ToListAsync();

            var result = new List<object>();
            foreach (var ent in entregas)
            {
                var estudiante = await _estService.GetByCarnetAsync(ent.carnet_estudiante);
                var nota = await _context.Nota.FindAsync(ent.id_entregable);

                result.Add(new {
                    idEntrega = ent.id_entregable,
                    carnet = ent.carnet_estudiante,
                    nombreEstudiante = estudiante?.nombre,
                    idArchivo = ent.id_entregable,
                    nombreArchivo = ent.archivo,
                    fechaEntrega = ent.fecha_entrega.ToString("yyyy-MM-dd"),
                    horaEntrega = ent.fecha_entrega.ToString("HH:mm"),
                    comentario = nota.observaciones,
                    //idDocumentoRetroalimentacion = nota?.archivo_retro,
                    estado = nota?.estado
                });
            }
            return Ok(result);
        }

        // GET: api/entregas/download/{idEvaluacion}
        [HttpGet("download/{idEvaluacion}")]
        public async Task<IActionResult> DownloadZip(int idEvaluacion)
        {
            var entregas = await _context.Entregable
                .Where(e => e.id_evaluacion == idEvaluacion)
                .ToListAsync();

            var zipName = $"entregas_{idEvaluacion}.zip";
            var zipPath = Path.Combine(_env.ContentRootPath, "Temp", zipName);
            Directory.CreateDirectory(Path.GetDirectoryName(zipPath));

            using (var zip = ZipFile.Open(zipPath, ZipArchiveMode.Create))
            {
                foreach (var ent in entregas)
                {
                    var filePath = Path.Combine(_env.ContentRootPath, "Uploads", ent.archivo);
                    if (System.IO.File.Exists(filePath))
                        zip.CreateEntryFromFile(filePath, ent.archivo);
                }
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(zipPath);
            return File(bytes, "application/zip", zipName);
        }

        [HttpPatch("{idEntrega}/retroalimentacion")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> PatchRetroalimentacion(int idEntrega, [FromForm] RetroalimentacionDto form)
        {
            var nota = await _context.Nota.FindAsync(idEntrega);
            if (nota == null) return NotFound();

            var archivo = form.archivo;

            // Guardar archivo retroalimentación
            var uploadPath = Path.Combine(_env.ContentRootPath, "Feedback", archivo.FileName);
            Directory.CreateDirectory(Path.GetDirectoryName(uploadPath));
            using var stream = System.IO.File.Create(uploadPath);
            await archivo.CopyToAsync(stream);

            nota.observaciones = form.comentario;
            //nota.archivo_retro = archivo.FileName;
            _context.Entry(nota).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }


        // PATCH: api/entregas/{idEntrega}/toggle-estado
        [HttpPatch("{idEntrega}/toggle-estado")]
        public async Task<IActionResult> ToggleEstado(int idEntrega)
        {
            var nota = await _context.Nota.FindAsync(idEntrega);
            if (nota == null) return NotFound();

            nota.estado = nota.estado == "sinpublicar" ? "publicado" : "sinpublicar";
            _context.Entry(nota).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/evaluaciones/{idEvaluacion}/publicar-todas
        [HttpPatch("/api/evaluaciones/{idEvaluacion}/publicar-todas")]
        public async Task<IActionResult> PublicarTodas(int idEvaluacion)
        {
            var entregas = await _context.Entregable
                .Where(e => e.id_evaluacion == idEvaluacion)
                .ToListAsync();

            foreach (var ent in entregas)
            {
                var nota = await _context.Nota.FindAsync(ent.id_entregable);
                if (nota != null)
                {
                    nota.estado = "publicado";
                    _context.Entry(nota).State = EntityState.Modified;
                }
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/entregas/{idEntrega}/calificacion
        [HttpPatch("{idEntrega}/calificacion")]
        public async Task<IActionResult> Calificar(int idEntrega, [FromBody] CalificacionDto dto)
        {
            var nota = await _context.Nota.FindAsync(idEntrega);
            if (nota == null) return NotFound();

            nota.calificacion = dto.calificacion;
            _context.Entry(nota).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(nota);
        }

        // GET: api/entregas/estudiante?idEstudiante=&idEvaluacion=
        [HttpGet("estudiante")]
        public async Task<IActionResult> GetPorEstudiante([FromQuery] string idEstudiante, [FromQuery] int idEvaluacion)
        {
            var entrega = await _context.Entregable
                .Where(e => e.id_evaluacion == idEvaluacion && e.carnet_estudiante == idEstudiante)
                .FirstOrDefaultAsync();
            if (entrega == null) return NotFound();

            var nota = await _context.Nota.FindAsync(entrega.id_entregable);
            return Ok(new {
                idDocumentoEntrega = entrega.archivo,
                calificacion = nota?.calificacion,
                comentario = nota?.observaciones,
                //idDocumentoRetroalimentacion = nota?.archivo_retro
            });
        }

        // GET: api/entregas/estudiante/grupal?idEstudiante=&idEvaluacion=
        [HttpGet("estudiante/grupal")]
        public async Task<IActionResult> GetEntregagrupal([FromQuery] string idEstudiante, [FromQuery] int idEvaluacion)
        {
            // Cargar idCategoria desde Evaluacion
            var eval = await _context.Evaluacion.FindAsync(idEvaluacion);
            if (eval == null) return NotFound();

            // Obtener grupo de minitrabajo
            var grupoTrabajo = await _context.EstudianteXMiniGrupo
                .Where(x => x.carnet_estudiante == idEstudiante)
                .Include(x => x.miniGrupo)
                .FirstOrDefaultAsync(x => x.miniGrupo.id_categoria == eval.id_categoria);
            if (grupoTrabajo == null) return NotFound();

            // Integrantes
            var integrantes = await _context.EstudianteXMiniGrupo
                .Where(x => x.id_minigrupo == grupoTrabajo.id_minigrupo)
                .Select(x => x.carnet_estudiante)
                .ToListAsync();

            var nombres = new List<string>();
            foreach (var carnet in integrantes)
            {
                var est = await _estService.GetByCarnetAsync(carnet);
                if (est != null) nombres.Add(est.nombre);
            }

            // Entrega del grupo (tomamos la primera)
            var entrega = await _context.Entregable
                .Where(e => e.id_evaluacion == idEvaluacion && integrantes.Contains(e.carnet_estudiante))
                .FirstOrDefaultAsync();
            if (entrega == null) return NotFound();

            var nota = await _context.Nota.FindAsync(entrega.id_entregable);

            return Ok(new {
                idGrupoTrabajo = grupoTrabajo.id_minigrupo,
                nombreGrupoTrabajo = grupoTrabajo.miniGrupo.nombre_minigrupo,
                integrantes = nombres,
                idDocumentoEntrega = entrega.archivo,
                calificacion = nota?.calificacion,
                comentario = nota?.observaciones,
                //idDocumentoRetroalimentacion = nota?.archivo_retro
            });
        }

        // GET: api/entregas/evaluacion/{idEvaluacion}
        [HttpGet("evaluacion/{idEvaluacion}")]
        public async Task<IActionResult> GetEntregasPorEvaluacion(int idEvaluacion)
        {
            var entregas = await _context.Entregable
                .Where(e => e.id_evaluacion == idEvaluacion)
                .ToListAsync();

            if (!entregas.Any()) return NotFound();

            var result = entregas.Select(ent => new
            {
                idEntrega = ent.id_entregable,
                carnetEstudiante = ent.carnet_estudiante,
                nombreArchivo = ent.archivo,
                archivoId = ent.archivo_id, // Ensure correct column usage
                fechaEntrega = ent.fecha_entrega.ToString("yyyy-MM-dd"),
                horaEntrega = ent.fecha_entrega.ToString("HH:mm")
            });

            return Ok(result);
        }

        public class CalificacionDto { public double calificacion { get; set; } }
    }
}
