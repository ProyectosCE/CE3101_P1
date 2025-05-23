using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class Profesor
    {
        [Key]
        public string cedula_profesor { get; set; }

        [JsonIgnore]
        public ICollection<ProfesorXGrupo> grupos { get; set; } = new List<ProfesorXGrupo>();
        [JsonIgnore]
        public List<Carpeta> carpetas { get; set; } = new();
        [JsonIgnore]
        public List<Noticia> noticias { get; set; } = new();
    }
}
