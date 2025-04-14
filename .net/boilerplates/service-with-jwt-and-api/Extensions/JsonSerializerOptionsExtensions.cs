using System.Text.Json;
using System.Text.Json.Serialization;
using Converters;

namespace Extensions;
public static class JsonSerializerOptionsExtensions
{
    public static void ApplyJsonOptions(JsonSerializerOptions options)
    {
        // do not change property names
        options.PropertyNamingPolicy = null;
        options.DictionaryKeyPolicy = null;
        // ignore case for property names
        options.PropertyNameCaseInsensitive = true;
        // convert enum as string
        options.Converters.Add(new JsonStringEnumConverter(null, false));

        // Converter for the dates like /Date(1724104800000+0200)/
        options.Converters.Add(new JsonDateTimeConverter());
        
        // ignore properties with default values
        options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingDefault;
        // allow parsing numbers from strings
        options.NumberHandling = JsonNumberHandling.AllowReadingFromString;
        // set max depth for nested objects
        options.MaxDepth = 8;
    }

    public static IServiceCollection SetupJsonOptions(this IServiceCollection services)
    {
        services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options => 
        {
            ApplyJsonOptions(options.SerializerOptions);
        });
        return services;
    }

    public static IMvcBuilder SetupJsonOptions(this IMvcBuilder mvcBuilder)
    {
        mvcBuilder.AddJsonOptions(options => ApplyJsonOptions(options.JsonSerializerOptions));
        return mvcBuilder;
    }    
}
