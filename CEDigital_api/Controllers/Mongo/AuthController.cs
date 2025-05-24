using Microsoft.AspNetCore.Mvc;
using CEDigital_api.Data.Mongo;

namespace CEDigital_api.Controllers.Mongo
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var (success, role, message, id, carnet) = await _authService.LoginAsync(request.Correo, request.Password);
            if (!success)
            {
                return Unauthorized(new { message });
            }

            return Ok(new { message, role, id, carnet });
        }
    }

    public class LoginRequest
    {
        public string Correo { get; set; }
        public string Password { get; set; }
    }
}
