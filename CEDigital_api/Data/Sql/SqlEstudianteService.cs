using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;

public class SqlEstudianteService
{
    private readonly AppDbContext _context;

    public SqlEstudianteService(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddEstudianteAsync(string carnet)
    {
        var estudiante = new Estudiante { carnet_estudiante = carnet };
        await _context.Estudiante.AddAsync(estudiante);
        await _context.SaveChangesAsync();
    }
}
