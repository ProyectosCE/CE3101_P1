using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CEDigital_api.Models.Sql
{
    public class Documento
    {
        [Key]
        public int id_documento { get; set; }
        public string nombre_archivo { get; set; }
        public double size { get; set; }
        public DateTime fecha_subida { get; set; }

        // Foreign Keys
        public int? id_carpeta { get; set; }

        [JsonIgnore]
        public Carpeta? carpeta { get; set; }

    }
}
