using System.ComponentModel.DataAnnotations;

namespace CEDigital_api.Models.Sql
{
    public class Semestre
    {
        [Key]
        public int id_semestre { get; set; }
        public int año { get; set; }
        public string periodo { get; set; }

        //public List<Curso> cursos { get; set; } = new();

        public List<Grupo> grupos { get; set; } = new();
    }
}
