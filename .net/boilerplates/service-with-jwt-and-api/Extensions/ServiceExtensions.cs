using Middleware.CurrentUserContext;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;

namespace Extensions;
public static class ServiceExtensions
{
    public static IServiceCollection AddCustomServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserContextProvider, CurrentUserContextProvider>();
        // add the custom services here
        // ... e.g. services.AddScoped<IMyService, MyService>();

        return services;
    }
}
