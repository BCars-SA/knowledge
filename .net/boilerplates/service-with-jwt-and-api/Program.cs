using Microsoft.AspNetCore.Mvc;
using Middleware.CurrentUserContext;
using Extensions;

var builder = WebApplication.CreateBuilder(args);

// setup NLog from the extensions
builder.AddNLog();

if (builder.Configuration.GetSection("JwtSettings") == null)
{
    throw new Exception("JwtSettings section is missing in the configuration file.");
}

// setup custom CORS policy  from the extensions
builder.Services.SetupCors(builder.Configuration);

builder.Services.AddControllers(
    options => options.Filters.Add(new ProducesAttribute("application/json"))
).SetupJsonOptions(); // setup JSON options for the controllers from the extensions
builder.Services.SetupJsonOptions(); // setup JSON options for the whole application from the extensions

// setup API versioning from the extensions
builder.Services.SetupApiVersioning();

// setup Swagger from the extensions
builder.Services.SetupSwagger();

// setup all custom services from the extensions
builder.Services.AddCustomServices(builder.Configuration);

// setup authentication and authorization
builder.Services.SetupAuthentication(builder.Configuration);

var app = builder.Build();

// setup swagger UI from the extensions
app.SetupSwagger(builder.Configuration);

// use http to https redirection
app.UseHttpsRedirection();

// use authentication and authorization in the app
app.UseAuthentication();
app.UseAuthorization();

// setup the current user context middleware
app.UseMiddleware<CurrentUserContextMiddleware>(); // Ensure this is before UseCors and MapControllers

// setup CORS
app.UseCors();
// setup routing
app.MapControllers();

app.Run();

// needed for the integration tests
public partial class Program {}