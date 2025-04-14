namespace Middleware.CurrentUserContext;

/**
 * A provider for the current user context.
 * This provider is used to get and set the current user context in the http context.
 * To be injected in the services for accessing the current user context.
 */
public interface ICurrentUserContextProvider
{
    ICurrentUserContext? GetContext();
    void SetContext(HttpContext httpContext, ICurrentUserContext? userContext);
}

public class CurrentUserContextProvider : ICurrentUserContextProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserContextProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public ICurrentUserContext? GetContext()
    {
        if (_httpContextAccessor.HttpContext?.Items["CurrentUserContext"] is ICurrentUserContext userContext)
        {
            return userContext;
        }
        return null;
    }

    public void SetContext(HttpContext httpContext, ICurrentUserContext? userContext)
    {
        httpContext.Items["CurrentUserContext"] = userContext;
    }
}
