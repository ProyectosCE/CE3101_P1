using CEDigital_api.Models.Mongo;
using Microsoft.Extensions.Configuration.UserSecrets;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

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

        // Obtener todos los estudiantes
        public async Task<List<Estudiante>> GetAllAsync()
        {
            return await _estudiantes.Find(_ => true).ToListAsync();
        }

        // Modificar un estudiante por carnet
        public async Task UpdateAsync(string carnet, Estudiante estudianteActualizado)
        {
            await _estudiantes.ReplaceOneAsync(e => e.carnet == carnet, estudianteActualizado);
        }

        // Eliminar un estudiante por carnet
        public async Task DeleteAsync(string carnet)
        {
            await _estudiantes.DeleteOneAsync(e => e.carnet == carnet);
        }

    }
}
