using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class Evaluacion
    {
        [Key]
        public int id_evaluacion { get; set; }
        public string nombre { get; set; }
        public double peso { get; set; }
        public DateTime fecha_entrega { get; set; }
        public string tipo { get; set; }
        public string archivo_especificacion { get; set; }

        [JsonIgnore]
        public List<Entregable> entregables { get; set; } = new();

        // Foreign Keys
        public int id_rubro { get; set; }
        public Rubro? rubro { get; set; }

    }
}
