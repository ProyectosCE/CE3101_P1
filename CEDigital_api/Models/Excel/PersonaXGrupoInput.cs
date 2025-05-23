namespace CEDigital_api.Models.Excel
{
    public class PersonaXGrupoInput
    {
        public string Id { get; set; } // cedula o carnet
        public string Rol { get; set; } // "estudiante" o "profesor"
        public string CodigoCurso { get; set; }
        public int NumeroGrupo { get; set; }
        public int AnioSemestre { get; set; }
        public string PeriodoSemestre { get; set; }
    }
}
