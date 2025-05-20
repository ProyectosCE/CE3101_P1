using CEDigital_api.Models.Mongo;
using MongoDB.Driver;
using Microsoft.Extensions.Options;

namespace CEDigital_api.Data.Mongo
{
    public class AuthService
    {
        private readonly IMongoCollection<Estudiante> _estudiantes;
        private readonly IMongoCollection<Profesor> _profesores;

        public AuthService(IOptions<MongoDbSettings> mongoSettings)
        {
            var settings = mongoSettings.Value;
            var client = new MongoClient(settings.ConnectionURI);
            var database = client.GetDatabase(settings.DatabaseName);

            _estudiantes = database.GetCollection<Estudiante>("Estudiantes");
            _profesores = database.GetCollection<Profesor>("Profesores");
        }

        public async Task<(bool success, string role, string message)> LoginAsync(string correo, string password)
        {
            var profesor = await _profesores.Find(p => p.correo == correo).FirstOrDefaultAsync();
            if (profesor != null && BCrypt.Net.BCrypt.Verify(password, profesor.password))
            {
                return (true, profesor.IsAdmin ? "admin" : "profesor", "Inicio de sesión exitoso");
            }

            var estudiante = await _estudiantes.Find(e => e.correo == correo).FirstOrDefaultAsync();
            if (estudiante != null && BCrypt.Net.BCrypt.Verify(password, estudiante.password))
            {
                return (true, "estudiante", "Inicio de sesión exitoso");
            }

            return (false, "", "Credenciales inválidas");
        }
    }
}