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

        // Crear un nuevo estudiante
        public async Task CreateAsync(Estudiante nuevoEstudiante)
        {
            await _estudiantes.InsertOneAsync(nuevoEstudiante);
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

        // Obtener estudiante por cédula
        public async Task<Estudiante> GetByCedulaAsync(string cedula)
        {
            return await _estudiantes.Find(e => e.cedula == cedula).FirstOrDefaultAsync();
        }

        // Obtener estudiantes por nombre 
        public async Task<List<Estudiante>> GetByNombreAsync(string nombre)
        {
            return await _estudiantes.Find(e => e.nombre.ToLower().Contains(nombre.ToLower())).ToListAsync();
        }

        // Validar login (encriptacion por implemntar)
        public async Task<bool> ValidateLoginAsync(string cedula, string password)
        {
            var estudiante = await _estudiantes.Find(e => e.cedula == cedula && e.password == password).FirstOrDefaultAsync();
            return estudiante != null;
        }

        // Verificar si carnet ya existe 
        public async Task<bool> CarnetExistsAsync(string carnet)
        {
            var count = await _estudiantes.CountDocumentsAsync(e => e.carnet == carnet);
            return count > 0;
        }

        //Obtener cantidad total de estudiantes
        public async Task<long> GetTotalCountAsync()
        {
            return await _estudiantes.CountDocumentsAsync(_ => true);
        }
    }
}