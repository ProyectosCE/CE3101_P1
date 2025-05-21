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
        public async Task<ActionResult<List<Estudiante>>> GetAll()
        {
            var estudiantes = await _estudianteService.GetAllAsync();
            return Ok(estudiantes);
        }

        // Crear un nuevo estudiante
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Estudiante estudiante)
        {
            if (await _estudianteService.CarnetExistsAsync(estudiante.carnet))
                return BadRequest("Ya existe un estudiante con ese carnet.");

            await _estudianteService.CreateAsync(estudiante);
            return CreatedAtAction(nameof(GetAll), new { carnet = estudiante.carnet }, estudiante);
        }

        // Actualizar un estudiante
        [HttpPut("{carnet}")]
        public async Task<ActionResult> Update(string carnet, [FromBody] Estudiante estudiante)
        {
            await _estudianteService.UpdateAsync(carnet, estudiante);
            return NoContent();
        }

        // Eliminar un estudiante por carnet
        [HttpDelete("{carnet}")]
        public async Task<ActionResult> Delete(string carnet)
        {
            await _estudianteService.DeleteAsync(carnet);
            return NoContent();
        }

        // Obtener estudiante por cédula
        [HttpGet("cedula/{cedula}")]
        public async Task<ActionResult<Estudiante>> GetByCedula(string cedula)
        {
            var estudiante = await _estudianteService.GetByCedulaAsync(cedula);
            if (estudiante == null) return NotFound();
            return Ok(estudiante);
        }

        // Obtener estudiantes por nombre
        [HttpGet("nombre/{nombre}")]
        public async Task<ActionResult<List<Estudiante>>> GetByNombre(string nombre)
        {
            var estudiantes = await _estudianteService.GetByNombreAsync(nombre);
            return Ok(estudiantes);
        }
    }
}