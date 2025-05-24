using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class Rubro
    {
        [Key]
        public int id_rubro { get; set; }
        public string nombre { get; set; }
        public double porcentaje { get; set; }

        [JsonIgnore]
        public List<Evaluacion> evaluaciones { get; set; } = new();

        // Foreign Keys
        public int id_grupo { get; set; }

        [JsonIgnore]
        public Grupo? grupo { get; set; }
    }
}