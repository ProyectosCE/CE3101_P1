using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using CEDigital_api.Services.Archivos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ArchivoService _archivoService;
        private readonly IWebHostEnvironment _env;

        public DocumentoController(
            AppDbContext context,
            ArchivoService archivoService,
            IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
            _archivoService = archivoService;
        }

        // GET : api/documentos/
        [HttpGet("{id_carpeta}")]
        public async Task<IActionResult> GetDocumentosByCarpetaId(int id_carpeta)
        {
            var documentos = await _context.Documento
                .Where(d => d.id_carpeta == id_carpeta)
                .ToListAsync();
            if (documentos == null || documentos.Count == 0)
                return NotFound("No se encontraron documentos para la carpeta especificada.");
            return Ok(documentos);
        }

        // GET : api/documentos/{id_documento}
        [HttpGet("{id_documento}/download")]
        public async Task<IActionResult> DescargarDocumento(int id_documento)
        {
            var documento = await _context.Documento
                .Include(d => d.carpeta)
                .ThenInclude(c => c.grupo)
                .ThenInclude(g => g.curso)
                .Include(d => d.carpeta.grupo.semestre)
                .FirstOrDefaultAsync(d => d.id_documento == id_documento);

            if (documento == null)
                return NotFound("Documento no encontrado.");

            var nombreCarpetaSanitizado = new string(documento.carpeta.nombre
                .Where(c => char.IsLetterOrDigit(c) || c == '_' || c == '-')
                .ToArray());

            var rutaArchivo = Path.Combine(
                _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"),
                "Archivos",
                $"Semestre_{documento.carpeta.grupo.id_semestre}",
                documento.carpeta.grupo.codigo_curso!,
                $"Grupo_{documento.carpeta.grupo.id_grupo}",
                $"Carpeta_{documento.id_carpeta}_{nombreCarpetaSanitizado}",
                documento.nombre_archivo
            );

            if (!System.IO.File.Exists(rutaArchivo))
                return NotFound("Archivo no encontrado en el sistema.");

            var bytes = await System.IO.File.ReadAllBytesAsync(rutaArchivo);
            return File(bytes, "application/octet-stream", documento.nombre_archivo);
        }

        // POST : api/documentos/upload/id_carpeta
        [HttpPost("upload/{id_carpeta}")]
        public async Task<IActionResult> SubirDocumento(int id_carpeta, IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
                return BadRequest("Archivo inválido.");

            var carpeta = await _context.Carpeta
                .Include(c => c.grupo)
                .ThenInclude(g => g.curso)
                .Include(c => c.grupo.semestre)
                .FirstOrDefaultAsync(c => c.id_carpeta == id_carpeta);

            if (carpeta == null)
                return NotFound("Carpeta no encontrada.");

            try
            {
                var rutaArchivo = await _archivoService.GuardarArchivoAsync(
                    archivo,
                    carpeta.grupo.id_semestre,
                    carpeta.grupo.codigo_curso!,
                    carpeta.grupo.id_grupo,
                    carpeta.id_carpeta,
                    carpeta.nombre
                );

                var nuevoDocumento = new Documento
                {
                    nombre_archivo = archivo.FileName,
                    size = (float)archivo.Length,
                    fecha_subida = DateTime.UtcNow,
                    id_carpeta = id_carpeta
                };

                _context.Documento.Add(nuevoDocumento);
                await _context.SaveChangesAsync();

                return Ok(nuevoDocumento);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al guardar el archivo: {ex.Message}");
            }
        }

        // DELETE : api/documentos/{id_documento} 
        [HttpDelete("{id_documento}")]
        public async Task<IActionResult> EliminarDocumento(int id_documento)
        {
            var documento = await _context.Documento
                .Include(d => d.carpeta)
                    .ThenInclude(c => c.grupo)
                        .ThenInclude(g => g.curso)
                .Include(d => d.carpeta.grupo.semestre)
                .FirstOrDefaultAsync(d => d.id_documento == id_documento);

            if (documento == null)
                return NotFound("Documento no encontrado.");

            try
            {
                string nombreSanitizado = new string(documento.carpeta.nombre
                    .Where(c => char.IsLetterOrDigit(c) || c == '_' || c == '-')
                    .ToArray());

                string rutaArchivo = Path.Combine(
                    _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"),
                    "Archivos",
                    $"Semestre_{documento.carpeta.grupo.id_semestre}",
                    documento.carpeta.grupo.codigo_curso!,
                    $"Grupo_{documento.carpeta.grupo.id_grupo}",
                    $"Carpeta_{documento.carpeta.id_carpeta}_{nombreSanitizado}",
                    documento.nombre_archivo
                );

                // Eliminar archivo físico si existe
                if (System.IO.File.Exists(rutaArchivo))
                    System.IO.File.Delete(rutaArchivo);

                // Eliminar de la base de datos
                _context.Documento.Remove(documento);
                await _context.SaveChangesAsync();

                return Ok("Documento eliminado correctamente.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al eliminar el documento: {ex.Message}");
            }
        }

        // PATCH : api/documentos/{id_documento}
        [HttpPatch("{id_documento}")]
        public async Task<IActionResult> EditarNombreArchivo(int id_documento, [FromBody] DocumentoNombreDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Nombre))
                return BadRequest("El nombre del archivo no puede estar vacío.");

            var documento = await _context.Documento
                .Include(d => d.carpeta)
                    .ThenInclude(c => c.grupo)
                        .ThenInclude(g => g.curso)
                .Include(d => d.carpeta.grupo.semestre)
                .FirstOrDefaultAsync(d => d.id_documento == id_documento);

            if (documento == null)
                return NotFound("Documento no encontrado.");

            // Obtener extensión original
            var extensionOriginal = Path.GetExtension(documento.nombre_archivo);

            // Sanitizar el nuevo nombre recibido (sin extensión)
            var nuevoNombreSanitizado = new string(dto.Nombre
                .Where(c => char.IsLetterOrDigit(c) || c == '_' || c == '-' || c == ' ')
                .ToArray()).Trim();

            if (string.IsNullOrWhiteSpace(nuevoNombreSanitizado))
                return BadRequest("El nombre del archivo contiene caracteres inválidos.");

            // Construir el nombre final con la extensión original
            var nuevoNombreCompleto = nuevoNombreSanitizado + extensionOriginal;

            string nombreCarpetaSanitizado = new string(documento.carpeta.nombre
                .Where(c => char.IsLetterOrDigit(c) || c == '_' || c == '-')
                .ToArray());

            string rutaCarpeta = Path.Combine(
                _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"),
                "Archivos",
                $"Semestre_{documento.carpeta.grupo.id_semestre}",
                documento.carpeta.grupo.codigo_curso!,
                $"Grupo_{documento.carpeta.grupo.id_grupo}",
                $"Carpeta_{documento.carpeta.id_carpeta}_{nombreCarpetaSanitizado}"
            );

            string rutaArchivoViejo = Path.Combine(rutaCarpeta, documento.nombre_archivo);
            string rutaArchivoNuevo = Path.Combine(rutaCarpeta, nuevoNombreCompleto);

            if (!System.IO.File.Exists(rutaArchivoViejo))
                return NotFound("Archivo físico no encontrado.");

            if (System.IO.File.Exists(rutaArchivoNuevo))
                return Conflict("Ya existe un archivo con el nuevo nombre.");

            try
            {
                System.IO.File.Move(rutaArchivoViejo, rutaArchivoNuevo);

                documento.nombre_archivo = nuevoNombreCompleto;
                await _context.SaveChangesAsync();

                return Ok(documento);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al renombrar el archivo: {ex.Message}");
            }
        }
    }

    public class DocumentoNombreDto
    {
        public string Nombre { get; set; } = string.Empty;
    }

}
