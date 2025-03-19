// usings....


var builder = WebApplication.CreateBuilder(args);

RequestHelpers.Configuration = builder.Configuration;

// other code...

if (builder.Configuration.GetSection("JwtSettings") == null)
{
    // setup default JwtSettings or throw an exception here
} 


// Use the versioning middleware to add API versioning to the application via the header
// The API version header is "api-version"
builder.Services.AddApiVersioning(options =>
    {
        options.ReportApiVersions = true; // Add headers to the response that indicate the supported versions
        options.DefaultApiVersion = new ApiVersion(1, 0); // Default API version is 1.0
        options.AssumeDefaultVersionWhenUnspecified = true;
        options.ApiVersionReader = new HeaderApiVersionReader(new[] { "api-version" }); // Use HeaderApiVersionReader
    })
    .AddVersionedApiExplorer(options =>
    {
        // add the versioned api explorer, which also adds IApiVersionDescriptionProvider service
        // note: the specified format code will format the version as "major[.minor]"
        options.GroupNameFormat = "VV";
        options.SubstituteApiVersionInUrl = true;
    });

// Setup Swagger
builder.Services
    .AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>()
    .AddSwaggerGen((options) =>
    {
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "Example: \"Bearer 12345abcdef\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        // Add security requirement to all endpoints (or selectively)
        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                new string[] { }
            }
        });
        // https://github.com/swagger-api/swagger-ui/issues/7911
        options.CustomSchemaIds(type => type.FullName?.Replace("+", ".")); // Use full type names in schema definitions);    
        options.OperationFilter<SwaggerDefaultValues>();
    });

// other code....


var app = builder.Build();

app.UseSwaggerUI(options =>
{
    var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();
    // add swagger endpoints jsons for each discovered API version
    foreach (var description in provider.ApiVersionDescriptions)
    {
        options.SwaggerEndpoint($"/swagger/{description.GroupName}/swagger.json", description.GroupName.ToUpperInvariant());
    }
});

app.UseAuthentication();
app.UseAuthorization();

// other code...

app.Run();
