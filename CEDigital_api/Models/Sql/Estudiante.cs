using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class Estudiante
    {
        [Key]
        public string carnet_estudiante { get; set; }


        [JsonIgnore]
        public ICollection<EstudiantexGrupo> grupos { get; set; } = new List<EstudiantexGrupo>();

        [JsonIgnore]
        public ICollection<EstudianteXMiniGrupo> minigrupos { get; set; } = new List<EstudianteXMiniGrupo>();

        [JsonIgnore]
        public List<Entregable> entregables { get; set; } = new();

        [JsonIgnore]
        public List<Nota> notas { get; set; } = new();
    }
}
