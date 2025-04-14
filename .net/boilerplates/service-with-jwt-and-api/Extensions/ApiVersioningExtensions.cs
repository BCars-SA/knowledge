using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;

namespace Extensions;
public static class ApiVersionongExtensions
{
    public static IServiceCollection SetupApiVersioning(this IServiceCollection services)
    {
        // Use the versioning middleware to add API versioning to the application via the header
        // The API version header is "api-version"
        services.AddApiVersioning(options =>
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

        return services;
    }
}
