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

        // Agregar metodos despues
    }
}
