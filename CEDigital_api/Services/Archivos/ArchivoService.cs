namespace CEDigital_api.Services.Archivos
{
    public class ArchivoService
    {
        private readonly IWebHostEnvironment _env;

        public ArchivoService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> GuardarArchivoAsync(IFormFile archivo, int idSemestre, string codigoCurso, int idGrupo, int idCarpeta, string nombreCarpeta)
        {
            string nombreSanitizado = SanitizarNombre(nombreCarpeta);

            var rutaCarpeta = Path.Combine(
                _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"),
                "Archivos",
                $"Semestre_{idSemestre}",
                codigoCurso,
                $"Grupo_{idGrupo}",
                $"Carpeta_{idCarpeta}_{nombreSanitizado}"
            );

            if (!Directory.Exists(rutaCarpeta))
                Directory.CreateDirectory(rutaCarpeta);

            var rutaArchivo = Path.Combine(rutaCarpeta, archivo.FileName);

            using (var stream = new FileStream(rutaArchivo, FileMode.Create))
            {
                await archivo.CopyToAsync(stream);
            }

            return rutaArchivo; // o ruta relativa si la necesitas
        }

        public string SanitizarNombre(string nombre)
        {
            return string.Concat(nombre.Where(c => char.IsLetterOrDigit(c) || c == '_' || c == '-')).Trim();
        }
    }
}
