using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CEDigital_api.Models.Mongo
{
    [BsonIgnoreExtraElements]
    public class Estudiante
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string carnet { get; set; }
        public string cedula { get; set; }
        public string nombre { get; set; }
        public string apellidos { get; set; }
        public string nombre_completo => $"{nombre} {apellidos}".Trim();
        public string correo { get; set; }
        public string telefono { get; set; }
        public string password { get; set; }
        [BsonElement("isAdmin")]
        public bool IsAdmin { get; set; } = false;

    }
}
