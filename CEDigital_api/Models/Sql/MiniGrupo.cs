using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class MiniGrupo
    {
        [Key]
        public int id_minigrupo { get; set; }

        public string nombre_minigrupo { get; set; }

        [JsonIgnore]
        public ICollection<EstudianteXMiniGrupo> estudiantes { get; set; } = new List<EstudianteXMiniGrupo>();

        // Foreign Keys
        public int id_categoria { get; set; }

        [JsonIgnore]
        public CategoriaGrupo? categoriagrupo { get; set; }
    }
}
