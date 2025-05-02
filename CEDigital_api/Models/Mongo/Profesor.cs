using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CEDigital_api.Models.Mongo
{
    public class Profesor
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string cedula { get; set; }

        public string nombre { get; set; }
        public string apellido1 { get; set; }
        public string apellido2 { get; set; }
        public string correo { get; set; }
        public string password { get; set; }
    }
}
