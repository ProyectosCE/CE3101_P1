using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace CEDigital_api.Models.Sql
{
    public class Carrera
    {
        [Key]
        public string codigo_carrera { get; set; }
        public string nombre { get; set; }

        public List<Curso> cursos { get; set; } = new();
    }
}
