namespace CEDigital_api.Models.Sql
{
    public class Noticia
    {
        public int id_noticia { get; set; }
        public string titulo { get; set; }
        public DateTime fecha_publicacion { get; set; }
        public string mensaje { get; set; }
    }
}
