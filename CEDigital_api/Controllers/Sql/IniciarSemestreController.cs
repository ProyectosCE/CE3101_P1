using CEDigital_api.Data.Sql;
using Microsoft.AspNetCore.Mvc;
using CEDigital_api.Models.Excel;
using OfficeOpenXml;
using CEDigital_api.Models.Sql;
using Microsoft.EntityFrameworkCore;

namespace CEDigital_api.Controllers.Sql
{
    [ApiController]
    [Route("api/[controller]")]
    public class IniciarSemestreController : ControllerBase
    {
        private readonly AppDbContext _context;
        public IniciarSemestreController(AppDbContext context)
        {
            _context = context;
        }


        // POST : api/upload_excel
        [HttpPost("upload_excel")]
        public async Task<IActionResult> CargarDatosExcel(IFormFile archivoExcel)
        {
            if (archivoExcel == null || archivoExcel.Length == 0)
                return BadRequest("No se recibió un archivo Excel válido.");

            ExcelPackage.License.SetNonCommercialOrganization("Tecnológico de Costa Rica");


            using var package = new ExcelPackage(archivoExcel.OpenReadStream());
            var hoja = package.Workbook.Worksheets.First();

            var request = new SemestreInitRequest();

            int fila = 5;
            var semestreKeys = new HashSet<string>();

            while (
                !string.IsNullOrEmpty(hoja.Cells[fila, 2].Text) ||  // B - anio semestre
                !string.IsNullOrEmpty(hoja.Cells[fila, 6].Text) ||  // F - curso grupo 
                !string.IsNullOrEmpty(hoja.Cells[fila, 11].Text))   // K - id persona 
            {
                // --- Semestre ---
                var anioTexto = hoja.Cells[fila, 2].Text.Trim(); // B
                var periodoTexto = hoja.Cells[fila, 3].Text.Trim(); // C
                var estadoTexto = hoja.Cells[fila, 4].Text.Trim().ToLower(); // D


                if (int.TryParse(anioTexto, out int anio) && !string.IsNullOrEmpty(periodoTexto))
                {
                    var key = $"{anio}-{periodoTexto}";
                    if (!semestreKeys.Contains(key))
                    {
                        semestreKeys.Add(key);
                        request.Semestres.Add(new SemestreInput
                        {
                            Anio = anio,
                            Periodo = periodoTexto,
                            Estado = string.IsNullOrEmpty(estadoTexto) ? "inactivo" : estadoTexto
                        });
                    }
                }

                // --- Grupo ---
                var codigoCurso = hoja.Cells[fila, 6].Text.Trim(); // F
                var numGrupo = hoja.Cells[fila, 7].Text.Trim(); // G
                var anioGrupo = hoja.Cells[fila, 8].Text.Trim(); // H
                var periodoGrupo = hoja.Cells[fila, 9].Text.Trim(); // I

                if (!string.IsNullOrEmpty(codigoCurso) &&
                    int.TryParse(numGrupo, out int numeroGrupo) &&
                    int.TryParse(anioGrupo, out int anioSemestreGrupo) &&
                    !string.IsNullOrEmpty(periodoGrupo))
                {
                    request.Grupos.Add(new GrupoInput
                    {
                        CodigoCurso = codigoCurso,
                        NumeroGrupo = numeroGrupo,
                        AnioSemestre = anioSemestreGrupo,
                        PeriodoSemestre = periodoGrupo
                    });
                }

                // --- PersonaXGrupo ---
                var idPersona = hoja.Cells[fila, 11].Text.Trim(); // K
                var rol = hoja.Cells[fila, 12].Text.Trim(); // L
                var codCursoPXG = hoja.Cells[fila, 13].Text.Trim(); // M
                var numGrupoPXG = hoja.Cells[fila, 14].Text.Trim(); // N
                var anioPXG = hoja.Cells[fila, 15].Text.Trim(); // O
                var periodoPXG = hoja.Cells[fila, 16].Text.Trim(); // P

                if (!string.IsNullOrEmpty(idPersona) &&
                    !string.IsNullOrEmpty(rol) &&
                    !string.IsNullOrEmpty(codCursoPXG) &&
                    int.TryParse(numGrupoPXG, out int numGrupoPersona) &&
                    int.TryParse(anioPXG, out int anioPersona) &&
                    !string.IsNullOrEmpty(periodoPXG))
                {
                    request.PersonasXGrupo.Add(new PersonaXGrupoInput
                    {
                        Id = idPersona,
                        Rol = rol.ToLower(),
                        CodigoCurso = codCursoPXG,
                        NumeroGrupo = numGrupoPersona,
                        AnioSemestre = anioPersona,
                        PeriodoSemestre = periodoPXG
                    });
                }

                fila++;
            }

            if (!request.Semestres.Any())
                return BadRequest("No se pudo leer ningún semestre válido del archivo.");

            return await InicializarSemestres(request);
        }

