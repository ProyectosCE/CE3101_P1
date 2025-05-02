namespace CEDigital_api.Models.Sql
{
    public class Evaluacion
    {
        public int id_evaluacion { get; set; }
        public string nombre { get; set; }
        public double peso { get; set; }
        public DateOnly fecha { get; set; }
        public TimeOnly hora { get; set; }
        public string entrega => fecha.ToString("yyyy-MM-dd") + " " + hora.ToString("hh\\:mm\\:ss");
        public string tipo { get; set; }
        public string archivo_especificacion { get; set; }
    }
}
