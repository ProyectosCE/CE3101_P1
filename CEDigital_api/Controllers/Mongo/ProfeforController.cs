using CEDigital_api.Data.Mongo;
using Microsoft.AspNetCore.Mvc;

namespace CEDigital_api.Controllers.Mongo
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfeforController : ControllerBase
    {
        private readonly ProfesorService _profesorService;
        public ProfeforController(ProfesorService profesorService)
        {
            _profesorService = profesorService;
        }
    }
}
