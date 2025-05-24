using CEDigital_api.Data.Mongo;
using CEDigital_api.Models.Mongo;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace CEDigital_api.Controllers.Mongo
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfesorController : ControllerBase
    {
        private readonly ProfesorService _profesorService;
        private readonly SqlProfesorService _sqlProfesorService;

        public ProfesorController(ProfesorService profesorService, SqlProfesorService sqlProfesorService)
        {
            _profesorService = profesorService;
            _sqlProfesorService = sqlProfesorService;
        }

        // GET: api/profesores
        // Obtener todos los profesores
        [HttpGet]
        public async Task<ActionResult<List<Profesor>>> GetAll()
        {
            var profesores = await _profesorService.GetAllAsync();
            var profesoresSinInfo = profesores.Select(p => new
            {
                p.Id,
                p.cedula,
                p.nombre,
                p.apellidos,
                p.nombre_completo,
                p.correo,
                p.estado
            });
            return Ok(profesoresSinInfo);
        }

        // POST: api/profesores
        // Crear un nuevo profesor
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Profesor profesor)
        {
            if (await _profesorService.CedulaExistsAsync(profesor.cedula))
                return BadRequest("Ya existe un profesor con ese cedula.");

            await _profesorService.CreateAsync(profesor);

            try
            {
                await _sqlProfesorService.AddProfesorAsync(profesor.cedula);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al guardar en SQL: {ex.Message}");
            }

            return CreatedAtAction(nameof(GetAll), new { carnet = profesor.cedula }, profesor);
        }

        // PATCH: api/profesores/{id}
        // Actualizar un profesor por Id
        [HttpPatch("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] Profesor profesor)
        {
            if (profesor == null)
                return BadRequest("El cuerpo de la solicitud no puede ser null.");

            if (id != profesor.Id)  
                return BadRequest("El Id no coincide.");

            var existente = await _profesorService.GetByIdAsync(id);
            if (existente == null)
                return NotFound();

            await _profesorService.UpdateByIdAsync(id, profesor);

            return NoContent();
        }


        // PATCH : api/profesores/{id}/toggle
        // Cambiar el estado de un profesor
        [HttpPatch("{id}/toggle")]
        public async Task<ActionResult> Toggle(string id)
        {
            if (!ObjectId.TryParse(id, out _))
                return BadRequest("Invalid id format. Must be a 24-digit hexadecimal string.");

            var profesor = await _profesorService.GetByIdAsync(id);
            if (profesor == null)
                return NotFound("Profesor no encontrado.");
            profesor.estado = profesor.estado == "activo" ? "inactivo" : "activo";
            await _profesorService.UpdateByIdAsync(id, profesor);
            return NoContent();
        }

        // PATCH : api/profesores/{id}/admin/toggle
        [HttpPatch("{id}/admin/toggle")]
        public async Task<ActionResult> ToggleAdmin(string id)
        {
            if (!ObjectId.TryParse(id, out _))
                return BadRequest("Invalid id format. Must be a 24-digit hexadecimal string.");

            var profesor = await _profesorService.GetByIdAsync(id);
            if (profesor == null)
                return NotFound("Profesor no encontrado.");
            profesor.IsAdmin = !profesor.IsAdmin;
            await _profesorService.UpdateAdminAsync(id, profesor.IsAdmin);
            return NoContent();
        }


        // Eliminar un profesor por cédula
        [HttpDelete("{cedula}")]
        public async Task<ActionResult> Delete(string cedula)
        {
            await _profesorService.DeleteAsync(cedula);
            return NoContent();
        }
    }
}