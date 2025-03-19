using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Net;

namespace API.Services
{
    public interface IAuthService
    {
        public string? Authenticate(string usrpwd);
    }

    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;

        private readonly ILogger<AuthService> _logger;

        public AuthService(IConfiguration configuration, ILogger<AuthService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public string? Authenticate(string username, string password)
        {
            // Get user from database and validate credentials

            // If credentials are valid, generate JWT token        
            return this.GenerateAccessToken(user);
        }

        private string GenerateAccessToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]);
            Int32.TryParse(_configuration["JwtSettings:ExpireInDays"], out int days);
            var claims = new List<Claim>() {
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.NameIdentifier, user.Id)
            };
            var roles = user.Roles;
            if (roles != null)
            {
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(days), // Set token expiration            
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"]
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class User {
        public string? Name { get; set; }
        public string? Id { get; set; }
        public string[]? Roles { get; set; }
    }
}
