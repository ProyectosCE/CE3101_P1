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

        // Agregar metodos despues
    }
}