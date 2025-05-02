namespace CEDigital_api.Models.Sql
{
    public class Entregable
    {
        public int id_entregable { get; set; }
        public string archivo { get; set; }
        public DateOnly fecha { get; set; }
        public TimeOnly hora { get; set; }
        public string entrega => fecha.ToString("yyyy-MM-dd") + " " + hora.ToString("hh\\:mm\\:ss");

        public Nota? nota { get; set; } = new(); // 1 a 1

        // Foreign Keys
        public int id_evaluacion { get; set; }
        public Evaluacion? evaluacion { get; set; }
        public string carnet_estudiante { get; set; }



    }
}
