namespace CEDigital_api.Models.Sql
{
    public class Rubro
    {
        public int id_rubro { get; set; }
        public string nombre { get; set; }
        public double porcentaje { get; set; }

        public List<Evaluacion> evaluaciones { get; set; } = new();

        // Foreign Keys
        public int id_grupo { get; set; }
        public Grupo? grupo { get; set; }
    }
}