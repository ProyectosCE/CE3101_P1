using System.ComponentModel.DataAnnotations;

namespace CEDigital_api.Models.Sql
{
    public class Carpeta
    {
        [Key]
        public int id_carpeta { get; set; }
        public string nombre { get; set; }

        public List<Documento> documentos { get; set; } = new();

        // Foreign Keys
        public int id_grupo { get; set; }
        public Grupo? grupo { get; set; }
        public string cedula_profesor { get; set; }


    }
}
