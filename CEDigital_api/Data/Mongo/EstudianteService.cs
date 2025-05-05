using CEDigital_api.Models.Mongo;
using Microsoft.Extensions.Configuration.UserSecrets;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Security.Cryptography;
using System.Text;

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

        // Método para calcular SHA256
        private static string ComputeSha256Hash(string rawData)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                StringBuilder builder = new StringBuilder();
                foreach (var b in bytes)
                {
                    builder.Append(b.ToString("x2"));
                }
                return builder.ToString();
            }
        }

        // Obtener todos los estudiantes
        public async Task<List<Estudiante>> GetAllAsync()
        {
            return await _estudiantes.Find(_ => true).ToListAsync();
        }

        // Crear un nuevo estudiante (guardando password como hash)
        public async Task CreateAsync(Estudiante nuevoEstudiante)
        {
            nuevoEstudiante.password = ComputeSha256Hash(nuevoEstudiante.password);
            await _estudiantes.InsertOneAsync(nuevoEstudiante);
        }

        // Modificar un estudiante por carnet opcional actualiza pasword con hash
        public async Task UpdateAsync(string carnet, Estudiante estudianteActualizado)
        {
            if (!string.IsNullOrEmpty(estudianteActualizado.password))
            {
                estudianteActualizado.password = ComputeSha256Hash(estudianteActualizado.password);
            }
            await _estudiantes.ReplaceOneAsync(e => e.carnet == carnet, estudianteActualizado);
        }

        // Eliminar un estudiante por carnet
        public async Task DeleteAsync(string carnet)
        {
            await _estudiantes.DeleteOneAsync(e => e.carnet == carnet);
        }

        // Obtener estudiante por cédula
        public async Task<Estudiante> GetByCedulaAsync(string cedula)
        {
            return await _estudiantes.Find(e => e.cedula == cedula).FirstOrDefaultAsync();
        }

        // Obtener estudiantes por nombre (búsqueda parcial)
        public async Task<List<Estudiante>> GetByNombreAsync(string nombre)
        {
            return await _estudiantes.Find(e => e.nombre.ToLower().Contains(nombre.ToLower())).ToListAsync();
        }

        // Validar login (cedula + password hashada)
        public async Task<bool> ValidateLoginAsync(string cedula, string password)
        {
            string passwordHash = ComputeSha256Hash(password);
            var estudiante = await _estudiantes.Find(e => e.cedula == cedula && e.password == passwordHash).FirstOrDefaultAsync();
            return estudiante != null;
        }

        // Verificar si carnet ya existe 
        public async Task<bool> CarnetExistsAsync(string carnet)
        {
            var count = await _estudiantes.CountDocumentsAsync(e => e.carnet == carnet);
            return count > 0;
        }

        // Obtener cantidad total de estudiantes
        public async Task<long> GetTotalCountAsync()
        {
            return await _estudiantes.CountDocumentsAsync(_ => true);
        }
    }
}