        // Metodo para insertar datos del excel a la base de datos
        [HttpPost("inicializar")]
        public async Task<IActionResult> InicializarSemestres(SemestreInitRequest request)
        {
            var errores = new List<string>();

            var semestreIdMap = new Dictionary<(int anio, string periodo), int>();
            var grupoIdMap = new Dictionary<(int numeroGrupo, string codigoCurso, int idSemestre), int>();

            // === 1. Insertar Semestres ===
            foreach (var s in request.Semestres)
            {
                if (!new[] { "1", "2", "V" }.Contains(s.Periodo))
                {
                    errores.Add($"Periodo inválido: {s.Anio}-{s.Periodo}");
                    continue;
                }

                // Verificar formato de estado
                if (!new[] { "inactivo", "activo" }.Contains(s.Estado.ToLower()))
                {
                    errores.Add($"Estado inválido: {s.Anio}-{s.Periodo} - {s.Estado}");
                    continue;
                }

                // Verificar si el semestre ya existe
                var existente = await _context.Semestre
                    .FirstOrDefaultAsync(x => x.anio == s.Anio && x.periodo == s.Periodo);

                if (existente == null)
                {
                    var nuevo = new Semestre { anio = s.Anio, periodo = s.Periodo, estado = s.Estado };
                    _context.Semestre.Add(nuevo);
                    await _context.SaveChangesAsync();
                    semestreIdMap[(s.Anio, s.Periodo)] = nuevo.id_semestre;
                }
                else
                {
                    semestreIdMap[(s.Anio, s.Periodo)] = existente.id_semestre;
                }
            }

            if (!semestreIdMap.Any())
                return BadRequest("No se insertó ningún semestre válido. Verifique los datos.");

            // === 2. Insertar Grupos ===
            foreach (var g in request.Grupos)
            {
                var keySemestre = (g.AnioSemestre, g.PeriodoSemestre);
                if (!semestreIdMap.TryGetValue(keySemestre, out int idSemestre))
                {
                    errores.Add($"No se encontró el semestre para grupo {g.CodigoCurso} grupo {g.NumeroGrupo}");
                    continue;
                }

                var curso = await _context.Curso.FindAsync(g.CodigoCurso);
                if (curso == null)
                {
                    errores.Add($"Curso no encontrado: {g.CodigoCurso}");
                    continue;
                }

                var grupoExistente = await _context.Grupo.FirstOrDefaultAsync(x =>
                    x.numero_grupo == g.NumeroGrupo &&
                    x.codigo_curso == g.CodigoCurso &&
                    x.id_semestre == idSemestre);

                if (grupoExistente == null)
                {
                    var nuevoGrupo = new Grupo
                    {
                        numero_grupo = g.NumeroGrupo,
                        codigo_curso = g.CodigoCurso,
                        id_semestre = idSemestre
                    };

                    await _context.Grupo.AddAsync(nuevoGrupo);
                    await _context.SaveChangesAsync(); // se genera el id_grupo aquí

                    // Guardar en el mapa
                    grupoIdMap[(g.NumeroGrupo, g.CodigoCurso, idSemestre)] = nuevoGrupo.id_grupo;

                    // Crear carpetas por defecto
                    var carpetas = new List<Carpeta>
                    {
                        new Carpeta { nombre = "Presentaciones", id_grupo = nuevoGrupo.id_grupo },
                        new Carpeta { nombre = "Quices", id_grupo = nuevoGrupo.id_grupo },
                        new Carpeta { nombre = "Exámenes", id_grupo = nuevoGrupo.id_grupo },
                        new Carpeta { nombre = "Proyectos", id_grupo = nuevoGrupo.id_grupo }
                    };

                    // Crear rubros por defecto
                    var rubros = new List<Rubro>
                    {
                        new Rubro { nombre = "Quices", porcentaje = 30.00, id_grupo = nuevoGrupo.id_grupo },
                        new Rubro { nombre = "Exámenes", porcentaje = 30.00, id_grupo = nuevoGrupo.id_grupo },
                        new Rubro { nombre = "Proyectos", porcentaje = 40.00, id_grupo = nuevoGrupo.id_grupo }
                    };

                    await _context.Carpeta.AddRangeAsync(carpetas);
                    await _context.Rubro.AddRangeAsync(rubros);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    grupoIdMap[(g.NumeroGrupo, g.CodigoCurso, idSemestre)] = grupoExistente.id_grupo;
                }
            }

            if (!grupoIdMap.Any())
                return BadRequest("No se insertó ningún grupo. Asegúrese de tener cursos válidos y semestres existentes.");

            // === 3. Insertar PersonasXGrupo ===
            foreach (var pxg in request.PersonasXGrupo)
            {
                var keySemestre = (pxg.AnioSemestre, pxg.PeriodoSemestre);
                if (!semestreIdMap.TryGetValue(keySemestre, out int idSemestre))
                {
                    errores.Add($"Semestre no encontrado para persona {pxg.Id}");
                    continue;
                }

                if (!grupoIdMap.TryGetValue((pxg.NumeroGrupo, pxg.CodigoCurso, idSemestre), out int idGrupo))
                {
                    errores.Add($"Grupo no encontrado para persona {pxg.Id}");
                    continue;
                }

                if (pxg.Rol == "estudiante")
                {
                    var estudiante = await _context.Estudiante.FindAsync(pxg.Id);
                    if (estudiante == null)
                    {
                        errores.Add($"Estudiante no existe: {pxg.Id}");
                        continue;
                    }

                    var yaExiste = await _context.EstudiantexGrupo
                        .AnyAsync(x => x.carnet_estudiante == pxg.Id && x.id_grupo == idGrupo);

                    if (!yaExiste)
                    {
                        _context.EstudiantexGrupo.Add(new EstudiantexGrupo
                        {
                            id_grupo = idGrupo,
                            carnet_estudiante = pxg.Id
                        });
                    }
                }
                else if (pxg.Rol == "profesor")
                {
                    var profesor = await _context.Profesor.FindAsync(pxg.Id);
                    if (profesor == null)
                    {
                        errores.Add($"Profesor no existe: {pxg.Id}");
                        continue;
                    }

                    var yaExiste = await _context.ProfesorXGrupo
                        .AnyAsync(x => x.cedula_profesor == pxg.Id && x.id_grupo == idGrupo);

                    if (!yaExiste)
                    {
                        _context.ProfesorXGrupo.Add(new ProfesorXGrupo
                        {
                            cedula_profesor = pxg.Id,
                            id_grupo = idGrupo
                        });
                    }
                }
                else
                {
                    errores.Add($"Rol inválido para persona {pxg.Id}: {pxg.Rol}");
                }
            }

            await _context.SaveChangesAsync();

            if (errores.Any())
                return BadRequest(new { mensaje = "Se completó parcialmente con errores.", errores });

            return Ok(new { mensaje = "Inicialización completada exitosamente." });
        }
    }
}
