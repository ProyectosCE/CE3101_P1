namespace CEDigital_api.Services.Excel
{
    public class SemestreInput
    {
        public int Anio { get; set; }
        public string Periodo { get; set; } // "1", "2", "V"
        public string Estado { get; set; } = "inactivo"; // "inactivo", "activo"
    }
}
