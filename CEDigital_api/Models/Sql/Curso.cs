using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class Curso
    {
        [Key]
        public string codigo_curso { get; set; }
        public string nombre { get; set; }
        public int creditos { get; set; }
        public string estado { get; set; } = "inactivo";

        [JsonIgnore]
        public List<Grupo> grupos { get; set; } = new();

        // Foreign Keys
        public string codigo_carrera { get; set; }
        public Carrera? carrera { get; set; }

    }
}
