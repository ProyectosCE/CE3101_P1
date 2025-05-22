using CEDigital_api.Models.Mongo;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CEDigital_api.Data.Mongo
{
    public class EstudianteService
    {
        private readonly IMongoCollection<Estudiante> _estudiantes;

        public EstudianteService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionURI);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _estudiantes = database.GetCollection<Estudiante>("estudiantes");
        }

        private static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        // Obtener todos los estudiantes
        public async Task<List<Estudiante>> GetAllAsync()
        {
            return await _estudiantes.Find(_ => true).ToListAsync();
        }

        // Crear un nuevo estudiante
        public async Task CreateAsync(Estudiante nuevoEstudiante)
        {
            if (!string.IsNullOrEmpty(nuevoEstudiante.password))
            {
                nuevoEstudiante.password = HashPassword(nuevoEstudiante.password);
            }
            await _estudiantes.InsertOneAsync(nuevoEstudiante);
        }

        // Crear estudiante con validación de correo
        public async Task CrearEstudianteAsync(string nombre, string correo, string password)
        {
            var existente = await GetByCorreoAsync(correo);
            if (existente != null)
                throw new System.Exception("Ya existe un estudiante con ese correo.");

            var nuevoEstudiante = new Estudiante
            {
                nombre = nombre,
                correo = correo,
                password = HashPassword(password)
            };

            await CreateAsync(nuevoEstudiante);
        }

        // Actualizar un estudiante
        public async Task UpdateAsync(string carnet, Estudiante estudianteActualizado)
        {
            if (!string.IsNullOrEmpty(estudianteActualizado.password))
            {
                estudianteActualizado.password = HashPassword(estudianteActualizado.password);
            }
            await _estudiantes.ReplaceOneAsync(e => e.carnet == carnet, estudianteActualizado);
        }

        // Eliminar un estudiante
        public async Task DeleteAsync(string carnet)
        {
            await _estudiantes.DeleteOneAsync(e => e.carnet == carnet);
        }

        // Obtener por cédula
        public async Task<Estudiante> GetByCedulaAsync(string cedula)
        {
            return await _estudiantes.Find(e => e.cedula == cedula).FirstOrDefaultAsync();
        }

        // Obtener por nombre (búsqueda parcial)
        public async Task<List<Estudiante>> GetByNombreAsync(string nombre)
        {
            return await _estudiantes.Find(e => e.nombre.ToLower().Contains(nombre.ToLower())).ToListAsync();
        }

        // Validar login
        public async Task<bool> ValidateLoginAsync(string cedula, string password)
        {
            var estudiante = await GetByCedulaAsync(cedula);
            if (estudiante == null) return false;

            return BCrypt.Net.BCrypt.Verify(password, estudiante.password);
        }

        // Verificar si carnet existe
        public async Task<bool> CarnetExistsAsync(string carnet)
        {
            return await _estudiantes.CountDocumentsAsync(e => e.carnet == carnet) > 0;
        }

        // Obtener por correo
        public async Task<Estudiante> GetByCorreoAsync(string correo)
        {
            return await _estudiantes.Find(e => e.correo == correo).FirstOrDefaultAsync();
        }

        // Contar estudiantes
        public async Task<long> GetTotalCountAsync()
        {
            return await _estudiantes.CountDocumentsAsync(_ => true);
        }

        // Obtener estudiante por carnet
        public async Task<Estudiante> GetByCarnetAsync(string carnet)
        {
            return await _estudiantes.Find(e => e.carnet == carnet).FirstOrDefaultAsync();

        }

        // Obtener múltiples estudiantes por una lista de carnets
        public async Task<List<Estudiante>> GetByCarnetsAsync(List<string> carnets)
        {
            return await _estudiantes.Find(e => carnets.Contains(e.carnet)).ToListAsync();
        }

    }
}