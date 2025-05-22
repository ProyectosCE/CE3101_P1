using System.Text.Json;
using CEDigital_api.Models.Mongo;
using CEDigital_api.Data.Mongo;
using System.Reflection;

public class MongoSeeder
{
    private readonly EstudianteService _estudianteService;
    private readonly ProfesorService _profesorService;
    private readonly SqlEstudianteService _sqlEstudianteService;
    private readonly SqlProfesorService _sqlProfesorService;

    public MongoSeeder(
        EstudianteService estudianteService,
        ProfesorService profesorService,
        SqlEstudianteService sqlEstudianteService,
        SqlProfesorService sqlProfesorService)
    {
        _estudianteService = estudianteService;
        _profesorService = profesorService;
        _sqlEstudianteService = sqlEstudianteService;
        _sqlProfesorService = sqlProfesorService;
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
                {
                    await _estudianteService.CreateAsync(est);

                    try
                    {
                        await _sqlEstudianteService.AddEstudianteAsync(est.carnet);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al guardar estudiante en SQL: {ex.Message}");
                    }
                }
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
                {
                    await _profesorService.CreateAsync(prof);

                    try
                    {
                        await _sqlProfesorService.AddProfesorAsync(prof.cedula);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al guardar profesor en SQL: {ex.Message}");
                    }
                }
            }
        }
    }
}
