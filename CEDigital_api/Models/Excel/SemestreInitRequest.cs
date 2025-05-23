namespace CEDigital_api.Models.Excel
{
    public class SemestreInitRequest
    {
        public List<SemestreInput> Semestres { get; set; } = new();
        public List<GrupoInput> Grupos { get; set; } = new();
        public List<PersonaXGrupoInput> PersonasXGrupo { get; set; } = new();
    }
}
