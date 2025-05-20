using System.ComponentModel.DataAnnotations;

namespace CEDigital_api.Models.Sql
{
    public class Entregable
    {
        [Key]
        public int id_entregable { get; set; }
        public string archivo { get; set; }
        public DateTime fecha_entrega { get; set; }
        public Nota? nota { get; set; } = new(); // 1 a 1

        // Foreign Keys
        public int id_evaluacion { get; set; }
        public Evaluacion? evaluacion { get; set; }
        public string carnet_estudiante { get; set; }
        public Estudiante? estudiante { get; set; } 

    }
}
