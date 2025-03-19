// usings...

var builder = WebApplication.CreateBuilder(args);

// other code...

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
    .AddSwaggerGen(options => ConfigureSwaggerOptions.AddSwaggerGen(options));

// Add API key authentication
builder.Services.AddAuthentication("ApiKeyScheme")
    .AddScheme<ApiKeyAuthenticationOptions, ApiKeyAuthenticationHandler>("ApiKeyScheme", options => {});

// APP configuration
var app = builder.Build();
app.UseSwagger().UseSwaggerUI(options =>
    {
        var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();
        // add swagger endpoints jsons for each discovered API version
        foreach (var description in provider.ApiVersionDescriptions)
        {
            options.SwaggerEndpoint($"/swagger/{description.GroupName}/swagger.json", description.GroupName.ToUpperInvariant());
        }
    });

// other code ...