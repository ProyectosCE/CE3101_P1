using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class Grupo
    {
        [Key]
        public int id_grupo { get; set; }
        public int numero_grupo { get; set; }
        public string estado { get; set; } = "activo";

        [JsonIgnore]
        public List<Rubro> rubros { get; set; } = new();

        [JsonIgnore]
        public List<Carpeta> carpetas { get; set; } = new();

        [JsonIgnore]
        public List<Noticia> noticias { get; set; } = new();

        [JsonIgnore]
        public ICollection<ProfesorXGrupo> profesores { get; set; } = new List<ProfesorXGrupo>();

        [JsonIgnore]
        public ICollection<EstudiantexGrupo> estudiantes { get; set; } = new List<EstudiantexGrupo>();

        [JsonIgnore]
        public ICollection<CategoriaGrupo> categorias { get; set; } = new List<CategoriaGrupo>();

        // Fks

        [JsonIgnore]
        public int id_semestre { get; set; }

        [JsonIgnore]
        public Semestre? semestre { get; set; }

        public string? codigo_curso { get; set; }

        [JsonIgnore]
        public Curso? curso { get; set; }
    }
}
