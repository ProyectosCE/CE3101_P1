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

        // Obtener todos los profesores
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var profesores = await _profesorService.GetAllAsync();
            return Ok(profesores);
        }

        // Crear un nuevo profesor
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Profesor nuevoProfesor)
        {
            await _profesorService.CreateAsync(nuevoProfesor);
            return CreatedAtAction(nameof(GetAll), new { Id = nuevoProfesor.cedula }, nuevoProfesor);
        }

        // Eliminar un profesor por cédula
        [HttpDelete("{cedula}")]
        public async Task<IActionResult> Delete(string cedula)
        {
            var profesor = await _profesorService.GetAllAsync();
            if (profesor == null)
            {
                return NotFound();
            }
            await _profesorService.DeleteAsync(cedula);
            return NoContent();
        }
    }
}
