using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

namespace Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection SetupAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        if (configuration == null)
        {
            throw new ArgumentNullException(nameof(configuration));
        }
        if (configuration.GetSection("JwtSettings") == null)
        {
            throw new Exception("JwtSettings section is missing in the configuration file.");
        }
        if (string.IsNullOrEmpty(configuration["JwtSettings:Secret"]))
        {
            throw new Exception("JwtSettings:Secret is missing in the configuration file.");
        }
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["JwtSettings:Issuer"],
                ValidAudience = configuration["JwtSettings:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtSettings:Secret"]!)),
                ClockSkew = TimeSpan.Zero
            };
        });

        // Add authorization policies
        services.AddAuthorization(options =>
        {            
            // Add a policy for the Admin role for example
            options.AddPolicy("Admin", policy => policy.RequireAssertion(context =>
            {
                // Check if the user has the "Admin" claim
                return context.User.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "Admin");
            }));
        });

        return services;
    }
}
