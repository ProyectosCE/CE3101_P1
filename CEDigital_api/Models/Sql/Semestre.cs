namespace CEDigital_api.Models.Sql
{
    public class Semestre
    {
        public int id_semestre { get; set; }
        public int año { get; set; }
        public string periodo { get; set; }

        public List<Curso> cursos { get; set; } = new();
    }
}
