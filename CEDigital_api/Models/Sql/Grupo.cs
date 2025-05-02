namespace CEDigital_api.Models.Sql
{
    public class Grupo
    {
        public int id_grupo { get; set; }
        public int numero_grupo { get; set; }

        public List<Rubro> rubros { get; set; } = new();
        public List<Carpeta> carpetas { get; set; } = new();
        public List<Noticia> noticias { get; set; } = new();

        public ICollection<GrupoXEstudiante> estudiantes { get; set; }

        public ICollection<ProfesorXGrupo> profesores { get; set; } 
    }
}
