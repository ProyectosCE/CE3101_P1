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
        private readonly SqlEstudianteService _sqlEstudianteService;

        public EstudianteController(EstudianteService estudianteService, SqlEstudianteService sqlEstudianteService)
        {
            _estudianteService = estudianteService;
            _sqlEstudianteService = sqlEstudianteService;
        }

        // Obtener todos los estudiantes
        [HttpGet]
        public async Task<ActionResult<List<Estudiante>>> GetAll()
        {
            var estudiantes = await _estudianteService.GetAllAsync();
            var estudiantesSinInfo = estudiantes.Select(e => new
            {
                e.Id,
                e.carnet,
                e.cedula,
                e.nombre,
                e.apellidos,
                e.nombre_completo,
                e.correo,
                e.telefono,
                e.estado
            });
            return Ok(estudiantesSinInfo);
        }

        // POST: api/estudiantes
        // Crear un nuevo estudiante
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Estudiante estudiante)
        {
            if (await _estudianteService.CarnetExistsAsync(estudiante.carnet))
                return BadRequest("Ya existe un estudiante con ese carnet.");

            await _estudianteService.CreateAsync(estudiante);

            try
            {
                await _sqlEstudianteService.AddEstudianteAsync(estudiante.carnet);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al guardar en SQL: {ex.Message}");
            }

            return CreatedAtAction(nameof(GetAll), new { carnet = estudiante.carnet }, estudiante);
        }


        // PATCH: api/estudiantes/{id}
        // Actualizar un estudiante por Id (ObjectId)
        [HttpPatch("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] Estudiante estudiante)
        {
            if (estudiante == null)
                return BadRequest("El cuerpo de la solicitud no puede ser null.");

            if (id != estudiante.Id)
                return BadRequest("El Id no coincide.");

            var existente = await _estudianteService.GetByIdAsync(id);
            if (existente == null)
                return NotFound();

            existente.carnet = estudiante.carnet;
            existente.cedula = estudiante.cedula;
            existente.nombre = estudiante.nombre;
            existente.apellidos = estudiante.apellidos;
            existente.correo = estudiante.correo;
            existente.telefono = estudiante.telefono;
            existente.password = existente.password; // No se actualiza la contraseña aquí
            existente.estado = estudiante.estado;
            existente.IsAdmin = estudiante.IsAdmin;

            await _estudianteService.UpdateByIdAsync(id, existente);

            return NoContent();
        }


        // PATCH: api/estudiantes/{id}/toggle
        // Cambiar el estado de un estudiante por id
        [HttpPatch("{id}/toggle")]
        public async Task<ActionResult> Toggle(string id)
        {
            var estudiante = await _estudianteService.GetByIdAsync(id);
            if (estudiante == null)
                return NotFound("Estudiante no encontrado.");
            estudiante.estado = estudiante.estado == "activo" ? "inactivo" : "activo";
            await _estudianteService.UpdateByIdAsync(id, estudiante);
            return NoContent();
        }

        // PATCH : api/estudiante/{id}/admin/toggle
        // Cambiar el estado de admin de un estudiante por id
        [HttpPatch("{id}/admin/toggle")]
        public async Task<ActionResult> ToggleAdmin(string id)
        {
            var estudiante = await _estudianteService.GetByIdAsync(id);
            if (estudiante == null)
                return NotFound("Estudiante no encontrado.");
            estudiante.IsAdmin = !estudiante.IsAdmin;
            await _estudianteService.UpdateAdminAsync(id, estudiante.IsAdmin);
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
    }
}