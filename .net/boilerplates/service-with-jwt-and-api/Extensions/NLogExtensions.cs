using NLog.Web;
using NLog.Extensions.Logging;

namespace Extensions;

public static class NLogExtensions
{
    public static void AddNLog(this WebApplicationBuilder builder)
    {
        builder.Logging.ClearProviders();        
        builder.Logging.AddNLog();
        builder.Host.UseNLog();

    }
    
}