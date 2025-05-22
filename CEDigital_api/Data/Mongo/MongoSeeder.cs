using System.Text.Json;
using CEDigital_api.Models.Mongo;
using CEDigital_api.Data.Mongo;
using System.Reflection;

public class MongoSeeder
{
    private readonly EstudianteService _estudianteService;
    private readonly ProfesorService _profesorService;

    public MongoSeeder(EstudianteService estudianteService, ProfesorService profesorService)
    {
        _estudianteService = estudianteService;
        _profesorService = profesorService;
    }

    public async Task SeedAsync()
    {
        var basePath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) ?? Directory.GetCurrentDirectory();

        // Leer estudiantes
        var estudiantesJson = await File.ReadAllTextAsync(Path.Combine(basePath, "Data", "Mongo", "Seed", "estudiantes.json"));
        var estudiantes = JsonSerializer.Deserialize<List<Estudiante>>(estudiantesJson);

        if (estudiantes != null)
        {
            foreach (var est in estudiantes)
            {
                var existe = await _estudianteService.GetByCarnetAsync(est.carnet);
                if (existe == null)
                    await _estudianteService.CreateAsync(est);
            }
        }

        // Leer profesores
        var profesoresJson = await File.ReadAllTextAsync(Path.Combine(basePath, "Data", "Mongo", "Seed", "profesores.json"));
        var profesores = JsonSerializer.Deserialize<List<Profesor>>(profesoresJson);

        if (profesores != null)
        {
            foreach (var prof in profesores)
            {
                var existe = await _profesorService.GetByCedulaAsync(prof.cedula);
                if (existe == null)
                    await _profesorService.CreateAsync(prof);
            }
        }
    }
}
