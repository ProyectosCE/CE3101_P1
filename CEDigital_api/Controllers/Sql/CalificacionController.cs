using CEDigital_api.Data.Mongo;
using CEDigital_api.Data.Sql;
using CEDigital_api.Models.Mongo;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class CalificacionController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EstudianteService _estudianteService;
        private readonly SqlService _sqlService;

        public CalificacionController(
            AppDbContext context, 
            EstudianteService estudianteService,
            SqlService sqlService)
        {
            _context = context;
            _estudianteService = estudianteService;
            _sqlService = sqlService;
        }


        // GET: api/Calificacion
        [HttpGet]
        public async Task<IActionResult> GetNotasPorGrupo(
            [FromQuery] string codigo_curso,
            [FromQuery] int id_grupo)
        {
            if (string.IsNullOrEmpty(codigo_curso))
                return BadRequest("Debe proporcionar 'codigo_curso'.");

            var sql = _sqlService.LoadSqlQuery("Controllers/Sql/Queries/notas_por_grupo.sql");

            var paramCurso = new SqlParameter("@codigo_curso", codigo_curso);
            var paramGrupo = new SqlParameter("@id_grupo", id_grupo);

            var notasRaw = new List<dynamic>();
            var carnets = new HashSet<string>();

            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();

                using (var command = connection.CreateCommand())
                {
                    command.CommandText = sql;
                    command.CommandType = CommandType.Text;
                    command.Parameters.Add(paramCurso);
                    command.Parameters.Add(paramGrupo);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var carnet = reader["carnet"].ToString();
                            carnets.Add(carnet);

                            notasRaw.Add(new
                            {
                                carnet = carnet,
                                rubro = reader["rubro"].ToString(),
                                porcentaje = Convert.ToDecimal(reader["porcentaje"]),
                                evaluacion = reader["evaluacion"].ToString(),
                                peso = Convert.ToDecimal(reader["peso"]),
                                calificacion = Convert.ToDecimal(reader["calificacion"])
                            });
                        }
                    }
                }
            }

            // Consultar Mongo por los nombres completos
            var estudiantes = await _estudianteService.GetByCarnetsAsync(carnets.ToList());
            var estudiantesDict = estudiantes.ToDictionary(e => e.carnet, e => e);

            var resultado = notasRaw
                .GroupBy(n => n.carnet)
                .Select(g =>
                {
                    estudiantesDict.TryGetValue(g.Key, out Estudiante estudianteMongo);

                    // Agrupar por rubro dentro de cada estudiante
                    var rubros = g
                        .GroupBy(nr => nr.rubro)
                        .Select(rg =>
                        {
                            var porcentajeRubro = rg.First().porcentaje; // todos iguales en el mismo rubro
                            var evaluaciones = rg
                                .Select(ev => new
                                {
                                    evaluacion = ev.evaluacion,
                                    nota = ev.calificacion,
                                    porcentaje = ev.peso
                                }).ToList();

                            var promedioRubro = rg.Average(x => (decimal)x.calificacion);
                            var notaPonderada = promedioRubro * (porcentajeRubro / 100);

                            return new
                            {
                                rubro = rg.Key,
                                porcentaje = porcentajeRubro,
                                promedio = (decimal)Math.Round((double)promedioRubro, 2),
                                nota_ponderada = (decimal)Math.Round((double)notaPonderada, 2),
                                evaluaciones = evaluaciones
                            };
                        }).ToList();

                    // Sumar todas las notas ponderadas para total
                    var totalPonderado = rubros.Sum(r => r.nota_ponderada);

                    return new
                    {
                        carnet = g.Key,
                        nombre_estudiante = estudianteMongo?.nombre_completo ?? "Desconocido",
                        calificaciones = rubros,
                        nota_total = Math.Round(totalPonderado, 2)
                    };
                });

            return Ok(resultado);
        }

        // GET: api/Calificacion/estudiante
        [HttpGet("estudiante")]
        public async Task<IActionResult> GetNotasPorEstudiante(
            [FromQuery] string codigo_curso,
            [FromQuery] int id_grupo,
            [FromQuery] string carnet)
        {
            if (string.IsNullOrEmpty(codigo_curso) || string.IsNullOrEmpty(carnet))
                return BadRequest("Debe proporcionar 'codigo_curso', 'id_grupo' y 'carnet'.");

            var sql = _sqlService.LoadSqlQuery("Controllers/Sql/Queries/notas_por_estudiante_grupo.sql");

            var paramCurso = new SqlParameter("@codigo_curso", codigo_curso);
            var paramGrupo = new SqlParameter("@id_grupo", id_grupo);
            var paramCarnet = new SqlParameter("@carnet", carnet);

            var notasRaw = new List<dynamic>();

            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();

                using (var command = connection.CreateCommand())
                {
                    command.CommandText = sql;
                    command.CommandType = CommandType.Text;
                    command.Parameters.Add(paramCurso);
                    command.Parameters.Add(paramGrupo);
                    command.Parameters.Add(paramCarnet);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            notasRaw.Add(new
                            {
                                carnet = reader["carnet"].ToString(),
                                rubro = reader["rubro"].ToString(),
                                porcentaje = Convert.ToDecimal(reader["porcentaje"]),
                                evaluacion = reader["evaluacion"].ToString(),
                                peso = Convert.ToDecimal(reader["peso"]),
                                calificacion = Convert.ToDecimal(reader["calificacion"])
                            });
                        }
                    }
                }
            }

            var estudiante = await _estudianteService.GetByCarnetAsync(carnet);

            var rubros = notasRaw
                .GroupBy(n => n.rubro)
                .Select(rg =>
                {
                    var porcentajeRubro = rg.First().porcentaje;
                    var evaluaciones = rg.Select(ev => new
                    {
                        evaluacion = ev.evaluacion,
                        nota = ev.calificacion,
                        porcentaje = ev.peso
                    }).ToList();

                    var promedioRubro = rg.Average(x => (decimal)x.calificacion);
                    var notaPonderada = promedioRubro * (porcentajeRubro / 100);

                    return new
                    {
                        rubro = rg.Key,
                        porcentaje = porcentajeRubro,
                        promedio = (decimal)Math.Round((double)promedioRubro, 2),
                        nota_ponderada = (decimal)Math.Round((double)notaPonderada, 2),
                        evaluaciones = evaluaciones
                    };
                }).ToList();

            var totalPonderado = rubros.Sum(r => r.nota_ponderada);

            var resultado = new
            {
                carnet = carnet,
                nombre_estudiante = estudiante?.nombre_completo ?? "Desconocido",
                calificaciones = rubros,
                nota_total = Math.Round(totalPonderado, 2)
            };

            return Ok(resultado);
        }

    }

}
