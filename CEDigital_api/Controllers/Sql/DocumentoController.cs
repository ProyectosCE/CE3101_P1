using CEDigital_api.Data.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DocumentoController(AppDbContext context)
        {
            _context = context;
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
    }
}
