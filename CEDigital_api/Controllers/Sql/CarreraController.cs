using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

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

        // GET: api/carreras
        [HttpGet]
        public async Task<IActionResult> GetAllCarreras()
        {
            var carreras = await _context.Carrera.ToListAsync();
            return Ok(carreras);
        }

        // GET: api/carreras/{codigo_carrera}
        [HttpGet("{codigo_carrera}")]
        public async Task<IActionResult> GetCarreraById(string codigo_carrera)
        {
            var carrera = await _context.Carrera.FindAsync(codigo_carrera);

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

            // Validar si el código de carrera ya existe
            var existingCarrera = await _context.Carrera.FindAsync(carrera.codigo_carrera);
            if (existingCarrera != null)
                return BadRequest($"La carrera con código '{carrera.codigo_carrera}' ya existe.");

            await _context.Carrera.AddAsync(carrera);
            await _context.SaveChangesAsync();

            // Corregir el error de CreatedAtAction
            return CreatedAtAction(nameof(GetCarreraById), new { codigo_carrera = carrera.codigo_carrera }, carrera);
        }


        // PATCH: api/carreras/{codigo_carrera}
        [HttpPatch("{codigo_carrera}")]
        public async Task<IActionResult> UpdateCarrera(string codigo_carrera, [FromBody] Carrera updatedCarrera)
        {
            if (updatedCarrera == null)
                return BadRequest("El cuerpo de la solicitud no puede ser vacío.");

            if (string.IsNullOrWhiteSpace(codigo_carrera))
                return BadRequest("Debe proveer un código de carrera válido en la URL.");

            var existingCarrera = await _context.Carrera.FindAsync(codigo_carrera);
            if (existingCarrera == null)
                return NotFound("Carrera no encontrada.");

            // Actualizar campos permitidos
            existingCarrera.nombre = updatedCarrera.nombre;

            await _context.SaveChangesAsync();
            return NoContent();
        }



        // PATCH: api/carreras/{codigo_carrera}/toggle
        [HttpPatch("{codigo_carrera}/toggle")]
        public async Task<IActionResult> ToggleCarrera(string codigo_carrera)
        {
            var carrera = await _context.Carrera.FindAsync(codigo_carrera);
            if (carrera == null)
                return NotFound();
            carrera.estado = carrera.estado == "activo" ? "inactivo" : "activo";
            _context.Entry(carrera).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/carreras/{codigo_carrera}
        [HttpDelete("{codigo_carrera}")]
        public async Task<IActionResult> DeleteCarrera(string codigo_carrera)
        {
            var carrera = await _context.Carrera.FindAsync(codigo_carrera);
            if (carrera == null)
                return NotFound();

            _context.Carrera.Remove(carrera);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
