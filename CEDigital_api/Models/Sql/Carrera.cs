using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class Carrera
    {
        [Key]
        public string codigo_carrera { get; set; }
        public string nombre { get; set; }
        public string estado { get; set; } = "activo";

        [JsonIgnore]
        public List<Curso> cursos { get; set; } = new();
    }
}
