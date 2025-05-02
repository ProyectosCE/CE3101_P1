namespace CEDigital_api.Models.Sql
{
    public class Nota
    {
        public double calificacion { get; set; }
        public string estado { get; set; }
        public string observaciones { get; set; }

        // Foreign Keys
        public int id_entregable { get; set; }
        public Entregable? entregable { get; set; }
        public string carnet_estudiante { get; set; }

    }
}
