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

        // POST: api/estudiantes
        // Crear un nuevo estudiante
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Estudiante estudiante)
        {
            if (await _estudianteService.CarnetExistsAsync(estudiante.carnet))
                return BadRequest("Ya existe un estudiante con ese carnet.");

            await _estudianteService.CreateAsync(estudiante);
            return CreatedAtAction(nameof(GetAll), new { carnet = estudiante.carnet }, estudiante);
        }

        // PATCH: api/estudiantes/{carnet}
        // Actualizar un estudiante por carnet
        [HttpPatch("{carnet}")]
        public async Task<ActionResult> Update(string carnet, [FromBody] Estudiante estudiante)
        {
            if (carnet != estudiante.carnet)
                return BadRequest("El carnet no coincide.");
            var existente = await _estudianteService.GetByCarnetAsync(carnet);
            if (existente == null) return NotFound();
            await _estudianteService.UpdateAsync(carnet, estudiante);
            return NoContent();
        }

        // PATCH: api/estudiantes/{carnet}/toggle
        // Cambiar el estado de un estudiante por carnet
        [HttpPatch("{carnet}/toggle")]
        public async Task<ActionResult> Toggle(string carnet)
        {
            var estudiante = await _estudianteService.GetByCedulaAsync(carnet);
            if (estudiante == null)
                return NotFound("Estudiante no encontrado.");
            estudiante.estado = estudiante.estado == "activo" ? "inactivo" : "activo";
            await _estudianteService.UpdateAsync(carnet, estudiante);
            return NoContent();
        }

        // POST: api/estudiantes/upload-excel
        // Falta

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
    }
}