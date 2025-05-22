using CEDigital_api.Models.Mongo;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CEDigital_api.Data.Mongo
{
    public class ProfesorService
    {
        private readonly IMongoCollection<Profesor> _profesores;

        public ProfesorService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionURI);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _profesores = database.GetCollection<Profesor>("profesores");
        }

        private static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        // Obtener todos los profesores
        public async Task<List<Profesor>> GetAllAsync()
        {
            return await _profesores.Find(_ => true).ToListAsync();
        }

        // Crear un nuevo profesor
        public async Task CreateAsync(Profesor nuevoProfesor)
        {
            if (!string.IsNullOrEmpty(nuevoProfesor.password))
            {
                nuevoProfesor.password = HashPassword(nuevoProfesor.password);
            }
            await _profesores.InsertOneAsync(nuevoProfesor);
        }

        // Crear profesor con validación de correo
        public async Task CrearProfesorAsync(string nombre, string correo, string password, bool isAdmin = false)
        {
            var existente = await GetByCorreoAsync(correo);
            if (existente != null)
                throw new System.Exception("Ya existe un profesor con ese correo.");

            var nuevoProfesor = new Profesor
            {
                nombre = nombre,
                correo = correo,
                password = HashPassword(password),
                IsAdmin = isAdmin
            };

            await CreateAsync(nuevoProfesor);
        }

        // Actualizar un profesor
        public async Task UpdateAsync(string cedula, Profesor profesorActualizado)
        {
            if (!string.IsNullOrEmpty(profesorActualizado.password))
            {
                profesorActualizado.password = HashPassword(profesorActualizado.password);
            }
            await _profesores.ReplaceOneAsync(p => p.cedula == cedula, profesorActualizado);
        }

        // Eliminar un profesor
        public async Task DeleteAsync(string cedula)
        {
            await _profesores.DeleteOneAsync(p => p.cedula == cedula);
        }

        // Obtener por correo
        public async Task<Profesor> GetByCorreoAsync(string correo)
        {
            return await _profesores.Find(p => p.correo == correo).FirstOrDefaultAsync();
        }

        // Validar credenciales
        public async Task<bool> ValidatePasswordAsync(string correo, string password)
        {
            var profesor = await GetByCorreoAsync(correo);
            if (profesor == null) return false;
        
            return BCrypt.Net.BCrypt.Verify(password, profesor.password);
        }

        // Obtener por cedula
        public async Task<Profesor> GetByCedulaAsync(string cedula)
        {
            return await _profesores.Find(p => p.cedula == cedula).FirstOrDefaultAsync();
        }

        // Verificar si cedula existe
        public async Task<bool> CedulaExistsAsync(string cedula)
        {
            var profesor = await GetByCedulaAsync(cedula);
            return profesor != null;
        }
    }
}