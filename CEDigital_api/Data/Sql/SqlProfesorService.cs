using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Sql;

public class SqlProfesorService
{
    private readonly AppDbContext _context;

    public SqlProfesorService(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddProfesorAsync(string cedula)
    {
        var profesor = new Profesor { cedula_profesor = cedula };
        await _context.Profesor.AddAsync(profesor);
        await _context.SaveChangesAsync();
    }
}
