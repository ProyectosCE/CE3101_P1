using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class Carpeta
    {
        [Key]
        public int id_carpeta { get; set; }
        public string nombre { get; set; }

        [JsonIgnore]
        public List<Documento> documentos { get; set; } = new();

        // Foreign Keys
        public int id_grupo { get; set; }
        [JsonIgnore]
        public Grupo? grupo { get; set; }
        public string cedula_profesor { get; set; } = "0";
        [JsonIgnore]
        public Profesor? profesor { get; set; }


    }
}
