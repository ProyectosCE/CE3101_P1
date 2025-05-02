using CEDigital_api.Data.Mongo;
using CEDigital_api.Models.Mongo;
using Microsoft.AspNetCore.Mvc;

namespace CEDigital_api.Controllers.Mongo
{
    [ApiController]
    [Route("api/[controller]")]
    public class EstudianteController : ControllerBase
    {
        private readonly EstudianteService _estudianteService;

        public EstudianteController(EstudianteService estudianteService)
        {
            _estudianteService = estudianteService;
        }

        // Obtener todos los estudiantes
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var estudiantes = await _estudianteService.GetAllAsync();
            return Ok(estudiantes);
        }

        // Crear un nuevo estudiante
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Estudiante nuevoEstudiante)
        {
            await _estudianteService.CreateAsync(nuevoEstudiante);
            return CreatedAtAction(nameof(GetAll), new { Id = nuevoEstudiante.carnet }, nuevoEstudiante);
        }

        // Eliminar un estudiante por carnet
        [HttpDelete("{carnet}")]
        public async Task<IActionResult> Delete(string carnet)
        {
            var estudiante = await _estudianteService.GetAllAsync();
            if (estudiante == null)
            {
                return NotFound();
            }
            await _estudianteService.DeleteAsync(carnet);
            return NoContent();
        }
    }
}
