using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class CategoriaGrupo
    {
        public int id_categoria { get; set; }
        public string nombre_categoria { get; set; }

        [JsonIgnore]
        public List<MiniGrupo> minigrupos { get; set; } = new();

        [JsonIgnore]
        public List<Evaluacion> evaluaciones { get; set; } = new();
    }
}
