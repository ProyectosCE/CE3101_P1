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

            await _context.Carrera.AddAsync(carrera);
            await _context.SaveChangesAsync();

            // Devuelve 201 Created con la ubicación del recurso creado
            return CreatedAtAction(nameof(GetCarreraById), new { id = carrera.codigo_carrera }, carrera);
        }

        // PATCH: api/carreras
        [HttpPatch]
        public async Task<IActionResult> UpdateCarrera([FromBody] Carrera updatedCarrera)
        {
            if (updatedCarrera == null || string.IsNullOrWhiteSpace(updatedCarrera.codigo_carrera))
                return BadRequest("El cuerpo de la solicitud debe incluir un código de carrera válido.");

            var existingCarrera = await _context.Carrera.FindAsync(updatedCarrera.codigo_carrera);
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
    }
}
