using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class Semestre
    {
        [Key]
        public int id_semestre { get; set; }

        public int anio { get; set; }
        public string periodo { get; set; }
        public string estado { get; set; } = "inactivo";

        [JsonIgnore]
        public List<Grupo> grupos { get; set; } = new();
    }
}
