namespace CEDigital_api.Data.Sql
{
    public class SqlService
    {
        private readonly IWebHostEnvironment _env;

        public SqlService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public string LoadSqlQuery(string relativePath)
        {
            var fullPath = Path.Combine(_env.ContentRootPath, relativePath);

            if (!File.Exists(fullPath))
                throw new FileNotFoundException($"No se encontró el archivo SQL: {fullPath}");

            return File.ReadAllText(fullPath);
        }
    }
}
