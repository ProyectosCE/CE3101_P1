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
        public async Task<ActionResult<List<Profesor>>> GetAll()
        {
            var profesores = await _profesorService.GetAllAsync();
            return Ok(profesores);
        }

        // Crear un nuevo profesor
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Profesor profesor)
        {
            await _profesorService.CreateAsync(profesor);
            return CreatedAtAction(nameof(GetAll), new { cedula = profesor.cedula }, profesor);
        }

        // Actualizar un profesor
        [HttpPut("{cedula}")]
        public async Task<ActionResult> Update(string cedula, [FromBody] Profesor profesor)
        {
            await _profesorService.UpdateAsync(cedula, profesor);
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