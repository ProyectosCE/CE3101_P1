using CEDigital_api.Data.Mongo;
using CEDigital_api.Models.Mongo;
using Microsoft.AspNetCore.Mvc;

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
            return Ok(profesores);
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

        // PATCH: api/profesores/{cedula}
        // Actualizar un profesor por cédula
        [HttpPatch("{cedula}")]
        public async Task<ActionResult> Update(string cedula, [FromBody] Profesor profesor)
        {
            if (cedula != profesor.cedula)
                return BadRequest("La cédula no coincide con el ID del profesor.");
            await _profesorService.UpdateAsync(cedula, profesor);
            return NoContent();
        }

        // PATCH : api/profesores/{cedula}/toggle
        // Cambiar el estado de un profesor
        [HttpPatch("{cedula}/toggle")]
        public async Task<ActionResult> Toggle(string cedula)
        {
            var profesor = await _profesorService.GetByCedulaAsync(cedula);
            if (profesor == null)
                return NotFound("Profesor no encontrado.");
            profesor.estado = profesor.estado == "activo" ? "inactivo" : "activo";
            await _profesorService.UpdateAsync(cedula, profesor);
            return NoContent();
        }

        // POST: api/profesores/upload-excel
        // Falta

        // Eliminar un profesor por cédula
        [HttpDelete("{cedula}")]
        public async Task<ActionResult> Delete(string cedula)
        {
            await _profesorService.DeleteAsync(cedula);
            return NoContent();
        }
    }
}