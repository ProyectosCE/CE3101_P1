using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;
using Microsoft.AspNetCore.Mvc;

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
    }
}
