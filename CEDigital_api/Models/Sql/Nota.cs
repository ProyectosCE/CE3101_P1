using System.ComponentModel.DataAnnotations;

namespace CEDigital_api.Models.Sql
{
    public class Nota
    {
        public double calificacion { get; set; }
        public string estado { get; set; } = "inactivo";
        public string observaciones { get; set; }

        // Foreign Keys
        [Key]
        public int id_entregable { get; set; }
        public Entregable? entregable { get; set; }
        public string carnet_estudiante { get; set; }
        public Estudiante? estudiante { get; set; } 

    }
}
