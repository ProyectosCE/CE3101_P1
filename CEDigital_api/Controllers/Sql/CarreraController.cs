using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarreraController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CarreraController(AppDbContext context)
        {
            _context = context;
        }
        // GET: api/carreras/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCarreraById(string id)
        {
            var carrera = await _context.Carrera.FindAsync(id);

            if (carrera == null)
                return NotFound();

            return Ok(carrera);
        }
        // POST: api/carreras
        [HttpPost]
        public async Task<IActionResult> AddCarrera([FromBody] Carrera carrera)
        {
            if (carrera == null)
                return BadRequest("Carrera no puede ser null.");

            await _context.Carrera.AddAsync(carrera);
            await _context.SaveChangesAsync();

            // Devuelve 201 Created con la ubicación del recurso creado
            return CreatedAtAction(nameof(GetCarreraById), new { id = carrera.codigo_carrera }, carrera);
        }

        // PATCH: api/carreras/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateCarrera(string id, [FromBody] Carrera carrera)
        {
            if (id != carrera.codigo_carrera)
                return BadRequest("El ID de la carrera no coincide.");
            _context.Entry(carrera).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                var carrera_exist = await _context.Carrera.FindAsync(id);
                if (carrera_exist == null)
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        // PATCH: api/carreras/{id}/toggle
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleCarrera(string id)
        {
            var carrera = await _context.Carrera.FindAsync(id);
            if (carrera == null)
                return NotFound();
            carrera.estado = carrera.estado == "activo" ? "inactivo" : "activo";
            _context.Entry(carrera).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/carreras/upload-excel
        // Falta implementar la carga de Excel
    }
}
