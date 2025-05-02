using CEDigital_api.Models.Mongo;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

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

        // Obtener todos los profesores
        public async Task<List<Profesor>> GetAllAsync()
        {
            return await _profesores.Find(_ => true).ToListAsync();
        }

        // Crear un nuevo profesor
        public async Task CreateAsync(Profesor nuevoProfesor)
        {
            await _profesores.InsertOneAsync(nuevoProfesor);
        }

        // Modificar un profesor por cédula
        public async Task UpdateAsync(string cedula, Profesor profesorActualizado)
        {
            await _profesores.ReplaceOneAsync(p => p.cedula == cedula, profesorActualizado);
        }

        // Eliminar un profesor por cédula
        public async Task DeleteAsync(string cedula)
        {
            await _profesores.DeleteOneAsync(p => p.cedula == cedula);
        }

    }
}