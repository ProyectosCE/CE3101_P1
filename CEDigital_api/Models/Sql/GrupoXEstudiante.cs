namespace CEDigital_api.Models.Sql
{
    public class GrupoXEstudiante
    {
        // Foreign Keys
        public string carnet_estudiante { get; set; }
        public int id_grupo { get; set; }
        public Grupo? grupo { get; set; }
    }
}
