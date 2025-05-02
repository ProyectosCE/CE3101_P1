namespace CEDigital_api.Models.Sql
{
    public class ProfesorXGrupo
    {
        // Foreign Keys
        public string cedula_profesor { get; set; }
        public int id_grupo { get; set; }
        public Grupo? grupo { get; set; }
    }
}
