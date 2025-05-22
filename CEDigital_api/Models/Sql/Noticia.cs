using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class Noticia
    {
        [Key]
        public int id_noticia { get; set; }
        public string titulo { get; set; }
        public DateTime fecha_publicacion { get; set; }
        public string mensaje { get; set; }

        // Foreign Keys
        public int id_grupo { get; set; }
        [JsonIgnore]
        public Grupo? grupo { get; set; }
        public string cedula_profesor { get; set; }
        [JsonIgnore]
        public Profesor? profesor { get; set; }
    }
}
