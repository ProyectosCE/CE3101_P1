namespace CEDigital_api.Models.Sql
{
    public class Documento
    {
        public int id_documento { get; set; }
        public string nombre_archivo { get; set; }
        public double size { get; set; }
        public DateTime fecha_subida { get; set; }

    }
}
