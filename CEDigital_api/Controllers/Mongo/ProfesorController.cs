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

        public ProfesorController(ProfesorService profesorService)
        {
            _profesorService = profesorService;
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
            await _profesorService.CreateAsync(profesor);
            return CreatedAtAction(nameof(GetAll), new { cedula = profesor.cedula }, profesor);
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