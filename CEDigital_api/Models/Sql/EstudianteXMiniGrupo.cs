namespace CEDigital_api.Models.Sql
{
    public class EstudianteXMiniGrupo
    {
        public string carnet_estudiante { get; set; }
        public Estudiante? estudiante { get; set; }
        public int id_minigrupo { get; set; }
        public MiniGrupo? miniGrupo { get; set; }
    }
}
